import React, { useState } from 'react';
import { ArrowLeftRight, X, Sparkles, Check, AlertCircle } from 'lucide-react';

export interface FoodItemData {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  category: 'proteina' | 'carboidrato' | 'fruta' | 'gordura';
}

interface FoodSwapModalProps {
  currentFood: FoodItemData;
  onClose: () => void;
  onSwapFood: (newFood: FoodItemData) => void;
}

export const FoodSwapModal: React.FC<FoodSwapModalProps> = ({
  currentFood,
  onClose,
  onSwapFood,
}) => {
  // Banco de equivalências rigorosas de macros
  // Respeito estrito às frutas essenciais (Uva, Mamão e Abacaxi) com exclusão absoluta de Banana
  const swapDatabase: Record<string, FoodItemData[]> = {
    fruta: [
      { id: 'sw-mamao', name: 'Mamão Papaia Fresco', quantity: '150g (1/2 unid)', calories: 60, proteinG: 1, carbsG: 15, fatG: 0.2, category: 'fruta' },
      { id: 'sw-abacaxi', name: 'Abacaxi Pérola em Cubos', quantity: '120g (2 fatias)', calories: 60, proteinG: 0.6, carbsG: 15.5, fatG: 0.1, category: 'fruta' },
      { id: 'sw-uva', name: 'Uva Thompson Sem Semente', quantity: '90g (1 cacho peq)', calories: 62, proteinG: 0.6, carbsG: 16, fatG: 0.2, category: 'fruta' },
      { id: 'sw-morango', name: 'Morangos Frescos', quantity: '180g (10 unid)', calories: 58, proteinG: 1.2, carbsG: 14, fatG: 0.5, category: 'fruta' },
    ],
    proteina: [
      { id: 'sw-frango', name: 'Filé de Peito de Frango Grelhado', quantity: '150g', calories: 240, proteinG: 46, carbsG: 0, fatG: 4.5, category: 'proteina' },
      { id: 'sw-tilapia', name: 'Filé de Tilápia / Peixe Branco', quantity: '180g', calories: 230, proteinG: 45, carbsG: 0, fatG: 4.2, category: 'proteina' },
      { id: 'sw-patinho', name: 'Patinho Moído Magro', quantity: '140g', calories: 245, proteinG: 44, carbsG: 0, fatG: 6.8, category: 'proteina' },
      { id: 'sw-ovos', name: 'Ovos Caipiras (2 inteiros + 3 claras)', quantity: '5 unidades', calories: 235, proteinG: 34, carbsG: 1.5, fatG: 10, category: 'proteina' },
    ],
    carboidrato: [
      { id: 'sw-arroz', name: 'Arroz Branco ou Parboilizado', quantity: '150g cozido', calories: 195, proteinG: 3.8, carbsG: 42, fatG: 0.4, category: 'carboidrato' },
      { id: 'sw-mandioca', name: 'Mandioca / Aipim Cozido', quantity: '140g', calories: 190, proteinG: 1.5, carbsG: 45, fatG: 0.3, category: 'carboidrato' },
      { id: 'sw-batata-doce', name: 'Batata Doce Cozida com Casca', quantity: '160g', calories: 185, proteinG: 2.1, carbsG: 43, fatG: 0.2, category: 'carboidrato' },
      { id: 'sw-aveia', name: 'Aveia em Flocos Finos', quantity: '50g', calories: 190, proteinG: 7, carbsG: 33, fatG: 3.5, category: 'carboidrato' },
    ],
    gordura: [
      { id: 'sw-azeite', name: 'Azeite de Oliva Extra Virgem', quantity: '1 colher sopa (13ml)', calories: 108, proteinG: 0, carbsG: 0, fatG: 12, category: 'gordura' },
      { id: 'sw-castanha', name: 'Castanha-do-Pará Selecionada', quantity: '3 unidades (15g)', calories: 105, proteinG: 2.2, carbsG: 1.8, fatG: 10.5, category: 'gordura' },
      { id: 'sw-amendoim', name: 'Pasta de Amendoim 100% Integral', quantity: '18g (1 colher)', calories: 110, proteinG: 4.8, carbsG: 3.2, fatG: 9, category: 'gordura' },
    ],
  };

  const detectedCategory = currentFood.category || (currentFood.name.toLowerCase().includes('banana') || currentFood.name.toLowerCase().includes('fruta') || currentFood.name.toLowerCase().includes('mamão') || currentFood.name.toLowerCase().includes('uva') || currentFood.name.toLowerCase().includes('abacaxi') ? 'fruta' : currentFood.name.toLowerCase().includes('frango') || currentFood.name.toLowerCase().includes('ovo') || currentFood.name.toLowerCase().includes('carne') || currentFood.name.toLowerCase().includes('whey') ? 'proteina' : 'carboidrato');

  const availableSwaps = (swapDatabase[detectedCategory] || swapDatabase.carboidrato).filter(
    (item) => item.name.toLowerCase() !== currentFood.name.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-[#0a0e17] border border-cyan-500/40 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-[0_0_40px_rgba(0,210,255,0.2)]">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
                SUBSTITUIÇÃO INTELIGENTE
              </span>
              <h3 className="text-sm font-black text-white">Trocar Alimento (Acabou?)</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alimento Original que Acabou */}
        <div className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 text-xs space-y-1">
          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Item Atual da Dieta:</span>
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white line-through decoration-rose-500/70">{currentFood.name}</h4>
            <span className="font-mono text-[11px] text-[#00d2ff] font-bold">{currentFood.calories} kcal</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {currentFood.quantity} • P: {currentFood.proteinG}g | C: {currentFood.carbsG}g | G: {currentFood.fatG}g
          </p>
        </div>

        {/* Aviso de Respeito às Aversões e Frutas Selecionadas */}
        {detectedCategory === 'fruta' && (
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2 text-[10px] text-slate-300">
            <Sparkles className="w-4 h-4 text-[#00d2ff] shrink-0" />
            <span>Ficha respeitada: <strong>Mamão, Uva e Abacaxi</strong> priorizados; <strong>Banana excluída</strong>.</span>
          </div>
        )}

        {/* Lista de Opções Equivalentes em 1 Toque */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Substitutos com Equivalência de Calorias & Macros:
          </span>

          {availableSwaps.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSwapFood(item);
                onClose();
              }}
              className="p-3 rounded-xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <h5 className="text-xs font-bold text-white group-hover:text-[#00d2ff] transition-colors">
                  {item.name}
                </h5>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Porção: <strong className="text-slate-200">{item.quantity}</strong>
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  P: {item.proteinG}g • C: {item.carbsG}g • G: {item.fatG}g
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#00d2ff] block">{item.calories} kcal</span>
                <span className="text-[9px] text-emerald-400 font-bold">Trocar ➔</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};