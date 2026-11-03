import React, { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { BottomNav } from "./components/layout/BottomNav";
import { TodayView } from "./components/views/TodayView";
import { WorkoutsView } from "./components/views/WorkoutsView";
import { NutritionView } from "./components/views/NutritionView";
import { OutdoorGPSView } from "./components/views/OutdoorGPSView";
import { SocialView } from "./components/views/SocialView";
import { LiveWorkoutModal } from "./components/workout/LiveWorkoutModal";
import { AICoachDrawer } from "./components/ai/AICoachDrawer";
import { OnboardingModal } from "./components/onboarding/OnboardingModal";
import { SettingsModal } from "./components/settings/SettingsModal";
import { NewPostModal } from "./components/social/NewPostModal";
import { AuthModal } from "./components/auth/AuthModal";
import { ProfileModal } from "./components/profile/ProfileModal";
import { AIPlanProposalModal } from "./components/workout/AIPlanProposalModal";
import { WorkoutReminderModal } from "./components/workout/WorkoutReminderModal";
import { WorkoutReminderToast } from "./components/common/WorkoutReminderToast";
import { AchievementUnlockToast } from "./components/common/AchievementUnlockToast";
import { SyncStatusModal } from "./components/sync/SyncStatusModal";
import { UpgradePlanModal } from "./components/subscription/UpgradePlanModal";
import { storage } from "./services/storage";
import { aiService } from "./services/aiService";
import { notificationService } from "./services/notificationService";
import { themeService } from "./services/themeService";
import { SPORT_MODALITIES } from "./data/sportModalities";
import { ProjectDownloadModal } from "./components/export/ProjectDownloadModal";
import { AIWorkoutNutritionIntakeModal } from "./components/ai/AIWorkoutNutritionIntakeModal";
import {
  UserProfile,
  WorkoutPlan,
  DailyNutrition,
  CompletedWorkoutRecord,
  GPSActivity,
  SocialPost,
  GroupChallenge,
  Achievement,
  PlanVersion,
  WorkoutReminderEventDetail,
} from "./types";


export default function App() {
  const [activeTab, setActiveTab] = useState<string>("hoje");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isAIIntakeOpen, setIsAIIntakeOpen] = useState(false);

  // Main Persistent State
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [plan, setPlan] = useState<WorkoutPlan>(() => storage.getWorkoutPlan());
  const [nutrition, setNutrition] = useState<DailyNutrition>(() => storage.getNutrition());
  const [history, setHistory] = useState<CompletedWorkoutRecord[]>(() => storage.getWorkoutHistory());
  const [gpsActivities, setGpsActivities] = useState<GPSActivity[]>(() => storage.getGPSActivities());
  const [posts, setPosts] = useState<SocialPost[]>(() => storage.getPosts());
  const [challenges, setChallenges] = useState<GroupChallenge[]>(() => storage.getChallenges());
  const [achievements, setAchievements] = useState<Achievement[]>(() => storage.getAchievements());

  // Modals & Drawers
  const [liveWorkoutSessionId, setLiveWorkoutSessionId] = useState<string | null>(null);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachInitialPrompt, setCoachInitialPrompt] = useState<string>("");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [proposedAIPlan, setProposedAIPlan] = useState<WorkoutPlan | null>(null);
  const [activeReminder, setActiveReminder] = useState<WorkoutReminderEventDetail | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeHighlightedFeature, setUpgradeHighlightedFeature] = useState<string | undefined>(undefined);

  const handleOpenUpgrade = (feature?: string) => {
    setUpgradeHighlightedFeature(feature);
    setIsUpgradeModalOpen(true);
  };

  // Initialize theme and high-impact neon accent on mount
  useEffect(() => {
    themeService.initTheme();
  }, []);

  // Sync data whenever local custom event fires
  useEffect(() => {
    const handleDataChange = () => {
      setProfile(storage.getProfile());
      setPlan(storage.getWorkoutPlan());
      setNutrition(storage.getNutrition());
      setHistory(storage.getWorkoutHistory());
      setGpsActivities(storage.getGPSActivities());
      setPosts(storage.getPosts());
      setChallenges(storage.getChallenges());
      setAchievements(storage.getAchievements());
    };

    window.addEventListener("athlynx_data_change", handleDataChange);
    return () => window.removeEventListener("athlynx_data_change", handleDataChange);
  }, []);

  // Browser Push & In-App Notification Scheduler for Scheduled Workout
  useEffect(() => {
    const handleReminderEvent = (e: Event) => {
      const customEvent = e as CustomEvent<WorkoutReminderEventDetail>;
      if (customEvent.detail) {
        setActiveReminder(customEvent.detail);
      }
    };

    const handleOpenWorkout = (e: Event) => {
      const customEvent = e as CustomEvent<{ sessionId: string }>;
      if (customEvent.detail?.sessionId) {
        setLiveWorkoutSessionId(customEvent.detail.sessionId);
      }
    };

    window.addEventListener("athlynx_workout_reminder", handleReminderEvent);
    window.addEventListener("athlynx_open_workout", handleOpenWorkout);

    // Start background check against user's scheduled reminder time
    const stopScheduler = notificationService.startScheduler(() => {
      const todaySession = plan.sessions[0];
      return {
        title: todaySession?.title || "Treino do Dia",
        id: todaySession?.id || "session-0",
        muscleFocus: todaySession?.muscleFocus || "Treino Geral",
        streakDays: 7,
      };
    });

    return () => {
      window.removeEventListener("athlynx_workout_reminder", handleReminderEvent);
      window.removeEventListener("athlynx_open_workout", handleOpenWorkout);
      stopScheduler();
    };
  }, [plan]);

  const handleSnoozeReminder = (minutes: number) => {
    setActiveReminder(null);
    window.setTimeout(() => {
      const todaySession = plan.sessions[0];
      notificationService.dispatchWorkoutReminder({
        workoutTitle: todaySession?.title || "Treino do Dia",
        workoutId: todaySession?.id || "session-0",
        muscleFocus: todaySession?.muscleFocus || "Treino Geral",
        streakDays: 7,
        message: `Lembrete adiado (${minutes} min atrás): hora de completar sua sessão de hoje!`,
      });
    }, minutes * 60 * 1000);
  };


  // Handlers
  const handleStartWorkout = (sessionId: string) => {
    const targetSession =
      plan.sessions.find((s) => s.id === sessionId) ||
      SPORT_MODALITIES.flatMap((m) => [...m.presetPlan.sessions, ...m.quickSessions]).find(
        (s) => s.id === sessionId
      );

    if (targetSession && targetSession.isPremiumOnly && !profile.isPremium) {
      handleOpenUpgrade(targetSession.title || "Treino PRO");
      return;
    }

    setLiveWorkoutSessionId(sessionId);
  };

  const handleFinishLiveWorkout = (
    record: CompletedWorkoutRecord,
    shareToFeed: boolean,
    customPost?: SocialPost
  ) => {
    storage.addWorkoutRecord(record);

    if (customPost) {
      storage.addPost(customPost);
      setPosts(storage.getPosts());
      setActiveTab("comunidade");
    } else if (shareToFeed) {
      const newPost: SocialPost = {
        id: `post-${Date.now()}`,
        authorName: profile.name,
        authorHandle: profile.handle,
        authorAvatar: profile.avatarUrl,
        timestamp: "Agora",
        content: `Acabei de completar o ${record.title}! Volume de ${record.totalVolumeKg.toLocaleString("pt-BR")}kg em ${Math.round(record.durationSeconds / 60)} minutos. ${record.prsAchieved.join(" · ")}`,
        category: "workout",
        workoutData: {
          title: record.title,
          duration: `${Math.round(record.durationSeconds / 60)} min`,
          volumeOrDistance: `${record.totalVolumeKg.toLocaleString("pt-BR")} kg total`,
          highlight: record.prsAchieved[0] || "100% das séries completadas",
          totalKgLifted: record.totalVolumeKg,
        },
        likesCount: 1,
        likedByCurrentUser: true,
        comments: [],
      };
      storage.addPost(newPost);
      setPosts(storage.getPosts());
      setActiveTab("comunidade");
    }

    setLiveWorkoutSessionId(null);
  };

  const handleOpenCoachWithPrompt = (prompt: string) => {
    setCoachInitialPrompt(prompt);
    setIsCoachOpen(true);
  };

  const handleLikePost = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const nextLiked = !p.likedByCurrentUser;
        return {
          ...p,
          likedByCurrentUser: nextLiked,
          likesCount: nextLiked ? p.likesCount + 1 : p.likesCount - 1,
        };
      }
      return p;
    });
    storage.savePosts(updated);
  };

  const handleAddComment = (postId: string, text: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: `c-${Date.now()}`,
              authorName: profile.name,
              authorHandle: profile.handle,
              authorAvatar: profile.avatarUrl,
              content: text,
              timestamp: "Agora",
            },
          ],
        };
      }
      return p;
    });
    storage.savePosts(updated);
  };

  const handleToggleJoinChallenge = (challengeId: string) => {
    const updated = challenges.map((ch) => {
      if (ch.id === challengeId) {
        return { ...ch, joined: !ch.joined };
      }
      return ch;
    });
    storage.saveChallenges(updated);
  };

  const handleSaveGPSActivity = (act: GPSActivity) => {
    storage.addGPSActivity(act);
  };

  const handleDeleteGPSActivity = (id: string) => {
    storage.deleteGPSActivity(id);
  };

  const handleShareGPSToFeed = (act: GPSActivity) => {
    const newPost: SocialPost = {
      id: `post-gps-${Date.now()}`,
      authorName: profile.name,
      authorHandle: profile.handle,
      authorAvatar: profile.avatarUrl,
      timestamp: "Agora",
      content: `Atividade outdoor finalizada com sucesso! ${act.distanceKm}km percorridos com ritmo médio de ${act.averagePaceMinPerKm}/km e ${act.elevationGainM}m de ganho de elevação.`,
      category: "run",
      workoutData: {
        title: act.title,
        duration: `${Math.round(act.durationSeconds / 60)} min`,
        volumeOrDistance: `${act.distanceKm} km`,
        highlight: `Ritmo: ${act.averagePaceMinPerKm} /km`,
      },
      likesCount: 1,
      likedByCurrentUser: true,
      comments: [],
    };
    storage.addPost(newPost);
    setActiveTab("comunidade");
  };

  // Plan generation with AI proposal review & versioning flow
  const handleRegeneratePlanAI = async (customProfile?: UserProfile) => {
    setIsGeneratingPlan(true);
    try {
      const targetProf = customProfile || profile;
      const result = await aiService.generateWorkoutPlan(targetProf);
      if (result && result.sessions && result.sessions.length > 0) {
        const updatedPlan: WorkoutPlan = {
          id: `plan-ai-${Date.now()}`,
          title: result.planTitle || "FORZON Pro — Periodização Adaptativa",
          description: result.focusSummary || "Plano personalizado gerado com IA.",
          frequencyDaysPerWeek: result.weeklyFrequency || targetProf.trainingDaysPerWeek,
          active: true,
          updatedAt: new Date().toISOString(),
          sessions: result.sessions.map((s: any, idx: number) => ({
            id: s.id || `sess-${idx}`,
            title: s.dayName ? `${s.dayName} — ${s.focus}` : `Treino ${String.fromCharCode(65 + idx)}`,
            dayLabel: s.dayName || `Dia ${idx + 1}`,
            muscleFocus: s.focus || "Geral",
            estimatedMinutes: s.estimatedDurationMin || 55,
            warmupProtocol: s.warmup || "5 min aquecimento dinâmico",
            completedCount: 0,
            exercises: (s.exercises || []).map((e: any, eIdx: number) => ({
              id: `we-gen-${idx}-${eIdx}`,
              exerciseId: `ex-${e.name.toLowerCase().replace(/\s+/g, "-")}`,
              name: e.name,
              targetMuscle: e.targetMuscle || "Musculatura Principal",
              restSeconds: e.restSeconds || 75,
              notes: e.notes || "",
              sets: Array.from({ length: e.sets || 3 }).map((_, sIdx) => ({
                id: `s-gen-${idx}-${eIdx}-${sIdx}`,
                setNumber: sIdx + 1,
                type: sIdx === 0 ? "warmup" : "working",
                weightKg: 50,
                targetReps: typeof e.reps === "string" ? parseInt(e.reps) || 10 : e.reps || 10,
                completed: false,
              })),
            })),
          })),
        };

        // Open proposal modal so athlete can review and confirm (Section 11/12)
        setProposedAIPlan(updatedPlan);
      }
    } catch (_err) {
      // Deterministic fallback plan handled cleanly
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleAcceptPlanProposal = (version: PlanVersion) => {
    if (proposedAIPlan) {
      storage.saveWorkoutPlan(proposedAIPlan);
      storage.savePlanVersion(version);
      setProposedAIPlan(null);
      setActiveTab("treinos");
    }
  };

  const activeLiveSession =
    plan.sessions.find((s) => s.id === liveWorkoutSessionId) ||
    SPORT_MODALITIES.flatMap((m) => m.presetPlan.sessions).find((s) => s.id === liveWorkoutSessionId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLiveWorkout={() => handleStartWorkout(plan.sessions[0].id)}
        onOpenCoach={() => {
          setCoachInitialPrompt("");
          setIsCoachOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenReminderModal={() => setIsReminderModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenUpgradeModal={handleOpenUpgrade}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onOpenAIIntake={() => setIsAIIntakeOpen(true)}
        profile={profile}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {activeTab === "hoje" && (
          <TodayView
            profile={profile}
            plan={plan}
            nutrition={nutrition}
            onUpdateNutrition={(updated) => storage.saveNutrition(updated)}
            onStartWorkout={handleStartWorkout}
            onOpenCoachWithPrompt={handleOpenCoachWithPrompt}
            onNavigateTab={setActiveTab}
            recentWorkouts={history}
            challenges={challenges}
            gpsActivities={gpsActivities}
            onOpenReminderModal={() => setIsReminderModalOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenUpgradeModal={handleOpenUpgrade}
            onPlanUpdated={(newPlan) => setPlan(newPlan)}
            onOpenAIIntake={() => setIsAIIntakeOpen(true)}
          />
        )}


        {activeTab === "treinos" && (
          <WorkoutsView
            plan={plan}
            isPremium={profile.isPremium}
            onStartSession={handleStartWorkout}
            onOpenCoachWithPrompt={handleOpenCoachWithPrompt}
            onRegeneratePlanAI={() => handleRegeneratePlanAI()}
            onApplyPlan={(newPlan) => {
              setPlan(newPlan);
              storage.saveWorkoutPlan(newPlan);
            }}
            onOpenUpgradeModal={handleOpenUpgrade}
          />
        )}

        {activeTab === "nutricao" && (
          <NutritionView
            nutrition={nutrition}
            onUpdateNutrition={(updated) => storage.saveNutrition(updated)}
            onOpenCoachWithPrompt={handleOpenCoachWithPrompt}
            profile={profile}
            recentWorkouts={history}
            onOpenUpgradeModal={handleOpenUpgrade}
          />
        )}

        {activeTab === "gps" && (
          <OutdoorGPSView
            pastActivities={gpsActivities}
            onSaveActivity={handleSaveGPSActivity}
            onShareToCommunity={handleShareGPSToFeed}
            onDeleteActivity={handleDeleteGPSActivity}
          />
        )}

        {activeTab === "comunidade" && (
          <SocialView
            posts={posts}
            challenges={challenges}
            achievements={achievements}
            profile={profile}
            workoutHistory={history}
            gpsActivities={gpsActivities}
            streakDays={7}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onToggleJoinChallenge={handleToggleJoinChallenge}
            onOpenNewPostModal={() => setIsNewPostOpen(true)}
            onToggleFollow={(h) => storage.toggleFollowUser(h)}
            onReportPost={(id) => storage.reportPost(id)}
            onDeletePost={(id) => storage.deletePost(id)}
            onStartWorkoutClick={() => handleStartWorkout(plan.sessions[0].id)}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Live Workout Fullscreen Overlay Modal */}
      {activeLiveSession && (
        <LiveWorkoutModal
          session={activeLiveSession}
          isPremium={profile.isPremium}
          onClose={() => setLiveWorkoutSessionId(null)}
          onFinishWorkout={handleFinishLiveWorkout}
          onOpenCoachWithPrompt={handleOpenCoachWithPrompt}
          onOpenUpgradeModal={handleOpenUpgrade}
        />
      )}

      {/* AI Conversational Coach Drawer */}
      <AICoachDrawer
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        profile={profile}
        initialPrompt={coachInitialPrompt}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentProfile={profile}
        onSaveProfile={(updated) => storage.saveProfile(updated)}
        onTriggerPlanGeneration={(updated) => handleRegeneratePlanAI(updated)}
      />

      {/* Settings & LGPD Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => storage.saveProfile(updated)}
      />

      {/* Workout Push Reminder Configuration Modal */}
      <WorkoutReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        nextWorkoutTitle={plan.sessions[0]?.title || "Treino do Dia"}
        muscleFocus={plan.sessions[0]?.muscleFocus || "Treino Geral"}
        streakDays={7}
      />

      {/* Account / Auth & Consents Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => storage.saveProfile(updated)}
        onSwitchToNewUser={() => setIsOnboardingOpen(true)}
      />

      {/* Athlete Profile & Badges Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        history={history}
        gpsActivities={gpsActivities}
        streakDays={7}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenUpgradeModal={handleOpenUpgrade}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          storage.saveProfile(updated);
        }}
      />

      {/* AI Plan Proposal & Versioning Modal */}
      {proposedAIPlan && (
        <AIPlanProposalModal
          isOpen={Boolean(proposedAIPlan)}
          onClose={() => setProposedAIPlan(null)}
          proposedPlan={proposedAIPlan}
          currentPlan={plan}
          onAcceptProposal={handleAcceptPlanProposal}
          onRejectProposal={() => setProposedAIPlan(null)}
        />
      )}

      {/* New Community Post Modal */}
      <NewPostModal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        profile={profile}
        onSubmitPost={(post) => storage.addPost(post)}
      />

      {/* Scheduled Workout Reminder Toast (Push & In-App Alert) */}
      <WorkoutReminderToast
        reminder={activeReminder}
        onClose={() => setActiveReminder(null)}
        onStartWorkout={(workoutId) => handleStartWorkout(workoutId)}
        onSnooze={handleSnoozeReminder}
      />

      {/* Visual Toast Notification on Achievement Unlock */}
      <AchievementUnlockToast />

      {/* Offline Cache & Cloud Synchronization Modal */}
      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      {/* Subscription Paywall & Freemium Upgrade Modal */}
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        profile={profile}
        highlightedFeature={upgradeHighlightedFeature}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          storage.saveProfile(updated);
        }}
      />

      {/* Project & Files Download Center Modal */}
      <ProjectDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* Conversational AI Intake Modal (Height, Weight, Health, Goal -> Tailored Workout & Diet) */}
      <AIWorkoutNutritionIntakeModal
        isOpen={isAIIntakeOpen}
        onClose={() => setIsAIIntakeOpen(false)}
        profile={profile}
        onPlanApplied={(newPlan, newNutrition, updatedProfile) => {
          setPlan(newPlan);
          setNutrition(newNutrition);
          setProfile(updatedProfile);
          setActiveTab("hoje");
        }}
      />

      {/* Generating plan toast/indicator */}
      {isGeneratingPlan && (
        <div className="fixed bottom-20 right-6 z-50 bg-neutral-900 border border-emerald-500/50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white font-medium">IA gerando proposta de periodização...</span>
        </div>
      )}
    </div>
  );
}
