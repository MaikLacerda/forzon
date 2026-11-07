import React, { useState } from 'react';
import {
  Sparkles,
  X,
  HeartPulse,
  Pill,
  Clock,
  Dumbbell,
  Utensils,
  Target,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export interface MedicalIntakeData {
  heightCm: number;
  weightKg: number;
  waterLiters: number;
  diagnoses: string[];
  medications: string;
  trainingHistory: string;
  sustainableDays: number;
  exactSessionMinutes: number;
  splitPreference: string;
  focusMuscles: string[];
  strongMuscles: string[];
  mealsPerDay: string;
  forbiddenFoods: string;
  essentialFoods: string;
  cookingHabit: string;
  gutHealth: string;
  alcoholSodaHabit: string;
  goal90Days: string;
  pastFailures: string;
  absoluteSuccessDefinition: string;
}

interface ComprehensiveMedicalIntakeModalProps {
  onClose: () => void;
  onApplyIntake?: (data: MedicalIntakeData) => void;
}

export const ComprehensiveMedicalIntakeModal: React.FC<ComprehensiveMedicalIntakeModalProps> = ({
  onClose,
  onApplyIntake,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // 1. Biometria com Pontos Flutuantes
  const [heightCm, setHeightCm] = useState<number>(178.5);
  const [weightKg, setWeightKg] = useState<number>(78.4);
  const [waterLiters, setWaterLiters] = useState<number>(3.2);

  // 2. Saúde Clínica & Medicamentos
  const [diagnoses, setDiagnoses] = useState<string[]>(['Nenhuma condição diagnosticada']);
  const [medications, setMedications] = useState('');

  // 3. Histórico de Treino & Biomecânica
  const [trainingHistory, setTrainingHistory] = useState('1 a 3 anos contínuos');
  const [sustainableDays, setSustainableDays] = useState(4);
  const [exactSessionMinutes, setExactSessionMinutes] = useState(60);
  const [splitPreference, setSplitPreference] = useState('ABCD Clássico');
  const [focusMuscles, setFocusMuscles] = useState<string[]>(['Peitoral', 'Deltoides (Lateral)', 'Braços']);
  const [strongMuscles, setStrongMuscles] = useState<string[]>(['Costas / Dorsais']);

  // 4. Nutrição, Aversões & Hábitos Gastrointestinais
  const [mealsPerDay, setMealsPerDay] = useState('4 refeições estruturadas');
  const [forbiddenFoods, setForbiddenFoods] = useState('Frutos do mar, lactose, carne vermelha, banana');
  const [essentialFoods, setEssentialFoods] = useState('Mamão, uva, abacaxi, ovos, aveia, café');
  const [cookingHabit, setCookingHabit] = useState('Cozinha em casa diariamente');
  const [gutHealth, setGutHealth] = useState('Gases frequentes ou estufamento');
  const [alcoholSodaHabit, setAlcoholSodaHabit] = useState('Zero consumo / Nunca');

  // 5. Metas 90 Dias
  const [goal90Days, setGoal90Days] = useState('Ganhar 3kg de massa magra mantendo o abdômen definido');
  const [pastFailures, setPastFailures] = useState('Dietas muito restritivas e treinos com volume excessivo');
  const [absoluteSuccessDefinition, setAbsoluteSuccessDefinition] = useState('Ganhar 3kg de massa magra mantendo o abdômen definido');

  // Toggle para diagnósticos médicos
  const toggleDiagnosis = (diag: string) => {
    if (diag === 'Nenhuma condição diagnosticada') {
      setDiagnoses(['Nenhuma condição diagnosticada']);
      return;
    }
    const filtered = diagnoses.filter((d) => d !== 'Nenhuma condição diagnosticada');
    if (filtered.includes(diag)) {
      const next = filtered.filter((d) => d !== diag);
      setDiagnoses(next.length === 0 ? ['Nenhuma condição diagnosticada'] : next);
    } else {
      setDiagnoses([...filtered, diag]);
    }
  };

  const toggleMuscle = (muscle: string, type: 'focus' | 'strong') => {
    if (type === 'focus') {
      setFocusMuscles((prev) =>
        prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
      );
    } else {
      setStrongMuscles((prev) =>
        prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
      );
    }
  };

  // Finalização segura à prova de falhas: nunca trava se a prop for opcional
  const handleFinish = () => {
    const intakePayload: MedicalIntakeData = {
      heightCm,
      weightKg,
      waterLiters,
      diagnoses,
      medications,
      trainingHistory,
      sustainableDays,
      exactSessionMinutes,
      splitPreference,
      focusMuscles,
      strongMuscles,
      mealsPerDay,
      forbiddenFoods,
      essentialFoods,
      cookingHabit,
      gutHealth,
      alcoholSodaHabit,
      goal90Days,
      pastFailures,
      absoluteSuccessDefinition,
    };

    try {
      localStorage.setItem('forzon_intake_data', JSON.stringify(intakePayload));
    } catch (_) {}

    if (typeof onApplyIntake === 'function') {
      onApplyIntake(intakePayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in select-none">
      <div className="bg-[#0a0e17] border border-cyan-500/40 rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col justify-between p-5 space-y-4 shadow-[0_0_35px_rgba(0,210,255,0.2)]">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">
                AVALIAÇÃO CIENTÍFICA & ANAMNESE • ETAPA {activeStep} DE 4
              </span>
              <h3 className="text-sm font-black text-white">Intake Médico & Nutricional</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador de Progresso das 4 Etapas */}
        <div className="grid grid-cols-4 gap-1.5 shrink-0">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all ${
                activeStep >= step ? 'bg-[#00d2ff] shadow-[0_0_8px_#00d2ff]' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* ================= CORPO DO FORMULÁRIO (4 ETAPAS) ================= */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">

          {/* ETAPA 1: BIOMETRIA COM PONTOS FLUTUANTES & SAÚDE CLÍNICA */}
          {activeStep === 1 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-[#00d2ff]" /> 1. Biometria & Diagnósticos Prévios
                </h4>
                <p className="text-[11px] text-slate-400">Valores numéricos com suporte a decimais.</p>
              </div>

              {/* Altura, Peso e Água com Decimais (Pontos Flutuantes) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-[#0f131c] border border-slate-800 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Altura (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono font-bold text-white bg-transparent border-b border-cyan-500/40 text-center py-0.5 outline-none focus:border-[#00d2ff]"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#0f131c] border border-slate-800 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono font-bold text-white bg-transparent border-b border-cyan-500/40 text-center py-0.5 outline-none focus:border-[#00d2ff]"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#0f131c] border border-slate-800 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Água (L/dia)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono font-bold text-white bg-transparent border-b border-cyan-500/40 text-center py-0.5 outline-none focus:border-[#00d2ff]"
                  />
                </div>
              </div>

              {/* Diagnósticos Médicos Prévios */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  Possui algum diagnóstico médico prévio?
                </label>
                <div className="space-y-1.5">
                  {[
                    'Pressão alta / Hipertensão arterial',
                    'Resistência à insulina / Pré-diabetes ou Diabetes',
                    'Alterações na tireoide (Hipotireoidismo / Hashimoto)',
                    'Dislipidemia (Colesterol total ou Triglicérides elevados)',
                    'Nenhuma condição diagnosticada'
                  ].map((diag) => {
                    const isSelected = diagnoses.includes(diag);
                    return (
                      <button
                        key={diag}
                        type="button"
                        onClick={() => toggleDiagnosis(diag)}
                        className={`w-full p-2.5 text-left rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/70 border-[#00d2ff] text-[#00d2ff]'
                            : 'bg-[#0f131c] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[11px] font-semibold">{diag}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#00d2ff] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Medicamentos Contínuos ou Esporádicos */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-amber-400" />
                  Medicamentos contínuos ou esporádicos:
                </label>
                <input
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="Ex: Anti-inflamatórios frequentes, ansiolíticos, levotiroxina, nenhum..."
                  className="w-full bg-[#0f131c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
                />
              </div>
            </div>
          )}

          {/* ETAPA 2: HISTÓRICO, SUSTENTABILIDADE & TEMPO REAL */}
          {activeStep === 2 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#00d2ff]" /> 2. Histórico & Tempo Real Sustentável
                </h4>
                <p className="text-[11px] text-slate-400">Considerando a sua rotina real, não a semana perfeita.</p>
              </div>

              {/* Tempo Ininterrupto de Musculação */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  Há quanto tempo treina musculação ininterrupta e estruturada?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Iniciante recente (< 6 meses)',
                    '6 meses a 1 ano',
                    '1 a 3 anos contínuos',
                    'Mais de 3 anos de treino sério'
                  ].map((hist) => (
                    <button
                      key={hist}
                      type="button"
                      onClick={() => setTrainingHistory(hist)}
                      className={`p-2.5 text-left rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        trainingHistory === hist
                          ? 'bg-cyan-950/70 border-[#00d2ff] text-[#00d2ff]'
                          : 'bg-[#0f131c] border-slate-800 text-slate-400'
                      }`}
                    >
                      {hist}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dias Sustentáveis na Semana */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  Dias por semana sustentáveis na sua rotina real:
                </label>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setSustainableDays(days)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        sustainableDays === days
                          ? 'bg-cyan-950/90 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_10px_rgba(0,210,255,0.2)]'
                          : 'bg-[#0f131c] border-slate-800 text-slate-400'
                      }`}
                    >
                      {days} dias
                    </button>
                  ))}
                </div>
              </div>

              {/* Tempo Exato com Aquecimento e Pós-Treino */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  Tempo exato disponível por sessão (incluindo aquecimento e pós-treino):
                </label>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[45, 60, 75, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setExactSessionMinutes(mins)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        exactSessionMinutes === mins
                          ? 'bg-cyan-950/90 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_10px_rgba(0,210,255,0.2)]'
                          : 'bg-[#0f131c] border-slate-800 text-slate-400'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Divisão Preferida */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Divisão de Treino (Split):</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['ABCD Clássico', 'ABC Padrão', 'Upper / Lower', 'Full Body', 'ABCDE Avançado'].map((split) => (
                    <button
                      key={split}
                      type="button"
                      onClick={() => setSplitPreference(split)}
                      className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        splitPreference === split
                          ? 'bg-cyan-950/70 border-[#00d2ff] text-[#00d2ff]'
                          : 'bg-[#0f131c] border-slate-800 text-slate-400'
                      }`}
                    >
                      {split}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3: BIOMECÂNICA, PONTOS FORTES & FRACOS */}
          {activeStep === 3 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-[#00d2ff]" /> 3. Biomecânica de Pontos Fortes e Fracos
                </h4>
                <p className="text-[11px] text-slate-400">Para balancear o volume e as proporções musculares.</p>
              </div>

              {/* Grupamentos Prioritários para Desenvolver */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  Grupamentos musculares prioritários para evoluir (Pontos Fracos):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Peitoral',
                    'Costas / Dorsais',
                    'Deltoides (Lateral/Ombros)',
                    'Braços (Bíceps/Tríceps)',
                    'Quadríceps',
                    'Posterior / Glúteos',
                    'Panturrilhas',
                    'Core / Abdômen'
                  ].map((muscle) => {
                    const isSel = focusMuscles.includes(muscle);
                    return (
                      <button
                        key={muscle}
                        type="button"
                        onClick={() => toggleMuscle(muscle, 'focus')}
                        className={`p-2 text-left rounded-xl border text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSel
                            ? 'bg-cyan-950/70 border-[#00d2ff] text-[#00d2ff]'
                            : 'bg-[#0f131c] border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{muscle}</span>
                        {isSel && <Check className="w-3.5 h-3.5 text-[#00d2ff]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grupamentos Considerados Pontos Fortes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  Grupamentos que respondem com facilidade (Pontos Fortes):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Costas / Dorsais',
                    'Peitoral',
                    'Pernas / Quadríceps',
                    'Braços',
                    'Ombros',
                    'Nenhum (tudo equilibrado)'
                  ].map((muscle) => {
                    const isSel = strongMuscles.includes(muscle);
                    return (
                      <button
                        key={muscle}
                        type="button"
                        onClick={() => toggleMuscle(muscle, 'strong')}
                        className={`p-2 text-left rounded-xl border text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSel
                            ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                            : 'bg-[#0f131c] border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{muscle}</span>
                        {isSel && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 4: NUTRIÇÃO PROFUNDA, ADERÊNCIA & METAS 90 DIAS */}
          {activeStep === 4 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#00d2ff]" /> 4. Nutrição, Aversões & Metas 90 Dias
                </h4>
                <p className="text-[11px] text-slate-400">Para garantir uma dieta que você consiga sustentar.</p>
              </div>

              {/* Refeições e Rotina de Cozinha */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300">Refeições por Dia</label>
                  <select
                    value={mealsPerDay}
                    onChange={(e) => setMealsPerDay(e.target.value)}
                    className="w-full py-2 px-2 rounded-xl bg-[#0f131c] border border-slate-800 text-xs font-semibold text-white focus:border-[#00d2ff] outline-none"
                  >
                    <option>3 refeições maiores</option>
                    <option>4 refeições estruturadas</option>
                    <option>5 a 6 fracionadas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300">Preparo de Refeições</label>
                  <select
                    value={cookingHabit}
                    onChange={(e) => setCookingHabit(e.target.value)}
                    className="w-full py-2 px-2 rounded-xl bg-[#0f131c] border border-slate-800 text-xs font-semibold text-white focus:border-[#00d2ff] outline-none"
                  >
                    <option>Cozinha em casa diariamente</option>
                    <option>Marmitas congeladas prontas</option>
                    <option>Restaurante / Por quilo</option>
                    <option>Delivery frequente</option>
                  </select>
                </div>
              </div>

              {/* Alimentos Proibidos / Aversões */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">
                  Alimentos que você NÃO come (aversão, alergia ou intolerância):
                </label>
                <input
                  type="text"
                  value={forbiddenFoods}
                  onChange={(e) => setForbiddenFoods(e.target.value)}
                  placeholder="Ex: Frutos do mar, lactose, carne vermelha, banana..."
                  className="w-full bg-[#0f131c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
                />
              </div>

              {/* Alimentos Essenciais para Sanidade */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">
                  Alimentos essenciais para manter sua adesão à dieta:
                </label>
                <input
                  type="text"
                  value={essentialFoods}
                  onChange={(e) => setEssentialFoods(e.target.value)}
                  placeholder="Ex: Mamão, uva, abacaxi, ovos, aveia, café..."
                  className="w-full bg-[#0f131c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
                />
              </div>

              {/* Trato Gastrointestinal & Álcool */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300">Trato Gastrointestinal</label>
                  <select
                    value={gutHealth}
                    onChange={(e) => setGutHealth(e.target.value)}
                    className="w-full py-2 px-2 rounded-xl bg-[#0f131c] border border-slate-800 text-xs font-semibold text-white focus:border-[#00d2ff] outline-none"
                  >
                    <option>Gases frequentes ou estufamento</option>
                    <option>Regular (sem estufamento ou refluxo)</option>
                    <option>Refluxo ocasional</option>
                    <option>Intestino preso / irregular</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300">Álcool / Bebidas Açucaradas</label>
                  <select
                    value={alcoholSodaHabit}
                    onChange={(e) => setAlcoholSodaHabit(e.target.value)}
                    className="w-full py-2 px-2 rounded-xl bg-[#0f131c] border border-slate-800 text-xs font-semibold text-white focus:border-[#00d2ff] outline-none"
                  >
                    <option>Zero consumo / Nunca</option>
                    <option>Esporádico / Raro (0 a 1x semana)</option>
                    <option>Frequente (2 a 3x semana)</option>
                  </select>
                </div>
              </div>

              {/* Metas 90 Dias & Sucesso Absoluto */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <label className="text-xs font-bold text-[#00d2ff] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  O que representará SUCESSO ABSOLUTO para você daqui a 90 dias?
                </label>
                <textarea
                  rows={2}
                  value={absoluteSuccessDefinition}
                  onChange={(e) => {
                    setAbsoluteSuccessDefinition(e.target.value);
                    setGoal90Days(e.target.value);
                  }}
                  placeholder="Ex: Ganhar 3kg de massa magra mantendo o abdômen definido."
                  className="w-full bg-[#0f131c] border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

        </div>

        {/* ================= NAVEGAÇÃO ENTRE ETAPAS ================= */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
          {activeStep > 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => (prev - 1) as any)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
          ) : (
            <div />
          )}

          {activeStep < 4 ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => (prev + 1) as any)}
              className="px-4 py-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-black text-[#00d2ff] flex items-center gap-1 hover:bg-cyan-900 shadow-[0_0_12px_rgba(0,210,255,0.2)] cursor-pointer"
            >
              Avançar <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-3 rounded-xl bg-[#00d2ff] hover:bg-cyan-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 fill-neutral-950" />
              Aplicar Periodização Personalizada
            </button>
          )}
        </div>

      </div>
    </div>
  );
};