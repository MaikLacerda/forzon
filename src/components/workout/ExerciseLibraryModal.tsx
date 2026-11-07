import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Dumbbell,
  ChevronRight,
  Video
} from 'lucide-react';

export interface CatalogExercise {
  id: string;
  name: string;
  group: 'Peitoral' | 'Costas' | 'Ombros' | 'Bíceps' | 'Tríceps' | 'Pernas' | 'Glúteos' | 'Panturrilhas' | 'Abdômen' | 'Cardio';
  equipment: string;
  cue: string;
}

interface ExerciseLibraryModalProps {
  onClose: () => void;
  onSelectExercise?: (exercise: CatalogExercise) => void;
}

export const ALL_104_FORZON_EXERCISES: CatalogExercise[] = [
  // 1. PEITORAL (15)
  { id: 'ex-supino-inclinado-halteres', name: 'Supino Inclinado com Halteres', group: 'Peitoral', equipment: 'Halteres & Banco 30°', cue: 'Pegada neutra a 30° com retração escapular ativa.' },
  { id: 'ex-supino-reto-barra', name: 'Supino Reto com Barra Olímpica', group: 'Peitoral', equipment: 'Barra Olímpica & Banco Reto', cue: 'Descida controlada até a linha do esterno.' },
  { id: 'ex-supino-reto-halteres', name: 'Supino Reto com Halteres', group: 'Peitoral', equipment: 'Halteres & Banco', cue: 'Maior amplitude articular sem estalar ombros.' },
  { id: 'ex-supino-inclinado-barra', name: 'Supino Inclinado com Barra', group: 'Peitoral', equipment: 'Barra Olímpica', cue: 'Foco em feixes claviculares do peitoral superior.' },
  { id: 'ex-supino-declinado-barra', name: 'Supino Declinado com Barra (Canadense)', group: 'Peitoral', equipment: 'Barra & Banco Declinado', cue: 'Ênfase nos feixes inferiores do peitoral.' },
  { id: 'ex-supino-declinado-halteres', name: 'Supino Declinado com Halteres', group: 'Peitoral', equipment: 'Halteres', cue: 'Estabilidade axial e conforto no manguito rotador.' },
  { id: 'ex-supino-maquina-articulada', name: 'Supino Reto na Máquina Articulada', group: 'Peitoral', equipment: 'Máquina Articulada', cue: 'Trajetória guiada convergente para sobrecarga segura.' },
  { id: 'ex-crucifixo-reto-halteres', name: 'Crucifixo Reto com Halteres', group: 'Peitoral', equipment: 'Halteres', cue: 'Alongamento fascial peitoral sem hiperestender cotovelos.' },
  { id: 'ex-crucifixo-inclinado-halteres', name: 'Crucifixo Inclinado com Halteres', group: 'Peitoral', equipment: 'Halteres', cue: 'Abertura em arco preservando escápulas travadas.' },
  { id: 'ex-peck-deck-voador', name: 'Voador Peitoral / Peck Deck', group: 'Peitoral', equipment: 'Máquina Peck Deck', cue: 'Pico de contração de 1s no centro do tórax.' },
  { id: 'ex-crossover-polia-media', name: 'Crucifixo no Crossover (Polia Média)', group: 'Peitoral', equipment: 'Crossover', cue: 'Tensão constante em todo o arco do movimento.' },
  { id: 'ex-crossover-polia-alta', name: 'Crossover na Polia Alta (Foco Inferior)', group: 'Peitoral', equipment: 'Polia Alta', cue: 'Vetor descendente de força para feixes esternais.' },
  { id: 'ex-crossover-polia-baixa', name: 'Crossover na Polia Baixa (Foco Superior)', group: 'Peitoral', equipment: 'Polia Baixa', cue: 'Vetor ascendente ativando o peitoral superior.' },
  { id: 'ex-mergulho-paralelas-peito', name: 'Paralelas com Foco em Peitoral (Chest Dips)', group: 'Peitoral', equipment: 'Barras Paralelas', cue: 'Tronco inclinado à frente em 30°.' },
  { id: 'ex-pullover-halter', name: 'Pullover com Halter no Banco Plano', group: 'Peitoral', equipment: 'Halter', cue: 'Expansão da caixa torácica e serrátil anterior.' },

  // 2. COSTAS / DORSAIS (14)
  { id: 'ex-puxada-frontal-polia', name: 'Puxada Frontal na Polia Alta', group: 'Costas', equipment: 'Polia Alta com Barra', cue: 'Puxe direcionando cotovelos para os bolsos da calça.' },
  { id: 'ex-barra-fixa-pronada', name: 'Barra Fixa Pronada (Pull-Up)', group: 'Costas', equipment: 'Barra Fixa', cue: 'Acionamento de latíssimo com queixo passando da barra.' },
  { id: 'ex-barra-fixa-supinada', name: 'Barra Fixa Supinada (Chin-Up)', group: 'Costas', equipment: 'Barra Fixa', cue: 'Participação ativa de bíceps e grande dorsal.' },
  { id: 'ex-puxada-triangulo', name: 'Puxada Alta com Triângulo (Pegada Neutra)', group: 'Costas', equipment: 'Polia Alta', cue: 'Maior recrutamento de densidade dorsal central.' },
  { id: 'ex-remada-curvada-barra', name: 'Remada Curvada com Barra', group: 'Costas', equipment: 'Barra Olímpica', cue: 'Tronco a 45° mantendo curvatura lombar anatômica.' },
  { id: 'ex-remada-unilateral-serrote', name: 'Remada Unilateral com Halter (Serrote)', group: 'Costas', equipment: 'Halter & Banco', cue: 'Apoio firme no banco sem rotação excessiva do tronco.' },
  { id: 'ex-remada-cavalinho-tbar', name: 'Remada Cavalinho / T-Bar com Barra', group: 'Costas', equipment: 'Barra T-Bar', cue: 'Esmague os rombóides na fase concêntrica máxima.' },
  { id: 'ex-remada-baixa-triangulo', name: 'Remada Baixa na Polia com Triângulo', group: 'Costas', equipment: 'Polia Baixa', cue: 'Alongamento dorsal sem curvar a espinha torácica.' },
  { id: 'ex-remada-articulada-maquina', name: 'Remada Articulada na Máquina', group: 'Costas', equipment: 'Máquina Articulada', cue: 'Sobrecarga miofibrilar com apoio estável no peito.' },
  { id: 'ex-pulldown-polia-alta', name: 'Pulldown na Polia Alta com Barra Reta', group: 'Costas', equipment: 'Polia Alta', cue: 'Isolamento de grande dorsal sem flexão dos cotovelos.' },
  { id: 'ex-levantamento-terra-convencional', name: 'Levantamento Terra Convencional', group: 'Costas', equipment: 'Barra Olímpica & Anilhas', cue: 'Puxada da cadeia posterior com ativação de glúteos e eretores.' },
  { id: 'ex-crucifixo-invertido-halteres', name: 'Crucifixo Invertido com Halteres', group: 'Costas', equipment: 'Halteres', cue: 'Ativação precisa de deltóide posterior e trapézio médio.' },
  { id: 'ex-crucifixo-invertido-peck-deck', name: 'Voador Invertido no Peck Deck', group: 'Costas', equipment: 'Máquina Peck Deck', cue: 'Manter braços quase retos sem elevar os ombros.' },
  { id: 'ex-extensao-lombar-banco', name: 'Hiperextensão Lombar no Banco 45°', group: 'Costas', equipment: 'Banco 45°', cue: 'Fortalecimento dos eretores da espinha e lombar.' },

  // 3. DELTÓIDES & TRAPÉZIO (13)
  { id: 'ex-desenvolvimento-halteres', name: 'Desenvolvimento com Halteres Sentado', group: 'Ombros', equipment: 'Halteres & Banco 80°', cue: 'Empurrar vertical sem bater os halteres no topo.' },
  { id: 'ex-desenvolvimento-militar-barra', name: 'Desenvolvimento Militar em Pé (OHP)', group: 'Ombros', equipment: 'Barra Olímpica', cue: 'Core e glúteos travados para sustentação axial.' },
  { id: 'ex-desenvolvimento-arnold', name: 'Desenvolvimento Arnold com Halteres', group: 'Ombros', equipment: 'Halteres', cue: 'Rotação coordenada de 180° dos punhos.' },
  { id: 'ex-desenvolvimento-maquina', name: 'Desenvolvimento de Ombros na Máquina', group: 'Ombros', equipment: 'Máquina Articulada', cue: 'Estabilidade guiada para falha concêntrica segura.' },
  { id: 'ex-elevacao-lateral-halteres', name: 'Elevação Lateral com Halteres', group: 'Ombros', equipment: 'Halteres', cue: 'Plano escapular com cotovelos liderando a subida.' },
  { id: 'ex-elevacao-lateral-polia', name: 'Elevação Lateral na Polia Baixa', group: 'Ombros', equipment: 'Polia Baixa', cue: 'Tensão sob torque mecânico constante desde o início.' },
  { id: 'ex-elevacao-lateral-inclinada', name: 'Elevação Lateral no Banco Inclinado', group: 'Ombros', equipment: 'Halter & Banco 60°', cue: 'Isolamento da cabeça lateral do deltóide em alongamento.' },
  { id: 'ex-elevacao-frontal-halteres', name: 'Elevação Frontal Alternada', group: 'Ombros', equipment: 'Halteres', cue: 'Subir até a linha dos olhos com cadência excêntrica de 2s.' },
  { id: 'ex-elevacao-frontal-corda', name: 'Elevação Frontal na Polia com Corda', group: 'Ombros', equipment: 'Polia Baixa & Corda', cue: 'Tensão vertical contínua na porção anterior.' },
  { id: 'ex-face-pull-corda', name: 'Face Pull na Polia Alta com Corda', group: 'Ombros', equipment: 'Polia Alta & Corda', cue: 'Puxar em direção às têmporas com rotação externa.' },
  { id: 'ex-remada-alta-barra-w', name: 'Remada Alta com Barra W', group: 'Ombros', equipment: 'Barra W', cue: 'Pegada na largura dos ombros sem elevar cotovelos acima do pescoço.' },
  { id: 'ex-encolhimento-barra', name: 'Encolhimento de Ombros com Barra', group: 'Ombros', equipment: 'Barra Olímpica', cue: 'Elevação vertical de trapézio com pausa isométrica de 2s.' },
  { id: 'ex-encolhimento-halteres', name: 'Encolhimento com Halteres e Isometria', group: 'Ombros', equipment: 'Halteres Pesados', cue: 'Sem rotação dos ombros, apenas subida e descida limpa.' },

  // 4. BÍCEPS & ANTEBRAÇO (8)
  { id: 'ex-rosca-direta-barra-reta', name: 'Rosca Direta com Barra Reta', group: 'Bíceps', equipment: 'Barra Olímpica', cue: 'Flexão estrita sem embalo do tronco.' },
  { id: 'ex-rosca-direta-barra-w', name: 'Rosca Direta com Barra W', group: 'Bíceps', equipment: 'Barra W', cue: 'Conforto nos punhos e pico concêntrico.' },
  { id: 'ex-rosca-martelo-halteres', name: 'Rosca Martelo com Halteres', group: 'Bíceps', equipment: 'Halteres', cue: 'Pegada neutra ativando braquial e braquiorradial.' },
  { id: 'ex-rosca-martelo-corda', name: 'Rosca Martelo na Polia com Corda', group: 'Bíceps', equipment: 'Polia Baixa & Corda', cue: 'Tensão isométrica constante nos flexores.' },
  { id: 'ex-rosca-alternada-halteres', name: 'Rosca Alternada com Halteres', group: 'Bíceps', equipment: 'Halteres', cue: 'Giro completo do mindinho para dentro no topo.' },
  { id: 'ex-rosca-scott-barra-w', name: 'Rosca Scott no Banco com Barra W', group: 'Bíceps', equipment: 'Banco Scott & Barra W', cue: 'Isolamento da cabeça curta do bíceps sem alívio.' },
  { id: 'ex-rosca-inclinada-45-halteres', name: 'Rosca no Banco Inclinado 45°', group: 'Bíceps', equipment: 'Halteres & Banco 45°', cue: 'Alongamento máximo da cabeça longa do bíceps.' },
  { id: 'ex-rosca-concentrada-halter', name: 'Rosca Concentrada com Halter Sentado', group: 'Bíceps', equipment: 'Halter', cue: 'Apoio na coxa para eliminar qualquer trapaça.' },

  // 5. TRÍCEPS (9)
  { id: 'ex-triceps-corda-polia', name: 'Tríceps Corda na Polia Alta', group: 'Tríceps', equipment: 'Polia Alta & Corda', cue: 'Abertura das pontas da corda na extensão máxima.' },
  { id: 'ex-triceps-pulley-barra-reta', name: 'Tríceps Pulley com Barra Reta', group: 'Tríceps', equipment: 'Polia Alta & Barra Reta', cue: 'Sobrecarga progressiva nos cotovelos fixos.' },
  { id: 'ex-triceps-pulley-barra-v', name: 'Tríceps Pulley com Barra V', group: 'Tríceps', equipment: 'Polia Alta & Barra V', cue: 'Ângulo ergonômico favorável para carga alta.' },
  { id: 'ex-triceps-testa-barra-w', name: 'Tríceps Testa com Barra W no Banco Reto', group: 'Tríceps', equipment: 'Barra W & Banco', cue: 'Descida controlada da barra até o topo da testa.' },
  { id: 'ex-triceps-testa-halteres', name: 'Tríceps Testa com Halteres', group: 'Tríceps', equipment: 'Halteres', cue: 'Conforto nos tendões do cotovelo e maior arco.' },
  { id: 'ex-triceps-frances-unilateral', name: 'Tríceps Francês Unilateral com Halter', group: 'Tríceps', equipment: 'Halter', cue: 'Alongamento profundo da cabeça longa acima da cabeça.' },
  { id: 'ex-triceps-frances-polia-corda', name: 'Tríceps Francês na Polia com Corda', group: 'Tríceps', equipment: 'Polia & Corda', cue: 'Tensão de extensão contínua atrás da nuca.' },
  { id: 'ex-triceps-paralelas-peso', name: 'Mergulho em Paralelas Foco em Tríceps', group: 'Tríceps', equipment: 'Barras Paralelas', cue: 'Corpo vertical e cotovelos fechados apontando para trás.' },
  { id: 'ex-supino-fechado-barra', name: 'Supino com Pegada Fechada (Close-Grip)', group: 'Tríceps', equipment: 'Barra Olímpica', cue: 'Mãos na largura dos ombros com cotovelos rentes às costelas.' },

  // 6. PERNAS & POSTERIOR (13)
  { id: 'ex-agachamento-livre-barra', name: 'Agachamento Livre com Barra', group: 'Pernas', equipment: 'Barra Olímpica & Rack', cue: 'Descida até 90° com joelhos alinhados à ponta dos pés.' },
  { id: 'ex-agachamento-frontal-barra', name: 'Agachamento Frontal com Barra', group: 'Pernas', equipment: 'Barra Olímpica', cue: 'Tronco estritamente vertical e foco em quadríceps.' },
  { id: 'ex-leg-press-45', name: 'Leg Press 45°', group: 'Pernas', equipment: 'Máquina Leg Press 45°', cue: 'Pés na largura dos ombros sem travar articulação no topo.' },
  { id: 'ex-hack-squat-maquina', name: 'Agachamento Hack na Máquina', group: 'Pernas', equipment: 'Hack Machine', cue: 'Trajetória guiada com segurança e ênfase no vasto lateral.' },
  { id: 'ex-agachamento-smith', name: 'Agachamento no Smith Machine', group: 'Pernas', equipment: 'Smith Machine', cue: 'Pés ligeiramente avançados aliviando cisalhamento lombar.' },
  { id: 'ex-cadeira-extensora', name: 'Cadeira Extensora (Isolador)', group: 'Pernas', equipment: 'Cadeira Extensora', cue: 'Extensão completa com pico de contração de 1s.' },
  { id: 'ex-agachamento-bulgaro-halteres', name: 'Agachamento Búlgaro com Halteres', group: 'Pernas', equipment: 'Halteres & Banco', cue: 'Pé apoiado no banco com tronco levemente inclinado.' },
  { id: 'ex-afundo-passada-halteres', name: 'Avanço / Passada Caminhando com Halteres', group: 'Pernas', equipment: 'Halteres', cue: 'Passo largo mantendo joelho anterior a 90°.' },
  { id: 'ex-sissy-squat', name: 'Sissy Squat na Máquina ou Livre', group: 'Pernas', equipment: 'Máquina Sissy', cue: 'Alongamento e tensão mecânica extrema no reto femoral.' },
  { id: 'ex-stiff-halteres', name: 'Stiff com Halteres / RDL', group: 'Pernas', equipment: 'Halteres', cue: 'Empurrar os quadris para trás sem fletir a coluna.' },
  { id: 'ex-stiff-barra', name: 'Stiff com Barra Reta', group: 'Pernas', equipment: 'Barra Olímpica', cue: 'Barra raspando nas pernas para proteção da lombar.' },
  { id: 'ex-mesa-flexora', name: 'Mesa Flexora Deitada (Leg Curl)', group: 'Pernas', equipment: 'Mesa Flexora', cue: 'Quadril pressionado ao banco na flexão dos joelhos.' },
  { id: 'ex-cadeira-flexora', name: 'Cadeira Flexora Sentada', group: 'Pernas', equipment: 'Cadeira Flexora', cue: 'Alavanca longa exigindo recrutamento de isquiotibiais.' },

  // 7. GLÚTEOS & PANTURRILHAS (8)
  { id: 'ex-elevacao-pelvica-barra', name: 'Elevação Pélvica com Barra (Hip Thrust)', group: 'Glúteos', equipment: 'Barra & Banco', cue: 'Contração máxima no topo com queixo recolhido.' },
  { id: 'ex-elevacao-pelvica-maquina', name: 'Elevação Pélvica na Máquina', group: 'Glúteos', equipment: 'Máquina Hip Thrust', cue: 'Estabilidade guiada para sobrecarga sem desconforto.' },
  { id: 'ex-cadeira-abdutora', name: 'Cadeira Abdutora', group: 'Glúteos', equipment: 'Cadeira Abdutora', cue: 'Tronco inclinado para pico de glúteo médio e mínimo.' },
  { id: 'ex-gluteo-coice-polia', name: 'Glúteo Coice na Polia Baixa', group: 'Glúteos', equipment: 'Polia Baixa', cue: 'Extensão de quadril pura sem girar a pelve.' },
  { id: 'ex-panturrilha-em-pe-maquina', name: 'Elevação de Panturrilha em Pé', group: 'Panturrilhas', equipment: 'Máquina de Panturrilha', cue: 'Alongamento fascial profundo no gastrocnêmio.' },
  { id: 'ex-panturrilha-sentado-soleo', name: 'Elevação de Panturrilha Sentado (Sóleo)', group: 'Panturrilhas', equipment: 'Máquina de Sóleo', cue: 'Joelhos flexionados a 90° isolando o sóleo.' },
  { id: 'ex-panturrilha-leg-press-45', name: 'Panturrilha no Leg Press 45°', group: 'Panturrilhas', equipment: 'Leg Press 45°', cue: 'Pressão na bola do dedão com arco plantar firme.' },
  { id: 'ex-panturrilha-unilateral-degrau', name: 'Elevação Unilateral no Degrau', group: 'Panturrilhas', equipment: 'Degrau & Halter', cue: 'Amplitude total eliminando assimetrias entre pernas.' },

  // 8. ABDÔMEN DINÂMICO & CORE (8)
  { id: 'ex-abdominal-polia-cable-crunch', name: 'Abdominal na Polia Alta (Cable Crunch)', group: 'Abdômen', equipment: 'Polia Alta & Corda', cue: 'Aproxime as costelas do quadril sem puxar com os braços.' },
  { id: 'ex-abdominal-infra-paralela', name: 'Elevação de Pernas na Torre / Paralelas', group: 'Abdômen', equipment: 'Torre Abdominal', cue: 'Retroverso pélvico no topo ativando o infra-abdominal.' },
  { id: 'ex-roda-abdominal-abwheel', name: 'Rolamento com Roda Abdominal (Ab Wheel)', group: 'Abdômen', equipment: 'Roda Abdominal', cue: 'Transverso do abdômen ativado sem hiperextensão lombar.' },
  { id: 'ex-abdominal-supra-solo', name: 'Abdominal Crunch Tradicional', group: 'Abdômen', equipment: 'Anilha / Solo', cue: 'Enrolamento torácico controlado sem puxar o pescoço.' },
  { id: 'ex-russian-twist-anilha', name: 'Giro Russo (Russian Twist) com Anilha', group: 'Abdômen', equipment: 'Anilha', cue: 'Rotação controlada do tronco recrutando os oblíquos.' },
  { id: 'ex-prancha-isometrica', name: 'Stomach Vacuum (Vácuo Abdominal)', group: 'Abdômen', equipment: 'Corpo Livre', cue: 'Sucção do umbigo em direção à coluna para estabilidade profunda.' },
  { id: 'ex-prancha-lateral-estatica', name: 'Elevação de Pernas na Barra Fixa', group: 'Abdômen', equipment: 'Barra Fixa', cue: 'Eleve os joelhos até a linha do peito sem balanço.' },
  { id: 'ex-crunch-declinado', name: 'Crunch no Banco Declinado com Anilha', group: 'Abdômen', equipment: 'Banco Declinado', cue: 'Sobrecarga de flexão espinhal com torque máximo.' },

  // 9. CARDIO (3)
  { id: 'ex-corrida-ao-ar-livre', name: 'Simulador de Escadas (Stairmaster)', group: 'Cardio', equipment: 'Stairmaster', cue: 'Nível 7 a 9 sem apoiar o peso do corpo nos braços.' },
  { id: 'ex-esteira-inclinada-12', name: 'Esteira Inclinada (Incline Treadmill Walk)', group: 'Cardio', equipment: 'Esteira', cue: 'Inclinação de 10% a 12% a 5.4 km/h sem impacto.' },
  { id: 'ex-bicicleta-ergometrica-spinning', name: 'Bicicleta Ergométrica Regenerativa', group: 'Cardio', equipment: 'Bicicleta Ergométrica', cue: 'Cadência de 85 a 95 RPM para flush de lactato.' },
];

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  onClose,
  onSelectExercise,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Todos');
  const [previewExercise, setPreviewExercise] = useState<CatalogExercise | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const groups = ['Todos', 'Peitoral', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Panturrilhas', 'Abdômen', 'Cardio'];

  const filteredExercises = useMemo(() => {
    return ALL_104_FORZON_EXERCISES.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.cue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGroup = selectedGroup === 'Todos' || ex.group === selectedGroup;

      return matchesSearch && matchesGroup;
    });
  }, [searchTerm, selectedGroup]);

  // Autoplay da prévia
  useEffect(() => {
    if (previewExercise && previewVideoRef.current) {
      previewVideoRef.current.currentTime = 0;
      previewVideoRef.current.play().catch(() => {});
    }
  }, [previewExercise]);

  const videoUrl = previewExercise ? `/assets/exercise-videos/${previewExercise.id}.mp4` : '';
  const posterUrl = previewExercise ? `/assets/exercise-videos/${previewExercise.id}.png` : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#0a0e17] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-4 space-y-3.5 shadow-[0_0_40px_rgba(0,210,255,0.2)] max-h-[92vh] flex flex-col">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider block">
                CATÁLOGO TÉCNICO OFICIAL
              </span>
              <h3 className="text-sm font-black text-white">
                Biblioteca de 104 Exercícios ({filteredExercises.length})
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por exercício, máquina ou músculo..."
            className="w-full bg-[#0f131c] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00d2ff] outline-none"
          />
        </div>

        {/* Filtro por Grupamento Muscular */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-all cursor-pointer ${
                selectedGroup === grp
                  ? 'bg-cyan-950/90 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_10px_rgba(0,210,255,0.2)]'
                  : 'bg-[#0f131c] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Lista de Exercícios */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {filteredExercises.map((ex, idx) => (
            <div
              key={ex.id}
              onClick={() => setPreviewExercise(ex)}
              className="p-3 rounded-2xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-slate-400">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#00d2ff] transition-colors">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                    <span className="text-[#00d2ff] font-semibold">{ex.group}</span>
                    <span>•</span>
                    <span className="truncate max-w-[170px]">{ex.equipment}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-500/20 flex items-center justify-center text-[#00d2ff]">
                  <Video className="w-3.5 h-3.5" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Prévia com Vídeo MP4 Direto */}
        {previewExercise && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0a0e17] border border-cyan-500/50 rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-[0_0_40px_rgba(0,210,255,0.25)]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white truncate max-w-[210px]">
                  {previewExercise.name}
                </h4>
                <button onClick={() => setPreviewExercise(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Player do Vídeo ex-*.mp4 */}
              <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-cyan-500/40 relative flex items-center justify-center">
                <video
                  ref={previewVideoRef}
                  key={videoUrl}
                  src={videoUrl}
                  poster={posterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  webkit-playsinline="true"
                  preload="auto"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Ficha Biomecânica */}
              <div className="p-3 rounded-xl bg-[#0f131c] border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Aparelho:</span>
                  <strong className="text-white">{previewExercise.equipment}</strong>
                </div>
                <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800 leading-relaxed">
                  <strong>Ponto Crítico:</strong> {previewExercise.cue}
                </p>
              </div>

              <div className="flex gap-2">
                {onSelectExercise && (
                  <button
                    onClick={() => {
                      onSelectExercise(previewExercise);
                      setPreviewExercise(null);
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#00d2ff] text-neutral-950 font-black text-xs hover:bg-cyan-400 cursor-pointer"
                  >
                    Usar no Treino Atual
                  </button>
                )}
                <button
                  onClick={() => setPreviewExercise(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
