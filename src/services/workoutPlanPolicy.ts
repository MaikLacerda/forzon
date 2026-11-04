import { EXERCISE_LIBRARY } from '../data/exercises';
import type { UserProfile, WorkoutPlan } from '../types';

type PlanningProfile = Pick<UserProfile, 'environment' | 'equipment' | 'injuriesOrNotes' | 'timePerSessionMin' | 'trainingDaysPerWeek'> & Partial<Pick<UserProfile, 'experienceLevel'>> & { cardioMinutes?: number };
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
  const level = plain(profile.experienceLevel || 'Iniciante');
  const advanced = /avancado|atleta/.test(level);
  const beginner = level === 'iniciante';
  const workingSets = advanced ? 4 : 3;
  const maxStrength = beginner ? 5 : level === 'atleta' ? 9 : advanced ? 8 : 7;
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
    const requestedCardio = bounded(profile.cardioMinutes ?? session.cardioProtocol?.durationMin ?? (canonical ? cardioSource?.sets?.[0]?.targetReps : parseInt(cardioSource?.reps)), 0, 0, 60);
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
      const restSeconds = bounded(exercise.restSeconds, 75, 30, 180);
      const sets = /abd|core/.test(plain(exercise.targetMuscle || '')) ? (beginner ? 2 : 3) : workingSets;
      return { ...exercise, restSeconds, sets: canonical ? Array.from({ length: sets }, (_, i) => ({ id: `set-${index}-${eIdx}-${i}`, setNumber: i + 1, type: 'working', weightKg: 0, targetReps: bounded(exercise.sets?.[i]?.targetReps || parseInt(exercise.reps), 10, 1, 30), completed: false })) : sets };
    });
    const planningWarnings: string[] = [];
    const armGroups = ['biceps', 'triceps'].filter(group => new RegExp(group).test(plain(`${session.muscleFocus || session.focus || ''} ${session.title || ''} ${exercises.map(e => e.targetMuscle).join(' ')}`)));
    // Add a missing variation only when equipment is available and no reported
    // restriction requires a professional to choose the replacement.
    if (!beginner) for (const group of armGroups) {
      const matching = () => exercises.filter(e => plain(e.targetMuscle || '') === group);
      for (const candidate of EXERCISE_LIBRARY.filter(e => plain(e.primaryMuscle) === group)) {
        if (matching().length >= 2 || profile.injuriesOrNotes?.trim()) break;
        const gym = /academia|hibrid/.test(plain(profile.environment || ''));
        const available = gym || (profile.equipment || []).some(e => plain(e) === plain(candidate.equipment)) || matching().some(e => plain(e.name).includes(plain(candidate.equipment)));
        if (!available || exercises.some(e => e.exerciseId === candidate.id || plain(e.name) === plain(candidate.name))) continue;
        exercises.push({ id: `arm-${index}-${candidate.id}`, exerciseId: candidate.id, name: candidate.name, targetMuscle: candidate.primaryMuscle, restSeconds: 75,
          reps: '10-12', sets: canonical ? Array.from({ length: workingSets }, (_, i) => ({ id: `arm-set-${index}-${candidate.id}-${i}`, setNumber: i + 1, type: 'working', weightKg: 0, targetReps: 10, completed: false })) : workingSets });
      }
      if (matching().length < 2) planningWarnings.push(`Não foi possível incluir duas variações de ${group === 'biceps' ? 'bíceps' : 'tríceps'} com os equipamentos e restrições informados. Revise essa sessão.`);
    }
    // Reserve a slot for a dynamic abdominal exercise, rather than appending it to a long session.
    const maxExercises = maxStrength;
    const ordered = balancedOrder(exercises);
    const required = new Set<any>();
    const groups = new Set<string>();
    for (const exercise of ordered) {
      const group = plain(exercise.targetMuscle || '');
      if (!groups.has(group)) { required.add(exercise); groups.add(group); }
    }
    if (!beginner) for (const group of armGroups) for (const e of ordered.filter(e => plain(e.targetMuscle || '') === group).slice(0, 2)) required.add(e);
    const reserveAbs = absDays.has(index) && !needsAssessment && !ordered.some(e => /abd|core/.test(plain(e.targetMuscle || '')));
    const selected = [...required];
    for (const exercise of ordered) if (!required.has(exercise) && selected.length < maxExercises - (reserveAbs ? 1 : 0)) selected.push(exercise);
    const hasAbs = selected.some(e => /abd|core/.test(plain(e.targetMuscle || '')));
    if (absDays.has(index) && !hasAbs && !needsAssessment) {
      selected.push({ id: `abs-${index}`, exerciseId: abs.id, name: abs.name, targetMuscle: 'Abdômen & Core', restSeconds: 60, notes: 'Movimento controlado. Ajuste a carga à sua execução.', reps: '10-15', sets: canonical ? Array.from({ length: beginner ? 2 : 3 }, (_, i) => ({ id: `abs-set-${index}-${i}`, setNumber: i + 1, type: 'working', weightKg: 0, targetReps: 12, completed: false })) : beginner ? 2 : 3 });
    }
    selected.sort((a, b) => Number(/abd|core/.test(plain(a.targetMuscle || ''))) - Number(/abd|core/.test(plain(b.targetMuscle || ''))));
    const cost = (e: any) => (Array.isArray(e.sets) ? e.sets.length : e.sets) * (45 + e.restSeconds) / 60 + 1;
    const lifting = selected.reduce((n, e) => n + cost(e), 0);
    const cardioDuration = hasCardio ? requestedCardio : 0;
    const estimatedMinutes = Math.ceil(5 + lifting + cardioDuration);
    if (estimatedMinutes > duration) planningWarnings.push(`Esta sessão exige cerca de ${estimatedMinutes} min; sua disponibilidade é ${duration} min. O cardio de ${cardioDuration} min e as séries do nível foram preservados. Aumente o tempo disponível ou revise a divisão antes de aplicar.`);
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
      estimatedMinutes,
      estimatedDurationMin: estimatedMinutes,
      planningWarnings,
      cardioProtocol,
    };
  });
  return { ...plan, sessions: result, ...(needsAssessment ? { description: 'Informe suas restrições ao profissional responsável antes de incluir abdominais. ' + ((plan as any).description || '') } : {}) };
}

export function prepareGeneratedPlan(plan: WorkoutPlan, profile: PlanningProfile) {
  return applyWorkoutPolicy(plan, profile);
}
