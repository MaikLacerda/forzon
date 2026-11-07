import React, { useState } from 'react';
import { ShoppingBag, X, Check, Copy } from 'lucide-react';

export interface GroceryItem {
  id: string;
  name: string;
  amount: string;
  category: 'Hortifrúti' | 'Proteínas & Carnes' | 'Grãos & Mercearia' | 'Suplementos';
  checked: boolean;
}

interface GroceryListModalProps {
  onClose: () => void;
}

export const GroceryListModal: React.FC<GroceryListModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  // Lista compilada a partir da anamnese (Mamão, Uva e Abacaxi; exclusão de Banana)
  const [items, setItems] = useState<GroceryItem[]>([
    // Hortifrúti
    { id: 'g-1', name: 'Mamão Papaia Fresco', amount: '3 unidades (médias)', category: 'Hortifrúti', checked: false },
    { id: 'g-2', name: 'Uva Thompson Sem Semente', amount: '2 caixas (1kg)', category: 'Hortifrúti', checked: true },
    { id: 'g-3', name: 'Abacaxi Pérola em Fatias', amount: '1 unidade grande', category: 'Hortifrúti', checked: false },
    { id: 'g-4', name: 'Morangos Selecionados', amount: '2 bandejas (500g)', category: 'Hortifrúti', checked: false },

    // Proteínas & Carnes Magras
    { id: 'g-5', name: 'Peito de Frango em Filés', amount: '2.5 kg', category: 'Proteínas & Carnes', checked: true },
    { id: 'g-6', name: 'Ovos Caipiras Grandes', amount: '3 dúzias (36 unid)', category: 'Proteínas & Carnes', checked: true },
    { id: 'g-7', name: 'Patinho Moído Magro 95%', amount: '1.2 kg', category: 'Proteínas & Carnes', checked: false },
    { id: 'g-8', name: 'Filé de Tilápia Congelado', amount: '800g', category: 'Proteínas & Carnes', checked: false },

    // Grãos, Carboidratos & Mercearia
    { id: 'g-9', name: 'Arroz Branco ou Parboilizado', amount: '2 kg', category: 'Grãos & Mercearia', checked: true },
    { id: 'g-10', name: 'Mandioca / Aipim Descascado', amount: '1.5 kg', category: 'Grãos & Mercearia', checked: false },
    { id: 'g-11', name: 'Aveia em Flocos Finos', amount: '500g', category: 'Grãos & Mercearia', checked: false },
    { id: 'g-12', name: 'Azeite de Oliva Extra Virgem', amount: '1 garrafa (500ml)', category: 'Grãos & Mercearia', checked: true },
    { id: 'g-13', name: 'Castanha-do-Pará em Grãos', amount: '200g', category: 'Grãos & Mercearia', checked: false },

    // Suplementação Esportiva
    { id: 'g-14', name: 'Whey Protein Isolado / 3W', amount: '1 refil (900g)', category: 'Suplementos', checked: false },
    { id: 'g-15', name: 'Creatina Monohidratada 100% Pura', amount: '1 pote (300g)', category: 'Suplementos', checked: true },
  ]);

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const completedCount = items.filter((i) => i.checked).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = ['Hortifrúti', 'Proteínas & Carnes', 'Grãos & Mercearia', 'Suplementos'] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in select-none">
      <div className="bg-[#0a0e17] border border-cyan-500/40 rounded-3xl max-w-md w-full p-4 space-y-3.5 shadow-[0_0_40px_rgba(0,210,255,0.2)] max-h-[92vh] flex flex-col">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
                COMPILAÇÃO SEMANAL DA DIETA
              </span>
              <h3 className="text-sm font-black text-white">Lista de Compras Inteligente</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 space-y-1.5 shrink-0">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold">Progresso no Supermercado</span>
            <span className="font-mono text-[#00d2ff] font-bold">
              {completedCount} de {items.length} itens ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-[#00d2ff] transition-all duration-300 shadow-[0_0_8px_#00d2ff]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Lista por Categoria */}
        <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
          {categories.map((cat) => {
            const catItems = items.filter((i) => i.category === cat);
            return (
              <div key={cat} className="space-y-1.5">
                <h4 className="text-[11px] font-black text-[#00d2ff] uppercase tracking-wider px-1">
                  {cat} ({catItems.length})
                </h4>
                <div className="space-y-1">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        item.checked
                          ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                          : 'bg-[#0f131c] border-slate-800 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                            item.checked
                              ? 'bg-[#00d2ff] border-[#00d2ff] text-neutral-950'
                              : 'border-slate-700 bg-slate-950'
                          }`}
                        >
                          {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            item.checked ? 'text-slate-500 line-through' : 'text-white'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé com botão de copiar */}
        <div className="flex gap-2 pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-xs font-bold text-[#00d2ff] hover:bg-cyan-900 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Lista Copiada!' : 'Copiar Texto para o WhatsApp'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};