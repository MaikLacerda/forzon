import json, os, re

# Load app exercises
with open('scripts/app_exercises.json', 'r', encoding='utf-8') as f:
    app_exercises = json.load(f)

# Load Hevy library
with open('scripts/hevy_library.json', 'r', encoding='utf-8') as f:
    hevy_lib = json.load(f)

hevy_files = set(os.listdir('public/assets/hevy'))
print(f"Total Hevy files available: {len(hevy_files)}")

# Direct explicit map for maximum biomechanical precision:
# Each exercise in our app gets mapped directly to the authentic Hevy asset slug
EXACT_MAPPINGS = {
    # 1. Peitoral (Chest)
    "ex-supino-reto-barra": "bench_press__barbell_.jpg",
    "ex-supino-reto-halteres": "bench_press__dumbbell_.jpg",
    "ex-supino-inclinado-barra": "incline_bench_press__barbell_.jpg",
    "ex-supino-inclinado-halteres": "incline_bench_press__dumbbell_.jpg",
    "ex-supino-declinado-barra": "decline_bench_press__barbell_.jpg",
    "ex-supino-declinado-halteres": "decline_bench_press__dumbbell_.jpg",
    "ex-supino-maquina-articulada": "chest_press__machine_.jpg",
    "ex-crucifixo-reto-halteres": "chest_fly__dumbbell_.jpg",
    "ex-crucifixo-inclinado-halteres": "incline_chest_fly__dumbbell_.jpg",
    "ex-peck-deck-voador": "chest_fly__machine_.jpg",
    "ex-crossover-polia-media": "cable_fly_crossovers.jpg",
    "ex-crossover-polia-alta": "cable_fly_crossovers.jpg",
    "ex-crossover-polia-baixa": "cable_fly_crossovers.jpg",
    "ex-mergulho-paralelas-peito": "chest_dip.jpg",
    "ex-flexao-solo-deficit": "push_up.jpg",
    "ex-pullover-halteres": "dumbbell_around_pullover.jpg",

    # 2. Costas (Back)
    "ex-puxada-frontal-polia": "lat_pulldown__cable_.jpg",
    "ex-barra-fixa-pronada": "pull_up.jpg",
    "ex-barra-fixa-supinada": "chin_up.jpg",
    "ex-chin-up-lastrada": "chin_up.jpg",
    "ex-puxada-triangulo": "lat_pulldown_-_close_grip__cable_.jpg",
    "ex-puxada-articulada-maquina": "lat_pulldown__machine_.jpg",
    "ex-remada-curvada-barra": "bent_over_row__barbell_.jpg",
    "ex-remada-curvada-halteres": "bent_over_row__dumbbell_.jpg",
    "ex-remada-cavalinho-barra-t": "t_bar_row.jpg",
    "ex-remada-baixa-triangulo": "seated_cable_row.jpg",
    "ex-remada-unilateral-serrote": "single_arm_dumbbell_row.jpg",
    "ex-remada-articulada-maquina": "seated_row__machine_.jpg",
    "ex-remada-peito-apoiado-inclinado": "incline_row__dumbbell_.jpg",
    "ex-remada-invertida-barra-smith": "inverted_row.jpg",
    "ex-levantamento-terra-convencional": "deadlift__barbell_.jpg",
    "ex-levantamento-terra-sumo": "sumo_deadlift.jpg",
    "ex-crucifixo-inverso-halteres": "rear_delt_fly__dumbbell_.jpg",
    "ex-encolhimento-trapezio-barra": "shrug__barbell_.jpg",

    # 3. Ombros (Shoulders)
    "ex-desenvolvimento-halteres": "overhead_press__dumbbell_.jpg",
    "ex-desenvolvimento-militar-barra": "overhead_press__barbell_.jpg",
    "ex-desenvolvimento-arnold": "arnold_press__dumbbell_.jpg",
    "ex-desenvolvimento-maquina": "overhead_press__machine_.jpg",
    "ex-elevacao-lateral-halteres": "lateral_raise__dumbbell_.jpg",
    "ex-elevacao-lateral-polia": "lateral_raise__cable_.jpg",
    "ex-elevacao-lateral-inclinada-banco": "incline_lateral_raise__dumbbell_.jpg",
    "ex-elevacao-frontal-barra": "front_raise__barbell_.jpg",
    "ex-elevacao-frontal-halteres": "front_raise__dumbbell_.jpg",
    "ex-remada-alta-barra": "upright_row__barbell_.jpg",
    "ex-remada-alta-polia": "upright_row__cable_.jpg",
    "ex-face-pull-corda": "face_pull.jpg",
    "ex-crucifixo-inverso-peck-deck": "reverse_fly__machine_.jpg",
    "ex-manguito-rotador-externo-polia": "external_cable_shoulder_rotation.jpg",

    # 4. Pernas (Quadríceps)
    "ex-agachamento-livre-barra": "squat__barbell_.jpg",
    "ex-agachamento-frontal-barra": "front_squat.jpg",
    "ex-leg-press-45": "leg_press__machine_.jpg",
    "ex-hack-squat-maquina": "hack_squat__machine_.jpg",
    "ex-cadeira-extensora": "leg_extension__machine_.jpg",
    "ex-passada-afundo-halteres": "lunge__dumbbell_.jpg",
    "ex-agachamento-bulgaro-halteres": "bulgarian_split_squat.jpg",
    "ex-agachamento-sumo-halter": "sumo_squat__dumbbell_.jpg",
    "ex-agachamento-goblet": "goblet_squat.jpg",
    "ex-sissy-squat-livre": "sissy_squat__weighted_.jpg",
    "ex-agachamento-smith": "squat__smith_machine_.jpg",

    # 5. Pernas (Posterior de Coxa)
    "ex-stiff-halteres": "romanian_deadlift__dumbbell_.jpg",
    "ex-stiff-barra": "romanian_deadlift__barbell_.jpg",
    "ex-mesa-flexora": "lying_leg_curl__machine_.jpg",
    "ex-cadeira-flexora": "seated_leg_curl__machine_.jpg",
    "ex-flexora-unilateral-em-pe": "single_leg_curl.jpg",
    "ex-bom-dia-barra": "good_morning.jpg",

    # 6. Glúteos
    "ex-elevacao-pelvica-barra": "hip_thrust__barbell_.jpg",
    "ex-elevacao-pelvica-maquina": "hip_thrust__machine_.jpg",
    "ex-cadeira-abdutora": "seated_hip_abduction__machine_.jpg",
    "ex-cadeira-adutora": "seated_hip_adduction__machine_.jpg",
    "ex-gluteo-coice-polia": "glute_kickback__cable_.jpg",
    "ex-gluteo-quatro-apoios-caneleira": "glute_kickback.jpg",

    # 7. Panturrilhas
    "ex-panturrilha-em-pe-maquina": "standing_calf_raise__machine_.jpg",
    "ex-panturrilha-sentado-soleo": "seated_calf_raise.jpg",
    "ex-panturrilha-leg-press-45": "calf_press_on_leg_press.jpg",
    "ex-panturrilha-unilateral-degrau": "single_leg_standing_calf_raise.jpg",

    # 8. Bíceps & Braquial
    "ex-rosca-direta-barra-w": "bicep_curl__barbell_.jpg",
    "ex-rosca-direta-barra-reta": "bicep_curl__barbell_.jpg",
    "ex-rosca-alternada-halteres": "bicep_curl__dumbbell_.jpg",
    "ex-rosca-martelo-halteres": "hammer_curl__dumbbell_.jpg",
    "ex-rosca-inclinada-banco-45": "incline_bicep_curl__dumbbell_.jpg",
    "ex-rosca-scott-barra-w": "preacher_curl__barbell_.jpg",
    "ex-rosca-concentrada-halteres": "concentration_curl__dumbbell_.jpg",
    "ex-rosca-spider-halteres": "spider_curl.jpg",
    "ex-rosca-polia-alta-dupla": "bicep_curl__cable_.jpg",
    "ex-rosca-inversa-barra": "reverse_curl__barbell_.jpg",

    # 9. Tríceps
    "ex-triceps-corda-polia": "triceps_pushdown__cable___rope_.jpg",
    "ex-triceps-pulley-barra-reta": "triceps_pushdown__cable___straight_bar_.jpg",
    "ex-triceps-pulley-barra-v": "triceps_pushdown__cable___v_bar_.jpg",
    "ex-triceps-testa-barra-w": "skull_crusher__barbell_.jpg",
    "ex-triceps-frances-halteres": "overhead_triceps_extension__dumbbell_.jpg",
    "ex-triceps-coice-halteres": "tricep_kickback__dumbbell_.jpg",
    "ex-triceps-mergulho-banco": "bench_dip.jpg",
    "ex-triceps-supinado-fechado": "close_grip_bench_press__barbell_.jpg",
    "ex-triceps-unilateral-polia": "single_arm_triceps_pushdown__cable_.jpg",
    "ex-triceps-frances-polia-corda": "overhead_triceps_extension__cable_.jpg",

    # 10. Abdômen & Core
    "ex-prancha-isometrica": "plank.jpg",
    "ex-abdominal-polia-cable-crunch": "cable_crunch.jpg",
    "ex-abdominal-infra-paralela": "hanging_leg_raise.jpg",
    "ex-roda-abdominal-abwheel": "ab_wheel.jpg",
    "ex-crunch-solo-tradicional": "crunch.jpg",
    "ex-abdominal-declinado": "decline_crunch.jpg",
    "ex-abdominal-obliquo-solo": "cross_body_crunch.jpg",
    "ex-estomago-vacuum": "plank.jpg",

    # 11. Cardio & Resistência
    "ex-corrida-ao-ar-livre": "running.jpg",
    "ex-hyrox-skierg": "ski_erg.jpg",
    "ex-swim-crawl-sprints": "swimming.jpg",
    "ex-dance-samba-funk-burst": "aerobics.jpg",
}

# Verify and build final asset map
mapped_count = 0
missing_files = []
final_map = {}

# Backup fallback if exact file not present
fallback_by_muscle = {
    "peitoral": "bench_press__barbell_.jpg",
    "costas": "lat_pulldown__cable_.jpg",
    "ombros": "overhead_press__dumbbell_.jpg",
    "pernas (quadríceps)": "squat__barbell_.jpg",
    "pernas (posterior)": "romanian_deadlift__barbell_.jpg",
    "glúteos": "hip_thrust__barbell_.jpg",
    "panturrilhas": "standing_calf_raise__machine_.jpg",
    "bíceps": "bicep_curl__barbell_.jpg",
    "tríceps": "triceps_pushdown__cable___rope_.jpg",
    "abdômen & core": "plank.jpg",
    "cardio & resistência": "running.jpg"
}

for ex in app_exercises:
    eid = ex['id']
    chosen_slug = EXACT_MAPPINGS.get(eid)
    
    # Check if file exists
    if chosen_slug and chosen_slug in hevy_files:
        final_map[eid] = f"/assets/hevy/{chosen_slug}"
        mapped_count += 1
    else:
        # Check muscle fallback
        muscle_key = ex['primaryMuscle'].lower()
        fallback_slug = fallback_by_muscle.get(muscle_key, "bench_press__barbell_.jpg")
        if fallback_slug in hevy_files:
            final_map[eid] = f"/assets/hevy/{fallback_slug}"
            mapped_count += 1
        else:
            missing_files.append((eid, chosen_slug))

print(f"Mapped {mapped_count}/{len(app_exercises)} exercises successfully!")
if missing_files:
    print(f"Missing files for: {missing_files}")

# Write to src/data/hevyAssetMap.ts
ts_content = """// Authentic static Hevy technical demonstration assets
// High-fidelity 3D anatomical model with accurate perspective angle and red muscle highlights

export const HEVY_EXERCISE_ASSET_MAP: Record<string, string> = """ + json.dumps(final_map, indent=2) + """;

export const DEFAULT_HEVY_ASSET = "/assets/hevy/bench_press__barbell_.jpg";

export function getHevyIllustration(exerciseId: string, primaryMuscle?: string): string {
  if (HEVY_EXERCISE_ASSET_MAP[exerciseId]) {
    return HEVY_EXERCISE_ASSET_MAP[exerciseId];
  }
  
  const cleanId = exerciseId.toLowerCase().trim();
  if (HEVY_EXERCISE_ASSET_MAP[cleanId]) {
    return HEVY_EXERCISE_ASSET_MAP[cleanId];
  }

  // Biomechanical fallback by muscle
  if (primaryMuscle) {
    const m = primaryMuscle.toLowerCase();
    if (m.includes("peit")) return HEVY_EXERCISE_ASSET_MAP["ex-supino-reto-barra"] || DEFAULT_HEVY_ASSET;
    if (m.includes("cost") || m.includes("dors")) return HEVY_EXERCISE_ASSET_MAP["ex-remada-curvada-barra"] || DEFAULT_HEVY_ASSET;
    if (m.includes("ombr") || m.includes("delt")) return HEVY_EXERCISE_ASSET_MAP["ex-desenvolvimento-halteres"] || DEFAULT_HEVY_ASSET;
    if (m.includes("quad") || m.includes("pern")) return HEVY_EXERCISE_ASSET_MAP["ex-agachamento-livre-barra"] || DEFAULT_HEVY_ASSET;
    if (m.includes("post") || m.includes("isquio")) return HEVY_EXERCISE_ASSET_MAP["ex-stiff-barra"] || DEFAULT_HEVY_ASSET;
    if (m.includes("bicep") || m.includes("bícep")) return HEVY_EXERCISE_ASSET_MAP["ex-rosca-direta-barra-w"] || DEFAULT_HEVY_ASSET;
    if (m.includes("tricep") || m.includes("trícep")) return HEVY_EXERCISE_ASSET_MAP["ex-triceps-corda-polia"] || DEFAULT_HEVY_ASSET;
    if (m.includes("abd") || m.includes("core")) return HEVY_EXERCISE_ASSET_MAP["ex-prancha-isometrica"] || DEFAULT_HEVY_ASSET;
    if (m.includes("glút")) return HEVY_EXERCISE_ASSET_MAP["ex-elevacao-pelvica-barra"] || DEFAULT_HEVY_ASSET;
    if (m.includes("panturrilha")) return HEVY_EXERCISE_ASSET_MAP["ex-panturrilha-em-pe-maquina"] || DEFAULT_HEVY_ASSET;
    if (m.includes("cardio")) return HEVY_EXERCISE_ASSET_MAP["ex-corrida-ao-ar-livre"] || DEFAULT_HEVY_ASSET;
  }

  return DEFAULT_HEVY_ASSET;
}
"""

with open('src/data/hevyAssetMap.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Saved src/data/hevyAssetMap.ts successfully!")
