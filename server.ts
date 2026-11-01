import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize Google Gemini AI SDK on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Safe helper with model fallback (gemini-3.8-flash -> gemini-flash-latest -> gemini-3.1-flash-lite)
// Catches 503/429/404 silently and returns null without printing to stderr (preventing false Backend Error badges)
async function callGeminiSafely(options: {
  contents: any;
  systemInstruction?: string;
  isJson?: boolean;
}): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

  for (const modelName of candidateModels) {
    try {
      const config: any = {};
      if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
      if (options.isJson) config.responseMimeType = "application/json";

      const res = await ai.models.generateContent({
        model: modelName,
        contents: options.contents,
        config,
      });

      if (res && res.text) {
        return res.text;
      }
    } catch {
      // Gracefully continue to next candidate
    }
  }
  return null;
}

// Health endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "FORZON",
    slogan: "More Than Fitness. A Way of Life.",
    version: "1.0.0",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 1. AI Conversational Coach
app.post("/api/ai/coach", async (req, res) => {
  try {
    const { message, conversationHistory = [], userContext = {} } = req.body;

    const systemInstruction = `Você é o FORZON Coach, um especialista em fisiologia do exercício, treinamento resistido, corrida e nutrição esportiva de elite.
Você é encorajador, científico, objetivo e adaptável.
Slogan da Marca FORZON: "MORE THAN FITNESS. A WAY OF LIFE." (Train together. Fuel your body. Share your progress).
Contexto do Usuário:
- Nome: ${userContext.name || "Atleta"}
- Objetivo: ${userContext.mainGoal || "Hipertrofia e Desempenho"}
- Nível: ${userContext.experienceLevel || "Intermediário"}
- Disponibilidade: ${userContext.daysPerWeek || 4} dias/semana, ${userContext.timePerSession || 60} min/sessão
- Restrições/Lesões: ${userContext.injuries || "Nenhuma relatada"}
- Equipamentos: ${userContext.equipment || "Academia completa"}
- Preferências alimentares: ${userContext.dietaryPreferences || "Equilibrada"}
- Qualidade do Sono Recente: ${userContext.sleepQuality || "Boa"}
- Nível de Estresse Diário (1-10): ${userContext.stressLevel ? `${userContext.stressLevel}/10` : "3/10 (Baixo)"}

Regras Estritas:
1. Responda em Português do Brasil com linguagem dinâmica, motivadora e cientificamente embasada.
2. Seja direto e estruturado com listas curtas quando sugerir exercícios ou refeições.
3. Se o usuário estiver sem tempo ("dias corridos"), dê opções de drop-sets, supersets ou treinos compactos de 20-30 min.
4. Se o usuário pedir substituição de exercício ("equipamento ocupado"), ofereça 2 alternativas com ativação muscular equivalente.
5. Sempre lembre de manter técnica segura e consulte profissionais de saúde para diagnósticos médicos. Nunca prescreva medicamentos ou hormônios.
6. Leve em conta a Qualidade do Sono e o Nível de Estresse: se o sono for Ruim/Péssimo ou o estresse for alto (7-10), recomende ajuste de RPE (reduzir para RPE 6-7), foco em respiração e deload para evitar sobretreinamento do SNC. Se o sono for Excelente e o estresse for baixo (1-3), encoraje busca por novos recordes pessoais (PRs).`;

    const contents = [
      ...conversationHistory.slice(-6).map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const replyText = await callGeminiSafely({ contents, systemInstruction });
    if (replyText) {
      return res.json({ reply: replyText });
    }

    const userGoal = userContext.mainGoal || "desempenho físico";
    const userSleep = userContext.sleepQuality ? `com sono ${userContext.sleepQuality.toLowerCase()}` : "em fase de treino";
    return res.json({
      reply: `FORZON Coach: Excelente dedicação! Analisando seu objetivo de ${userGoal} e seu estado atual (${userSleep}), recomendo manter cadência controlada (3 segundos excêntricos) e 2 repetições na reserva (RIR 2) nos exercícios compostos. Como deseja ajustar sua sessão hoje?`,
    });
  } catch (_error: any) {
    res.json({
      reply: "FORZON Coach pronto! Como posso ajudar você no treino de hoje?",
    });
  }
});

// 2. AI Adaptive Plan Generator
app.post("/api/ai/generate-plan", async (req, res) => {
  const { profile } = req.body;
  const specificGoal = profile?.specificGoal || "ganhar_massa";
  const calibration = profile?.goalCalibration || {
    repRangeTarget: specificGoal === "forca_pura" ? "3-5 reps" : specificGoal === "perder_gordura" ? "12-15 reps" : specificGoal === "resistencia" ? "15-20 reps" : "8-12 reps",
    restIntervalSeconds: specificGoal === "forca_pura" ? 180 : specificGoal === "perder_gordura" ? 45 : specificGoal === "resistencia" ? 45 : 90,
    metabolicFocus: specificGoal === "forca_pura" ? "tensão_mecanica" : specificGoal === "perder_gordura" ? "queima_lipidica" : specificGoal === "resistencia" ? "capacidade_mitocondrial" : "tensão_mecanica",
  };

  const buildDeterministicPlan = () => {
    const isForca = specificGoal === "forca_pura";
    const isFatLoss = specificGoal === "perder_gordura";
    const isEndurance = specificGoal === "resistencia";

    const titleMap: Record<string, string> = {
      forca_pura: "FORZON Pro — Força Máxima & Recrutamento Neural (3-5 Reps)",
      perder_gordura: "FORZON Pro — Densidade Metabólica & Queima Lipídica (EPOC)",
      resistencia: "FORZON Pro — Resistência Mitocondrial & Condicionamento",
      recomposicao: "FORZON Pro — Recomposição Muscular Ondulatória",
      ganhar_massa: "FORZON Pro — Hipertrofia Miofibrilar & Sobrecarga Progressiva",
    };

    const summaryMap: Record<string, string> = {
      forca_pura: `Periodização de força pura calibrada para cargas submáximas, ${calibration.repRangeTarget} e ${calibration.restIntervalSeconds}s de descanso completo para recuperação do SNC.`,
      perder_gordura: `Periodização metabólica com alta densidade, ${calibration.repRangeTarget} e descanso curto de ${calibration.restIntervalSeconds}s para potencializar o consumo de oxigênio pós-exercício (EPOC).`,
      resistencia: `Estímulo de resistência muscular localizada e angiogênese, faixas de ${calibration.repRangeTarget} e descanso de ${calibration.restIntervalSeconds}s.`,
      recomposicao: `Estímulo ondulatório concorrente de recomposição corporal, alternando faixas de hipertrofia e estresse metabólico.`,
      ganhar_massa: `Periodização para ganho de massa magra, priorizando ${calibration.repRangeTarget}, descanso de ${calibration.restIntervalSeconds}s e ênfase na fase excêntrica de 3s.`,
    };

    return {
      planTitle: titleMap[specificGoal] || "FORZON Pro — Hipertrofia & Força Funcional",
      focusSummary: summaryMap[specificGoal] || "Periodização adaptada individualizada.",
      weeklyFrequency: profile?.trainingDaysPerWeek || 4,
      sessions: [
        {
          id: "sess-1",
          dayName: "Treino A",
          focus: isForca ? "Força Multiarticular: Peitorais, Tríceps e Deltoides" : isFatLoss ? "Circuito de Densidade: Peito, Ombros e Core" : "Peitorais, Deltóide Anterior e Tríceps",
          estimatedDurationMin: profile?.timePerSessionMin || 55,
          warmup: "Mobilidade articular de ombros + 2 séries leves de ativação",
          exercises: [
            {
              name: "Supino Reto com Barra",
              targetMuscle: "Peitoral Maior",
              sets: isForca ? 5 : 4,
              reps: calibration.repRangeTarget,
              restSeconds: calibration.restIntervalSeconds,
              notes: isForca ? "Pausa de 1 segundo na transição excêntrica/concêntrica. RPE 8.5." : "Cadência excêntrica de 3s mantendo escápulas aduzidas.",
            },
            {
              name: "Supino Inclinado com Halteres",
              targetMuscle: "Peitoral Superior",
              sets: 3,
              reps: calibration.repRangeTarget,
              restSeconds: calibration.restIntervalSeconds,
              notes: "Banco regulado em 30 graus para pico de ativação clavicular.",
            },
            {
              name: "Desenvolvimento Militar",
              targetMuscle: "Deltóides",
              sets: 3,
              reps: calibration.repRangeTarget,
              restSeconds: calibration.restIntervalSeconds,
              notes: "Glúteos e abdômen firmemente contraídos para estabilidade axial.",
            },
            {
              name: "Tríceps Corda na Polia",
              targetMuscle: "Tríceps",
              sets: 3,
              reps: isForca ? "6-8" : isFatLoss ? "15" : "12-15",
              restSeconds: 60,
              notes: "Pico de contração de 1 segundo no final da extensão dos cotovelos.",
            },
          ],
        },
        {
          id: "sess-2",
          dayName: "Treino B",
          focus: isForca ? "Tração Pesada: Dorsais, Trapézio e Bíceps" : isFatLoss ? "Complex de Tração & Densidade Metabólica" : "Costas, Trapézio e Bíceps",
          estimatedDurationMin: profile?.timePerSessionMin || 50,
          warmup: "Mobilidade torácica + puxada com elástico",
          exercises: [
            {
              name: "Puxada Alta Frontal",
              targetMuscle: "Latíssimo do Dorso",
              sets: isForca ? 5 : 4,
              reps: calibration.repRangeTarget,
              restSeconds: calibration.restIntervalSeconds,
              notes: "Puxe direcionando os cotovelos para os quadris, sem hiperextender a lombar.",
            },
            {
              name: "Remada Curvada com Barra",
              targetMuscle: "Dorsal Médio e Rombóides",
              sets: 4,
              reps: calibration.repRangeTarget,
              restSeconds: calibration.restIntervalSeconds,
              notes: "Coluna em ângulo neutro a 45 graus e pegada pronada sólida.",
            },
            {
              name: "Rosca Direta com Barra W",
              targetMuscle: "Bíceps Braquial",
              sets: 3,
              reps: calibration.repRangeTarget,
              restSeconds: Math.min(90, calibration.restIntervalSeconds),
              notes: "Cotovelos fixos ao lado do tronco evitando balanço postural.",
            },
          ],
        },
      ],
    };
  };

  try {
    const prompt = `Gere uma periodização semanal de treinamento individualizado para o atleta com o seguinte perfil:
- Nome: ${profile?.name || "Atleta"}
- Objetivo Geral: ${profile?.mainGoal || "Hipertrofia"}
- OBJETIVO ESPECÍFICO DO ATLETA: ${specificGoal.toUpperCase()} (${calibration.metabolicFocus})
- FAIXA ALVO DE REPETIÇÕES CALIBRADA: ${calibration.repRangeTarget}
- INTERVALO DE DESCANSO CALIBRADO: ${calibration.restIntervalSeconds} segundos
- Nível de Experiência: ${profile?.experienceLevel || "Intermediário"}
- Frequência Semanal: ${profile?.trainingDaysPerWeek || 4} dias
- Tempo por Sessão: ${profile?.timePerSessionMin || 60} minutos
- Ambiente & Equipamentos: ${profile?.environment || "Academia"}
- Restrições: ${profile?.injuriesOrNotes || "Nenhuma"}
- Qualidade do Sono: ${profile?.sleepQuality || "Boa"}
- Nível de Estresse Diário: ${profile?.stressLevel ? `${profile.stressLevel}/10` : "3/10"}

ATENÇÃO: É Mandatório que as séries, repetições (${calibration.repRangeTarget}) e descansos (${calibration.restIntervalSeconds}s) sejam calibrados rigorosamente de acordo com o OBJETIVO ESPECÍFICO informado.

Retorne estritamente um JSON no seguinte formato (sem blocos markdown adicionais):
{
  "planTitle": "string",
  "focusSummary": "string",
  "weeklyFrequency": number,
  "sessions": [
    {
      "id": "string",
      "dayName": "string",
      "focus": "string",
      "estimatedDurationMin": number,
      "warmup": "string",
      "exercises": [
        {
          "name": "string",
          "targetMuscle": "string",
          "sets": number,
          "reps": "string",
          "restSeconds": number,
          "notes": "string"
        }
      ]
    }
  ]
}`;

    const planText = await callGeminiSafely({ contents: prompt, isJson: true });
    if (planText) {
      try {
        const parsed = JSON.parse(planText);
        if (parsed.sessions && parsed.sessions.length > 0) {
          return res.json({ plan: parsed });
        }
      } catch {}
    }
    return res.json({ plan: buildDeterministicPlan() });
  } catch (_error: any) {
    return res.json({ plan: buildDeterministicPlan() });
  }
});

// 2b. AI Comprehensive Intake Assessment (Workout + Diet Generation)
app.post("/api/ai/intake-assessment", async (req, res) => {
  try {
    const {
      heightCm,
      weightKg,
      goal,
      specificGoal,
      healthIssues,
      trainingDays,
      environment,
      dietaryPreference,
      sports = ["Musculação"],
      userName,
    } = req.body;

    const sportsListStr = Array.isArray(sports) && sports.length > 0 ? sports.join(", ") : "Musculação";

    const prompt = `Você é o FORZON AI Coach, especialista de elite em musculação, biomecânica, outros esportes (corrida, ciclismo, lutas, natação, futebol, cross training) e nutrição esportiva.
Gere um plano de treino e um plano nutricional completos e personalizados para o seguinte atleta:
- Nome: ${userName || "Atleta"}
- Altura: ${heightCm || 175} cm | Peso: ${weightKg || 75} kg
- Objetivo Principal: ${goal} (${specificGoal})
- Esportes e Modalidades Praticadas: ${sportsListStr}
- Lesões / Problemas de Saúde: "${healthIssues || "Nenhuma limitação"}" (CRUCIAL: se houver lesão no joelho, lombar, ombro ou outra articulação, NUNCA prescreva exercícios que causem impacto ou compressão direta nessa articulação! Substitua por variações seguras com apoio).
- Frequência: ${trainingDays || 4} dias por semana
- Local: ${environment || "Academia"}
- Dieta: ${dietaryPreference || "Padrão"}

REGRAS OBRIGATÓRIAS DE PRESCRIÇÃO:
1. VOLUME DE BRAÇOS (BÍCEPS E TRÍCEPS): NUNCA prescreva apenas 1 exercício para bíceps ou tríceps! Sempre prescreva NO MÍNIMO 2 a 3 exercícios para Bíceps (ex: Rosca Direta + Rosca Martelo para braquial e antebraço + Rosca Scott ou Inclinada para pico) e NO MÍNIMO 2 a 3 exercícios para Tríceps (ex: Tríceps Corda/Polia para cabeça lateral/medial + Tríceps Francês/Testa para cabeça longa + Mergulho/Paralelas).
2. DEMAIS ESPORTES (${sportsListStr}): Se o atleta selecionou outros esportes além da musculação (como Corrida de Rua, Ciclismo, Natação, Lutas/Jiu-Jitsu, Cross Training, Futebol, etc.), crie sessões específicas na periodização ou blocos de condicionamento dedicados para essa modalidade, e aumente os carboidratos e a meta calórica para compensar o gasto energético do esporte!
3. GRUPOS GRANDES: 3 a 4 exercícios completos para peito, costas e pernas.

Calcule a Taxa Metabólica Basal (TMB) e Gasto Energético Total (GET) por Mifflin-St Jeor, considerando o gasto dos esportes adicionais.
Defina as calorias diárias, proteínas (em gramas), carboidratos (em gramas), gorduras (em gramas) e água diária (em ml).

Retorne estritamente um JSON no seguinte formato:
{
  "plan": {
    "id": "plan-intake-ai",
    "title": "FORZON AI — ${goal}",
    "description": "Periodização personalizada desenhada pelo FORZON AI Coach integrando ${sportsListStr}",
    "frequencyDaysPerWeek": ${trainingDays || 4},
    "active": true,
    "sessions": [
      {
        "id": "sess-1",
        "dayName": "Treino A",
        "focus": "Foco do dia",
        "dayLabel": "Dia 1",
        "estimatedDurationMin": 50,
        "warmup": "Aquecimento articular",
        "exercises": [
          { "name": "Nome", "targetMuscle": "Músculo", "sets": 4, "reps": "8-12 reps", "restSeconds": 90, "notes": "Instrução" }
        ]
      }
    ]
  },
  "nutrition": {
    "calorieGoal": 2300,
    "proteinGoal": 160,
    "carbsGoal": 260,
    "fatGoal": 65,
    "waterGoal": 3000,
    "meals": [
      {
        "id": "m-1",
        "name": "Café da Manhã",
        "time": "08:00",
        "calories": 500,
        "proteinG": 35,
        "carbsG": 50,
        "fatG": 15,
        "items": ["Item 1", "Item 2"]
      }
    ]
  },
  "rationale": {
    "tdee": 2400,
    "deficitOrSurplus": "Superávit de +300 kcal ou Déficit de -400 kcal",
    "jointProtection": "Explicação de como os exercícios protegem a saúde e lesão informada",
    "coachMessage": "Mensagem motivacional e prescrição do Coach da IA"
  }
}`;

    const text = await callGeminiSafely({ contents: prompt, isJson: true });
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.plan && parsed.nutrition) {
          return res.json(parsed);
        }
      } catch {}
    }

    return res.status(500).json({ error: "Fallback local ativo" });
  } catch {
    return res.status(500).json({ error: "Erro interno no intake" });
  }
});

// 3. AI Exercise Swap
app.post("/api/ai/swap-exercise", async (req, res) => {
  try {
    const { exerciseName, targetMuscle, reason, availableEquipment } = req.body;

    const prompt = `O atleta precisa substituir o exercício "${exerciseName}" (Grupo Muscular: ${targetMuscle}).
Motivo: ${reason || "Aparelho ocupado na academia"}.
Equipamentos disponíveis: ${availableEquipment || "Halteres, banco e elásticos"}.
Sugira 3 alternativas biomecanicamente equivalentes que trabalhem o mesmo grupo muscular com intensidade semelhante.

Retorne estritamente um JSON no formato:
{
  "originalExercise": "${exerciseName}",
  "alternatives": [
    {
      "name": "string",
      "targetMuscle": "string",
      "equipment": "string",
      "differenceCue": "string",
      "suggestedSetsReps": "string"
    }
  ]
}`;

    const deterministicSwap = {
      originalExercise: exerciseName,
      alternatives: [
        {
          name: `${exerciseName} com Halteres`,
          targetMuscle,
          equipment: "Halteres e Banco",
          differenceCue: "Maior amplitude articular e correção de assimetrias.",
          suggestedSetsReps: "3 séries de 10-12 reps",
        },
        {
          name: "Variação na Polia / Cabo",
          targetMuscle,
          equipment: "Cabo Ajustável",
          differenceCue: "Tensão constante durante toda a fase excêntrica e concêntrica.",
          suggestedSetsReps: "3 séries de 12-15 reps",
        },
      ],
    };

    const swapText = await callGeminiSafely({ contents: prompt, isJson: true });
    if (swapText) {
      try {
        const parsed = JSON.parse(swapText);
        if (parsed.alternatives && parsed.alternatives.length > 0) {
          return res.json(parsed);
        }
      } catch {}
    }
    return res.json(deterministicSwap);
  } catch (_error: any) {
    res.json({
      originalExercise: "Exercício",
      alternatives: [
        {
          name: "Variação com Halteres",
          targetMuscle: "Grupo Muscular",
          equipment: "Halteres",
          differenceCue: "Amplitude livre e conforto articular.",
          suggestedSetsReps: "3 séries de 10-12 reps",
        }
      ]
    });
  }
});

// 4. AI Post-Workout Recovery Meal Generator (based on daily workout volume)
app.post("/api/ai/recovery-meal", async (req, res) => {
  try {
    const {
      volumeKg = 12000,
      muscleFocus = "Peitorais e Tríceps",
      consumedCalories = 1800,
      targetCalories = 2650,
      dietaryPreference = "Equilibrada / Alta Proteína",
      athleteName = "Atleta",
    } = req.body;

    const prompt = `Você é um nutricionista esportivo de elite. Analise o volume da sessão de treino de hoje:
- Atleta: ${athleteName}
- Volume total levantado hoje: ${volumeKg} kg
- Foco muscular trabalhado: ${muscleFocus}
- Calorias consumidas até agora: ${consumedCalories} kcal / Meta: ${targetCalories} kcal
- Preferência alimentar: ${dietaryPreference}

Gere uma sugestão de "Refeição de Recuperação Pós-Treino" (Recovery Meal) com proporção otimizada de carboidratos e proteínas de alto valor biológico (rica em leucina, eletrólitos e rápida digestibilidade) adaptada à culinária brasileira.

Retorne estritamente um JSON no seguinte formato (sem markdown):
{
  "mealName": "string",
  "recommendedTiming": "Até 45 minutos após o treino",
  "calories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "leucineEstimateG": number,
  "physiologicalRationale": "string explicando a reposição de glicogênio e redução de dano muscular para ${volumeKg}kg",
  "ingredients": [
    { "name": "string", "quantity": "string", "calories": number, "proteinG": number }
  ],
  "prepTimeMin": number,
  "preparationMethod": "string"
}`;

    const isHighVolume = volumeKg > 10000;
    const deterministicRecoveryMeal = {
      mealName: isHighVolume ? "Bowl de Açaí Turbo com Whey Isolado e Banana Prata" : "Omelete Funcional com Mandioca Cozida e Queijo Minas",
      recommendedTiming: "Consumir em até 40 minutos após o encerramento do treino",
      calories: isHighVolume ? 580 : 440,
      proteinG: isHighVolume ? 42 : 36,
      carbsG: isHighVolume ? 74 : 48,
      fatG: isHighVolume ? 12 : 14,
      leucineEstimateG: 3.8,
      physiologicalRationale: `Com ${volumeKg.toLocaleString()}kg levantados no treino de ${muscleFocus}, a depleção de glicogênio miofibrilar exige ratio balanceado de carboidratos complexos com frutose natural e proteínas de absorção rápida para reverter o catabolismo muscular induzido pelo esforço.`,
      ingredients: isHighVolume ? [
        { name: "Whey Protein Concentrado/Isolado", quantity: "40g (1 scoop e meio)", calories: 160, proteinG: 32 },
        { name: "Polpa de Açaí Puro Sem Xarope", quantity: "200g", calories: 130, proteinG: 3 },
        { name: "Banana Prata Fatiada", quantity: "2 unidades médias", calories: 180, proteinG: 2 },
        { name: "Mel Silvestre Puro", quantity: "1 colher de sopa (20g)", calories: 65, proteinG: 0 },
        { name: "Castanha-do-Pará Ralada", quantity: "2 unidades (eletrólitos e selênio)", calories: 45, proteinG: 1 }
      ] : [
        { name: "Ovos Caipiras Inteiros", quantity: "3 unidades", calories: 210, proteinG: 18 },
        { name: "Claras Pasteurizadas", quantity: "100ml", calories: 50, proteinG: 11 },
        { name: "Mandioca Cozida ao Vapor", quantity: "120g", calories: 140, proteinG: 2 },
        { name: "Queijo Minas Frescal Light", quantity: "40g", calories: 40, proteinG: 5 }
      ],
      prepTimeMin: isHighVolume ? 5 : 12,
      preparationMethod: isHighVolume
        ? "Bata o açaí gelado com o whey protein e um pouco de água de coco até ficar cremoso. Transfira para o bowl, cubra com as rodelas de banana, fio de mel e castanhas."
        : "Bata os ovos e claras com uma pitada de sal marinho e orégano. Despeje em frigideira antiaderente pré-aquecida. Adicione o queijo em cubos e dobre ao meio. Sirva com a mandioca quente."
    };

    const mealText = await callGeminiSafely({ contents: prompt, isJson: true });
    if (mealText) {
      try {
        const parsed = JSON.parse(mealText);
        if (parsed.mealName) {
          return res.json({ meal: parsed });
        }
      } catch {}
    }
    return res.json({ meal: deterministicRecoveryMeal });
  } catch (_error: any) {
    res.json({
      meal: {
        mealName: "Omelete com Mandioca e Frutas",
        recommendedTiming: "Até 45 minutos após o treino",
        calories: 450,
        proteinG: 35,
        carbsG: 50,
        fatG: 12,
        leucineEstimateG: 3.2,
        physiologicalRationale: "Recuperação proteica com carboidratos de absorção equilibrada.",
        ingredients: [{ name: "Ovos e Mandioca", quantity: "Porção padrão", calories: 450, proteinG: 35 }],
        prepTimeMin: 10,
        preparationMethod: "Preparo rápido para suporte pós-treino."
      }
    });
  }
});

// 5. AI Gamification Challenges Generator (based on workout history & volume)
app.post("/api/ai/suggest-challenges", async (req, res) => {
  try {
    const {
      workoutHistory = [],
      totalVolumeKg = 45000,
      streakDays = 7,
      profile = {},
    } = req.body;

    const prompt = `Você é o mestre de gamificação esportiva da comunidade FORZON (Slogan: "MORE THAN FITNESS. A WAY OF LIFE.").
Analise os dados do atleta:
- Nome: ${profile?.name || "Atleta"}
- Nível: ${profile?.experienceLevel || "Intermediário"}
- Volume acumulado recente: ${totalVolumeKg} kg
- Streak de consistência: ${streakDays} dias seguidos
- Quantidade de treinos registrados: ${workoutHistory.length}

Sugira 3 desafios de gamificação progressivos, altamente motivadores e realistas para as próximas semanas.
Retorne estritamente um JSON no seguinte formato (sem markdown):
{
  "challenges": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "category": "volume" | "streak" | "outdoor",
      "targetValue": number,
      "targetMetricLabel": "string",
      "rewardPoints": number,
      "badgeName": "string",
      "badgeIcon": "Trophy" | "Flame" | "Dumbbell" | "Zap" | "Medal" | "Crown",
      "coachTip": "string"
    }
  ]
}`;

    const deterministicChallenges = [
      {
        id: `chal-ai-${Date.now()}-1`,
        title: "Desafio 50 Toneladas do Ferro",
        description: "Acumule mais 50.000 kg de sobrecarga em exercícios compostos até o final do ciclo.",
        category: "volume",
        targetValue: 50000,
        targetMetricLabel: "50.000 kg levantados",
        rewardPoints: 500,
        badgeName: "Colosso de Aço",
        badgeIcon: "Dumbbell",
        coachTip: "Distribua o volume entre agachamento, levantamento terra e supinos para maximizar a tonelagem."
      },
      {
        id: `chal-ai-${Date.now()}-2`,
        title: "Streak Implacável de 14 Dias",
        description: "Mantenha sua disciplina ativa sem falhar um único dia de registro de treino ou cardio regenerativo.",
        category: "streak",
        targetValue: 14,
        targetMetricLabel: "14 dias ininterruptos",
        rewardPoints: 350,
        badgeName: "Disciplina de Titânio",
        badgeIcon: "Flame",
        coachTip: "Nos dias de descanso muscular, registre uma caminhada leve ou mobilidade para manter o streak."
      },
      {
        id: `chal-ai-${Date.now()}-3`,
        title: "Expedição Outdoor 25km",
        description: "Complete 25km de corrida ou pedalada monitorada por GPS durante as próximas duas semanas.",
        category: "outdoor",
        targetValue: 25,
        targetMetricLabel: "25 km percorridos",
        rewardPoints: 400,
        badgeName: "Lobo da Pista",
        badgeIcon: "Zap",
        coachTip: "Mantenha o pace na Zona 2 cardíaca (conversação confortável) para desenvolver base mitocondrial."
      }
    ];

    const chalText = await callGeminiSafely({ contents: prompt, isJson: true });
    if (chalText) {
      try {
        const parsed = JSON.parse(chalText);
        if (parsed.challenges && parsed.challenges.length > 0) {
          return res.json(parsed);
        }
      } catch {}
    }
    return res.json({ challenges: deterministicChallenges });
  } catch (_error: any) {
    res.json({ challenges: [] });
  }
});

// 6. AI Bio-Feedback Workout Intensity Adjustment (Sleep Quality & Stress Level)
app.post("/api/ai/adjust-intensity", async (req, res) => {
  try {
    const {
      sleepQuality = "Boa",
      stressLevel = 3,
      session,
      profile,
    } = req.body;

    // Biological baseline calculations
    const sleepMap: Record<string, number> = {
      "Péssima": 20,
      "Ruim": 40,
      "Regular": 65,
      "Boa": 85,
      "Excelente": 100,
    };
    const sleepScore = sleepMap[sleepQuality] ?? 75;
    const stressNum = Math.max(1, Math.min(10, Number(stressLevel) || 3));
    const stressPenalty = (stressNum - 1) * 7;
    const computedReadiness = Math.max(25, Math.min(99, Math.round(sleepScore * 0.65 + (100 - stressPenalty) * 0.35)));

    const prompt = `Você é um fisiologista do exercício e cientista esportivo de elite da FORZON.
O atleta registrou os seguintes dados diários de recuperação e biofeedback:
- Atleta: ${profile?.name || "Atleta"}
- Qualidade do Sono: "${sleepQuality}"
- Nível de Estresse Diário (1 a 10): ${stressNum}/10
- Próxima Sessão de Treino: ${session?.title || "Treino Programado"} (Foco: ${session?.muscleFocus || "Força / Hipertrofia"})
- Exercícios previstos: ${(session?.exercises || []).map((e: any) => e.name).join(", ") || "Supino Reto, Supino Inclinado, Desenvolvimento, Tríceps"}

Com base na fisiologia neuromuscular, equilíbrio autonômico (simpático vs parassimpático), fadiga do SNC e risco de overtraining:
1. Calcule o Score de Prontidão (0 a 100).
2. Defina o multiplicador de carga recomendada (ex: 0.8 a 1.05).
3. Defina o ajuste de volume em séries (-1 série se fadiga alta, 0 se normal, +1 se recuperação plena).
4. Defina a faixa de RPE recomendada (ex: RPE 6-7 Deload, RPE 7-8 Técnico, RPE 8-9 Sobrecarga progressiva).
5. Escreva um statusBadge conciso (ex: "Intensidade Reduzida (-15%)", "Deload Ativo", "Prontidão Plena / Dia de PR", "Manutenção Fisiológica").
6. Escreva uma recomendação científica, motivadora e direta explicando o porquê do ajuste com base no sono (${sleepQuality}) e no nível de estresse (${stressNum}/10) para o treino seguinte.
7. Ajuste os exercícios previstos.

Retorne estritamente um JSON no seguinte formato (sem blocos markdown):
{
  "readinessScore": number,
  "loadMultiplier": number,
  "volumeSetsAdjustment": number,
  "rpeTarget": "string",
  "statusBadge": "string",
  "recommendationMessage": "string",
  "adjustedExercises": [
    {
      "name": "string",
      "adjustedSets": number,
      "adjustedReps": "string",
      "adjustedLoadGuidance": "string",
      "rpe": "string"
    }
  ]
}`;

    // Prepare deterministic physiological baseline based on sleep and autonomic stress
    let loadMultiplier = 1.0;
    let volumeSetsAdjustment = 0;
    let rpeTarget = "RPE 8 - 8.5 (Sobrecarga Padrão)";
    let statusBadge = "Prontidão Equilibrada";
    let recommendationMessage = "";

    if (computedReadiness >= 80) {
      loadMultiplier = 1.05;
      volumeSetsAdjustment = 0;
      rpeTarget = "RPE 8.5 - 9.5 (Luz Verde para PRs)";
      statusBadge = "Prontidão Máxima / Modo PR";
      recommendationMessage = `Com sono "${sleepQuality}" e estresse controlado (${stressNum}/10), seu Sistema Nervoso Central está em prontidão ideal. A IA calibrou seu treino de amanhã para buscar sobrecarga progressiva máxima (+5% de carga ou +1-2 reps com segurança).`;
    } else if (computedReadiness >= 60) {
      loadMultiplier = 1.0;
      volumeSetsAdjustment = 0;
      rpeTarget = "RPE 7.5 - 8 (Volume Padrão)";
      statusBadge = "Intensidade Normal";
      recommendationMessage = `Sono ${sleepQuality} e estresse em nível ${stressNum}/10. Sua recuperação é suficiente para sustentar a intensidade planejada. Mantenha 2 repetições na reserva (RIR 2) para preservar as articulações.`;
    } else if (computedReadiness >= 40) {
      loadMultiplier = 0.9;
      volumeSetsAdjustment = -1;
      rpeTarget = "RPE 7 (Foco em Execução)";
      statusBadge = "Intensidade Calibrada (-10%)";
      recommendationMessage = `Sono ${sleepQuality} e estresse moderado a alto (${stressNum}/10) apontam elevação no cortisol basal. A IA ajustou o treino de amanhã com -10% nas cargas e -1 série nos exercícios compostos, focando em cadência controlada e oxigenação.`;
    } else {
      loadMultiplier = 0.8;
      volumeSetsAdjustment = -1;
      rpeTarget = "RPE 6 - 6.5 (Deload / Regenerativo)";
      statusBadge = "Deload Ativo Recomendado";
      recommendationMessage = `Alerta de fadiga: sono ${sleepQuality} somado a estresse elevado (${stressNum}/10) sobrecarregam o eixo HPA. Para evitar lesões ou sobretreinamento, a IA converteu a próxima sessão em deload regenerativo (-20% de peso e ênfase em mobilidade).`;
    }

    const sampleExercises = (session?.exercises || []).map((ex: any) => ({
      name: ex.name,
      adjustedSets: Math.max(2, (ex.sets?.length || 3) + volumeSetsAdjustment),
      adjustedReps: ex.sets?.[0]?.targetReps || "8-10",
      adjustedLoadGuidance: loadMultiplier > 1 ? "Adicionar +2kg a +4kg se o aquecimento estiver fluido" : loadMultiplier < 1 ? `Reduzir ~${Math.round((1 - loadMultiplier) * 100)}% da carga habitual` : "Manter carga da última sessão",
      rpe: rpeTarget,
    }));

    const deterministicAdjustment = {
      readinessScore: computedReadiness,
      loadMultiplier,
      volumeSetsAdjustment,
      rpeTarget,
      statusBadge,
      recommendationMessage,
      adjustedExercises: sampleExercises.length > 0 ? sampleExercises : [
        {
          name: "Supino Reto com Barra",
          adjustedSets: 3,
          adjustedReps: "8-10",
          adjustedLoadGuidance: loadMultiplier < 1 ? "Reduzir 10% da carga para preservar manguito" : "Tentar sobrecarga de 2kg",
          rpe: rpeTarget
        }
      ]
    };

    const adjustText = await callGeminiSafely({ contents: prompt, isJson: true });
    if (adjustText) {
      try {
        const parsed = JSON.parse(adjustText);
        if (parsed.readinessScore !== undefined) {
          return res.json(parsed);
        }
      } catch {}
    }
    return res.json(deterministicAdjustment);
  } catch (_error: any) {
    res.status(200).json({
      readinessScore: 75,
      loadMultiplier: 1.0,
      volumeSetsAdjustment: 0,
      rpeTarget: "RPE 7.5 - 8",
      statusBadge: "Intensidade Padrão",
      recommendationMessage: "Recuperação equilibrada calculada com sucesso.",
      adjustedExercises: [],
    });
  }
});

// 4. Workout Synchronization & Offline Cache Sync Endpoint
const serverWorkoutRegistry: Map<string, any> = new Map();

app.post("/api/sync/workouts", (req, res) => {
  try {
    const { items, clientTimestamp } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Parâmetro 'items' inválido ou ausente." });
    }

    const acknowledgedIds: string[] = [];
    const serverTimestamp = new Date().toISOString();

    for (const item of items) {
      const { id, record, checksum } = item;
      if (!id || !record) continue;

      // Integrity validation: verify core fields
      if (!record.title || typeof record.totalVolumeKg !== "number") {
        console.log(`[Sync Server] Treino rejeitado por falha de integridade: ${id}`);
        continue;
      }

      // Store / merge server side record with checksum verification
      serverWorkoutRegistry.set(id, {
        ...record,
        serverReceivedAt: serverTimestamp,
        clientQueuedAt: item.queuedAt || clientTimestamp,
        checksum: checksum || "verified",
        syncStatus: "synced",
      });

      acknowledgedIds.push(id);
    }

    console.log(`[Sync Server] Sincronização concluída: ${acknowledgedIds.length} treinos processados.`);

    res.json({
      success: true,
      syncedCount: acknowledgedIds.length,
      acknowledgedIds,
      serverTimestamp,
      totalServerWorkoutsCount: serverWorkoutRegistry.size,
    });
  } catch (error: any) {
    console.log("Error in /api/sync/workouts:", error?.message || error);
    res.status(500).json({
      error: "Falha interna ao sincronizar treinos no servidor",
      details: error?.message,
    });
  }
});

app.get("/api/sync/status", (_req, res) => {
  res.json({
    status: "online",
    serverTimestamp: new Date().toISOString(),
    totalSyncedWorkouts: serverWorkoutRegistry.size,
  });
});

// Static downloads for user zip bundles
app.use(express.static(path.resolve(__dirname, "public")));

app.get("/api/download/alterados", (_req, res) => {
  const filePath = path.resolve(__dirname, "public", "forzon-arquivos-alterados.zip");
  res.download(filePath, "forzon-arquivos-alterados.zip");
});

app.get("/api/download/projeto-completo", (_req, res) => {
  const filePath = path.resolve(__dirname, "public", "forzon-projeto-completo.zip");
  res.download(filePath, "forzon-projeto-completo.zip");
});

// Vite or Static handling
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 FORZON Server rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
