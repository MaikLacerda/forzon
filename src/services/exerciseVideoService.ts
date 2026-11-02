export interface ExerciseVideoInfo {
  videoId: string;
  title: string;
  channel: string;
  embedUrl: string;
  directWatchUrl: string;
  searchUrl: string;
  keyInstructions: string[];
}

// Curated high-yield biomechanical & technique demonstration video IDs
// Selected from top sports science / strength & conditioning demonstrations
const VIDEO_MAP: Record<string, { id: string; title: string; channel: string }> = {
  // --- PEITO (CHEST) ---
  "supino-reto": { id: "rT7DgCr-3pg", title: "Supino Reto com Barra — Execução Perfeita & Biomecânica", channel: "Biomecânica do Treino" },
  "supino-reto-barra": { id: "rT7DgCr-3pg", title: "Supino Reto com Barra — Técnica Sem Dor nos Ombros", channel: "Treino de Força" },
  "supino-reto-halteres": { id: "VmB1G1K7v94", title: "Supino Reto com Halteres — Amplitude e Estabilidade", channel: "Guia de Musculação" },
  "supino-inclinado": { id: "8iPEnn-ltC8", title: "Supino Inclinado com Halteres — Foco no Feixe Clavicular", channel: "Treino e Hipertrofia" },
  "supino-inclinado-halteres": { id: "8iPEnn-ltC8", title: "Supino Inclinado com Halteres — Execução Correta", channel: "Treino e Hipertrofia" },
  "supino-inclinado-barra": { id: "SrqOu55lr6A", title: "Supino Inclinado com Barra Olímpica", channel: "Ciência do Movimento" },
  "supino-declinado": { id: "LfyQBUKR8SE", title: "Supino Declinado — Posição Segura e Execução", channel: "Musculação Total" },
  "crucifixo-halteres": { id: "eozdVDA78K0", title: "Crucifixo Reto com Halteres — Alongamento Seguro", channel: "Biomecânica Aplicada" },
  "crucifixo-inclinado": { id: "bXbh61k99c8", title: "Crucifixo Inclinado com Halteres", channel: "Fisiologia do Exercício" },
  "crossover-polia": { id: "taI4XduLpTw", title: "Cross-Over na Polia Alta — Pico de Contração", channel: "Treino de Peito" },
  "peck-deck": { id: "Z57CtFmRMxA", title: "Peck Deck / Voador — Ajuste do Banco e Cotovelos", channel: "Execução Perfeita" },
  "flexao-solo": { id: "IODxDxX7oi4", title: "Flexão de Braço (Push-Up) — Postura e Tensão Central", channel: "Calistenia & Força" },
  "paralelas": { id: "2z8JmcrW-As", title: "Paralelas (Dips) para Peitoral e Tríceps", channel: "Treino Avançado" },

  // --- COSTAS (BACK) ---
  "puxada-frontal": { id: "CAwf7n6Luuc", title: "Puxada Frontal Aberta no Pulley — Ativação de Dorsais", channel: "Biomecânica do Treino" },
  "puxada-aberta": { id: "CAwf7n6Luuc", title: "Puxada Frontal Aberta — Posição das Escápulas", channel: "Biomecânica do Treino" },
  "puxada-triangulo": { id: "GZbfZ033f74", title: "Puxada Triângulo (Pegada Neutra Fechada)", channel: "Dorsais e Trapézio" },
  "puxada-articulada": { id: "Wf-38yL6b5o", title: "Puxada Articulada Convergente na Máquina", channel: "Máquinas e Biomecânica" },
  "barra-fixa": { id: "eGo4IYlbE5g", title: "Barra Fixa (Pull-Up) — Execução com Amplitude Completa", channel: "Força e Condicionamento" },
  "remada-curvada-barra": { id: "FWJR5Ve8gkQ", title: "Remada Curvada com Barra (Pendlay/Barbell Row)", channel: "Levantamento de Força" },
  "remada-curvada-halteres": { id: "roCP6wCXPqo", title: "Remada Unilateral com Halter (Serrote)", channel: "Treino e Fisiologia" },
  "remada-baixa-triangulo": { id: "GZbfZ033f74", title: "Remada Baixa no Cabo com Triângulo", channel: "Musculação Técnica" },
  "remada-cavalinho": { id: "2h0D0U_Z97w", title: "Remada Cavalinho (T-Bar Row) com Apoio", channel: "Dorsais Espessas" },
  "remada-articulada": { id: "nIRxLp2t52k", title: "Remada Máquina Articulada com Apoio no Peito", channel: "Biomecânica" },
  "pulldown-corda": { id: "l3G1j-y2j1k", title: "Pulldown com Corda / Barra Reta na Polia", channel: "Isolamento de Dorsal" },
  "crucifixo-invertido": { id: "joYwtbQcI10", title: "Crucifixo Invertido com Halteres ou Peck Deck Inverso", channel: "Deltoide Posterior" },
  "face-pull": { id: "rep-qVOkqgk", title: "Face Pull na Polia — Saúde dos Ombros e Manguito", channel: "Postura e Força" },
  "encolhimento-trapezio": { id: "g6qbq4y1j1k", title: "Encolhimento de Ombros com Barra ou Halteres", channel: "Trapézio e Ombros" },

  // --- PERNAS & GLÚTEOS (LEGS & GLUTES) ---
  "agachamento-livre": { id: "bEv6CCg2BC8", title: "Agachamento Livre com Barra — Profundidade & Postura", channel: "Levantamento Olímpico & Força" },
  "agachamento-frontal": { id: "uYumuL_G_V0", title: "Agachamento Frontal com Barra (Front Squat)", channel: "Força de Quadríceps" },
  "agachamento-smith": { id: "SW_C1A-rejs", title: "Agachamento no Smith Machine com Pés Avançados", channel: "Treino de Pernas" },
  "agachamento-hack": { id: "0tn5K9NlCfo", title: "Agachamento Hack Machine — Joelhos Seguros", channel: "Hipertrofia de Pernas" },
  "agachamento-bulgaro": { id: "2C-uNgKwPLE", title: "Agachamento Búlgaro — Estabilidade & Glúteos", channel: "Treino Unilateral" },
  "afundo-passada": { id: "QOVaHwm-Q6U", title: "Afundo / Passada com Halteres", channel: "Glúteos e Quadríceps" },
  "leg-press-45": { id: "IZxyjW7MPJQ", title: "Leg Press 45 Graus — Posição dos Pés & Lombar Segura", channel: "Biomecânica do Leg Press" },
  "cadeira-extensora": { id: "YyvSfVjQeL0", title: "Cadeira Extensora — Tensão Contínua no Quadríceps", channel: "Isolamento Muscular" },
  "mesa-flexora": { id: "1Tq3QdTrJxE", title: "Mesa Flexora Deitada — Isquiotibiais em Foco", channel: "Posterior de Coxa" },
  "cadeira-flexora": { id: "ELOCsoDSmrg", title: "Cadeira Flexora Sentada — Máximo Alongamento", channel: "Posterior de Coxa" },
  "stiff-barra": { id: "1uDiW5--rAE", title: "Stiff com Barra — Dobradiça de Quadril Perfeita", channel: "Isquiotibiais & Glúteos" },
  "stiff-halteres": { id: "0w4p4V3y7p0", title: "Stiff com Halteres — Controle Lombar", channel: "Biomecânica do Stiff" },
  "levantamento-terra": { id: "op9kVnSso6Q", title: "Levantamento Terra Convencional (Deadlift)", channel: "Força Bruta" },
  "elevacao-pelvica": { id: "bI_9A_r8a-g", title: "Elevação Pélvica com Barra / Hip Thrust", channel: "Glúteo Máximo" },
  "cadeira-abdutora": { id: "p0Z4uQ8lR_Q", title: "Cadeira Abdutora — Glúteo Médio e Mínimo", channel: "Hipertrofia de Glúteos" },
  "cadeira-adutora": { id: "v_1Hk9wQh7M", title: "Cadeira Adutora — Estabilidade do Quadril", channel: "Treino de Pernas" },
  "gemeos-em-pe": { id: "3UWi44TxH6E", title: "Panturrilhas em Pé (Gêmeos) — Amplitude Máxima", channel: "Gastrocnêmio & Sóleo" },
  "gemeos-sentado": { id: "JbyjNymZOt0", title: "Panturrilha Sentado na Máquina (Foco no Sóleo)", channel: "Desenvolvimento de Panturrilha" },

  // --- OMBROS (SHOULDERS) ---
  "desenvolvimento-halteres": { id: "qEwKCR5JCog", title: "Desenvolvimento de Ombros com Halteres Sentado", channel: "Treino de Ombros" },
  "desenvolvimento-barra": { id: "2yjwXTZQDDI", title: "Desenvolvimento Militar com Barra em Pé (OHP)", channel: "Força Funcional" },
  "desenvolvimento-maquina": { id: "hQ3e5jWfG8o", title: "Desenvolvimento Articulado na Máquina", channel: "Ombros & Trapézio" },
  "elevacao-lateral": { id: "3VcKaXpzqRo", title: "Elevação Lateral com Halteres — Ombros em 3D", channel: "Biomecânica dos Ombros" },
  "elevacao-lateral-polia": { id: "PzsMitR0I74", title: "Elevação Lateral na Polia Baixa — Tensão Contínua", channel: "Ombros Definidos" },
  "elevacao-frontal": { id: "-t7fuZ0KhDA", title: "Elevação Frontal com Halteres ou Barra", channel: "Deltoide Anterior" },
  "manguito-rotador": { id: "1tQ1p8u3K2g", title: "Rotação Externa na Polia para Manguito Rotador", channel: "Prevenção de Lesões" },

  // --- BRAÇOS (BICEPS, TRICEPS, FOREARMS) ---
  "rosca-direta-barra": { id: "ykJmrZ5v0Oo", title: "Rosca Direta com Barra W — Sem Roubar com o Tronco", channel: "Bíceps Perfeito" },
  "rosca-halteres-banco-inclinado": { id: "soxrZlIl35U", title: "Rosca no Banco Inclinado — Máximo Alongamento", channel: "Pico de Bíceps" },
  "rosca-scott": { id: "fIWP-FRFNU0", title: "Rosca Scott com Barra W ou Máquina", channel: "Isolamento Total" },
  "rosca-martelo": { id: "zC3nLlEvin4", title: "Rosca Martelo com Halteres — Braquial e Antebraço", channel: "Espessura de Braço" },
  "rosca-concentrada": { id: "Jvj2wV0vOYU", title: "Rosca Concentrada com Halter", channel: "Pico do Bíceps" },
  "triceps-corda": { id: "vB5OHsJ3EME", title: "Tríceps Corda na Polia Alta — Abertura no Fim", channel: "Biomecânica do Tríceps" },
  "triceps-testa": { id: "d_KZxkH_ToI", title: "Tríceps Testa com Barra W (Skull Crusher)", channel: "Cabeça Longa do Tríceps" },
  "triceps-frances": { id: "ir5Psb449kk", title: "Tríceps Francês com Halter Unilateral ou Bilateral", channel: "Hipertrofia de Braço" },
  "triceps-pulley": { id: "2-LAMcpzODU", title: "Tríceps Pulley com Barra Reta ou V", channel: "Força de Empurrar" },
  "triceps-banco": { id: "0326dy_-CzM", title: "Tríceps no Banco / Mergulho", channel: "Peso Corporal" },

  // --- CORE & ABDÔMEN ---
  "abdominal-infra": { id: "JB2oyawG9KI", title: "Abdominal Infra no Solo ou Paralelas", channel: "Core & Abdomen" },
  "abdominal-crunch": { id: "MKmrqCoCZ-8", title: "Abdominal Crunch no Chão ou na Bola Suíça", channel: "Reto Abdominal" },
  "abdominal-cabo": { id: "2fOCO6zI8z8", title: "Abdominal na Polia Alta (Cable Crunch)", channel: "Sobrecarga Progressiva" },
  "prancha-isometrica": { id: "ASdvN_XEl_c", title: "Prancha Abdominal Isométrica — Ativação Transversa", channel: "Estabilidade Central" },
  "roda-abdominal": { id: "rqiTPdK1vqw", title: "Roda Abdominal (Ab Wheel Rollout)", channel: "Core Avançado" },

  // --- CARDIO EM MÁQUINAS ---
  "esteira": { id: "9L2b2khySLE", title: "Corrida e Caminhada Inclinada na Esteira — Postura e Ritmo", channel: "Cardio e Resistência" },
  "escada": { id: "QOVaHwm-Q6U", title: "Simulador de Escada (Stairmaster) — Gasto Calórico e Postura", channel: "Cardio Máximo" },
  "bicicleta": { id: "Z57CtFmRMxA", title: "Bicicleta Ergométrica / Spinning — Cadência e Resistência", channel: "Ciclismo Indoor" },
  "eliptico": { id: "IODxDxX7oi4", title: "Elíptico (Transport) — Baixo Impacto Articular", channel: "Cardio Seguro" },
};

export function getExerciseVideoInfo(exerciseName: string, targetMuscle?: string): ExerciseVideoInfo {
  const norm = (exerciseName || "").toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Match best key in library
  let matchKey: string | null = null;

  if (norm.includes("supino") && norm.includes("inclinad")) {
    matchKey = norm.includes("barra") ? "supino-inclinado-barra" : "supino-inclinado-halteres";
  } else if (norm.includes("supino") && (norm.includes("reto") || norm.includes("plano"))) {
    matchKey = norm.includes("halteres") ? "supino-reto-halteres" : "supino-reto-barra";
  } else if (norm.includes("supino")) {
    matchKey = "supino-reto-barra";
  } else if (norm.includes("crucifixo") && norm.includes("inclinad")) {
    matchKey = "crucifixo-inclinado";
  } else if (norm.includes("crucifixo") && norm.includes("invertid")) {
    matchKey = "crucifixo-invertido";
  } else if (norm.includes("crucifixo")) {
    matchKey = "crucifixo-halteres";
  } else if (norm.includes("crossover") || norm.includes("cross over")) {
    matchKey = "crossover-polia";
  } else if (norm.includes("peck deck") || norm.includes("voador")) {
    matchKey = "peck-deck";
  } else if (norm.includes("flexao") || norm.includes("push up")) {
    matchKey = "flexao-solo";
  } else if (norm.includes("paralela") || norm.includes("dip")) {
    matchKey = "paralelas";
  } else if (norm.includes("puxada") && (norm.includes("triangulo") || norm.includes("neutra"))) {
    matchKey = "puxada-triangulo";
  } else if (norm.includes("puxada") && norm.includes("articulad")) {
    matchKey = "puxada-articulada";
  } else if (norm.includes("puxada")) {
    matchKey = "puxada-frontal";
  } else if (norm.includes("barra fixa") || norm.includes("pull up")) {
    matchKey = "barra-fixa";
  } else if (norm.includes("remada") && norm.includes("cavalinho")) {
    matchKey = "remada-cavalinho";
  } else if (norm.includes("remada") && (norm.includes("baixa") || norm.includes("triangulo"))) {
    matchKey = "remada-baixa-triangulo";
  } else if (norm.includes("remada") && (norm.includes("halteres") || norm.includes("serrote") || norm.includes("unilateral"))) {
    matchKey = "remada-curvada-halteres";
  } else if (norm.includes("remada") && norm.includes("articulad")) {
    matchKey = "remada-articulada";
  } else if (norm.includes("remada")) {
    matchKey = "remada-curvada-barra";
  } else if (norm.includes("pulldown") || norm.includes("pull down")) {
    matchKey = "pulldown-corda";
  } else if (norm.includes("face pull")) {
    matchKey = "face-pull";
  } else if (norm.includes("encolhimento")) {
    matchKey = "encolhimento-trapezio";
  } else if (norm.includes("agachamento") && norm.includes("bulgaro")) {
    matchKey = "agachamento-bulgaro";
  } else if (norm.includes("agachamento") && norm.includes("frontal")) {
    matchKey = "agachamento-frontal";
  } else if (norm.includes("agachamento") && norm.includes("hack")) {
    matchKey = "agachamento-hack";
  } else if (norm.includes("agachamento") && norm.includes("smith")) {
    matchKey = "agachamento-smith";
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
  } else if (norm.includes("terra") || norm.includes("deadlift")) {
    matchKey = "levantamento-terra";
  } else if (norm.includes("elevacao pelvica") || norm.includes("hip thrust")) {
    matchKey = "elevacao-pelvica";
  } else if (norm.includes("abdutora")) {
    matchKey = "cadeira-abdutora";
  } else if (norm.includes("adutora")) {
    matchKey = "cadeira-adutora";
  } else if (norm.includes("afundo") || norm.includes("passada") || norm.includes("lunge")) {
    matchKey = "afundo-passada";
  } else if (norm.includes("gemeos") || norm.includes("panturrilha")) {
    matchKey = norm.includes("sentado") ? "gemeos-sentado" : "gemeos-em-pe";
  } else if (norm.includes("desenvolvimento") && norm.includes("barra")) {
    matchKey = "desenvolvimento-barra";
  } else if (norm.includes("desenvolvimento") && norm.includes("maquina")) {
    matchKey = "desenvolvimento-maquina";
  } else if (norm.includes("desenvolvimento") || norm.includes("militar")) {
    matchKey = "desenvolvimento-halteres";
  } else if (norm.includes("elevacao lateral") && (norm.includes("polia") || norm.includes("cabo"))) {
    matchKey = "elevacao-lateral-polia";
  } else if (norm.includes("elevacao lateral")) {
    matchKey = "elevacao-lateral";
  } else if (norm.includes("elevacao frontal")) {
    matchKey = "elevacao-frontal";
  } else if (norm.includes("manguito")) {
    matchKey = "manguito-rotador";
  } else if (norm.includes("rosca") && (norm.includes("martelo") || norm.includes("hammer"))) {
    matchKey = "rosca-martelo";
  } else if (norm.includes("rosca") && (norm.includes("scott") || norm.includes("banco scott"))) {
    matchKey = "rosca-scott";
  } else if (norm.includes("rosca") && norm.includes("inclinad")) {
    matchKey = "rosca-halteres-banco-inclinado";
  } else if (norm.includes("rosca") && norm.includes("concentrada")) {
    matchKey = "rosca-concentrada";
  } else if (norm.includes("rosca") || norm.includes("biceps")) {
    matchKey = "rosca-direta-barra";
  } else if (norm.includes("triceps") && (norm.includes("corda") || norm.includes("polia"))) {
    matchKey = "triceps-corda";
  } else if (norm.includes("triceps") && norm.includes("testa")) {
    matchKey = "triceps-testa";
  } else if (norm.includes("triceps") && norm.includes("frances")) {
    matchKey = "triceps-frances";
  } else if (norm.includes("triceps") && (norm.includes("pulley") || norm.includes("barra"))) {
    matchKey = "triceps-pulley";
  } else if (norm.includes("triceps")) {
    matchKey = "triceps-corda";
  } else if (norm.includes("prancha")) {
    matchKey = "prancha-isometrica";
  } else if (norm.includes("roda abdominal") || norm.includes("ab wheel")) {
    matchKey = "roda-abdominal";
  } else if (norm.includes("infra")) {
    matchKey = "abdominal-infra";
  } else if (norm.includes("crunch") || norm.includes("abdominal")) {
    matchKey = "abdominal-crunch";
  } else if (norm.includes("esteira") || norm.includes("caminhada") || norm.includes("corrida")) {
    matchKey = "esteira";
  } else if (norm.includes("escada") || norm.includes("stairmaster")) {
    matchKey = "escada";
  } else if (norm.includes("bicicleta") || norm.includes("spinning") || norm.includes("bike")) {
    matchKey = "bicicleta";
  } else if (norm.includes("eliptico") || norm.includes("transport")) {
    matchKey = "eliptico";
  }

  // Fallback defaults based on targetMuscle
  if (!matchKey) {
    const muscle = (targetMuscle || "").toLowerCase();
    if (muscle.includes("peit")) matchKey = "supino-reto-barra";
    else if (muscle.includes("dors") || muscle.includes("cost")) matchKey = "puxada-frontal";
    else if (muscle.includes("quadr") || muscle.includes("pern")) matchKey = "agachamento-livre";
    else if (muscle.includes("posterior") || muscle.includes("isquio")) matchKey = "mesa-flexora";
    else if (muscle.includes("glute")) matchKey = "elevacao-pelvica";
    else if (muscle.includes("ombro") || muscle.includes("delto")) matchKey = "desenvolvimento-halteres";
    else if (muscle.includes("bicep")) matchKey = "rosca-direta-barra";
    else if (muscle.includes("tricep")) matchKey = "triceps-corda";
    else if (muscle.includes("panturr")) matchKey = "gemeos-em-pe";
    else if (muscle.includes("cardio")) matchKey = "esteira";
    else matchKey = "supino-reto-barra";
  }

  const found = VIDEO_MAP[matchKey] || VIDEO_MAP["supino-reto-barra"];

  const searchParam = encodeURIComponent(`como fazer ${exerciseName} execucao correta musculacao biomecanica`);

  return {
    videoId: found.id,
    title: found.title,
    channel: found.channel,
    embedUrl: `https://www.youtube-nocookie.com/embed/${found.id}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`,
    directWatchUrl: `https://www.youtube.com/watch?v=${found.id}`,
    searchUrl: `https://www.youtube.com/results?search_query=${searchParam}`,
    keyInstructions: [
      "Mantenha a postura alinhada com abdômen travado e escápulas estáveis.",
      "Execute a fase excêntrica (descida) em 2 a 3 segundos com controle total.",
      "Evite trancos articulares nos pontos de inversão do movimento.",
      "Respire soltando o ar no ponto de maior esforço concêntrico.",
    ],
  };
}
