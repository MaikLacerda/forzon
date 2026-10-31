import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Dumbbell,
  Mic,
  MicOff,
  Radio,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage, UserProfile } from "../../types";
import { aiService } from "../../services/aiService";

interface AICoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  initialPrompt?: string;
}

export const AICoachDrawer: React.FC<AICoachDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      role: "model",
      content: `Olá, ${profile.name.split(" ")[0]}! Sou o FORZON Coach. Estou acompanhando sua periodização focada em ${profile.mainGoal} (Sono: ${profile.sleepQuality || "Boa"}, Estresse: ${profile.stressLevel ?? 3}/10). Como posso calibrar seus treinos ou otimizar sua recuperação hoje? Você também pode usar comandos de voz pelo microfone!`,
      timestamp: "Agora",
      suggestions: [
        "Dormi mal e estou sob estresse alto: adapte a carga de amanhã",
        "Registrar RPE 8 no supino",
        "Aparelho ocupado na academia",
        "Tenho 25 minutos para treinar hoje",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize and cleanup speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const startListening = () => {
    setSpeechError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript("");
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setSpeechTranscript(transcript);
        setInputValue(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setSpeechError("Permissão de microfone bloqueada pelo navegador.");
        } else if (event.error !== "no-speech") {
          setSpeechError(`Microfone indisponível (${event.error})`);
        }
        setTimeout(() => setSpeechError(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setSpeechError("Não foi possível acessar o microfone.");
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // If opened with an initial prompt from another screen
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    if (isListening) {
      stopListening();
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setSpeechTranscript("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const reply = await aiService.askCoach(text, history, profile);

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "model",
        content: reply,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "model",
        content: "Houve uma instabilidade temporária. Por favor, tente novamente.",
        timestamp: "Agora",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="bg-neutral-950 border-l border-neutral-800 w-full max-w-lg h-full flex flex-col justify-between shadow-2xl">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-neutral-850 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>FORZON Coach</span>
                <span className="text-[10px] text-cyan-400 font-mono font-normal">IA Ativa</span>
              </h2>
              <div className="text-[11px] text-neutral-400">
                Fisiologia do exercício & nutrição adaptativa
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: "msg-reset",
                    role: "model",
                    content: `Conversa reiniciada. Em que posso te orientar agora, ${profile.name.split(" ")[0]}?`,
                    timestamp: "Agora",
                    suggestions: ["Substituição de exercício", "Ajuste de volume semanal"],
                  },
                ]);
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Limpar histórico"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${isUser ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isUser
                      ? "bg-neutral-800 text-neutral-300"
                      : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className={`space-y-2 max-w-[85%] ${isUser ? "items-end text-right" : ""}`}>
                  <div
                    className={`p-3.5 rounded-2xl whitespace-pre-wrap ${
                      isUser
                        ? "bg-emerald-500 text-neutral-950 font-medium rounded-tr-sm"
                        : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 transition-colors text-left cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-neutral-500 font-mono px-1">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-xs">
              <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl text-neutral-400 italic">
                FORZON Coach está analisando sua fisiologia e gerando recomendações...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Voice Recognition */}
        <div className="p-4 border-t border-neutral-850 bg-neutral-900/40 space-y-2.5">
          {/* Active Voice Listening Banner */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: 10 }}
                className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-white"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-semibold text-emerald-400">Escutando você:</span>
                  <span className="text-neutral-200 italic line-clamp-1">
                    {speechTranscript || "Fale agora... ex: 'Registrar RPE 8 no supino' ou 'Substituir exercício'"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopListening}
                  className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 transition-colors cursor-pointer"
                >
                  Parar
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Error Notice */}
          <AnimatePresence>
            {speechError && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-2 rounded-lg flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{speechError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Voice Command Short-cuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
            <span className="text-neutral-500 font-mono text-[10px] uppercase shrink-0">Comandos:</span>
            {[
              "Registrar RPE 8.5",
              "Aparelho ocupado",
              "Treino de 25 min",
              "Refeição pós-treino",
            ].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => handleSend(cmd)}
                className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1"
              >
                <Mic className="w-2.5 h-2.5 text-emerald-400" />
                <span>{cmd}</span>
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={isListening ? "Escutando sua voz..." : "Pergunte, registre RPE ou fale pelo microfone..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 border text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                isListening ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-neutral-800 focus:border-emerald-500"
              }`}
            />

            {/* Microphone Toggle Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 relative ${
                isListening
                  ? "bg-red-500 text-white border-red-400 shadow-md shadow-red-500/30"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-emerald-400 hover:border-emerald-500/40"
              }`}
              title={
                !speechSupported
                  ? "Reconhecimento de voz não suportado"
                  : isListening
                  ? "Parar gravação de voz"
                  : "Falar comando de voz (RPE / Modificar treino)"
              }
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </motion.button>

            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-neutral-950 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="text-[10px] text-neutral-500 text-center flex items-center justify-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 inline" />
            <span>Suporte a voz integrado (Web Speech API em pt-BR)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
