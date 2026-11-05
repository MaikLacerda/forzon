import { EXERCISE_LIBRARY } from '../data/exercises';
import type { UserProfile, WorkoutPlan } from '../types';

type PlanningProfile = Pick<UserProfile, 'environment' | 'equipment' | 'injuriesOrNotes' | 'timePerSessionMin' | 'trainingDaysPerWeek'>;
const plain = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const bounded = (n: unknown, fallback: number, min: number, max: number) => Math.max(min, Math.min(max, Number(n) || fallback));

/** Shared by server, browser AI responses and offline generation. Never touches saved routines. */
export function applyWorkoutPolicy<T extends { sessions: any[] }>(plan: T, profile: PlanningProfile): T {
  const duration = bounded(profile.timePerSessionMin, 45, 15, 120);
  const frequency = bounded(profile.trainingDaysPerWeek, 3, 1, 6);
  const sessions = (plan.sessions || []).slice(0, frequency);
  const absDays = new Set([0, Math.floor(sessions.length / 2)]);
  const equipment = plain((profile.equipment || []).join(' '));
  const useCable = plain(profile.environment || '').includes('academia') || equipment.includes('polia') || equipment.includes('cabo');
  const abs = EXERCISE_LIBRARY.find(e => e.id === (useCable ? 'ex-abdominal-polia-cable-crunch' : 'ex-abdominal-supra-solo'))!;
  const needsAssessment = /lombar|coluna|hernia|gesta|gravidez|pos.parto|cirurg|diastase/.test(plain(profile.injuriesOrNotes || ''));
  const result = sessions.map((session, index) => {
    const canonical = Array.isArray(session.exercises?.[0]?.sets) || 'dayLabel' in session;
    const seen = new Set<string>();
    const exercises: any[] = (session.exercises || []).filter((exercise: any) => {
      const key = plain(exercise.name || '');
      if (!key || /prancha|plank|vacuum/.test(key) || seen.has(key) || /cardio|aerobico/.test(plain(exercise.targetMuscle || ''))) return false;
      seen.add(key); return true;
    }).map((exercise: any, eIdx: number) => {
      const count = Array.isArray(exercise.sets) ? exercise.sets.length : exercise.sets;
      const restSeconds = bounded(exercise.restSeconds, 75, 30, 180);
      const sets = bounded(count, 3, 1, 4);
      return { ...exercise, restSeconds, sets: canonical ? Array.from({ length: sets }, (_, i) => ({ id: `set-${index}-${eIdx}-${i}`, setNumber: i + 1, type: 'working', weightKg: 0, targetReps: bounded(exercise.sets?.[i]?.targetReps, 10, 1, 30), completed: false })) : sets };
    });
    // Reserve a slot for a dynamic abdominal exercise, rather than appending it to a long session.
    const maxExercises = Math.min(6, Math.max(2, Math.floor((duration - 5) / 6)));
    const selected = exercises.slice(0, maxExercises);
    const hasAbs = selected.some(e => /abd|core/.test(plain(e.targetMuscle || '')));
    if (absDays.has(index) && !hasAbs && !needsAssessment) {
      if (selected.length >= maxExercises) selected.pop();
      selected.push({ id: `abs-${index}`, exerciseId: abs.id, name: abs.name, targetMuscle: 'Abdômen & Core', restSeconds: 60, notes: 'Movimento controlado. Ajuste a carga à sua execução.', reps: '10-15', sets: canonical ? Array.from({ length: 2 }, (_, i) => ({ id: `abs-set-${index}-${i}`, setNumber: i + 1, type: 'working', weightKg: 0, targetReps: 12, completed: false })) : 2 });
    }
    const cost = (e: any) => (Array.isArray(e.sets) ? e.sets.length : e.sets) * (45 + e.restSeconds) / 60 + 1;
    // Trim accessory sets first; preserve at least one set of each selected movement.
    const available = duration - 5;
    while (selected.reduce((n, e) => n + cost(e), 0) > available) {
      const largest = [...selected].sort((a, b) => cost(b) - cost(a)).find(e => (Array.isArray(e.sets) ? e.sets.length : e.sets) > 1);
      if (!largest) break;
      if (Array.isArray(largest.sets)) largest.sets.pop(); else largest.sets--;
    }
    const lifting = selected.reduce((n, e) => n + cost(e), 0);
    const cardioDuration = Math.max(0, Math.min(session.cardioProtocol?.durationMin || 0, Math.floor(available - lifting)));
    return { ...session, completedCount: 0, lastPerformed: undefined, exercises: selected,
      estimatedMinutes: Math.min(duration, Math.ceil(5 + lifting + cardioDuration)),
      estimatedDurationMin: Math.min(duration, Math.ceil(5 + lifting + cardioDuration)),
      cardioProtocol: cardioDuration >= 5 ? { ...session.cardioProtocol, durationMin: cardioDuration } : undefined,
    };
  });
  return { ...plan, sessions: result, ...(needsAssessment ? { description: 'Informe suas restrições ao profissional responsável antes de incluir abdominais. ' + ((plan as any).description || '') } : {}) };
}

export function prepareGeneratedPlan(plan: WorkoutPlan, profile: PlanningProfile) {
  return applyWorkoutPolicy(plan, profile);
}
