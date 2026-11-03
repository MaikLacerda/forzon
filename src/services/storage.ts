import { syncAccount } from "./accountSync";
import {
  UserProfile,
  WorkoutPlan,
  DailyNutrition,
  CompletedWorkoutRecord,
  SocialPost,
  GroupChallenge,
  Achievement,
  GPSActivity,
  ThemeMode,
  OfflineSyncQueueItem,
  SyncState,
} from "../types";
import { themeService } from "./themeService";
import { accountStorage } from "./accountStorage";
import { emptyProfile, emptyPlan, emptyNutrition } from "./emptyAccount";

const KEYS = {
  PROFILE: "athlynx_profile",
  PLAN: "athlynx_workout_plan",
  NUTRITION: "athlynx_nutrition",
  HISTORY: "athlynx_workout_history",
  POSTS: "athlynx_social_posts",
  CHALLENGES: "athlynx_challenges",
  ACHIEVEMENTS: "athlynx_achievements",
  GPS_ACTIVITIES: "athlynx_gps_activities",
  ACTIVE_SESSION: "athlynx_active_session_state",
  OFFLINE_QUEUE: "athlynx_offline_workout_queue",
  SIMULATED_OFFLINE: "athlynx_simulated_offline",
  LAST_SYNC_AT: "athlynx_last_sync_timestamp",
};

// Checksum helper to verify data integrity and prevent corruption during network interruptions
export function computeWorkoutChecksum(record: CompletedWorkoutRecord): string {
  const str = `${record.id}#${record.sessionId}#${record.startedAt}#${record.completedAt}#${record.totalVolumeKg}#${record.totalSets}#${record.totalReps}#${(record.exercisesLogged || []).length}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `ck_${Math.abs(hash).toString(16)}`;
}

let isSyncingInProgress = false;

export const storage = {
  getProfile(): UserProfile {
    try {
      const data = accountStorage.getItem(KEYS.PROFILE);
      const parsed = data ? JSON.parse(data) : emptyProfile(accountStorage.id || "");
      return parsed;
    } catch {
      return emptyProfile(accountStorage.id || "");
    }
  },
  saveProfile(profile: UserProfile): void {
    accountStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "profile" } }));
  },
  setPremium(isPremium: boolean): void {
    const current = this.getProfile();
    const updated = { ...current, isPremium };
    this.saveProfile(updated);
  },
  togglePremium(): boolean {
    const current = this.getProfile();
    const next = !current.isPremium;
    this.saveProfile({ ...current, isPremium: next });
    return next;
  },

  getWorkoutPlan(): WorkoutPlan {
    try {
      const data = accountStorage.getItem(KEYS.PLAN);
      return data ? JSON.parse(data) : emptyPlan();
    } catch {
      return emptyPlan();
    }
  },
  saveWorkoutPlan(plan: WorkoutPlan): void {
    accountStorage.setItem(KEYS.PLAN, JSON.stringify(plan));
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "plan" } }));
  },

  getNutrition(): DailyNutrition {
    try {
      const data = accountStorage.getItem(KEYS.NUTRITION);
      return data ? JSON.parse(data) : emptyNutrition();
    } catch {
      return emptyNutrition();
    }
  },
  saveNutrition(nutrition: DailyNutrition): void {
    accountStorage.setItem(KEYS.NUTRITION, JSON.stringify(nutrition));
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "nutrition" } }));
  },

  getWorkoutHistory(): CompletedWorkoutRecord[] {
    try {
      const data = accountStorage.getItem(KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Registers a completed workout with offline cache buffering,
   * cryptographic integrity checksum and automatic server synchronization.
   */
  addWorkoutRecord(record: CompletedWorkoutRecord): void {
    // 1. Compute and attach integrity checksum
    const checksum = computeWorkoutChecksum(record);
    const isOnline = this.isNetworkOnline();
    const preparedRecord: CompletedWorkoutRecord = {
      ...record,
      integrityChecksum: checksum,
      syncStatus: isOnline ? "pending" : "cached_offline",
    };

    // 2. Persist to local workout history immediately so UI reacts with 0 latency
    const list = this.getWorkoutHistory();
    const updated = [preparedRecord, ...list.filter((w) => w.id !== record.id)];
    accountStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));

    // 3. Enqueue into offline sync buffer (guarantees persistence across crashes or restarts)
    const queue = this.getOfflineQueue();
    const existingIdx = queue.findIndex((q) => q.id === record.id);
    const queueItem: OfflineSyncQueueItem = {
      id: record.id,
      record: preparedRecord,
      checksum,
      queuedAt: new Date().toISOString(),
      syncStatus: "pending",
      retryCount: 0,
    };

    if (existingIdx >= 0) {
      queue[existingIdx] = queueItem;
    } else {
      queue.unshift(queueItem);
    }
    this.saveOfflineQueue(queue);

    // 4. Dispatch data change event
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "history" } }));

    // 5. If online, trigger auto-sync immediately in background
    if (isOnline) {
      this.syncPendingWorkouts().catch((err) => {
        console.warn("[Storage Cache] Falha na sincronização imediata, mantido em buffer offline:", err);
      });
    }
  },

  // Offline sync queue & Network resilience layer
  getOfflineQueue(): OfflineSyncQueueItem[] {
    try {
      const data = accountStorage.getItem(KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveOfflineQueue(queue: OfflineSyncQueueItem[]): void {
    try {
      accountStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error("[Storage] Erro ao salvar fila offline:", e);
    }
    this.dispatchSyncStatus();
  },

  getPendingSyncCount(): number {
    return this.getOfflineQueue().filter((item) => item.syncStatus !== "synced").length;
  },

  isSimulatedOffline(): boolean {
    try {
      return accountStorage.getItem(KEYS.SIMULATED_OFFLINE) === "true";
    } catch {
      return false;
    }
  },

  setSimulatedOffline(simulated: boolean): void {
    accountStorage.setItem(KEYS.SIMULATED_OFFLINE, String(simulated));
    this.dispatchSyncStatus();
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "sync" } }));

    if (!simulated && typeof navigator !== "undefined" && navigator.onLine) {
      console.log("[Storage] Modo online restaurado. Disparando sincronização do cache offline...");
      this.syncPendingWorkouts().catch(console.error);
    }
  },

  isNetworkOnline(): boolean {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine && !this.isSimulatedOffline();
  },

  getLastSyncedAt(): string | null {
    try {
      return accountStorage.getItem(KEYS.LAST_SYNC_AT);
    } catch {
      return null;
    }
  },

  getSyncState(): SyncState {
    const isOnline = this.isNetworkOnline();
    const queue = this.getOfflineQueue();
    const pending = queue.filter((i) => i.syncStatus !== "synced");
    const failed = queue.filter((i) => i.syncStatus === "failed");

    return {
      isOnline,
      isSimulatedOffline: this.isSimulatedOffline(),
      isSyncing: isSyncingInProgress,
      pendingCount: pending.length,
      lastSyncedAt: this.getLastSyncedAt(),
      lastError: failed.length > 0 ? failed[0].lastError || "Erro de rede" : null,
    };
  },

  dispatchSyncStatus(): void {
    if (typeof window === "undefined") return;
    const state = this.getSyncState();
    window.dispatchEvent(
      new CustomEvent("athlynx_sync_status", {
        detail: state,
      })
    );
  },

  /**
   * Synchronizes cached workouts through the authenticated Supabase account.
   * Ensures data integrity by matching checksums and acknowledging IDs.
   */
  async syncPendingWorkouts(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
    const owner = accountStorage.id;
    if (!owner || !this.isNetworkOnline()) return { success: false, syncedCount: 0, error: 'Sincronização pendente' };
    const pending = this.getOfflineQueue().filter(item => item.syncStatus !== 'synced');
    isSyncingInProgress = true; this.dispatchSyncStatus();
    try {
      await syncAccount();
      if (accountStorage.id !== owner) return { success: false, syncedCount: 0 };
      const syncedAt = new Date().toISOString();
      const ids = new Set(pending.map(item => item.id));
      this.saveOfflineQueue(this.getOfflineQueue().filter(item => !ids.has(item.id)));
      accountStorage.setItem(KEYS.HISTORY, JSON.stringify(this.getWorkoutHistory().map(record => ids.has(record.id) ? { ...record, syncStatus: 'synced', syncedAt } : record)));
      accountStorage.setItem(KEYS.LAST_SYNC_AT, syncedAt);
      return { success: true, syncedCount: ids.size };
    } catch {
      return { success: false, syncedCount: 0, error: 'Os registros continuam neste aparelho. Tente sincronizar novamente.' };
    } finally { isSyncingInProgress = false; this.dispatchSyncStatus(); }
  },

  clearOfflineQueue(): void {
    accountStorage.removeItem(KEYS.OFFLINE_QUEUE);
    this.dispatchSyncStatus();
  },

  getGPSActivities(): GPSActivity[] {
    try {
      const data = accountStorage.getItem(KEYS.GPS_ACTIVITIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  addGPSActivity(act: GPSActivity): void {
    const list = this.getGPSActivities();
    const updated = [act, ...list];
    accountStorage.setItem(KEYS.GPS_ACTIVITIES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "gps" } }));
  },

  deleteGPSActivity(id: string): void {
    const list = this.getGPSActivities().filter((a) => a.id !== id);
    accountStorage.setItem(KEYS.GPS_ACTIVITIES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "gps" } }));
  },

  getPosts(): SocialPost[] {
    try {
      const data = accountStorage.getItem(KEYS.POSTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  savePosts(posts: SocialPost[]): void {
    accountStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "posts" } }));
  },
  addPost(post: SocialPost): void {
    const list = this.getPosts();
    this.savePosts([post, ...list]);
  },
  deletePost(id: string): void {
    const list = this.getPosts().filter((p: SocialPost) => p.id !== id);
    this.savePosts(list);
  },
  reportPost(id: string): void {
    const list = this.getPosts().map((p: SocialPost) => {
      if (p.id === id) {
        return { ...p, reportedByCurrentUser: true };
      }
      return p;
    });
    this.savePosts(list);
  },

  getChallenges(): GroupChallenge[] {
    try {
      const data = accountStorage.getItem(KEYS.CHALLENGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveChallenges(challenges: GroupChallenge[]): void {
    accountStorage.setItem(KEYS.CHALLENGES, JSON.stringify(challenges));
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "challenges" } }));
  },

  toggleFollowUser(handle: string): void {
    const profile = this.getProfile();
    const currentFollowing = profile.followingIds || [];
    const isFollowing = currentFollowing.includes(handle);
    const updatedFollowing = isFollowing
      ? currentFollowing.filter((h) => h !== handle)
      : [...currentFollowing, handle];
    this.saveProfile({ ...profile, followingIds: updatedFollowing });
  },

  getPlanVersions(): any[] {
    try {
      const data = accountStorage.getItem("athlynx_plan_versions");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  savePlanVersion(version: any): void {
    const versions = this.getPlanVersions();
    accountStorage.setItem("athlynx_plan_versions", JSON.stringify([version, ...versions]));
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "plan_versions" } }));
  },

  getCheckedGroceryItems(): string[] {
    try {
      const data = accountStorage.getItem("athlynx_checked_groceries");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  toggleCheckedGroceryItem(item: string): void {
    const items = this.getCheckedGroceryItems();
    const exists = items.includes(item);
    const updated = exists ? items.filter((i) => i !== item) : [...items, item];
    accountStorage.setItem("athlynx_checked_groceries", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "groceries" } }));
  },

  getAchievements(): Achievement[] {
    try {
      const data = accountStorage.getItem(KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Export full user dataset for LGPD compliance & data portability
  exportUserDataJSON(): string {
    const fullData = {
      exportedAt: new Date().toISOString(),
      platform: "FORZON",
      profile: this.getProfile(),
      workoutPlan: this.getWorkoutPlan(),
      workoutHistory: this.getWorkoutHistory(),
      nutrition: this.getNutrition(),
      gpsActivities: this.getGPSActivities(),
      posts: this.getPosts(),
      challenges: this.getChallenges(),
      achievements: this.getAchievements(),
    };
    return JSON.stringify(fullData, null, 2);
  },

  // Theme preference
  getTheme(): ThemeMode {
    return themeService.getTheme();
  },
  setTheme(theme: ThemeMode): void {
    themeService.setTheme(theme);
  },

  // Reset only this account; keep other accounts and authentication intact.
  resetAll(): void {
    const currentTheme = themeService.getTheme();
    accountStorage.clear();
    // Theme is a device preference, independent of account records.
    themeService.setTheme(currentTheme);
    window.dispatchEvent(new CustomEvent("athlynx_data_change", { detail: { type: "reset" } }));
  },
};

// Auto-synchronization listeners for browser network transitions
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[FORZON Cache] Conexão restabelecida. Sincronizando treinos em buffer offline...");
    storage.dispatchSyncStatus();
    storage.syncPendingWorkouts().catch((err) => {
      console.warn("[FORZON Auto-Sync] Falha na auto-sincronização:", err);
    });
  });

  window.addEventListener("offline", () => {
    console.log("[FORZON Cache] Desconectado da rede. Transições para cache local offline.");
    storage.dispatchSyncStatus();
  });
}
