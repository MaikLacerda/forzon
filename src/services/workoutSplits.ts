import { EXERCISE_LIBRARY } from '../data/exercises';
import type { UserProfile } from '../types';

const plain = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function muscleKey(value: string) {
  const s = plain(value || '');
  if (/peito|peitoral/.test(s)) return 'chest';
  if (/costas|dorsa/.test(s)) return 'back';
  if (/ombro|delto/.test(s)) return 'shoulders';
  if (/triceps/.test(s)) return 'triceps';
  if (/biceps/.test(s)) return 'biceps';
  if (/quadriceps/.test(s)) return 'quads';
  if (/posterior|isquiot/.test(s)) return 'hamstrings';
  if (/glute/.test(s)) return 'glutes';
  if (/panturr|soleo/.test(s)) return 'calves';
  if (/abd|core/.test(s)) return 'abs';
  return s;
}
export const sameMovement = (a: any, b: any) => (a.exerciseId && (a.exerciseId === b.id || a.exerciseId === b.exerciseId)) ||
  plain(a.name).includes(plain(b.name)) || plain(b.name).includes(plain(a.name));

type SplitProfile = Pick<UserProfile, 'environment' | 'equipment' | 'injuriesOrNotes' | 'trainingDaysPerWeek'> & Partial<Pick<UserProfile, 'trainingSplit'>>;
export function canAddExercise(exercise: any, profile: SplitProfile) {
  if (profile.injuriesOrNotes?.trim()) return false;
  if (/academia|hibrid/.test(plain(profile.environment || ''))) return true;
  return (profile.equipment || []).some(e => plain(e) === plain(exercise.equipment)) || /peso corporal/.test(plain(exercise.equipment));
}

/** Recompose strength days only. Dedicated sport sessions retain their order/data. */
export function composeSplitSessions(inputSessions: any[], profile: SplitProfile) {
  const sessions = [...inputSessions];
  const split = profile.trainingSplit || 'ABC';
  if (!['UpperLower', 'FullBody'].includes(split)) return sessions;
  const strength = sessions.filter(s => !/wod|combate|corrida|natacao|cross training|metcon/.test(plain(`${s.title || ''} ${s.dayLabel || ''}`)) && s.exercises?.some((e: any) => !/cardio|mobilidade/.test(plain(e.targetMuscle || ''))));
  if (!strength.length) return sessions;
  const frequency = Math.max(1, Math.min(6, Number(profile.trainingDaysPerWeek) || sessions.length));
  while (sessions.length < frequency) {
    const template = strength[(sessions.length - inputSessions.length) % strength.length];
    const next = { ...template, id: `${template.id || 'session'}-extra-${sessions.length}`, splitKind: undefined, dayLabel: `Dia ${sessions.length + 1}` };
    sessions.push(next); strength.push(next);
  }
  if (strength.every((s, i) => s.splitKind === (split === 'FullBody' ? 'FullBody' : i % 2 === 0 ? 'Upper' : 'Lower'))) return sessions;
  const pool: any[] = [];
  for (const e of strength.flatMap(s => s.exercises || [])) {
    if (/cardio|mobilidade/.test(plain(e.targetMuscle || '')) || /prancha|plank|vacuum/.test(plain(e.name || ''))) continue;
    if (!pool.some(p => sameMovement(p, e))) pool.push(e);
  }
  const raw = (e: any) => ({ id: e.id, exerciseId: e.id, name: e.name, targetMuscle: e.primaryMuscle, sets: 3, reps: '10-12', restSeconds: 75 });
  let ordinal = 0;
  return sessions.map(session => {
    if (!strength.includes(session)) return session;
    const n = ordinal++;
    const kind = split === 'FullBody' ? 'FullBody' : n % 2 === 0 ? 'Upper' : 'Lower';
    const slots = kind === 'Upper' ? ['chest', 'back', 'chest', 'back', 'shoulders', 'biceps', 'triceps'] :
      kind === 'Lower' ? ['quads', 'hamstrings', 'quads', 'hamstrings', 'glutes', 'calves'] :
        ['quads', 'chest', 'back', 'hamstrings', 'shoulders', n % 2 ? 'triceps' : 'biceps'];
    const selected: any[] = [];
    const missing: string[] = [];
    for (const group of slots) {
      const source = pool.filter(e => muscleKey(e.targetMuscle) === group);
      const candidates = [...source.slice(n % Math.max(1, source.length)), ...source.slice(0, n % Math.max(1, source.length)),
        ...EXERCISE_LIBRARY.filter(e => muscleKey(e.primaryMuscle) === group && canAddExercise(e, profile)).map(raw)];
      const next = candidates.find(e => !selected.some(p => sameMovement(p, e)));
      if (next) selected.push({ ...next }); else missing.push(group);
    }
    return { ...session, id: `${session.id || 'session'}-${kind}-${n}`, splitKind: kind,
      title: `Treino ${String.fromCharCode(65 + n)} — ${kind === 'FullBody' ? 'Full Body' : kind}`,
      muscleFocus: kind === 'Upper' ? 'Membros superiores' : kind === 'Lower' ? 'Membros inferiores' : 'Corpo inteiro',
      warmupProtocol: kind === 'Upper' ? '5 minutos de aquecimento leve e mobilidade dos membros superiores.' : kind === 'Lower' ? '5 minutos de aquecimento leve e mobilidade dos membros inferiores.' : '5 minutos de aquecimento leve e mobilidade geral.',
      focus: kind, exercises: [...selected, ...(session.exercises || []).filter((e: any) => /cardio/.test(plain(e.targetMuscle || '')))], compositionWarnings: missing.length ? [`Faltam movimentos para ${[...new Set(missing)].join(', ')} nesta divisão com os equipamentos e restrições informados.`] : [] };
  });
}
