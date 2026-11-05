import React from "react";
import { Exercise } from "../../types";

export type KineticPattern =
  | "bent_over_row"
  | "bicep_curl_w_bar"
  | "triceps_rope"
  | "triceps_bar"
  | "squat_barbell"
  | "running_cardio"
  | "plank_isometric"
  | "bench_press_flat"
  | "bench_press_incline"
  | "deadlift_stiff"
  | "lat_pulldown_pullup"
  | "overhead_press"
  | "lateral_raise"
  | "leg_press"
  | "leg_extension"
  | "leg_curl"
  | "hip_thrust"
  | "calf_raise"
  | "ab_crunch_cable"
  | "general_kinetic";

export interface BiomechanicalFocus {
  optimalAngle: string;
  forceVector: string;
  tensionPeak: string;
  jointCue: string;
}

export function detectKineticPattern(exercise: Exercise): {
  pattern: KineticPattern;
  focus: BiomechanicalFocus;
} {
  const name = (exercise.name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const id = (exercise.id || "").toLowerCase();
  const muscle = (exercise.primaryMuscle || "").toLowerCase();

  // 1. Remada Curvada / Rows (Costas)
  if (
    id.includes("remada-curvada") ||
    name.includes("remada curvada") ||
    (name.includes("remada") && !name.includes("alta") && !name.includes("baixa"))
  ) {
    return {
      pattern: "bent_over_row",
      focus: {
        optimalAngle: "Tronco inclinado a 45° | Joelhos a 20° de semi-flexão",
        forceVector: "Vetor de tração diagonal em direção ao umbigo / crista ilíaca",
        tensionPeak: "Pico concêntrico na retração e adução máxima das escápulas",
        jointCue: "Coluna neutra travada, cotovelos rentes ao tronco sem rotação interna",
      },
    };
  }

  // 2. Rosca Direta com Barra W / Reta (Bíceps)
  if (
    id.includes("rosca-direta") ||
    name.includes("rosca direta") ||
    (name.includes("rosca") && (name.includes("barra") || name.includes("w")))
  ) {
    return {
      pattern: "bicep_curl_w_bar",
      focus: {
        optimalAngle: "Cotovelos fixos a 0° no gradil costal | Arco de flexão de 30° a 140°",
        forceVector: "Torque rotacional concêntrico em supinação através do eixo do cotovelo",
        tensionPeak: "Contração máxima entre 85° e 100° do arco de movimento",
        jointCue: "Punhos neutros na angulação da barra W para descarregar o rádio e a ulna",
      },
    };
  }

  // 3. Tríceps Corda na Polia Alta
  if (
    id.includes("triceps-corda") ||
    name.includes("triceps corda") ||
    (name.includes("corda") && name.includes("tricep"))
  ) {
    return {
      pattern: "triceps_rope",
      focus: {
        optimalAngle: "Tronco inclinado a 15° | Cotovelos fixos alinhados à linha média",
        forceVector: "Vetor descendente com abertura divergente (flare) de 30° no fundo",
        tensionPeak: "Pico de contração máxima na extensão total com pronação final",
        jointCue: "Mantenha o braço (úmero) imóvel; apenas os antebraços executam o arco",
      },
    };
  }

  // 4. Tríceps Pulley / Barra Reta / Barra V
  if (
    id.includes("triceps-pulley") ||
    name.includes("triceps pulley") ||
    name.includes("triceps barra") ||
    (name.includes("tricep") && (name.includes("polia") || name.includes("barra")))
  ) {
    return {
      pattern: "triceps_bar",
      focus: {
        optimalAngle: "Cotovelos a 90° no ponto inicial | Extensão a 180° travada",
        forceVector: "Vetor puramente vertical perpendicular ao piso através da polia alta",
        tensionPeak: "Tensão mecânica contínua na cabeça medial e lateral do tríceps",
        jointCue: "Ombros deprimidos; não eleve as escápulas na subida da barra",
      },
    };
  }

  // 5. Agachamento Livre com Barra / Quadríceps
  if (
    id.includes("agachamento-livre") ||
    name.includes("agachamento livre") ||
    name.includes("agachamento frontal") ||
    (name.includes("agachamento") && !name.includes("bulgaro") && !name.includes("sumo")) ||
    (muscle.includes("quadriceps") && name.includes("agachamento"))
  ) {
    return {
      pattern: "squat_barbell",
      focus: {
        optimalAngle: "Dobra do quadril (crease) ultrapassa 90° abaixo da linha do joelho",
        forceVector: "Força de reação vertical do solo vetorizada através do médio-pé",
        tensionPeak: "Alongamento excêntrico máximo e inversão de vetor no terço inferior",
        jointCue: "Joelhos acompanham a linha dos pés (afaste o chão com os calcanhares)",
      },
    };
  }

  // 6. Corrida Contínua / Fartlek / Cardio
  if (
    id.includes("corrida") ||
    name.includes("corrida") ||
    name.includes("fartlek") ||
    name.includes("esteira") ||
    muscle.includes("cardio")
  ) {
    return {
      pattern: "running_cardio",
      focus: {
        optimalAngle: "Inclinação anterior do corpo a 8° a partir dos tornozelos",
        forceVector: "Impulsão horizontal-diagonal com contato no médio-pé sob o centro de massa",
        tensionPeak: "Recrutamento cardiovascular contínuo em cadência alvo de 170-180 ppm",
        jointCue: "Pelve estável, oscilação vertical reduzida e cotovelos flexionados a 90°",
      },
    };
  }

  // 7. Prancha Frontal Isométrica / Core
  if (
    id.includes("prancha") ||
    name.includes("prancha") ||
    name.includes("vacuum") ||
    (muscle.includes("abd") && name.includes("isometr"))
  ) {
    return {
      pattern: "plank_isometric",
      focus: {
        optimalAngle: "Alinhamento linear estrito de 180° entre ombros, pelve e calcanhares",
        forceVector: "Tensão de anti-extensão contra a gravidade com retroversão pélvica",
        tensionPeak: "Isometria neural profunda do transverso do abdômen e reto abdominal",
        jointCue: "Contraia os glúteos e puxe o umbigo em direção à coluna sem afundar a lombar",
      },
    };
  }

  // 8. Supino Inclinado (Barra ou Halteres)
  if (name.includes("inclinad") && (name.includes("supino") || muscle.includes("peit"))) {
    return {
      pattern: "bench_press_incline",
      focus: {
        optimalAngle: "Banco regulado em inclinação ótima de 30° a 45°",
        forceVector: "Empurre vertical em trajetória convergente na linha clavicular",
        tensionPeak: "Ativação seletiva do feixe clavicular superior do peitoral maior",
        jointCue: "Cotovelos em ângulo de 60° a 75° do tronco; evite hiperextensão do ombro",
      },
    };
  }

  // 9. Supino Reto / Declinado / Peitoral
  if (name.includes("supino") || name.includes("peck deck") || name.includes("voador") || name.includes("crucifixo")) {
    return {
      pattern: "bench_press_flat",
      focus: {
        optimalAngle: "Cotovelos a 75° em relação ao tronco | Barra na linha dos mamilos",
        forceVector: "Empurre concêntrico perpendicular com trajetória levemente curvilínea em 'J'",
        tensionPeak: "Tensão mecânica máxima na transição excêntrica/concêntrica no esterno",
        jointCue: "Escápulas aduzidas e deprimidas cravadas no estofado durante todo o arco",
      },
    };
  }

  // 10. Levantamento Terra / Stiff (Posterior / Costas)
  if (name.includes("terra") || name.includes("stiff") || name.includes("deadlift") || name.includes("good morning")) {
    return {
      pattern: "deadlift_stiff",
      focus: {
        optimalAngle: "Dobradiça de quadril pura (hip hinge) com tíbias próximas à vertical",
        forceVector: "Extensão potente de quadril impulsionada por glúteos e isquiotibiais",
        tensionPeak: "Pico de torque no fechamento pélvico no topo com glúteos travados",
        jointCue: "Barra colada às pernas; coluna dorsal e lombar rigidamente neutras",
      },
    };
  }

  // 11. Puxada Frontal / Barra Fixa (Dorsal)
  if (name.includes("puxada") || name.includes("barra fixa") || name.includes("pulldown") || name.includes("pull up")) {
    return {
      pattern: "lat_pulldown_pullup",
      focus: {
        optimalAngle: "Tronco inclinado a 10°-15° | Barra desce até a altura da fúrcula esternal",
        forceVector: "Depressão e rotação inferior das escápulas guiando os cotovelos para baixo",
        tensionPeak: "Alongamento completo das fibras do grande dorsal na fase excêntrica alta",
        jointCue: "Não puxe com a força dos bíceps; imagine levar as pontas dos cotovelos aos bolsos",
      },
    };
  }

  // 12. Desenvolvimento / Ombros
  if (name.includes("desenvolvimento") || name.includes("militar") || name.includes("overhead")) {
    return {
      pattern: "overhead_press",
      focus: {
        optimalAngle: "Plano escapular a 30° à frente do plano coronal | Empurre acima da cabeça",
        forceVector: "Vetor vertical alinhado diretamente sobre as articulações dos ombros",
        tensionPeak: "Contração máxima do deltoide anterior e medial no topo do movimento",
        jointCue: "Glúteos e abdômen firmes para impedir hiperlordose lombar compensatória",
      },
    };
  }

  // 13. Elevação Lateral
  if (name.includes("elevacao lateral") || (name.includes("lateral") && muscle.includes("ombr"))) {
    return {
      pattern: "lateral_raise",
      focus: {
        optimalAngle: "Abdução no plano escapular (30° anterior) até a linha horizontal de 90°",
        forceVector: "Braço de momento máximo perpendicular à gravidade no topo",
        tensionPeak: "Isolamento estrito da cabeça medial do deltoide sem impulso de trapézio",
        jointCue: "Cotovelos ligeiramente flexionados e punhos neutros sem rotação interna excessiva",
      },
    };
  }

  // 14. Leg Press
  if (name.includes("leg press")) {
    return {
      pattern: "leg_press",
      focus: {
        optimalAngle: "Plataforma a 45° | Joelhos descem até flexão de 90° sem retroversão",
        forceVector: "Empurre potente através dos calcanhares sem travar os joelhos em hiperextensão",
        tensionPeak: "Tensão contínua sobre vasto lateral, medial e glúteo máximo",
        jointCue: "Lombar e glúteos cravados no encosto; nunca permita que o quadril curve para cima",
      },
    };
  }

  // 15. Cadeira Extensora
  if (name.includes("extensora")) {
    return {
      pattern: "leg_extension",
      focus: {
        optimalAngle: "Eixo mecânico da máquina alinhado precisamente ao côndilo do joelho",
        forceVector: "Extensão concêntrica terminal com 1 segundo de isometria no topo",
        tensionPeak: "Encurtamento máximo do reto femoral e vastos no ápice",
        jointCue: "Segure firmemente as manoplas laterais para manter a pelve travada no assento",
      },
    };
  }

  // 16. Mesa / Cadeira Flexora
  if (name.includes("flexora")) {
    return {
      pattern: "leg_curl",
      focus: {
        optimalAngle: "Flexão de joelhos até ~105° com rolo posicionado logo acima do tendão calcâneo",
        forceVector: "Flexão ativa impulsionada pelos ísquios com pés em dorsiflexão neutra",
        tensionPeak: "Pico de contração na aproximação do rolo aos glúteos",
        jointCue: "Mantenha o quadril pressionado contra o estofado sem compensar com a lombar",
      },
    };
  }

  // 17. Elevação Pélvica / Hip Thrust
  if (name.includes("elevacao pelvica") || name.includes("hip thrust")) {
    return {
      pattern: "hip_thrust",
      focus: {
        optimalAngle: "Tíbias perpendiculares ao solo (90°) no ponto mais alto da elevação",
        forceVector: "Empurre vertical de quadril com retroversão pélvica no pico de extensão",
        tensionPeak: "Pico máximo de contração e esmagamento dos glúteos no topo",
        jointCue: "Queixo colado ao peito e olhar sempre para a frente durante toda a subida",
      },
    };
  }

  // 18. Panturrilha
  if (name.includes("panturrilha") || name.includes("calf") || name.includes("soleo")) {
    return {
      pattern: "calf_raise",
      focus: {
        optimalAngle: "Dorsiflexão profunda excêntrica (-25°) seguida de flexão plantar total (+45°)",
        forceVector: "Pressão perpendicular através do primeiro e segundo metatarsos dos pés",
        tensionPeak: "Pausa isométrica de 2 segundos no ponto de encurtamento máximo",
        jointCue: "Não realize rebote elástico no fundo; controle rigoroso da cadência",
      },
    };
  }

  // 19. Abdominal / Crunch
  if (name.includes("abdominal") || name.includes("crunch")) {
    return {
      pattern: "ab_crunch_cable",
      focus: {
        optimalAngle: "Flexão vertebral de ~30° aproximando o esterno da sínfise púbica",
        forceVector: "Enrolamento da caixa torácica sem puxar o pescoço com os braços",
        tensionPeak: "Contração máxima das fibras superiores e médias do reto abdominal",
        jointCue: "Solte todo o ar na fase concêntrica contraindo o abdômen profundamente",
      },
    };
  }

  // Fallback geral biomecânico
  return {
    pattern: "general_kinetic",
    focus: {
      optimalAngle: "Alinhamento articular neutro com base de apoio estável",
      forceVector: "Vetor controlado ao longo da linha de tração das fibras musculares",
      tensionPeak: "Controle da cadência com 2s excêntrico e 1s concêntrico potente",
      jointCue: "Estabilize o core e mantenha a respiração ritmada sem apneia",
    },
  };
}

interface KineticVectorDiagramProps {
  exercise: Exercise;
  className?: string;
}

export const KineticVectorDiagram: React.FC<KineticVectorDiagramProps> = ({
  exercise,
  className = "",
}) => {
  const { pattern, focus } = detectKineticPattern(exercise);

  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Heavy-style Minimalist Technical Container */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/9] max-h-[300px] bg-neutral-900 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center relative overflow-hidden border border-neutral-800 shadow-xl">
        {/* Subtle Biomechanical Grid in Background */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Top Badges: Muscle Group & Movement Type */}
        <div className="absolute top-3.5 left-4 flex items-center gap-2 pointer-events-none z-10">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
            {exercise.primaryMuscle || "Músculo Alvo"}
          </span>
          {exercise.equipment && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700/60">
              {exercise.equipment}
            </span>
          )}
        </div>

        {/* Minimalist Angle / View Badge */}
        <div className="absolute top-3.5 right-4 pointer-events-none z-10">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            Vetor Cinético 2D
          </span>
        </div>

        {/* ========================================================================= */}
        {/* DEDICATED BIOMECHANICAL VECTOR SVG ENGINE                                  */}
        {/* ========================================================================= */}
        <div className="w-full h-full flex items-center justify-center pt-4">
          {renderKineticSvg(pattern)}
        </div>

        {/* Bottom Kinetic Indicator Bar */}
        <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[10px] text-neutral-400 font-mono pointer-events-none border-t border-neutral-800/80 pt-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
            <span className="text-neutral-300 font-semibold">Tensão Primária</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span>Trajetória do Vetor</span>
            <span className="font-bold">➔</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* "FOCO BIOMECÂNICO" TECHNICAL CAPTIONS PANEL (DIRECTLY BELOW DIAGRAM)      */}
      {/* ========================================================================= */}
      <div className="w-full mt-3 bg-neutral-900/90 rounded-2xl p-3.5 border border-neutral-800 space-y-2.5 shadow-md text-left">
        <div className="flex items-center justify-between border-b border-neutral-800/70 pb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Foco Biomecânico & Ângulo Articular
            </h4>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono font-semibold">
            Padrão Técnico
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
              📐 Ângulo Articular Ótimo
            </span>
            <p className="text-neutral-200 font-medium leading-relaxed">
              {focus.optimalAngle}
            </p>
          </div>

          <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-0.5">
              🏹 Vetor de Força Principal
            </span>
            <p className="text-neutral-200 font-medium leading-relaxed">
              {focus.forceVector}
            </p>
          </div>

          <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
            <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">
              ⚡ Tensão Mecânica Pico
            </span>
            <p className="text-neutral-200 font-medium leading-relaxed">
              {focus.tensionPeak}
            </p>
          </div>

          <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
              🛡️ Alinhamento & Ponto Crítico
            </span>
            <p className="text-neutral-200 font-medium leading-relaxed">
              {focus.jointCue}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// SVG RENDERING FUNCTION FOR EACH BIOMECHANICAL MOVEMENT
// =========================================================================
function renderKineticSvg(pattern: KineticPattern) {
  switch (pattern) {
    case "bent_over_row":
      // Remada Curvada com Barra: Tronco inclinado a 45°, joelhos fletidos, barra puxando para o umbigo, vetor escapular
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-h-[190px]">
          {/* Floor Line */}
          <line x1="30" y1="185" x2="290" y2="185" stroke="#404040" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Angle 45° Arc Guide */}
          <path d="M 160 115 A 35 35 0 0 0 195 140" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2 2" />
          <text x="202" y="132" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">45°</text>

          {/* Legs: Feet, Knee slightly bent, Hip */}
          <polyline points="140,185 145,150 160,115" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="155,185 160,150 165,115" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Torso: Hinged forward at 45° */}
          <line x1="160" y1="115" x2="225" y2="70" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
          {/* Red Highlight: Latissimus & Rhomboids (Back Muscles) */}
          <path d="M 165 110 L 220 72 L 210 65 L 158 102 Z" fill="#f43f5e" opacity="0.85" />
          <circle cx="215" cy="73" r="5" fill="#f43f5e" />

          {/* Head & Neck */}
          <line x1="225" y1="70" x2="242" y2="60" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />
          <circle cx="248" cy="55" r="10" fill="#f1f5f9" />

          {/* Arms pulling Barbell upward */}
          <polyline points="220,73 195,85 190,120" fill="none" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Elbow Joint Pivot */}
          <circle cx="195" cy="85" r="3.5" fill="#06b6d4" />
          <text x="180" y="78" fill="#06b6d4" fontSize="8" fontFamily="monospace">Cotovelo</text>

          {/* Barbell Bar & Weight Plates */}
          <line x1="170" y1="120" x2="210" y2="120" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="170" cy="120" r="14" fill="#334155" stroke="#f8fafc" strokeWidth="1.5" />
          <circle cx="170" cy="120" r="5" fill="#06b6d4" />

          {/* Kinetic Upward Force Vector Arrow (Pulling towards Navel) */}
          <path d="M 190 145 L 190 105" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrow-cyan)" />
          <defs>
            <marker id="arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
            </marker>
          </defs>
          <text x="200" y="105" fill="#06b6d4" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Puxada Dorsal</text>
        </svg>
      );

    case "bicep_curl_w_bar":
      // Rosca Direta com Barra W: Em pé ereto, cotovelos colados ao tronco, flexão do antebraço em arco
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-h-[190px]">
          {/* Floor */}
          <line x1="40" y1="185" x2="280" y2="185" stroke="#404040" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Body Standing Upright */}
          {/* Legs */}
          <line x1="160" y1="185" x2="160" y2="115" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
          {/* Torso straight 90° */}
          <line x1="160" y1="115" x2="160" y2="55" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
          {/* Head */}
          <circle cx="160" cy="40" r="11" fill="#f1f5f9" />

          {/* Upper Arm: Pinned tightly to the torso */}
          <line x1="160" y1="62" x2="162" y2="95" stroke="#f1f5f9" strokeWidth="4.5" strokeLinecap="round" />
          {/* RED HIGHLIGHT: Biceps peak contraction */}
          <ellipse cx="165" cy="85" rx="5" ry="10" fill="#f43f5e" />

          {/* Elbow Fixed Pivot Point */}
          <circle cx="162" cy="95" r="4" fill="#06b6d4" />
          <text x="110" y="98" fill="#06b6d4" fontSize="9" fontFamily="monospace">Pivô 0° Fixo</text>

          {/* Forearm Curling Upward with W-Bar */}
          <polyline points="162,95 185,75 195,65" fill="none" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {/* W-Bar Silhouette in Hands */}
          <path d="M 188 68 L 193 62 L 198 66 L 203 60" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          {/* Weight Plates on Bar */}
          <circle cx="188" cy="68" r="9" fill="#334155" stroke="#f8fafc" strokeWidth="1.5" />
          <circle cx="203" cy="60" r="9" fill="#334155" stroke="#f8fafc" strokeWidth="1.5" />

          {/* Kinetic Curled Arc Force Vector */}
          <path d="M 185 125 A 35 35 0 0 0 200 68" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="3 2" markerEnd="url(#arrow-cyan)" />
          <text x="210" y="95" fill="#06b6d4" fontSize="9" fontWeight="bold">Arco Concêntrico</text>
        </svg>
      );

    case "triceps_rope":
      // Tríceps Corda na Polia Alta: Polia acima, cotovelo travado, corda abrindo nas laterais (flare)
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-h-[190px]">
          {/* Floor & Top Pulley */}
          <line x1="40" y1="185" x2="280" y2="185" stroke="#404040" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="190" cy="25" r="8" fill="#334155" stroke="#06b6d4" strokeWidth="2" />
          <text x="205" y="28" fill="#06b6d4" fontSize="9" fontFamily="monospace">Polia Alta</text>

          {/* Body standing slightly hinged (15°) */}
          <line x1="140" y1="185" x2="148" y2="115" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
          <line x1="148" y1="115" x2="155" y2="60" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
          <circle cx="158" cy="45" r="11" fill="#f1f5f9" />

          {/* Cable Line from Pulley down to hands */}
          <line x1="190" y1="25" x2="175" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Upper Arm pinned by side */}
          <line x1="156" y1="65" x2="160" y2="95" stroke="#f1f5f9" strokeWidth="4.5" strokeLinecap="round" />
          {/* RED HIGHLIGHT: Triceps Lateral & Long Head */}
          <rect x="150" y="70" width="7" height="18" rx="3.5" fill="#f43f5e" />

          {/* Elbow locked pivot */}
          <circle cx="160" cy="95" r="4" fill="#06b6d4" />

          {/* Forearm pushing down */}
          <line x1="160" y1="95" x2="175" y2="140" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />

          {/* Flexible Rope Handles expanding outwards (Flare) */}
          <path d="M 175 140 Q 185 145 195 155" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          <path d="M 175 140 Q 170 148 160 155" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          <circle cx="195" cy="155" r="4" fill="#f59e0b" />
          <circle cx="160" cy="155" r="4" fill="#f59e0b" />

          {/* Outward Flare Kinetic Arrows */}
          <path d="M 175 140 L 205 160" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arrow-cyan)" />
          <text x="210" y="162" fill="#06b6d4" fontSize="9" fontWeight="bold">Flare Externo</text>
        </svg>
      );

    case "triceps_bar":
      // Tríceps Barra Reta na Polia Alta: empurre vertical descendente rígido
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-h-[190px]">
          {/* Floor & Top Pulley */}
          <line x1="40" y1="185" x2="280" y2="185" stroke="#404040" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="185" cy="25" r="8" fill="#334155" stroke="#06b6d4" strokeWidth="2" />

          {/* Body */}
          <line x1="140" y1="185" x2="148" y2="115" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
          <line x1="148" y1="115" x2="152" y2="60" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
          <circle cx="154" cy="45" r="11" fill="#f1f5f9" />

          {/* Cable */}
          <line x1="185" y1="25" x2="175" y2="105" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Upper Arm with Triceps Red Highlight */}
          <line x1="152" y1="65" x2="156" y2="98" stroke="#f1f5f9" strokeWidth="4.5" />
          <rect x="146" y="70" width="7" height="18" rx="3.5" fill="#f43f5e" />
          <circle cx="156" cy="98" r="4" fill="#06b6d4" />

          {/* Forearm extended downwards */}
          <line x1="156" y1="98" x2="175" y2="145" stroke="#f1f5f9" strokeWidth="4" />

          {/* Straight Bar */}
          <line x1="160" y1="145" x2="195" y2="145" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />

          {/* Direct Vertical Downward Vector */}
          <path d="M 175 115 L 175 155" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arrow-cyan)" />
          <text x="185" y="135" fill="#06b6d4" fontSize="9" fontWeight="bold">Extensão Vertical</text>
        </svg>
      );

    case "squat_barbell":
      // Agachamento Livre com Barra: Joelhos em 90°, quadril abaixo do joelho, barra nos trapézios, força vertical
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-h-[190px]">
          {/* Floor Line */}
          <line x1="30" y1="185" x2="290" y2="185" stroke="#404040" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Feet Planted */}
          <line x1="120" y1="185" x2="140" y2="185" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />

          {/* Shins & Knees bent at 90° */}
          <polyline points="135,185 145,145 185,145" fill="none" stroke="#64748b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Knee Joint & 90° angle marker */}
          <circle cx="145" cy="145" r="4" fill="#06b6d4" />
          <text x="110" y="142" fill="#06b6d4" fontSize="9" fontFamily="monospace">90° Paralelo</text>

          {/* Femur (Thigh) with RED HIGHLIGHT: Quadriceps & Gluteus */}
          <line x1="145" y1="145" x2="185" y2="145" stroke="#f43f5e" strokeWidth="9" strokeLinecap="round" />
          <circle cx="185" cy="145" r="6" fill="#f43f5e" />

          {/* Torso upright / slightly angled */}
          <line x1="185" y1="145" x2="175" y2="85" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
          <circle cx="172" cy="72" r="10" fill="#f1f5f9" />

          {/* Barbell Across Upper Trapezius */}
          <line x1="145" y1="87" x2="205" y2="87" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="145" cy="87" r="13" fill="#334155" stroke="#f8fafc" strokeWidth="1.5" />
          <circle cx="205" cy="87" r="13" fill="#334155" stroke="#f8fafc" strokeWidth="1.5" />

          {/* Ground Reaction Force Kinetic Arrows (Straight Up) */}
          <path d="M 135 185 L 135 130" stroke="#06b6d4" strokeWidth="2.5" markerEnd="url(#arrow-cyan)" />
          <path d="M 185 170 L 185 110" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arrow-cyan)" />
          <text x="195" y="125" fill="#06b6d4" fontSize="9" fontWeight="bold">Pressão nos Calcanhares</text>
        </svg>
      );

    case "plank_isometric":
      // Prancha Frontal Isométrica: Corpo perfeitamente alinhado em 180°, apoiado em antebraços e pontas dos pés
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-h-[190px]">
          {/* Floor Line */}
          <line x1="20" y1="165" x2="300" y2="165" stroke="#404040" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* 180° Perfect Horizontal Alignment Guideline */}
          <line x1="55" y1="130" x2="265" y2="130" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
          <text x="215" y="115" fill="#06b6d4" fontSize="9" fontFamily="monospace">Alinhamento 180°</text>

          {/* Feet & Ankles on Floor */}
          <line x1="60" y1="165" x2="65" y2="135" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />

          {/* Legs & Glutes */}
          <line x1="65" y1="135" x2="130" y2="132" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

          {/* Torso & Pelvis with RED HIGHLIGHT: Transversus & Rectus Abdominis */}
          <line x1="130" y1="132" x2="225" y2="128" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" />
          <rect x="140" y="123" width="70" height="9" rx="4" fill="#f43f5e" opacity="0.95" />

          {/* Head & Neck neutral */}
          <line x1="225" y1="128" x2="245" y2="126" stroke="#f1f5f9" strokeWidth="5" strokeLinecap="round" />
          <circle cx="255" cy="125" r="10" fill="#f1f5f9" />

          {/* Forearms on Floor & Upper Arm at 90° */}
          <polyline points="225,128 225,165 250,165" fill="none" stroke="#f1f5f9" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="225" cy="165" r="3.5" fill="#06b6d4" />

          {/* Anti-Extension Force Vectors pointing UP into Core */}
          <path d="M 160 155 L 160 137" stroke="#06b6d4" strokeWidth="2.5" markerEnd="url(#arrow-cyan)" />
          <path d="M 190 155 L 190 137" stroke="#06b6d4" strokeWidth="2.5" markerEnd="url(#arrow-cyan)" />
          <text x="140" y="105" fill="#f43f5e" fontSize="9" fontWeight="bold">Ativação Anti-Extensão</text>
        </svg>
      );

    case "running_cardio":
      // Corrida Contínua / Fartlek: Silhueta dinâmica de passada atlética com vetor de propulsão
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-h-[190px]">
          {/* Running Track / Floor Line */}
          <line x1="30" y1="185" x2="290" y2="185" stroke="#404040" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Stride Angle 8° Lean */}
          <line x1="160" y1="185" x2="175" y2="60" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

          {/* Back Leg Pushing Off Floor */}
          <polyline points="105,180 125,145 155,120" fill="none" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Front Leg High Knee Drive with RED HIGHLIGHT: Quads & Hip Flexors */}
          <polyline points="155,120 185,115 175,155" fill="none" stroke="#f43f5e" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Torso Leaning Forward */}
          <line x1="155" y1="120" x2="170" y2="70" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
          <circle cx="175" cy="55" r="10" fill="#f1f5f9" />

          {/* Arms in 90° Running Swing */}
          <polyline points="170,75 190,95 205,80" fill="none" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="170,75 145,90 135,110" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {/* Forward Propulsion Vector Arrow */}
          <path d="M 185 90 L 240 70" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arrow-cyan)" />
          <text x="220" y="60" fill="#06b6d4" fontSize="9" fontWeight="bold">Propulsão 180 ppm</text>
        </svg>
      );

    case "bench_press_flat":
      // Supino Reto com Barra / Halteres
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-h-[190px]">
          {/* Flat Bench */}
          <rect x="80" y="130" width="160" height="12" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
          <line x1="110" y1="142" x2="110" y2="185" stroke="#475569" strokeWidth="4" />
          <line x1="210" y1="142" x2="210" y2="185" stroke="#475569" strokeWidth="4" />

          {/* Torso lying on bench with RED HIGHLIGHT: Pectoralis Major */}
          <line x1="100" y1="126" x2="200" y2="126" stroke="#f43f5e" strokeWidth="9" strokeLinecap="round" />
          <circle cx="95" cy="126" r="9" fill="#f1f5f9" />

          {/* Bent Legs on Floor (Leg Drive) */}
          <polyline points="200,126 215,150 220,185" fill="none" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" />

          {/* Arms Pressing Barbell Up */}
          <polyline points="150,124 135,100 150,75" fill="none" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="135" cy="100" r="3.5" fill="#06b6d4" />
          <text x="90" y="98" fill="#06b6d4" fontSize="8" fontFamily="monospace">75° Tuck</text>

          {/* Barbell & Plates */}
          <line x1="110" y1="75" x2="190" y2="75" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="110" cy="75" r="14" fill="#334155" stroke="#f8fafc" strokeWidth="1.5" />
          <circle cx="190" cy="75" r="14" fill="#334155" stroke="#f8fafc" strokeWidth="1.5" />

          {/* Kinetic Vertical Press Vector */}
          <path d="M 150 110 L 150 65" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arrow-cyan)" />
          <text x="160" y="60" fill="#06b6d4" fontSize="9" fontWeight="bold">Empurre Esternal</text>
        </svg>
      );

    case "bench_press_incline":
      // Supino Inclinado (30-45°)
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-h-[190px]">
          {/* Incline Bench at 35° */}
          <line x1="90" y1="165" x2="190" y2="105" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
          <text x="120" y="160" fill="#06b6d4" fontSize="9" fontFamily="monospace">35° Inclinação</text>

          {/* Body on Incline with RED HIGHLIGHT: Clavicular Pec */}
          <line x1="105" y1="158" x2="185" y2="110" stroke="#f43f5e" strokeWidth="9" strokeLinecap="round" />
          <circle cx="192" cy="100" r="9" fill="#f1f5f9" />

          {/* Dumbbells pressing vertically */}
          <line x1="160" y1="120" x2="145" y2="90" stroke="#f1f5f9" strokeWidth="4" />
          <line x1="145" y1="90" x2="155" y2="65" stroke="#f1f5f9" strokeWidth="4" />
          <rect x="145" y="55" width="20" height="8" rx="2" fill="#cbd5e1" />
          <circle cx="145" cy="59" r="6" fill="#334155" />
          <circle cx="165" cy="59" r="6" fill="#334155" />

          {/* Kinetic Clavicular Vector */}
          <path d="M 155 100 L 155 50" stroke="#06b6d4" strokeWidth="2.5" markerEnd="url(#arrow-cyan)" />
          <text x="170" y="50" fill="#06b6d4" fontSize="9" fontWeight="bold">Feixe Superior</text>
        </svg>
      );

    case "deadlift_stiff":
      // Levantamento Terra / Stiff (Hip Hinge)
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-h-[190px]">
          <line x1="30" y1="185" x2="290" y2="185" stroke="#404040" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Vertical Shins */}
          <line x1="140" y1="185" x2="142" y2="140" stroke="#64748b" strokeWidth="4.5" />
          
          {/* Hips Hinged Back with RED HIGHLIGHT: Hamstrings & Glutes */}
          <line x1="142" y1="140" x2="175" y2="115" stroke="#f43f5e" strokeWidth="7" />
          
          {/* Torso straight at 40° */}
          <line x1="175" y1="115" x2="135" y2="80" stroke="#f1f5f9" strokeWidth="6" />
          <circle cx="125" cy="70" r="9" fill="#f1f5f9" />

          {/* Arms hanging straight down holding Barbell */}
          <line x1="145" y1="88" x2="140" y2="150" stroke="#f1f5f9" strokeWidth="4" />
          <line x1="120" y1="150" x2="160" y2="150" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="120" cy="150" r="14" fill="#334155" stroke="#f8fafc" strokeWidth="1.5" />

          {/* Posterior Chain Kinetic Vector */}
          <path d="M 175 115 L 210 100" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arrow-cyan)" />
          <text x="180" y="90" fill="#06b6d4" fontSize="9" fontWeight="bold">Hip Hinge</text>
        </svg>
      );

    default:
      // General Biomechanical Movement Pattern
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full max-h-[190px]">
          <line x1="30" y1="185" x2="290" y2="185" stroke="#404040" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="160" y1="185" x2="160" y2="115" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
          <line x1="160" y1="115" x2="160" y2="60" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
          <circle cx="160" cy="45" r="11" fill="#f1f5f9" />
          <polyline points="160,68 185,85 190,115" fill="none" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />
          <circle cx="185" cy="85" r="4" fill="#06b6d4" />
          <path d="M 190 120 L 190 75" stroke="#06b6d4" strokeWidth="2.5" markerEnd="url(#arrow-cyan)" />
          <text x="200" y="80" fill="#06b6d4" fontSize="9" fontWeight="bold">Vetor Biomecânico</text>
        </svg>
      );
  }
}
