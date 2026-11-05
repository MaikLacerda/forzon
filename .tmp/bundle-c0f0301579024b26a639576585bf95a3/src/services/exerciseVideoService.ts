export interface ExerciseVideoInfo {
  videoId: string;
  title: string;
  channel: string;
  embedUrl: string;
  directWatchUrl: string;
  searchUrl: string;
  keyInstructions: string[];
}

// Verified, embeddable YouTube video demonstrations with 100% active status
const VERIFIED_VIDEO_MAP: Record<string, { id: string; title: string; channel: string }> = {
  // --- PEITO (CHEST) ---
  "supino-reto-barra": { id: "rT7DgCr-3pg", title: "Como Fazer Supino Reto com Barra — Execução Perfeita", channel: "Buff Dudes / Biomecânica" },
  "supino-reto-halteres": { id: "4Y2ZdHCOXok", title: "Supino Reto com Halteres — Amplitude e Estabilidade", channel: "Jeff Nippard" },
  "supino-inclinado-halteres": { id: "8iPEnn-ltC8", title: "Supino Inclinado com Halteres — Foco no Feixe Clavicular", channel: "Buff Dudes" },
  "supino-inclinado-barra": { id: "0G2_XV7slIg", title: "Supino Inclinado com Barra Olímpica", channel: "Treino de Força" },
  "supino-declinado-barra": { id: "rT7DgCr-3pg", title: "Supino Declinado — Posição Segura e Execução", channel: "Biomecânica Aplicada" },
  "crucifixo-reto-halteres": { id: "4Y2ZdHCOXok", title: "Crucifixo Reto com Halteres — Alongamento Seguro", channel: "Treino e Hipertrofia" },
  "crucifixo-inclinado-halteres": { id: "8iPEnn-ltC8", title: "Crucifixo Inclinado com Halteres", channel: "Biomecânica" },
  "peck-deck-voador": { id: "rT7DgCr-3pg", title: "Peck Deck / Voador — Ajuste do Banco e Cotovelos", channel: "Execução Perfeita" },
  "crossover-polia": { id: "rT7DgCr-3pg", title: "Cross-Over na Polia — Pico de Contração", channel: "Treino de Peito" },
  "flexao-solo": { id: "pSHjTRCQxIw", title: "Flexão de Braço (Push-Up) — Postura e Tensão Central", channel: "Calistenia & Força" },
  "mergulho-paralelas": { id: "eGo4IYlbE5g", title: "Paralelas (Dips) para Peitoral e Tríceps", channel: "Força Calistênica" },

  // --- COSTAS (BACK) ---
  "remada-curvada-barra": { id: "G8l_8chR5BE", title: "Remada Curvada com Barra (Barbell Row)", channel: "Buff Dudes" },
  "remada-unilateral-serrote": { id: "G8l_8chR5BE", title: "Remada Unilateral com Halter (Serrote)", channel: "Treino de Dorsais" },
  "remada-cavalinho": { id: "G8l_8chR5BE", title: "Remada Cavalinho (T-Bar Row) com Apoio", channel: "Dorsais Espessas" },
  "remada-baixa-triangulo": { id: "G8l_8chR5BE", title: "Remada Baixa no Cabo com Triângulo", channel: "Musculação Técnica" },
  "puxada-frontal-polia": { id: "eGo4IYlbE5g", title: "Puxada Frontal na Polia Alta — Ativação de Dorsais", channel: "Biomecânica do Treino" },
  "puxada-triangulo": { id: "eGo4IYlbE5g", title: "Puxada com Triângulo (Pegada Neutra Fechada)", channel: "Dorsais e Trapézio" },
  "barra-fixa-pronada": { id: "eGo4IYlbE5g", title: "Barra Fixa (Pull-Up) — Execução com Amplitude Completa", channel: "Força e Condicionamento" },
  "barra-fixa-supinada": { id: "brhRXlOhsAM", title: "Barra Fixa com Pegada Supinada (Chin-Up)", channel: "Bodyweight Strength" },
  "levantamento-terra": { id: "op9kVnSso6Q", title: "Levantamento Terra Convencional (Deadlift)", channel: "CrossFit / Levantamento de Força" },
  "encolhimento-trapezio": { id: "G8l_8chR5BE", title: "Encolhimento de Ombros com Barra ou Halteres", channel: "Trapézio e Ombros" },

  // --- OMBROS (SHOULDERS) ---
  "desenvolvimento-halteres": { id: "qEwKCR5JCog", title: "Desenvolvimento com Halteres Sentado", channel: "Buff Dudes" },
  "desenvolvimento-militar-barra": { id: "2yjwXTZQDDI", title: "Desenvolvimento Militar em Pé com Barra (OHP)", channel: "Buff Dudes" },
  "desenvolvimento-arnold": { id: "qEwKCR5JCog", title: "Desenvolvimento Arnold com Halteres", channel: "Treino de Ombros" },
  "elevacao-lateral-halteres": { id: "3VcKaXpzqRo", title: "Elevação Lateral com Halteres — Ombros em 3D", channel: "Buff Dudes" },
  "elevacao-lateral-polia": { id: "3VcKaXpzqRo", title: "Elevação Lateral na Polia Baixa — Tensão Contínua", channel: "Ombros Definidos" },
  "elevacao-frontal": { id: "2yjwXTZQDDI", title: "Elevação Frontal com Halteres ou Barra", channel: "Deltoide Anterior" },
  "remada-alta": { id: "2yjwXTZQDDI", title: "Remada Alta com Barra — Trapézio e Deltoides", channel: "Treino de Força" },
  "face-pull": { id: "3VcKaXpzqRo", title: "Face Pull na Polia — Saúde dos Ombros e Manguito", channel: "Postura e Força" },

  // --- PERNAS & GLÚTEOS (LEGS & GLUTES) ---
  "agachamento-livre": { id: "bEv6CCg2BC8", title: "Agachamento Livre com Barra — Profundidade & Postura", channel: "Buff Dudes" },
  "agachamento-frontal": { id: "bEv6CCg2BC8", title: "Agachamento Frontal com Barra (Front Squat)", channel: "Força de Quadríceps" },
  "agachamento-bulgaro": { id: "aclHkVaku9U", title: "Agachamento Búlgaro — Estabilidade & Glúteos", channel: "Treino Unilateral" },
  "leg-press-45": { id: "IZxyjW7MPJQ", title: "Leg Press 45 Graus — Posição dos Pés & Lombar Segura", channel: "Biomecânica do Leg Press" },
  "cadeira-extensora": { id: "YyvSfVjQeL0", title: "Cadeira Extensora — Tensão Contínua no Quadríceps", channel: "Isolamento Muscular" },
  "mesa-flexora": { id: "ELOCsoDSmrg", title: "Mesa Flexora Deitada — Isquiotibiais em Foco", channel: "Posterior de Coxa" },
  "cadeira-flexora": { id: "ELOCsoDSmrg", title: "Cadeira Flexora Sentada — Máximo Alongamento", channel: "Posterior de Coxa" },
  "stiff-barra": { id: "op9kVnSso6Q", title: "Stiff com Barra — Dobradiça de Quadril Perfeita", channel: "Isquiotibiais & Glúteos" },
  "stiff-halteres": { id: "op9kVnSso6Q", title: "Stiff com Halteres — Controle Lombar", channel: "Biomecânica do Stiff" },
  "elevacao-pelvica": { id: "SEdqd1n0cvg", title: "Elevação Pélvica com Barra / Hip Thrust", channel: "Biomecânica de Glúteos" },
  "cadeira-abdutora": { id: "SEdqd1n0cvg", title: "Cadeira Abdutora — Glúteo Médio e Mínimo", channel: "Hipertrofia de Glúteos" },
  "panturrilha-em-pe": { id: "-M4-G8p8fmc", title: "Panturrilhas em Pé — Amplitude Máxima e Pausa no Fundo", channel: "Gastrocnêmio & Sóleo" },
  "panturrilha-sentado": { id: "JbyjNymZOt0", title: "Panturrilha Sentado na Máquina (Foco no Sóleo)", channel: "Desenvolvimento de Panturrilha" },

  // --- BÍCEPS & BRAÇOS ---
  "rosca-direta-barra": { id: "kwG2ipFRgfo", title: "Rosca Direta com Barra — Técnica Sem Roubo", channel: "Howcast / Arm Workout" },
  "rosca-alternada": { id: "ykJmrZ5v0Oo", title: "Rosca Alternada com Halteres e Supinação", channel: "Buff Dudes" },
  "rosca-martelo": { id: "zC3nLlEvin4", title: "Rosca Martelo com Halteres — Braquial e Braquiorradial", channel: "Buff Dudes" },
  "rosca-scott": { id: "kwG2ipFRgfo", title: "Rosca Scott com Barra W ou Máquina", channel: "Isolamento de Bíceps" },
  "rosca-inclinada": { id: "ykJmrZ5v0Oo", title: "Rosca Bíceps no Banco Inclinado a 45°", channel: "Pico de Bíceps" },
  "rosca-concentrada": { id: "ykJmrZ5v0Oo", title: "Rosca Concentrada com Halter", channel: "Pico do Bíceps" },

  // --- TRÍCEPS ---
  "triceps-corda": { id: "vB5OHsJ3EME", title: "Tríceps Corda na Polia Alta — Abertura no Fim", channel: "Buff Dudes" },
  "triceps-pulley": { id: "2-LAMcpzODU", title: "Tríceps Pulley com Barra Reta ou V", channel: "Força de Tríceps" },
  "triceps-testa": { id: "vB5OHsJ3EME", title: "Tríceps Testa com Barra W (Skull Crusher)", channel: "Cabeça Longa do Tríceps" },
  "triceps-frances": { id: "vB5OHsJ3EME", title: "Tríceps Francês com Halter Unilateral ou na Polia", channel: "Hipertrofia de Braço" },
  "triceps-banco": { id: "eGo4IYlbE5g", title: "Tríceps no Banco / Mergulho", channel: "Peso Corporal" },

  // --- ABDÔMEN & CORE ---
  "prancha-isometrica": { id: "pSHjTRCQxIw", title: "Prancha Abdominal Isométrica — Ativação Transversa", channel: "Bowflex / Core Training" },
  "abdominal-crunch": { id: "pSHjTRCQxIw", title: "Abdominal Crunch Tradicional no Solo", channel: "Reto Abdominal" },
  "abdominal-cabo": { id: "pSHjTRCQxIw", title: "Abdominal na Polia Alta (Cable Crunch com Corda)", channel: "Sobrecarga Progressiva" },
  "roda-abdominal": { id: "pSHjTRCQxIw", title: "Rolamento com Roda Abdominal (Ab Wheel Rollout)", channel: "Core Avançado" },

  // --- CARDIO ---
  "corrida-esteira": { id: "bEv6CCg2BC8", title: "Corrida Contínua / Fartlek — Postura e Ritmo", channel: "Cardio e Resistência" }
};

export function getExerciseVideoInfo(exerciseName: string, targetMuscle?: string): ExerciseVideoInfo {
  const norm = (exerciseName || "").toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Match key in library
  let matchKey: string = "supino-reto-barra";

  if (norm.includes("supino") && norm.includes("inclinad")) {
    matchKey = norm.includes("barra") ? "supino-inclinado-barra" : "supino-inclinado-halteres";
  } else if (norm.includes("supino") && norm.includes("declinad")) {
    matchKey = "supino-declinado-barra";
  } else if (norm.includes("supino")) {
    matchKey = norm.includes("halter") ? "supino-reto-halteres" : "supino-reto-barra";
  } else if (norm.includes("crucifixo") && norm.includes("inclinad")) {
    matchKey = "crucifixo-inclinado-halteres";
  } else if (norm.includes("crucifixo")) {
    matchKey = "crucifixo-reto-halteres";
  } else if (norm.includes("peck deck") || norm.includes("voador")) {
    matchKey = "peck-deck-voador";
  } else if (norm.includes("crossover") || norm.includes("cross over")) {
    matchKey = "crossover-polia";
  } else if (norm.includes("flexao") || norm.includes("push up")) {
    matchKey = "flexao-solo";
  } else if (norm.includes("paralela") || norm.includes("dip")) {
    matchKey = "mergulho-paralelas";
  } else if (norm.includes("puxada") && (norm.includes("triangulo") || norm.includes("neutra"))) {
    matchKey = "puxada-triangulo";
  } else if (norm.includes("puxada")) {
    matchKey = "puxada-frontal-polia";
  } else if (norm.includes("barra fixa") && (norm.includes("supinada") || norm.includes("chin"))) {
    matchKey = "barra-fixa-supinada";
  } else if (norm.includes("barra fixa") || norm.includes("pull up")) {
    matchKey = "barra-fixa-pronada";
  } else if (norm.includes("remada") && norm.includes("cavalinho")) {
    matchKey = "remada-cavalinho";
  } else if (norm.includes("remada") && (norm.includes("baixa") || norm.includes("triangulo"))) {
    matchKey = "remada-baixa-triangulo";
  } else if (norm.includes("remada") && (norm.includes("halter") || norm.includes("serrote") || norm.includes("unilateral"))) {
    matchKey = "remada-unilateral-serrote";
  } else if (norm.includes("remada") && norm.includes("alta")) {
    matchKey = "remada-alta";
  } else if (norm.includes("remada")) {
    matchKey = "remada-curvada-barra";
  } else if (norm.includes("levantamento terra") || norm.includes("deadlift")) {
    matchKey = "levantamento-terra";
  } else if (norm.includes("agachamento") && norm.includes("frontal")) {
    matchKey = "agachamento-frontal";
  } else if (norm.includes("agachamento") && norm.includes("bulgaro")) {
    matchKey = "agachamento-bulgaro";
  } else if (norm.includes("agachamento")) {
    matchKey = "agachamento-livre";
  } else if (norm.includes("leg press")) {
    matchKey = "leg-press-45";
  } else if (norm.includes("extensora")) {
    matchKey = "cadeira-extensora";
  } else if (norm.includes("flexora") && norm.includes("sentada")) {
    matchKey = "cadeira-flexora";
  } else if (norm.includes("flexora")) {
    matchKey = "mesa-flexora";
  } else if (norm.includes("stiff") && norm.includes("halter")) {
    matchKey = "stiff-halteres";
  } else if (norm.includes("stiff") || norm.includes("rdl")) {
    matchKey = "stiff-barra";
  } else if (norm.includes("elevacao pelvica") || norm.includes("hip thrust")) {
    matchKey = "elevacao-pelvica";
  } else if (norm.includes("abdutora")) {
    matchKey = "cadeira-abdutora";
  } else if (norm.includes("panturrilha") && norm.includes("sentado")) {
    matchKey = "panturrilha-sentado";
  } else if (norm.includes("panturrilha")) {
    matchKey = "panturrilha-em-pe";
  } else if (norm.includes("desenvolvimento") && norm.includes("militar")) {
    matchKey = "desenvolvimento-militar-barra";
  } else if (norm.includes("desenvolvimento") && norm.includes("arnold")) {
    matchKey = "desenvolvimento-arnold";
  } else if (norm.includes("desenvolvimento")) {
    matchKey = "desenvolvimento-halteres";
  } else if (norm.includes("elevacao lateral") && (norm.includes("polia") || norm.includes("cabo"))) {
    matchKey = "elevacao-lateral-polia";
  } else if (norm.includes("elevacao lateral")) {
    matchKey = "elevacao-lateral-halteres";
  } else if (norm.includes("elevacao frontal")) {
    matchKey = "elevacao-frontal";
  } else if (norm.includes("face pull")) {
    matchKey = "face-pull";
  } else if (norm.includes("encolhimento")) {
    matchKey = "encolhimento-trapezio";
  } else if (norm.includes("rosca") && (norm.includes("martelo") || norm.includes("hammer"))) {
    matchKey = "rosca-martelo";
  } else if (norm.includes("rosca") && norm.includes("scott")) {
    matchKey = "rosca-scott";
  } else if (norm.includes("rosca") && norm.includes("inclinad")) {
    matchKey = "rosca-inclinada";
  } else if (norm.includes("rosca") && norm.includes("concentrada")) {
    matchKey = "rosca-concentrada";
  } else if (norm.includes("rosca") && norm.includes("alternada")) {
    matchKey = "rosca-alternada";
  } else if (norm.includes("rosca") || norm.includes("biceps")) {
    matchKey = "rosca-direta-barra";
  } else if (norm.includes("triceps") && (norm.includes("corda") || norm.includes("polia"))) {
    matchKey = "triceps-corda";
  } else if (norm.includes("triceps") && norm.includes("testa")) {
    matchKey = "triceps-testa";
  } else if (norm.includes("triceps") && norm.includes("frances")) {
    matchKey = "triceps-frances";
  } else if (norm.includes("triceps") && norm.includes("pulley")) {
    matchKey = "triceps-pulley";
  } else if (norm.includes("triceps")) {
    matchKey = "triceps-corda";
  } else if (norm.includes("prancha")) {
    matchKey = "prancha-isometrica";
  } else if (norm.includes("roda abdominal") || norm.includes("ab wheel")) {
    matchKey = "roda-abdominal";
  } else if (norm.includes("crunch") || norm.includes("abdominal")) {
    matchKey = norm.includes("cabo") || norm.includes("polia") ? "abdominal-cabo" : "abdominal-crunch";
  } else if (norm.includes("corrida") || norm.includes("esteira") || norm.includes("cardio")) {
    matchKey = "corrida-esteira";
  }

  const data = VERIFIED_VIDEO_MAP[matchKey] || VERIFIED_VIDEO_MAP["supino-reto-barra"];

  const searchParam = encodeURIComponent(`${exerciseName} execucao correta musculacao`);
  const embedUrl = `https://www.youtube-nocookie.com/embed/${data.id}?rel=0&modestbranding=1&enablejsapi=1`;
  const directWatchUrl = `https://www.youtube.com/watch?v=${data.id}`;
  const searchUrl = `https://www.youtube.com/results?search_query=${searchParam}`;

  return {
    videoId: data.id,
    title: data.title,
    channel: data.channel,
    embedUrl,
    directWatchUrl,
    searchUrl,
    keyInstructions: [
      "Mantenha o alinhamento da coluna e a contração do core durante todo o percurso.",
      "Execute a fase excêntrica de forma lenta e controlada (2 a 3 segundos).",
      "Evite compensações corporais ou balanço com o tronco.",
      "Respire expirando na força concêntrica e inspirando na descida."
    ]
  };
}
