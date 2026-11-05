// Authentic anatomical exercise illustration assets (Hevy / Everkinetic CC-BY-SA 3.0 line art)
// Frame 0: Starting / stretched position
// Frame 1: Peak contraction position

export interface ExerciseIllustrationAsset {
  frame0: string;
  frame1: string;
  base: string;
}

export const EXERCISE_ASSET_MAP: Record<string, ExerciseIllustrationAsset> = {
  "ex-supino-reto-barra": {
    "frame0": "/assets/exercises/bench-press-1.png",
    "frame1": "/assets/exercises/bench-press-2.png",
    "base": "bench-press"
  },
  "ex-supino-reto-halteres": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-supino-inclinado-halteres": {
    "frame0": "/assets/exercises/dumbbell-incline-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-incline-bench-press-2.png",
    "base": "dumbbell-incline-bench-press"
  },
  "ex-supino-inclinado-barra": {
    "frame0": "/assets/exercises/incline-bench-press-1.png",
    "frame1": "/assets/exercises/incline-bench-press-2.png",
    "base": "incline-bench-press"
  },
  "ex-supino-declinado-barra": {
    "frame0": "/assets/exercises/decline-bench-press-1.png",
    "frame1": "/assets/exercises/decline-bench-press-2.png",
    "base": "decline-bench-press"
  },
  "ex-supino-declinado-halteres": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-supino-maquina-articulada": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-crucifixo-reto-halteres": {
    "frame0": "/assets/exercises/dumbbell-flys-1.png",
    "frame1": "/assets/exercises/dumbbell-flys-2.png",
    "base": "dumbbell-flys"
  },
  "ex-crucifixo-inclinado-halteres": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-peck-deck-voador": {
    "frame0": "/assets/exercises/butterfly-machine-1.png",
    "frame1": "/assets/exercises/butterfly-machine-2.png",
    "base": "butterfly-machine"
  },
  "ex-crossover-polia-media": {
    "frame0": "/assets/exercises/cable-crossover-1.png",
    "frame1": "/assets/exercises/cable-crossover-2.png",
    "base": "cable-crossover"
  },
  "ex-crossover-polia-alta": {
    "frame0": "/assets/exercises/cable-crossover-1.png",
    "frame1": "/assets/exercises/cable-crossover-2.png",
    "base": "cable-crossover"
  },
  "ex-crossover-polia-baixa": {
    "frame0": "/assets/exercises/cable-crossover-1.png",
    "frame1": "/assets/exercises/cable-crossover-2.png",
    "base": "cable-crossover"
  },
  "ex-mergulho-paralelas-peito": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-flexao-solo-deficit": {
    "frame0": "/assets/exercises/push-up-1.png",
    "frame1": "/assets/exercises/push-up-2.png",
    "base": "push-up"
  },
  "ex-pullover-halter": {
    "frame0": "/assets/exercises/bent-arm-pullover-1.png",
    "frame1": "/assets/exercises/bent-arm-pullover-2.png",
    "base": "bent-arm-pullover"
  },
  "ex-puxada-frontal-polia": {
    "frame0": "/assets/exercises/wide-grip-lat-pull-down-1.gif",
    "frame1": "/assets/exercises/wide-grip-lat-pull-down-2.gif",
    "base": "wide-grip-lat-pull-down"
  },
  "ex-barra-fixa-pronada": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-barra-fixa-supinada": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-puxada-triangulo": {
    "frame0": "/assets/exercises/close-grip-front-lat-pull-down-1.png",
    "frame1": "/assets/exercises/close-grip-front-lat-pull-down-2.png",
    "base": "close-grip-front-lat-pull-down"
  },
  "ex-remada-curvada-barra": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-remada-unilateral-serrote": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-remada-cavalinho-tbar": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-remada-baixa-triangulo": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-remada-articulada-maquina": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-pulldown-polia-alta": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-levantamento-terra-convencional": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-crucifixo-invertido-halteres": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-crucifixo-invertido-peck-deck": {
    "frame0": "/assets/exercises/butterfly-machine-1.png",
    "frame1": "/assets/exercises/butterfly-machine-2.png",
    "base": "butterfly-machine"
  },
  "ex-extensao-lombar-banco": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-desenvolvimento-halteres": {
    "frame0": "/assets/exercises/dumbbell-shoulder-press-1.png",
    "frame1": "/assets/exercises/dumbbell-shoulder-press-2.png",
    "base": "dumbbell-shoulder-press"
  },
  "ex-desenvolvimento-militar-barra": {
    "frame0": "/assets/exercises/seated-military-shoulder-press-1.png",
    "frame1": "/assets/exercises/seated-military-shoulder-press-2.png",
    "base": "seated-military-shoulder-press"
  },
  "ex-desenvolvimento-arnold": {
    "frame0": "/assets/exercises/arnold-press-1.png",
    "frame1": "/assets/exercises/arnold-press-2.png",
    "base": "arnold-press"
  },
  "ex-desenvolvimento-maquina": {
    "frame0": "/assets/exercises/dumbbell-shoulder-press-1.png",
    "frame1": "/assets/exercises/dumbbell-shoulder-press-2.png",
    "base": "dumbbell-shoulder-press"
  },
  "ex-elevacao-lateral-halteres": {
    "frame0": "/assets/exercises/dumbbell-lateral-raises-1.png",
    "frame1": "/assets/exercises/dumbbell-lateral-raises-2.png",
    "base": "dumbbell-lateral-raises"
  },
  "ex-elevacao-lateral-polia": {
    "frame0": "/assets/exercises/cable-seated-rear-lateral-raise-1.png",
    "frame1": "/assets/exercises/cable-seated-rear-lateral-raise-2.png",
    "base": "cable-seated-rear-lateral-raise"
  },
  "ex-elevacao-lateral-inclinada": {
    "frame0": "/assets/exercises/dumbbell-lateral-raises-1.png",
    "frame1": "/assets/exercises/dumbbell-lateral-raises-2.png",
    "base": "dumbbell-lateral-raises"
  },
  "ex-elevacao-frontal-halteres": {
    "frame0": "/assets/exercises/barbell-front-raises-1.png",
    "frame1": "/assets/exercises/barbell-front-raises-2.png",
    "base": "barbell-front-raises"
  },
  "ex-elevacao-frontal-corda": {
    "frame0": "/assets/exercises/barbell-front-raises-1.png",
    "frame1": "/assets/exercises/barbell-front-raises-2.png",
    "base": "barbell-front-raises"
  },
  "ex-face-pull-corda": {
    "frame0": "/assets/exercises/barbell-rear-delt-row-1.png",
    "frame1": "/assets/exercises/barbell-rear-delt-row-2.png",
    "base": "barbell-rear-delt-row"
  },
  "ex-remada-alta-barra-w": {
    "frame0": "/assets/exercises/barbell-upright-rows-1.png",
    "frame1": "/assets/exercises/barbell-upright-rows-2.png",
    "base": "barbell-upright-rows"
  },
  "ex-encolhimento-barra": {
    "frame0": "/assets/exercises/barbell-shrugs-1.png",
    "frame1": "/assets/exercises/barbell-shrugs-2.png",
    "base": "barbell-shrugs"
  },
  "ex-encolhimento-halteres": {
    "frame0": "/assets/exercises/barbell-shrugs-1.png",
    "frame1": "/assets/exercises/barbell-shrugs-2.png",
    "base": "barbell-shrugs"
  },
  "ex-agachamento-livre-barra": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-agachamento-frontal-barra": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-leg-press-45": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-hack-squat-maquina": {
    "frame0": "/assets/exercises/biceps-curl-squat-1.gif",
    "frame1": "/assets/exercises/biceps-curl-squat-2.gif",
    "base": "biceps-curl-squat"
  },
  "ex-agachamento-smith": {
    "frame0": "/assets/exercises/smith-machine-rear-deltoid-row-1.png",
    "frame1": "/assets/exercises/smith-machine-rear-deltoid-row-2.png",
    "base": "smith-machine-rear-deltoid-row"
  },
  "ex-cadeira-extensora": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-agachamento-bulgaro-halteres": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-afundo-passada-halteres": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-sissy-squat": {
    "frame0": "/assets/exercises/biceps-curl-squat-1.gif",
    "frame1": "/assets/exercises/biceps-curl-squat-2.gif",
    "base": "biceps-curl-squat"
  },
  "ex-stiff-halteres": {
    "frame0": "/assets/exercises/romanian-deadlift-1.png",
    "frame1": "/assets/exercises/romanian-deadlift-2.png",
    "base": "romanian-deadlift"
  },
  "ex-stiff-barra": {
    "frame0": "/assets/exercises/romanian-deadlift-1.png",
    "frame1": "/assets/exercises/romanian-deadlift-2.png",
    "base": "romanian-deadlift"
  },
  "ex-mesa-flexora": {
    "frame0": "/assets/exercises/romanian-deadlift-1.png",
    "frame1": "/assets/exercises/romanian-deadlift-2.png",
    "base": "romanian-deadlift"
  },
  "ex-cadeira-flexora": {
    "frame0": "/assets/exercises/seated-leg-curl-1.png",
    "frame1": "/assets/exercises/seated-leg-curl-2.png",
    "base": "seated-leg-curl"
  },
  "ex-good-morning-barra": {
    "frame0": "/assets/exercises/good-mornings-1.png",
    "frame1": "/assets/exercises/good-mornings-2.png",
    "base": "good-mornings"
  },
  "ex-elevacao-pelvica-barra": {
    "frame0": "/assets/exercises/bent-knee-hip-raise-1.gif",
    "frame1": "/assets/exercises/bent-knee-hip-raise-2.gif",
    "base": "bent-knee-hip-raise"
  },
  "ex-elevacao-pelvica-maquina": {
    "frame0": "/assets/exercises/bent-knee-hip-raise-1.gif",
    "frame1": "/assets/exercises/bent-knee-hip-raise-2.gif",
    "base": "bent-knee-hip-raise"
  },
  "ex-cadeira-abdutora": {
    "frame0": "/assets/exercises/bent-knee-hip-raise-1.gif",
    "frame1": "/assets/exercises/bent-knee-hip-raise-2.gif",
    "base": "bent-knee-hip-raise"
  },
  "ex-gluteo-coice-polia": {
    "frame0": "/assets/exercises/bent-knee-hip-raise-1.gif",
    "frame1": "/assets/exercises/bent-knee-hip-raise-2.gif",
    "base": "bent-knee-hip-raise"
  },
  "ex-agachamento-sumo-halter": {
    "frame0": "/assets/exercises/bent-knee-hip-raise-1.gif",
    "frame1": "/assets/exercises/bent-knee-hip-raise-2.gif",
    "base": "bent-knee-hip-raise"
  },
  "ex-panturrilha-em-pe-maquina": {
    "frame0": "/assets/exercises/standing-calf-raises-1.gif",
    "frame1": "/assets/exercises/standing-calf-raises-2.gif",
    "base": "standing-calf-raises"
  },
  "ex-panturrilha-sentado-soleo": {
    "frame0": "/assets/exercises/seated-calf-raise-1.gif",
    "frame1": "/assets/exercises/seated-calf-raise-2.gif",
    "base": "seated-calf-raise"
  },
  "ex-panturrilha-leg-press-45": {
    "frame0": "/assets/exercises/calves-press-on-leg-machine-1.gif",
    "frame1": "/assets/exercises/calves-press-on-leg-machine-2.gif",
    "base": "calves-press-on-leg-machine"
  },
  "ex-panturrilha-unilateral-degrau": {
    "frame0": "/assets/exercises/seated-one-leg-calf-raise-1.gif",
    "frame1": "/assets/exercises/seated-one-leg-calf-raise-2.gif",
    "base": "seated-one-leg-calf-raise"
  },
  "ex-rosca-direta-barra-w": {
    "frame0": "/assets/exercises/bicep-curl-1.gif",
    "frame1": "/assets/exercises/bicep-curl-2.gif",
    "base": "bicep-curl"
  },
  "ex-rosca-direta-barra-reta": {
    "frame0": "/assets/exercises/bicep-curl-1.gif",
    "frame1": "/assets/exercises/bicep-curl-2.gif",
    "base": "bicep-curl"
  },
  "ex-rosca-alternada-halteres": {
    "frame0": "/assets/exercises/alternate-bicep-curl-1.gif",
    "frame1": "/assets/exercises/alternate-bicep-curl-2.gif",
    "base": "alternate-bicep-curl"
  },
  "ex-rosca-martelo-halteres": {
    "frame0": "/assets/exercises/alternate-hammer-curl-1.gif",
    "frame1": "/assets/exercises/alternate-hammer-curl-2.gif",
    "base": "alternate-hammer-curl"
  },
  "ex-rosca-martelo-corda": {
    "frame0": "/assets/exercises/alternate-hammer-curl-1.gif",
    "frame1": "/assets/exercises/alternate-hammer-curl-2.gif",
    "base": "alternate-hammer-curl"
  },
  "ex-rosca-scott-barra-w": {
    "frame0": "/assets/exercises/preacher-curl-1.gif",
    "frame1": "/assets/exercises/preacher-curl-2.gif",
    "base": "preacher-curl"
  },
  "ex-rosca-inclinada-45-halteres": {
    "frame0": "/assets/exercises/alternate-incline-curl-1.gif",
    "frame1": "/assets/exercises/alternate-incline-curl-2.gif",
    "base": "alternate-incline-curl"
  },
  "ex-rosca-concentrada-halter": {
    "frame0": "/assets/exercises/concentration-curls-1.gif",
    "frame1": "/assets/exercises/concentration-curls-2.gif",
    "base": "concentration-curls"
  },
  "ex-rosca-aranha-spider-curl": {
    "frame0": "/assets/exercises/bicep-curl-1.gif",
    "frame1": "/assets/exercises/bicep-curl-2.gif",
    "base": "bicep-curl"
  },
  "ex-triceps-corda-polia": {
    "frame0": "/assets/exercises/triceps-pushdown-1.gif",
    "frame1": "/assets/exercises/triceps-pushdown-2.gif",
    "base": "triceps-pushdown"
  },
  "ex-triceps-pulley-barra-reta": {
    "frame0": "/assets/exercises/triceps-pushdown-1.gif",
    "frame1": "/assets/exercises/triceps-pushdown-2.gif",
    "base": "triceps-pushdown"
  },
  "ex-triceps-pulley-barra-v": {
    "frame0": "/assets/exercises/triceps-pushdown-1.gif",
    "frame1": "/assets/exercises/triceps-pushdown-2.gif",
    "base": "triceps-pushdown"
  },
  "ex-triceps-testa-barra-w": {
    "frame0": "/assets/exercises/decline-ez-bar-triceps-extension-1.gif",
    "frame1": "/assets/exercises/decline-ez-bar-triceps-extension-2.gif",
    "base": "decline-ez-bar-triceps-extension"
  },
  "ex-triceps-testa-halteres": {
    "frame0": "/assets/exercises/decline-ez-bar-triceps-extension-1.gif",
    "frame1": "/assets/exercises/decline-ez-bar-triceps-extension-2.gif",
    "base": "decline-ez-bar-triceps-extension"
  },
  "ex-triceps-frances-unilateral": {
    "frame0": "/assets/exercises/triceps-pushdown-1.gif",
    "frame1": "/assets/exercises/triceps-pushdown-2.gif",
    "base": "triceps-pushdown"
  },
  "ex-triceps-frances-polia-corda": {
    "frame0": "/assets/exercises/triceps-pushdown-1.gif",
    "frame1": "/assets/exercises/triceps-pushdown-2.gif",
    "base": "triceps-pushdown"
  },
  "ex-triceps-paralelas-peso": {
    "frame0": "/assets/exercises/triceps-pushdown-1.gif",
    "frame1": "/assets/exercises/triceps-pushdown-2.gif",
    "base": "triceps-pushdown"
  },
  "ex-supino-fechado-barra": {
    "frame0": "/assets/exercises/triceps-pushdown-1.gif",
    "frame1": "/assets/exercises/triceps-pushdown-2.gif",
    "base": "triceps-pushdown"
  },
  "ex-triceps-coice-polia": {
    "frame0": "/assets/exercises/triceps-pushdown-1.gif",
    "frame1": "/assets/exercises/triceps-pushdown-2.gif",
    "base": "triceps-pushdown"
  },
  "ex-prancha-isometrica": {
    "frame0": "/assets/exercises/abdominal-4-point-drawing-in-1.png",
    "frame1": "/assets/exercises/abdominal-4-point-drawing-in-2.png",
    "base": "abdominal-4-point-drawing-in"
  },
  "ex-abdominal-polia-cable-crunch": {
    "frame0": "/assets/exercises/crunches-1.gif",
    "frame1": "/assets/exercises/crunches-2.gif",
    "base": "crunches"
  },
  "ex-abdominal-infra-paralela": {
    "frame0": "/assets/exercises/bent-knee-hip-raise-1.gif",
    "frame1": "/assets/exercises/bent-knee-hip-raise-2.gif",
    "base": "bent-knee-hip-raise"
  },
  "ex-roda-abdominal-abwheel": {
    "frame0": "/assets/exercises/ab-rollout-1.gif",
    "frame1": "/assets/exercises/ab-rollout-2.gif",
    "base": "ab-rollout"
  },
  "ex-abdominal-supra-solo": {
    "frame0": "/assets/exercises/crunches-1.gif",
    "frame1": "/assets/exercises/crunches-2.gif",
    "base": "crunches"
  },
  "ex-prancha-lateral-estatica": {
    "frame0": "/assets/exercises/abdominal-4-point-drawing-in-1.png",
    "frame1": "/assets/exercises/abdominal-4-point-drawing-in-2.png",
    "base": "abdominal-4-point-drawing-in"
  },
  "ex-russian-twist-anilha": {
    "frame0": "/assets/exercises/incline-flys-with-a-twist-1.png",
    "frame1": "/assets/exercises/incline-flys-with-a-twist-2.png",
    "base": "incline-flys-with-a-twist"
  },
  "ex-abdominal-vacuum": {
    "frame0": "/assets/exercises/abdominal-4-point-drawing-in-1.png",
    "frame1": "/assets/exercises/abdominal-4-point-drawing-in-2.png",
    "base": "abdominal-4-point-drawing-in"
  },
  "ex-corrida-ao-ar-livre": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-hyrox-skierg": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-hyrox-sled-push": {
    "frame0": "/assets/exercises/push-up-1.png",
    "frame1": "/assets/exercises/push-up-2.png",
    "base": "push-up"
  },
  "ex-hyrox-wall-balls": {
    "frame0": "/assets/exercises/ball-wall-circles-1.png",
    "frame1": "/assets/exercises/ball-wall-circles-2.png",
    "base": "ball-wall-circles"
  },
  "ex-fight-shadow": {
    "frame0": "/assets/exercises/dumbbell-shoulder-press-1.png",
    "frame1": "/assets/exercises/dumbbell-shoulder-press-2.png",
    "base": "dumbbell-shoulder-press"
  },
  "ex-fight-sprawl": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-swim-crawl-sprints": {
    "frame0": "/assets/exercises/bent-arm-pullover-1.png",
    "frame1": "/assets/exercises/bent-arm-pullover-2.png",
    "base": "bent-arm-pullover"
  },
  "ex-crossfit-thruster": {
    "frame0": "/assets/exercises/dumbbell-shoulder-press-1.png",
    "frame1": "/assets/exercises/dumbbell-shoulder-press-2.png",
    "base": "dumbbell-shoulder-press"
  },
  "ex-fut-sand-header-jump": {
    "frame0": "/assets/exercises/bent-knee-hip-raise-1.gif",
    "frame1": "/assets/exercises/bent-knee-hip-raise-2.gif",
    "base": "bent-knee-hip-raise"
  },
  "ex-dance-samba-funk-burst": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  },
  "ex-cal-muscle-up": {
    "frame0": "/assets/exercises/dumbbell-bench-press-1.png",
    "frame1": "/assets/exercises/dumbbell-bench-press-2.png",
    "base": "dumbbell-bench-press"
  }
};

export const DEFAULT_EXERCISE_ASSET: ExerciseIllustrationAsset = {
  frame0: "/assets/exercises/dumbbell-bench-press-1.png",
  frame1: "/assets/exercises/dumbbell-bench-press-2.png",
  base: "dumbbell-bench-press"
};

export function getExerciseIllustration(exerciseId: string, primaryMuscle?: string): ExerciseIllustrationAsset {
  if (EXERCISE_ASSET_MAP[exerciseId]) {
    return EXERCISE_ASSET_MAP[exerciseId];
  }
  
  // Normalized lookup
  const cleanId = exerciseId.toLowerCase().trim();
  if (EXERCISE_ASSET_MAP[cleanId]) {
    return EXERCISE_ASSET_MAP[cleanId];
  }

  // Fallback by muscle
  if (primaryMuscle) {
    const muscle = primaryMuscle.toLowerCase();
    if (muscle.includes("peito")) {
      return EXERCISE_ASSET_MAP["ex-supino-reto-halteres"] || DEFAULT_EXERCISE_ASSET;
    }
    if (muscle.includes("costa") || muscle.includes("dorsal")) {
      return EXERCISE_ASSET_MAP["ex-puxada-frontal-polia"] || DEFAULT_EXERCISE_ASSET;
    }
    if (muscle.includes("ombro") || muscle.includes("deltoid")) {
      return EXERCISE_ASSET_MAP["ex-desenvolvimento-halteres"] || DEFAULT_EXERCISE_ASSET;
    }
    if (muscle.includes("quadr") || muscle.includes("perna")) {
      return EXERCISE_ASSET_MAP["ex-agachamento-livre-barra"] || DEFAULT_EXERCISE_ASSET;
    }
    if (muscle.includes("bicep") || muscle.includes("bícep")) {
      return EXERCISE_ASSET_MAP["ex-rosca-alternada-halteres"] || DEFAULT_EXERCISE_ASSET;
    }
    if (muscle.includes("tricep") || muscle.includes("trícep")) {
      return EXERCISE_ASSET_MAP["ex-triceps-corda-polia"] || DEFAULT_EXERCISE_ASSET;
    }
    if (muscle.includes("abd")) {
      return EXERCISE_ASSET_MAP["ex-abdominal-polia-cable-crunch"] || DEFAULT_EXERCISE_ASSET;
    }
    if (muscle.includes("glút")) {
      return EXERCISE_ASSET_MAP["ex-elevacao-pelvica-barra"] || DEFAULT_EXERCISE_ASSET;
    }
    if (muscle.includes("panturrilha")) {
      return EXERCISE_ASSET_MAP["ex-panturrilha-em-pe-maquina"] || DEFAULT_EXERCISE_ASSET;
    }
  }

  return DEFAULT_EXERCISE_ASSET;
}
