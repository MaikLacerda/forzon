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

test('generated gym and home plans preserve volume and report time conflicts', () => {
  for (const environment of ['Academia', 'Casa']) for (const timePerSessionMin of [15, 30, 45, 60]) {
    const profile = { ...emptyProfile('A'), environment, timePerSessionMin };
    const input = { sessions: Array.from({ length: 3 }, (_, i) => ({ dayLabel: `Dia ${i}`, completedCount: 9, exercises: Array.from({ length: 10 }, (_, j) => ({ name: j === 0 ? 'Prancha Abdominal' : `Exercício ${j}`, targetMuscle: 'Peitoral', restSeconds: 180, sets: Array.from({ length: 5 }, () => ({ weightKg: 100, completed: true, previousWeightKg: 90 })) })) })) };
    const output = applyWorkoutPolicy(input, profile);
    for (const session of output.sessions) {
      assert.ok(session.exercises.length <= 6);
      if (session.estimatedMinutes > timePerSessionMin) assert.ok(session.planningWarnings.some(w => w.includes('disponibilidade')));
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

test('AI splits retain accessory muscle groups and an executable cardio block after time limiting', () => {
  const splits = [
    ['Peitoral', 'Peitoral', 'Peitoral', 'Peitoral', 'Ombros', 'Ombros', 'Tríceps', 'Tríceps'],
    ['Costas', 'Costas', 'Costas', 'Costas', 'Trapézio', 'Bíceps', 'Bíceps'],
    ['Pernas (Quadríceps)', 'Pernas (Quadríceps)', 'Pernas (Quadríceps)', 'Pernas (Posterior)', 'Pernas (Posterior)', 'Glúteos', 'Panturrilhas', 'Panturrilhas'],
  ];
  for (const canonical of [true, false]) {
    const input = { sessions: splits.map((groups, i) => ({
      ...(canonical ? { dayLabel: `Dia ${i + 1}`, title: `Treino ${i + 1} — Completo`, muscleFocus: 'Completo' } : { focus: 'Completo' }),
      cardioProtocol: { machine: 'Esteira', name: 'Cardio Pós-Treino: Esteira', durationMin: 20, estimatedKcal: 190, parameters: 'Ritmo confortável', intensity: 'Leve' },
      exercises: [...groups.map((targetMuscle, j) => ({ name: `Movimento ${j}`, targetMuscle, restSeconds: 90,
        sets: canonical ? Array.from({ length: 4 }, () => ({ targetReps: 12, weightKg: 20, completed: true })) : 4 })),
        { name: 'Cardio Pós-Treino: Esteira', targetMuscle: 'Cardio & Resistência', sets: canonical ? [{ targetReps: 20 }] : 1, reps: '20 min' }],
    })) };
    const snapshot = JSON.stringify(input);
    const profile = { ...emptyProfile('A'), timePerSessionMin: 45, trainingDaysPerWeek: 3 };
    const output = applyWorkoutPolicy(input, profile);
    output.sessions.forEach((session, i) => {
      for (const group of new Set(splits[i])) assert.ok(session.exercises.some(e => e.targetMuscle === group), `Missing ${group}`);
      const cardios = session.exercises.filter(e => e.targetMuscle === 'Cardio & Resistência');
      assert.equal(cardios.length, 1);
      assert.equal(session.exercises.at(-1), cardios[0]);
      assert.ok(session.cardioProtocol.durationMin >= 5);
      assert.ok(session.cardioProtocol.durationMin <= 20);
      assert.equal(canonical ? cardios[0].sets[0].targetReps : parseInt(cardios[0].reps), session.cardioProtocol.durationMin);
      const liftingMinutes = session.exercises.filter(e => e !== cardios[0]).reduce((sum, e) => sum + (canonical ? e.sets.length : e.sets) * (45 + e.restSeconds) / 60 + 1, 0);
      assert.equal(session.estimatedMinutes, Math.ceil(5 + liftingMinutes + session.cardioProtocol.durationMin));
      assert.equal(session.cardioProtocol.durationMin, 20);
      if (session.estimatedMinutes > 45) assert.ok(session.planningWarnings.length);
    });
    assert.equal(JSON.stringify(input), snapshot);
    const twice = applyWorkoutPolicy(output, profile);
    twice.sessions.forEach((session, i) => {
      assert.deepEqual(session.exercises.map(e => e.name), output.sessions[i].exercises.map(e => e.name));
      assert.equal(session.cardioProtocol.durationMin, output.sessions[i].cardioProtocol.durationMin);
    });
  }
});

test('cardio supplied only as an exercise survives normalization and short-session fitting', () => {
  for (const timePerSessionMin of [15, 30, 60]) {
    const output = applyWorkoutPolicy({ sessions: [{ dayLabel: 'A', exercises: [
      { name: 'Supino', targetMuscle: 'Peitoral', restSeconds: 180, sets: [{ targetReps: 10 }] },
      { name: 'Cardio: Bicicleta', targetMuscle: 'Cardio & Resistência', sets: [{ targetReps: 20 }] },
    ] }] }, { ...emptyProfile('A'), timePerSessionMin });
    const session = output.sessions[0];
    assert.equal(session.cardioProtocol.machine, 'Bicicleta');
    assert.ok(session.cardioProtocol.durationMin >= 5);
    assert.equal(session.exercises.at(-1).sets[0].targetReps, session.cardioProtocol.durationMin);
    assert.equal(session.cardioProtocol.durationMin, 20);
    if (session.estimatedMinutes > timePerSessionMin) assert.ok(session.planningWarnings.length);
  }
});

test('level changes working volume; intermediate and advanced retain two arm variations and exact cardio', () => {
  const groups = ['Peitoral', 'Peitoral', 'Peitoral', 'Ombros', 'Tríceps', 'Tríceps', 'Tríceps'];
  const makeInput = () => ({ sessions: [{ dayLabel: 'A', title: 'Treino A — Peito e Tríceps', muscleFocus: 'Peitoral e Tríceps',
    cardioProtocol: { machine: 'Esteira', name: 'Cardio: Esteira', durationMin: 20 },
    exercises: groups.map((targetMuscle, i) => ({ name: `Exercício ${i}`, targetMuscle, restSeconds: 75, sets: [{ targetReps: 12 }] })),
  }] });
  const signatures = [];
  for (const experienceLevel of ['Iniciante', 'Intermediário', 'Avançado', 'Atleta']) {
    const profile = { ...emptyProfile('A'), experienceLevel, cardioMinutes: 30, timePerSessionMin: 45 };
    const result = applyWorkoutPolicy(makeInput(), profile).sessions[0];
    const strength = result.exercises.filter(e => e.targetMuscle !== 'Cardio & Resistência' && !/Abd/.test(e.targetMuscle));
    assert.ok(strength.every(e => e.sets.length === (['Avançado', 'Atleta'].includes(experienceLevel) && e.targetMuscle === 'Peitoral' ? 4 : 3)));
    if (experienceLevel !== 'Iniciante') assert.ok(strength.filter(e => e.targetMuscle === 'Tríceps').length >= 2);
    assert.equal(result.cardioProtocol.durationMin, 30);
    assert.equal(result.exercises.at(-1).sets[0].targetReps, 30);
    assert.ok(result.planningWarnings.some(w => w.includes('45 min')));
    signatures.push(strength.map(e => `${e.name}:${e.sets.length}`).join('|'));
  }
  assert.notEqual(signatures[0], signatures[1]);
  assert.notEqual(signatures[1], signatures[2]);
});

test('missing biceps variation respects available equipment and reported restrictions', () => {
  const input = { sessions: [{ dayLabel: 'B', muscleFocus: 'Costas e Bíceps', exercises: [
    { name: 'Remada', targetMuscle: 'Costas', sets: [] },
    { name: 'Rosca Direta com Barra Reta', exerciseId: 'ex-rosca-direta-barra-reta', targetMuscle: 'Bíceps', sets: [] },
  ] }] };
  const profile = { ...emptyProfile('A'), experienceLevel: 'Intermediário', timePerSessionMin: 120 };
  const gym = applyWorkoutPolicy(input, profile).sessions[0];
  assert.equal(gym.exercises.filter(e => e.targetMuscle === 'Bíceps').length, 2);
  const restricted = applyWorkoutPolicy(input, { ...profile, injuriesOrNotes: 'Dor no cotovelo' }).sessions[0];
  assert.equal(restricted.exercises.filter(e => e.targetMuscle === 'Bíceps').length, 1);
  assert.ok(restricted.planningWarnings.some(w => w.includes('duas variações')));
  const home = applyWorkoutPolicy(input, { ...profile, environment: 'Casa', equipment: [] }).sessions[0];
  assert.ok(home.exercises.filter(e => e.targetMuscle === 'Bíceps').every(e => !/polia|cabo/i.test(e.name)));
});

test('push day prioritizes chest with exact level quotas and preserves cardio and abs', () => {
  const groups = ['Peitoral', 'Peitoral', 'Peitoral', 'Peitoral', 'Ombros', 'Ombros', 'Tríceps', 'Tríceps', 'Tríceps'];
  const input = { sessions: [{ dayLabel: 'A', title: 'Treino A — Peito', exercises: groups.map((targetMuscle, i) => ({ name: `Movimento ${i}`, targetMuscle, sets: [] })),
    cardioProtocol: { machine: 'Esteira', name: 'Cardio', durationMin: 30 } }] };
  for (const [experienceLevel, counts] of [['Iniciante', [2, 1, 1]], ['Intermediário', [3, 1, 2]], ['Avançado', [4, 2, 3]]]) {
    const profile = { ...emptyProfile('A'), experienceLevel, cardioMinutes: 30 };
    const result = applyWorkoutPolicy(input, profile);
    const session = result.sessions[0];
    ['Peitoral', 'Ombros', 'Tríceps'].forEach((group, i) => assert.equal(session.exercises.filter(e => e.targetMuscle === group).length, counts[i]));
    assert.equal(session.exercises.filter(e => e.targetMuscle === 'Abdômen & Core').length, 1);
    assert.equal(session.exercises.at(-1).sets[0].targetReps, 30);
    assert.deepEqual(applyWorkoutPolicy(result, profile).sessions[0].exercises.map(e => [e.name, e.sets.length]), session.exercises.map(e => [e.name, e.sets.length]));
  }
});

test('Upper Lower and Full Body are distinct compositions across frequencies and remain stable', async () => {
  const { EXERCISE_LIBRARY } = await import('../src/data/exercises.ts');
  const { muscleKey } = await import('../src/services/workoutSplits.ts');
  const input = { sessions: [{ id: 'a', dayLabel: 'A', title: 'Treino A', exercises: EXERCISE_LIBRARY.filter(e => ['Peitoral', 'Costas', 'Pernas (Quadríceps)', 'Pernas (Posterior)', 'Glúteos', 'Panturrilhas', 'Ombros', 'Bíceps', 'Tríceps'].includes(e.primaryMuscle)).map(e => ({ id: e.id, exerciseId: e.id, name: e.name, targetMuscle: e.primaryMuscle, sets: [] })), cardioProtocol: { machine: 'Esteira', name: 'Cardio', durationMin: 20 } }] };
  const snapshot = JSON.stringify(input);
  for (const trainingSplit of ['UpperLower', 'FullBody']) for (const trainingDaysPerWeek of [2, 3, 4, 6]) {
    const profile = { ...emptyProfile('A'), experienceLevel: 'Intermediário', trainingSplit, trainingDaysPerWeek, cardioMinutes: 20 };
    const result = applyWorkoutPolicy(input, profile);
    assert.equal(result.sessions.length, trainingDaysPerWeek);
    assert.equal(new Set(result.sessions.map(s => s.id)).size, trainingDaysPerWeek);
    result.sessions.forEach((session, i) => {
      const groups = new Set(session.exercises.map(e => muscleKey(e.targetMuscle)));
      if (trainingSplit === 'FullBody') { assert.ok(groups.has('chest') && groups.has('back') && groups.has('quads')); assert.match(session.title, /Full Body/); }
      else if (i % 2 === 0) { assert.ok(groups.has('chest') && groups.has('back')); assert.ok(!groups.has('quads') && !groups.has('hamstrings')); }
      else { assert.ok(groups.has('quads') && groups.has('hamstrings')); assert.ok(!groups.has('chest') && !groups.has('back')); }
      assert.equal(session.cardioProtocol.durationMin, 20);
      assert.equal(new Set(session.exercises.map(e => e.exerciseId)).size, session.exercises.length);
    });
    const twice = applyWorkoutPolicy(result, profile);
    assert.deepEqual(twice.sessions.map(s => s.exercises.map(e => e.name)), result.sessions.map(s => s.exercises.map(e => e.name)));
  }
  assert.equal(JSON.stringify(input), snapshot);
});

test('alternate splits retain dedicated sport sessions and report equipment limitations', () => {
  const sport = { id: 'run', dayLabel: 'Corrida', title: 'Corrida', exercises: [{ name: 'Corrida', targetMuscle: 'Cardio & Resistência', sets: 1, reps: '20 min' }] };
  const input = { sessions: [{ id: 'strength', dayLabel: 'A', title: 'Treino A', exercises: [{ name: 'Flexão', targetMuscle: 'Peitoral', sets: 3 }] }, sport] };
  const output = applyWorkoutPolicy(input, { ...emptyProfile('A'), environment: 'Casa', trainingSplit: 'FullBody', trainingDaysPerWeek: 2, equipment: [], injuriesOrNotes: 'Dor no ombro' });
  assert.deepEqual(output.sessions[1].exercises, sport.exercises);
  assert.ok(output.sessions[0].planningWarnings.some(w => w.includes('Faltam movimentos')));
  assert.ok(!output.sessions[0].exercises.some(e => /polia|barra|maquina/i.test(e.name)));
});
