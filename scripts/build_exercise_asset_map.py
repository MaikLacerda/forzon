import os
import re
import json

exercises_dir = 'public/assets/exercises'
files = os.listdir(exercises_dir)

# Find all pairs
pairs = {}
for f in files:
    m = re.match(r'^(.*?)-([123])\.(png|gif|jpg)$', f, re.IGNORECASE)
    if m:
        base = m.group(1).lower()
        idx = m.group(2)
        if base not in pairs:
            pairs[base] = {}
        pairs[base][idx] = f

# Filter bases with at least '1' and '2'
valid_pairs = {}
for base, frames in pairs.items():
    if '1' in frames and '2' in frames:
        valid_pairs[base] = (frames['1'], frames['2'])

print(f"Total valid paired bases available: {len(valid_pairs)}")

# Load exercises from scripts/app_exercises.json
with open('scripts/app_exercises.json', 'r', encoding='utf-8') as f:
    app_exercises = json.load(f)

# Priority mapping patterns for each exercise
# We will match exercise id, name, and muscle group
def find_best_pair(ex):
    eid = ex['id'].lower()
    name = ex['name'].lower()
    muscle = ex['primaryMuscle'].lower()
    equip = ex['equipment'].lower()

    # 1. Direct explicit keyword mappings
    rules = [
        # Chest
        (['supino', 'inclinado', 'halter'], 'dumbbell-incline-bench-press'),
        (['supino', 'inclinado', 'barra'], 'incline-bench-press'),
        (['supino', 'declinado', 'halter'], 'dumbbell-decline-bench-press'),
        (['supino', 'declinado', 'barra'], 'decline-bench-press'),
        (['supino', 'reto', 'halter'], 'dumbbell-bench-press'),
        (['supino', 'reto', 'barra'], 'bench-press'),
        (['supino', 'maquina'], 'chest-press-machine'),
        (['crucifixo', 'inclinado'], 'incline-dumbbell-flys'),
        (['crucifixo', 'reto'], 'dumbbell-flys'),
        (['peck-deck', 'voador'], 'butterfly-machine'),
        (['voador'], 'butterfly-machine'),
        (['crossover', 'alta'], 'cable-cross-over'),
        (['crossover', 'baixa'], 'cable-cross-over'),
        (['crossover'], 'cable-cross-over'),
        (['paralelas', 'peito'], 'dips'),
        (['flexao'], 'push-up'),
        (['pullover'], 'bent-arm-pullover'),

        # Back
        (['barra-fixa', 'pronada'], 'pull-ups'),
        (['barra-fixa', 'supinada'], 'chin-up'),
        (['chin-up'], 'chin-up'),
        (['pull-up'], 'pull-ups'),
        (['puxada', 'triangulo'], 'close-grip-front-lat-pull-down'),
        (['puxada', 'articulada'], 'lat-pull-down'),
        (['puxada'], 'wide-grip-lat-pull-down'),
        (['remada', 'curvada', 'barra'], 'bent-over-row'),
        (['remada', 'curvada', 'halter'], 'two-arm-dumbbell-row'),
        (['remada', 'cavalinho'], 'bent-over-row'),
        (['remada', 'serrote'], 'one-arm-dumbbell-row'),
        (['remada', 'unilateral'], 'one-arm-dumbbell-row'),
        (['remada', 'baixa'], 'seated-cable-row'),
        (['remada', 'articulada'], 'seated-cable-row'),
        (['remada', 'peito-apoiado'], 'two-arm-dumbbell-row'),
        (['remada', 'invertida'], 'inverted-row'),
        (['levantamento-terra', 'sumo'], 'sumo-deadlift'),
        (['levantamento-terra'], 'deadlift'),
        (['deadlift'], 'deadlift'),
        (['crucifixo-inverso'], 'bent-over-rear-delt-row-with-head-on-bench'),
        (['encolhimento'], 'barbell-shrugs'),

        # Shoulders
        (['desenvolvimento', 'arnold'], 'arnold-press'),
        (['desenvolvimento', 'militar'], 'seated-military-shoulder-press'),
        (['desenvolvimento', 'halter'], 'dumbbell-shoulder-press'),
        (['desenvolvimento', 'maquina'], 'dumbbell-shoulder-press'),
        (['elevacao-lateral', 'halter'], 'dumbbell-lateral-raises'),
        (['elevacao-lateral', 'polia'], 'cable-seated-rear-lateral-raise'),
        (['elevacao-lateral', 'inclinada'], 'dumbbell-lateral-raises'),
        (['elevacao-frontal'], 'barbell-front-raises'),
        (['remada-alta'], 'barbell-upright-rows'),
        (['face-pull'], 'barbell-rear-delt-row'),
        (['crucifixo-inverso-peck-deck'], 'bent-over-rear-delt-row-with-head-on-bench'),

        # Legs Quadriceps
        (['agachamento-frontal'], 'front-squat-1-857x1024'),
        (['agachamento', 'barra'], 'squat'),
        (['agachamento', 'sumo'], 'sumo-squat'),
        (['agachamento', 'goblet'], 'dumbbell-squat'),
        (['agachamento', 'bulgaro'], 'dumbbell-lunges'),
        (['agachamento', 'hack'], 'narrow-stance-leg-press-1-1024x671'),
        (['leg-press'], 'leg-press-1-1024x670'),
        (['extensora'], 'leg-extension'),
        (['passada'], 'dumbbell-lunges'),
        (['afundo'], 'dumbbell-lunges'),
        (['sissy'], 'front-squat-1-857x1024'),

        # Hamstrings & Glutes
        (['stiff', 'halter'], 'romanian-deadlift'),
        (['stiff', 'barra'], 'romanian-deadlift'),
        (['mesa-flexora'], 'lying-leg-curls'),
        (['cadeira-flexora'], 'seated-leg-curl'),
        (['flexora-unilateral'], 'lying-leg-curls'),
        (['bom-dia'], 'romanian-deadlift'),
        (['elevacao-pelvica'], 'bent-knee-hip-raise'),
        (['hip-thrust'], 'bent-knee-hip-raise'),
        (['abdutora'], 'hip-abduction'),
        (['adutora'], 'hip-adduction'),
        (['gluteo-coice'], 'cable-hip-extension'),
        (['gluteo-quatro-apoios'], 'cable-hip-extension'),

        # Calves
        (['panturrilha', 'em-pe'], 'standing-calf-raises'),
        (['panturrilha', 'sentado'], 'seated-calf-raise'),
        (['panturrilha', 'leg-press'], 'calves-press-on-leg-machine'),
        (['panturrilha', 'unilateral'], 'seated-one-leg-calf-raise'),
        (['panturrilha', 'burrinho'], 'donkey-calf-raises'),
        (['panturrilha'], 'standing-calf-raises'),

        # Biceps
        (['rosca-direta', 'barra-w'], 'bicep-curl'),
        (['rosca-direta', 'barra-reta'], 'bicep-curl'),
        (['rosca-alternada'], 'alternate-bicep-curl'),
        (['rosca-martelo'], 'alternate-hammer-curl'),
        (['rosca-inclinada'], 'alternate-incline-curl'),
        (['rosca-scott'], 'preacher-curl'),
        (['rosca-concentrada'], 'concentration-curls'),
        (['rosca-spider'], 'preacher-curl'),
        (['rosca-polia'], 'cable-curl'),
        (['rosca-inversa'], 'biceps-curl-reverse'),
        (['rosca'], 'bicep-curl'),

        # Triceps
        (['triceps-corda'], 'triceps-pushdown'),
        (['triceps-pulley'], 'triceps-pushdown'),
        (['triceps-testa'], 'decline-ez-bar-triceps-extension'),
        (['triceps-frances'], 'overhead-triceps-extension'),
        (['triceps-coice'], 'tricep-dumbbell-kickback'),
        (['triceps-mergulho'], 'bench-dips'),
        (['mergulho-paralelas'], 'dips'),
        (['triceps-supinado'], 'bench-press-close-grip'),
        (['triceps-unilateral'], 'one-arm-tricep-extension'),
        (['triceps'], 'triceps-pushdown'),

        # Abs & Core
        (['prancha'], 'abdominal-4-point-drawing-in'),
        (['abdominal-polia'], 'crunches'),
        (['abdominal-infra'], 'bent-knee-hip-raise'),
        (['roda-abdominal'], 'ab-rollout'),
        (['crunch'], 'crunches'),
        (['obliquo'], 'side-bend'),
        (['vacuum'], 'abdominal-4-point-drawing-in'),
        (['abdominal'], 'crunches'),

        # Cardio
        (['corrida'], 'squat'),
        (['skierg'], 'lat-pull-down'),
        (['swim'], 'bent-arm-pullover'),
        (['dance'], 'squat'),
    ]

    for keywords, target_base in rules:
        matches_all = True
        for kw in keywords:
            if kw not in eid and kw not in name:
                matches_all = False
                break
        if matches_all and target_base in valid_pairs:
            return target_base

    # Fallback to base names that contain keywords from the exercise id or name
    for base in valid_pairs.keys():
        if any(part in base for part in eid.replace('ex-', '').split('-') if len(part) > 3):
            return base

    # Muscle group fallbacks: guaranteed high quality matching
    muscle_fallbacks = {
        'peitoral': 'dumbbell-bench-press',
        'costas': 'bent-over-row',
        'ombros': 'dumbbell-shoulder-press',
        'pernas (quadríceps)': 'squat',
        'pernas (posterior)': 'romanian-deadlift',
        'glúteos': 'bent-knee-hip-raise',
        'panturrilhas': 'standing-calf-raises',
        'bíceps': 'bicep-curl',
        'tríceps': 'triceps-pushdown',
        'abdômen & core': 'crunches',
        'cardio & resistência': 'squat'
    }

    fb = muscle_fallbacks.get(muscle, 'dumbbell-bench-press')
    if fb in valid_pairs:
        return fb
    
    # Return first available valid pair
    return list(valid_pairs.keys())[0]

# Build mapping
mapping = {}
for ex in app_exercises:
    best_base = find_best_pair(ex)
    frame1, frame2 = valid_pairs[best_base]
    mapping[ex['id']] = {
        "frame0": f"/assets/exercises/{frame1}",
        "frame1": f"/assets/exercises/{frame2}",
        "base": best_base
    }

print(f"Generated mappings for {len(mapping)} exercises.")

# Generate TypeScript file
ts_content = """// Authentic anatomical exercise illustration assets (Hevy / Everkinetic CC-BY-SA 3.0 line art)
// Frame 0: Starting / stretched position
// Frame 1: Peak contraction position

export interface ExerciseIllustrationAsset {
  frame0: string;
  frame1: string;
  base: string;
}

export const EXERCISE_ASSET_MAP: Record<string, ExerciseIllustrationAsset> = """ + json.dumps(mapping, indent=2) + """;

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
"""

with open('src/data/exerciseAssetMap.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Saved src/data/exerciseAssetMap.ts successfully!")
