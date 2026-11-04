import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

class MemoryStorage {
  getItem(key) { return Object.hasOwn(this, key) ? this[key] : null; }
  setItem(key, value) { Object.defineProperty(this, key, { value: String(value), enumerable: true, configurable: true, writable: true }); }
  removeItem(key) { delete this[key]; }
  clear() { for (const key of Object.keys(this)) delete this[key]; }
}
globalThis.localStorage = new MemoryStorage();
globalThis.window = new EventTarget();
Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true });
const { accountStorage } = await import('../src/services/accountStorage.ts');
const { emptyProfile, emptyPlan, emptyNutrition, trainingStreak } = await import('../src/services/emptyAccount.ts');
const { storage } = await import('../src/services/storage.ts');
const { loadAccount, disconnectAccount, syncAccount, accountTransport } = await import('../src/services/accountSync.ts');
const { applyWorkoutPolicy } = await import('../src/services/workoutPlanPolicy.ts');
const { PersonalTodayView } = await import('../src/components/views/PersonalTodayView.tsx');
const { GlobalVolumeRanking } = await import('../src/components/social/GlobalVolumeRanking.tsx');
const { encodeSnapshot, decodeSnapshot, CHUNK_CHARACTERS, MAX_CHUNKS } = await import('../src/services/firestoreAccountTransport.ts');
const { authError } = await import('../src/services/firebase.ts');
const user = id => ({ id, user_metadata: { name: id } });
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
afterEach(() => { disconnectAccount(); localStorage.clear(); });

test('Firebase snapshots preserve large histories, accents and emoji across document boundaries', () => {
  const payload = { athlynx_workout_history: JSON.stringify({ notes: 'á🏋️'.repeat(CHUNK_CHARACTERS), sessions: ['Treino A', 'Abdômen'] }) };
  const chunks = encodeSnapshot(payload);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every(c => c.length <= CHUNK_CHARACTERS && !/[\uD800-\uDBFF]$/.test(c)));
  assert.deepEqual(decodeSnapshot(chunks), payload);
});
test('oversized or corrupt Firebase states fail without altering local data', () => {
  assert.throws(() => encodeSnapshot({ athlynx_workout_history: 'x'.repeat(CHUNK_CHARACTERS * MAX_CHUNKS + 1) }));
  assert.throws(() => decodeSnapshot(['{"athlynx_profile":42}']));
  assert.throws(() => decodeSnapshot(['incompleto']));
});
test('Firebase authentication errors explain verification, blocked providers and invalid credentials', () => {
  assert.match(authError({code:'auth/email-not-verified'}), /Confirme seu e-mail/);
  assert.match(authError({code:'auth/invalid-credential'}), /incorretos/);
  assert.match(authError({code:'auth/operation-not-allowed'}), /habilitado/);
  assert.match(authError({code:'auth/expired-action-code'}), /expirou/);
});

test('new accounts ignore legacy records, premium overrides and other accounts', () => {
  localStorage.setItem('athlynx_profile', JSON.stringify({ name: 'Maik', isPremium: true }));
  localStorage.setItem('athlynx_workout_history', '[{"id":"legacy"}]');
  accountStorage.activate('A');
  assert.equal(storage.getProfile().isPremium, false);
  assert.deepEqual(storage.getWorkoutHistory(), []);
  assert.deepEqual(storage.getWorkoutPlan().sessions, []);
  storage.saveProfile(emptyProfile('A', 'Maikon'));
  assert.equal(storage.getProfile().isPremium, false);
  accountStorage.setItem('athlynx_workout_history', '[{"id":"private-A"}]');
  accountStorage.activate('B');
  assert.deepEqual(storage.getWorkoutHistory(), []);
  storage.resetAll();
  accountStorage.activate('A');
  assert.equal(storage.getWorkoutHistory()[0].id, 'private-A');
  assert.ok(localStorage.getItem('athlynx_profile'));
});

test('cloud hydration restores the authenticated account before UI reads it', async t => {
  t.mock.method(accountTransport, 'load', async id => ({ data: { data: { athlynx_profile: JSON.stringify(emptyProfile(id, 'Nome salvo')) }, revision: 4 }, error: null }));
  assert.equal(await loadAccount(user('A')), true);
  assert.equal(storage.getProfile().name, 'Nome salvo');
  assert.equal(accountStorage.id, 'A');
});

test('a delayed login response cannot reopen the previous account', async t => {
  const old = deferred();
  t.mock.method(accountTransport, 'load', id => id === 'A' ? old.promise : Promise.resolve({ data: null, error: null }));
  const pending = loadAccount(user('A'));
  await loadAccount(user('B'));
  old.resolve({ data: null, error: null });
  assert.equal(await pending, false);
  assert.equal(accountStorage.id, 'B');
  assert.equal(storage.getProfile().id, 'B');
});

test('failed cloud saves retain local edits; conflicts never overwrite cloud or cache', async t => {
  t.mock.method(accountTransport, 'load', async () => ({ data: null, error: null }));
  t.mock.method(accountTransport, 'save', async () => ({ data: null, error: { message: 'revision conflict' } }));
  await loadAccount(user('A'));
  accountStorage.setItem('athlynx_workout_history', '[{"id":"offline"}]');
  await assert.rejects(syncAccount());
  assert.equal(localStorage.getItem(accountStorage.prefix() + '_dirty'), 'true');
  accountTransport.load.mock.restore();
  t.mock.method(accountTransport, 'load', async () => ({ data: { data: {}, revision: 7 }, error: null }));
  await assert.rejects(loadAccount(user('A')));
  assert.equal(accountStorage.id, null);
  assert.equal(accountStorage.snapshot('A').athlynx_workout_history, '[{"id":"offline"}]');
});

test('an old save completing after logout cannot mark another account saved', async t => {
  const old = deferred();
  t.mock.method(accountTransport, 'load', async () => ({ data: null, error: null }));
  t.mock.method(accountTransport, 'save', () => old.promise);
  await loadAccount(user('A'));
  const saving = syncAccount();
  disconnectAccount();
  await loadAccount(user('B'));
  old.resolve({ data: 1, error: null });
  await saving;
  assert.equal(accountStorage.id, 'B');
  assert.equal(localStorage.getItem(accountStorage.prefix() + '_revision'), '0');
  assert.equal(localStorage.getItem(accountStorage.prefix() + '_dirty'), 'true');
});

test('edits made during a save remain pending and reset retains cloud revision', async t => {
  const save = deferred();
  t.mock.method(accountTransport, 'load', async () => ({ data: { data: {}, revision: 3 }, error: null }));
  t.mock.method(accountTransport, 'save', () => save.promise);
  await loadAccount(user('A'));
  const saving = syncAccount();
  accountStorage.setItem('athlynx_profile', JSON.stringify(emptyProfile('A', 'Editado durante envio')));
  save.resolve({ data: 4, error: null });
  await saving;
  assert.equal(localStorage.getItem(accountStorage.prefix() + '_dirty'), 'true');
  storage.resetAll();
  assert.equal(localStorage.getItem(accountStorage.prefix() + '_revision'), '4');
});

test('empty dashboard displays actual zeros and setup action without sample results', () => {
  const html = renderToStaticMarkup(React.createElement(PersonalTodayView, { profile: emptyProfile('A', 'Ana'), plan: emptyPlan(), nutrition: emptyNutrition(), recentWorkouts: [], gpsActivities: [] }));
  assert.match(html, /Criar meu plano/);
  assert.match(html, /Você ainda não concluiu nenhum treino/);
  assert.doesNotMatch(html, /Maik|104.250|14.8|92%|7 dias seguidos|NaN/);
});

test('community statistics never invent ranking points, peers or previous workouts', () => {
  const props = { currentUserProfile: emptyProfile('A'), workoutHistory: [], gpsActivities: [] };
  const empty = renderToStaticMarkup(React.createElement(GlobalVolumeRanking, props));
  assert.match(empty, /0 kg/);
  assert.doesNotMatch(empty, /Lucas Zanetti|12.400|3.090|5ª posição/);
  const actual = renderToStaticMarkup(React.createElement(GlobalVolumeRanking, { ...props, workoutHistory: [{ completedAt: new Date().toISOString(), totalVolumeKg: 400 }] }));
  assert.match(actual, /400 kg/);
});

test('streak uses completed dates, de-duplicates same-day sessions and starts at zero', () => {
  const now = new Date(2026, 10, 3, 12);
  assert.equal(trainingStreak([], now), 0);
  assert.equal(trainingStreak([{ completedAt: new Date(2026, 10, 2).toISOString() }, { completedAt: new Date(2026, 10, 2, 17).toISOString() }, { completedAt: new Date(2026, 10, 1).toISOString() }], now), 2);
});

test('finishing a workout grows only that account history and survives a switch', () => {
  navigator.onLine = false;
  accountStorage.activate('A');
  storage.addWorkoutRecord({ id: 'actual-session', sessionId: 'session-1', title: 'Primeiro treino', startedAt: '2026-11-03T12:00:00Z', completedAt: '2026-11-03T12:20:00Z', totalVolumeKg: 400, totalSets: 2, totalReps: 20, exercisesLogged: [], prsAchieved: [] });
  assert.equal(storage.getWorkoutHistory().length, 1);
  assert.equal(storage.getOfflineQueue().length, 1);
  accountStorage.activate('B');
  assert.deepEqual(storage.getWorkoutHistory(), []);
  assert.deepEqual(storage.getOfflineQueue(), []);
  accountStorage.activate('A');
  assert.equal(storage.getWorkoutHistory()[0].totalVolumeKg, 400);
  navigator.onLine = true;
});

test('restored accounts can read their existing cache offline without showing another account', async t => {
  accountStorage.activate('A');
  storage.saveProfile(emptyProfile('A', 'Offline'));
  accountStorage.activate(null);
  navigator.onLine = false;
  const load = t.mock.method(accountTransport, 'load', () => { throw new Error('Network must not be called'); });
  await loadAccount(user('A'));
  assert.equal(storage.getProfile().name, 'Offline');
  assert.equal(load.mock.callCount(), 0);
  navigator.onLine = true;
});

test('generated gym and home plans include dynamic abs within time and exercise budget', () => {
  for (const environment of ['Academia', 'Casa']) for (const timePerSessionMin of [15, 30, 45, 60]) {
    const profile = { ...emptyProfile('A'), environment, timePerSessionMin };
    const input = { sessions: Array.from({ length: 3 }, (_, i) => ({ dayLabel: `Dia ${i}`, completedCount: 9, exercises: Array.from({ length: 10 }, (_, j) => ({ name: j === 0 ? 'Prancha Abdominal' : `Exercício ${j}`, targetMuscle: 'Peitoral', restSeconds: 180, sets: Array.from({ length: 5 }, () => ({ weightKg: 100, completed: true, previousWeightKg: 90 })) })) })) };
    const output = applyWorkoutPolicy(input, profile);
    for (const session of output.sessions) {
      assert.ok(session.exercises.length <= 6);
      assert.ok(session.estimatedMinutes <= timePerSessionMin);
      assert.equal(session.completedCount, 0);
      assert.ok(session.exercises.every(e => !/prancha/i.test(e.name)));
      assert.ok(session.exercises.every(e => e.sets.every(s => !s.completed && s.weightKg === 0 && s.previousWeightKg === undefined)));
    }
    assert.equal(output.sessions.filter(s => s.exercises.some(e => e.targetMuscle === 'Abdômen & Core')).length, 2);
    const abs = output.sessions[0].exercises.find(e => e.targetMuscle === 'Abdômen & Core');
    assert.equal(abs.exerciseId, environment === 'Casa' ? 'ex-abdominal-supra-solo' : 'ex-abdominal-polia-cable-crunch');
    assert.equal(input.sessions[0].completedCount, 9);
  }
});

test('reported spinal restrictions require assessment rather than automatic abdominal loading', () => {
  const output = applyWorkoutPolicy({ sessions: [{ dayLabel: 'A', exercises: [] }] }, { ...emptyProfile('A'), injuriesOrNotes: 'Hérnia lombar' });
  assert.equal(output.sessions[0].exercises.length, 0);
  assert.match(output.description, /profissional/);
});

test('abdominal scheduling preserves dedicated cardio sessions', () => {
  const cardio = { dayLabel: 'Corrida', exercises: [{ name: 'Corrida Contínua', targetMuscle: 'Cardio & Resistência', sets: [] }] };
  const output = applyWorkoutPolicy({ sessions: [cardio, { dayLabel: 'Musculação', exercises: [] }] }, emptyProfile('A'));
  assert.equal(output.sessions[0].exercises[0].name, 'Corrida Contínua');
  assert.equal(output.sessions[0].exercises.length, 1);
  assert.equal(output.sessions[1].exercises[0].targetMuscle, 'Abdômen & Core');
});
