import React, { useState } from 'react';
import { X, Send, Sparkles, Bot } from 'lucide-react';
interface AICoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const AICoachDrawer: React.FC<AICoachDrawerProps> = ({
  isOpen,
  onClose,
  userName = "Maikon",
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Olá, ${userName}! Sou o FORZON Coach. Seu biofeedback de hoje está em 88% com VFC ótima. Precisa de algum ajuste em exercício, sugestão de drop-set ou orientação nutricional?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          userContext: { name: userName, mainGoal: 'Hipertrofia e Força', experienceLevel: 'Intermediário' },
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || 'Treino calibrado com foco em sobrecarga progressiva e cadência controlada!' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Excelente dedicação! Mantenha a cadência excêntrica de 3s e 2 reps na reserva para máxima proteção articular.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0a0e17] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        <div className="p-4 border-b border-slate-800 bg-[#0f131c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">FORZON Coach IA</h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ativo • Fisiologia & Periodização
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto text-xs">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff] shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#00d2ff] text-slate-950 font-semibold rounded-br-none'
                    : 'bg-[#0f131c] border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-[11px] animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" /> Coach formulando recomendação...
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-800 bg-[#0f131c] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ex: aparelho de supino ocupado, o que fazer?"
            className="flex-1 bg-[#0a0e17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-xl bg-[#00d2ff] text-slate-950 hover:bg-[#00c0ea] transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
