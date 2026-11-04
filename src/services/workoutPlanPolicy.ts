import { EXERCISE_LIBRARY } from '../data/exercises';
import type { UserProfile, WorkoutPlan } from '../types';

type PlanningProfile = Pick<UserProfile, 'environment' | 'equipment' | 'injuriesOrNotes' | 'timePerSessionMin' | 'trainingDaysPerWeek'>;
const plain = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const bounded = (n: unknown, fallback: number, min: number, max: number) => Math.max(min, Math.min(max, Number(n) || fallback));
const isCardio = (e: any) => /cardio|aerobico/.test(plain(e.targetMuscle || '')) || /cardio|esteira|bicicleta|simulador de escada/.test(plain(e.name || ''));
// Take one movement from every primary muscle group before repeating a group.
// The source list often puts all chest exercises before shoulders and triceps.
function balancedOrder(exercises: any[]) {
  const groups = new Map<string, any[]>();
  for (const e of exercises) {
    const group = plain(e.targetMuscle || 'musculacao');
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(e);
  }
  const ordered: any[] = [];
  while ([...groups.values()].some(group => group.length)) {
    for (const group of groups.values()) if (group.length) ordered.push(group.shift());
  }
  return [...ordered.filter(e => !/abd|core/.test(plain(e.targetMuscle || ''))),
    ...ordered.filter(e => /abd|core/.test(plain(e.targetMuscle || '')))];
}

/** Shared by server, browser AI responses and offline generation. Never touches saved routines. */
export function applyWorkoutPolicy<T extends { sessions: any[] }>(plan: T, profile: PlanningProfile): T {
  const duration = bounded(profile.timePerSessionMin, 45, 15, 120);
  const frequency = bounded(profile.trainingDaysPerWeek, 3, 1, 6);
  const sessions = (plan.sessions || []).slice(0, frequency);
  const isCardioOnly = (session: any) => session.exercises?.length > 0 && session.exercises.every((e: any) => /cardio|mobilidade/.test(plain(e.targetMuscle || '')));
  const strengthIndexes = sessions.map((s, i) => isCardioOnly(s) ? -1 : i).filter(i => i >= 0);
  const absDays = new Set([strengthIndexes[0], strengthIndexes[Math.floor(strengthIndexes.length / 2)]]);
  const equipment = plain((profile.equipment || []).join(' '));
  const useCable = plain(profile.environment || '').includes('academia') || equipment.includes('polia') || equipment.includes('cabo');
  const abs = EXERCISE_LIBRARY.find(e => e.id === (useCable ? 'ex-abdominal-polia-cable-crunch' : 'ex-abdominal-supra-solo'))!;
  const needsAssessment = /lombar|coluna|hernia|gesta|gravidez|pos.parto|cirurg|diastase/.test(plain(profile.injuriesOrNotes || ''));
  const result = sessions.map((session, index) => {
    // A running/swimming session is not an accessory slot for abdominal work.
    if (isCardioOnly(session)) return { ...session, completedCount: 0, lastPerformed: undefined };
    const canonical = Array.isArray(session.exercises?.[0]?.sets) || 'dayLabel' in session;
    const cardioSource = (session.exercises || []).find(isCardio);
    const requestedCardio = bounded(session.cardioProtocol?.durationMin || (canonical ? cardioSource?.sets?.[0]?.targetReps : parseInt(cardioSource?.reps)), 0, 0, 60);
    const sourceProtocol = session.cardioProtocol || (cardioSource && requestedCardio >= 5 ? {
      machine: /bicicleta|bike/.test(plain(cardioSource.name)) ? 'Bicicleta' : /escada/.test(plain(cardioSource.name)) ? 'Escada' : 'Esteira',
      name: cardioSource.name, durationMin: requestedCardio, parameters: cardioSource.notes || '', intensity: '', estimatedKcal: 0, benefits: '',
    } : undefined);
    const hasCardio = requestedCardio >= 5 && !!sourceProtocol;
    const seen = new Set<string>();
    const exercises: any[] = (session.exercises || []).filter((exercise: any) => {
      const key = plain(exercise.name || '');
      if (!key || /prancha|plank|vacuum/.test(key) || seen.has(key) || isCardio(exercise)) return false;
      seen.add(key); return true;
    }).map((exercise: any, eIdx: number) => {
      const count = Array.isArray(exercise.sets) ? exercise.sets.length : exercise.sets;
      const restSeconds = bounded(exercise.restSeconds, 75, 30, 180);
      const sets = bounded(count, 3, 1, 4);
      return { ...exercise, restSeconds, sets: canonical ? Array.from({ length: sets }, (_, i) => ({ id: `set-${index}-${eIdx}-${i}`, setNumber: i + 1, type: 'working', weightKg: 0, targetReps: bounded(exercise.sets?.[i]?.targetReps, 10, 1, 30), completed: false })) : sets };
    });
    // Reserve a slot for a dynamic abdominal exercise, rather than appending it to a long session.
    const maxExercises = Math.min(6, Math.max(1, Math.floor((duration - 5 - (hasCardio ? 5 : 0)) / 3)));
    const selected = balancedOrder(exercises).slice(0, maxExercises);
    const hasAbs = selected.some(e => /abd|core/.test(plain(e.targetMuscle || '')));
    if (absDays.has(index) && !hasAbs && !needsAssessment) {
      if (selected.length >= maxExercises) selected.pop();
      selected.push({ id: `abs-${index}`, exerciseId: abs.id, name: abs.name, targetMuscle: 'Abdômen & Core', restSeconds: 60, notes: 'Movimento controlado. Ajuste a carga à sua execução.', reps: '10-15', sets: canonical ? Array.from({ length: 2 }, (_, i) => ({ id: `abs-set-${index}-${i}`, setNumber: i + 1, type: 'working', weightKg: 0, targetReps: 12, completed: false })) : 2 });
    }
    const cost = (e: any) => (Array.isArray(e.sets) ? e.sets.length : e.sets) * (45 + e.restSeconds) / 60 + 1;
    // Trim accessory sets first; preserve at least one set of each selected movement.
    const available = duration - 5;
    const cardioReserve = hasCardio ? Math.min(requestedCardio, Math.max(5, Math.floor(available * 0.4))) : 0;
    const liftingBudget = available - cardioReserve;
    while (selected.reduce((n, e) => n + cost(e), 0) > liftingBudget) {
      const largest = [...selected].sort((a, b) => cost(b) - cost(a)).find(e => (Array.isArray(e.sets) ? e.sets.length : e.sets) > 1);
      if (!largest) break;
      if (Array.isArray(largest.sets)) largest.sets.pop(); else largest.sets--;
    }
    // Very short sessions may not fit every group even at one set. Keep the
    // scheduled abdominal movement, and describe only the groups actually kept.
    while (selected.length > 1 && selected.reduce((n, e) => n + cost(e), 0) > available - (hasCardio ? 5 : 0)) {
      let removable = selected.length - 1;
      while (removable >= 0 && /abd|core/.test(plain(selected[removable].targetMuscle || ''))) removable--;
      selected.splice(removable >= 0 ? removable : selected.length - 1, 1);
    }
    const lifting = selected.reduce((n, e) => n + cost(e), 0);
    const cardioDuration = hasCardio ? Math.max(0, Math.min(requestedCardio, Math.floor(available - lifting))) : 0;
    const cardioProtocol = cardioDuration >= 5 ? { ...sourceProtocol, durationMin: cardioDuration,
      estimatedKcal: Math.round((sourceProtocol.estimatedKcal || 0) * cardioDuration / requestedCardio) } : undefined;
    const cardioExercise = cardioProtocol ? { ...cardioSource, id: `cardio-${index}`, exerciseId: cardioSource?.exerciseId || `ex-cardio-${plain(cardioProtocol.machine)}`,
      name: cardioProtocol.name, targetMuscle: 'Cardio & Resistência', restSeconds: 0,
      notes: `${cardioProtocol.durationMin} min · ${cardioProtocol.parameters} · ${cardioProtocol.intensity}`,
      reps: `${cardioDuration} min`, sets: canonical ? [{ id: `cardio-set-${index}`, setNumber: 1, type: 'working', weightKg: 0, targetReps: cardioDuration, completed: false }] : 1 } : undefined;
    const focus = [...new Set(selected.map(e => e.targetMuscle).filter(Boolean))].join(', ');
    return { ...session, completedCount: 0, lastPerformed: undefined, exercises: [...selected, ...(cardioExercise ? [cardioExercise] : [])],
      ...(session.title ? { title: `${session.title.split('—')[0].trim()} — ${focus}` } : {}),
      ...(session.muscleFocus !== undefined ? { muscleFocus: focus } : {}),
      ...(session.focus !== undefined ? { focus } : {}),
      estimatedMinutes: Math.min(duration, Math.ceil(5 + lifting + cardioDuration)),
      estimatedDurationMin: Math.min(duration, Math.ceil(5 + lifting + cardioDuration)),
      cardioProtocol,
    };
  });
  return { ...plan, sessions: result, ...(needsAssessment ? { description: 'Informe suas restrições ao profissional responsável antes de incluir abdominais. ' + ((plan as any).description || '') } : {}) };
}

export function prepareGeneratedPlan(plan: WorkoutPlan, profile: PlanningProfile) {
  return applyWorkoutPolicy(plan, profile);
}
