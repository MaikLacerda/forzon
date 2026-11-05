import type { UserProfile, WorkoutPlan, DailyNutrition } from '../types';

export function emptyProfile(id: string, name = 'Atleta'): UserProfile {
  return {
    id, name, handle: '', avatarUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23171717"/%3E%3Ccircle cx="40" cy="28" r="14" fill="%2322d3ee"/%3E%3Cpath d="M12 80a28 28 0 0156 0" fill="%2322d3ee"/%3E%3C/svg%3E', birthYear: 0, heightCm: 0, weightKg: 0,
    mainGoal: '', secondaryGoals: [], experienceLevel: 'Iniciante', trainingDaysPerWeek: 3,
    timePerSessionMin: 45, environment: 'Academia', equipment: [], dietaryPreference: '',
    dailyWaterGoalMl: 0, dailyCalorieGoal: 0, injuriesOrNotes: '', gpsPrivacyCloaking: true,
    consents: { lgpdDataCollection: false, healthSensorsConsent: false, termsAcceptedAt: '' },
    followingIds: [], isPremium: false, createdAt: new Date().toISOString(), bioimpedanceHistory: [],
  };
}
export function emptyPlan(): WorkoutPlan {
  return { id: 'new-plan', title: 'Seu plano de treino', description: 'Complete sua avaliação para criar seu primeiro plano.', frequencyDaysPerWeek: 0, sessions: [], active: false, updatedAt: new Date().toISOString() };
}
export function emptyNutrition(): DailyNutrition {
  return { targetCalories: 0, targetProteinG: 0, targetCarbsG: 0, targetFatG: 0, consumedCalories: 0, consumedProteinG: 0, consumedCarbsG: 0, consumedFatG: 0, waterIntakeMl: 0, waterGoalMl: 0, meals: [] };
}
export function trainingStreak(records: { completedAt: string }[], now = new Date()): number {
  const day = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const dates = new Set(records.map(r => day(new Date(r.completedAt))));
  const cursor = new Date(now); let count = 0;
  if (!dates.has(day(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(day(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); }
  return count;
}
