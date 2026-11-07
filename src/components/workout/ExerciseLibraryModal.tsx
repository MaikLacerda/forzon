import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Dumbbell,
  Sparkles,
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

// Lista oficial com os 104 exercícios catalogados do FORZON
export const ALL_104_FORZON_EXERCISES: CatalogExercise[] = [
  // 1. PEITORAL (15 exercícios)
  { id: 'ex-supino-inclinado-halteres', name: 'Supino Inclinado com Halteres', group: 'Peitoral', equipment: 'Halteres & Banco 30°', cue: 'Pegada neutra a 30° com retração escapular ativa.' },
  { id: 'ex-supino-reto-barra', name: 'Supino Reto com Barra Olímpica', group: 'Peitoral', equipment: 'Barra Olímpica & Banco Reto', cue: 'Descida controlada até a linha do esterno.' },
  { id: 'ex-supino-reto-halteres', name: 'Supino Reto com Halteres', group: 'Peitoral', equipment: 'Halteres & Banco', cue: 'Maior amplitude articular sem estalar ombros.' },
  { id: 'ex-supino-inclinado-barra', name: 'Supino Inclinado com Barra', group: 'Peitoral', equipment: 'Barra Olímpica', cue: 'Foco em feixes claviculares do peitoral superior.' },
  { id: 'ex-supino-declinado-barra', name: 'Supino Declinado com Barra (Canadense)', group: 'Peitoral', equipment: 'Barra & Banco Declinado', cue: 'Ênfase nos feixes inferiores do peitoral.' },
  { id: 'ex-supino-declinado-halteres', name: 'Supino Declinado com Halteres', group: 'Peitoral', equipment: 'Halteres', cue: 'Estabilidade axial e conforto no manguito rotador.' },
  { id: 'ex-supino-articulado-maquina', name: 'Supino Reto na Máquina Articulada', group: 'Peitoral', equipment: 'Máquina Articulada', cue: 'Trajetória guiada convergente para sobrecarga segura.' },
  { id: 'ex-crucifixo-reto-halteres', name: 'Crucifixo Reto com Halteres', group: 'Peitoral', equipment: 'Halteres', cue: 'Alongamento fascial peitoral sem hiperestender cotovelos.' },
  { id: 'ex-crucifixo-inclinado-halteres', name: 'Crucifixo Inclinado com Halteres', group: 'Peitoral', equipment: 'Halteres', cue: 'Abertura em arco preservando escápulas travadas.' },
  { id: 'ex-peck-deck', name: 'Voador Peitoral / Peck Deck', group: 'Peitoral', equipment: 'Máquina Peck Deck', cue: 'Pico de contração de 1s no centro do tórax.' },
  { id: 'ex-crossover-polia-media', name: 'Crucifixo no Crossover (Polia Média)', group: 'Peitoral', equipment: 'Crossover', cue: 'Tensão constante em todo o arco do movimento.' },
  { id: 'ex-crossover-polia-alta', name: 'Crossover na Polia Alta (Foco Inferior)', group: 'Peitoral', equipment: 'Polia Alta', cue: 'Vetor descendente de força para feixes esternais.' },
  { id: 'ex-crossover-polia-baixa', name: 'Crossover na Polia Baixa (Foco Superior)', group: 'Peitoral', equipment: 'Polia Baixa', cue: 'Vetor ascendente ativando o peitoral superior.' },
  { id: 'ex-paralelas-peitoral', name: 'Paralelas com Foco em Peitoral (Chest Dips)', group: 'Peitoral', equipment: 'Barras Paralelas', cue: 'Tronco inclinado à frente em 30°.' },
  { id: 'ex-pullover-halter', name: 'Pullover com Halter no Banco Plano', group: 'Peitoral', equipment: 'Halter', cue: 'Expansão da caixa torácica e serrátil anterior.' },

  // 2. COSTAS / DORSAIS (14 exercícios)
  { id: 'ex-puxada-frontal-polia-alta', name: 'Puxada Frontal na Polia Alta', group: 'Costas', equipment: 'Polia Alta com Barra', cue: 'Puxe direcionando cotovelos para os bolsos da calça.' },
  { id: 'ex-barra-fixa-pronada', name: 'Barra Fixa Pronada (Pull-Up)', group: 'Costas', equipment: 'Barra Fixa', cue: 'Acionamento de latíssimo com queixo passando da barra.' },
  { id: 'ex-barra-fixa-supinada', name: 'Barra Fixa Supinada (Chin-Up)', group: 'Costas', equipment: 'Barra Fixa', cue: 'Participação ativa de bíceps e grande dorsal.' },
  { id: 'ex-puxada-triangulo', name: 'Puxada Alta com Triângulo (Pegada Neutra)', group: 'Costas', equipment: 'Polia Alta', cue: 'Maior recrutamento de densidade dorsal central.' },
  { id: 'ex-remada-curvada-barra', name: 'Remada Curvada com Barra', group: 'Costas', equipment: 'Barra Olímpica', cue: 'Tronco a 45° mantendo curvatura lombar anatômica.' },
  { id: 'ex-remada-serrote-halter', name: 'Remada Unilateral com Halter (Serrote)', group: 'Costas', equipment: 'Halter & Banco', cue: 'Apoio firme no banco sem rotação excessiva do tronco.' },
  { id: 'ex-remada-cavalinho', name: 'Remada Cavalinho / T-Bar com Barra', group: 'Costas', equipment: 'Barra T-Bar', cue: 'Esmague os rombóides na fase concêntrica máxima.' },
  { id: 'ex-remada-baixa-triangulo', name: 'Remada Baixa na Polia com Triângulo', group: 'Costas', equipment: 'Polia Baixa', cue: 'Alongamento dorsal sem curvar a espinha torácica.' },
  { id: 'ex-remada-maquina-articulada', name: 'Remada Articulada na Máquina', group: 'Costas', equipment: 'Máquina Articulada', cue: 'Sobrecarga miofibrilar com apoio estável no peito.' },
  { id: 'ex-pulldown-polia-alta', name: 'Pulldown na Polia Alta com Corda', group: 'Costas', equipment: 'Polia Alta & Corda', cue: 'Isolamento de grande dorsal sem flexão dos cotovelos.' },
  { id: 'ex-levantamento-terra', name: 'Levantamento Terra Convencional', group: 'Costas', equipment: 'Barra Olímpica & Anilhas', cue: 'Puxada da cadeia posterior com ativação de glúteos e eretores.' },
  { id: 'ex-crucifixo-invertido-halteres', name: 'Crucifixo Invertido com Halteres', group: 'Costas', equipment: 'Halteres', cue: 'Ativação precisa de deltóide posterior e trapézio médio.' },
  { id: 'ex-voador-invertido-maquina', name: 'Voador Invertido no Peck Deck', group: 'Costas', equipment: 'Máquina Peck Deck', cue: 'Manter braços quase retos sem elevar os ombros.' },
  { id: 'ex-hiperextensao-lombar-45', name: 'Hiperextensão Lombar no Banco 45°', group: 'Costas', equipment: 'Banco 45°', cue: 'Fortalecimento dos eretores da espinha e lombar.' },

  // 3. DELTÓIDES & TRAPÉZIO (13 exercícios)
  { id: 'ex-desenvolvimento-halteres-sentado', name: 'Desenvolvimento com Halteres Sentado', group: 'Ombros', equipment: 'Halteres & Banco 80°', cue: 'Empurrar vertical sem bater os halteres no topo.' },
  { id: 'ex-desenvolvimento-militar-em-pe', name: 'Desenvolvimento Militar em Pé (OHP)', group: 'Ombros', equipment: 'Barra Olímpica', cue: 'Core e glúteos travados para sustentação axial.' },
  { id: 'ex-desenvolvimento-arnold', name: 'Desenvolvimento Arnold com Halteres', group: 'Ombros', equipment: 'Halteres', cue: 'Rotação coordenada de 180° dos punhos.' },
  { id: 'ex-desenvolvimento-maquina', name: 'Desenvolvimento de Ombros na Máquina', group: 'Ombros', equipment: 'Máquina Articulada', cue: 'Estabilidade guiada para falha concêntrica segura.' },
  { id: 'ex-elevacao-lateral-halteres', name: 'Elevação Lateral com Halteres', group: 'Ombros', equipment: 'Halteres', cue: 'Plano escapular com cotovelos liderando a subida.' },
  { id: 'ex-elevacao-lateral-polia-baixa', name: 'Elevação Lateral na Polia Baixa', group: 'Ombros', equipment: 'Polia Baixa', cue: 'Tensão sob torque mecânico constante desde o início.' },
  { id: 'ex-elevacao-lateral-banco-inclinado', name: 'Elevação Lateral no Banco Inclinado', group: 'Ombros', equipment: 'Halter & Banco 60°', cue: 'Isolamento da cabeça lateral do deltóide em alongamento.' },
  { id: 'ex-elevacao-frontal-halteres', name: 'Elevação Frontal Alternada', group: 'Ombros', equipment: 'Halteres', cue: 'Subir até a linha dos olhos com cadência excêntrica de 2s.' },
  { id: 'ex-elevacao-frontal-polia-corda', name: 'Elevação Frontal na Polia com Corda', group: 'Ombros', equipment: 'Polia Baixa & Corda', cue: 'Tensão vertical contínua na porção anterior.' },
  { id: 'ex-face-pull-polia-corda', name: 'Face Pull na Polia Alta com Corda', group: 'Ombros', equipment: 'Polia Alta & Corda', cue: 'Puxar em direção às têmporas com rotação externa.' },
  { id: 'ex-remada-alta-barra-w', name: 'Remada Alta com Barra W', group: 'Ombros', equipment: 'Barra W', cue: 'Pegada na largura dos ombros sem elevar cotovelos acima do pescoço.' },
  { id: 'ex-encolhimento-ombros-barra', name: 'Encolhimento de Ombros com Barra', group: 'Ombros', equipment: 'Barra Olímpica', cue: 'Elevação vertical de trapézio com pausa isométrica de 2s.' },
  { id: 'ex-encolhimento-halteres', name: 'Encolhimento com Halteres e Isometria', group: 'Ombros', equipment: 'Halteres Pesados', cue: 'Sem rotação dos ombros, apenas subida e descida limpa.' },

  // 4. BÍCEPS & ANTEBRAÇO (8 exercícios)
  { id: 'ex-rosca-direta-barra-reta', name: 'Rosca Direta com Barra Reta', group: 'Bíceps', equipment: 'Barra Olímpica', cue: 'Flexão estrita sem embalo do tronco.' },
  { id: 'ex-rosca-direta-barra-w', name: 'Rosca Direta com Barra W', group: 'Bíceps', equipment: 'Barra W', cue: 'Conforto nos punhos e pico concêntrico.' },
  { id: 'ex-rosca-martelo-halteres', name: 'Rosca Martelo com Halteres', group: 'Bíceps', equipment: 'Halteres', cue: 'Pegada neutra ativando braquial e braquiorradial.' },
  { id: 'ex-rosca-martelo-polia-corda', name: 'Rosca Martelo na Polia com Corda', group: 'Bíceps', equipment: 'Polia Baixa & Corda', cue: 'Tensão isométrica constante nos flexores.' },
  { id: 'ex-rosca-alternada-supinacao', name: 'Rosca Alternada com Halteres e Supinação', group: 'Bíceps', equipment: 'Halteres', cue: 'Giro completo do mindinho para dentro no topo.' },
  { id: 'ex-rosca-scott-barra-w', name: 'Rosca Scott no Banco com Barra W', group: 'Bíceps', equipment: 'Banco Scott & Barra W', cue: 'Isolamento da cabeça curta do bíceps sem alívio.' },
  { id: 'ex-rosca-inclinada-banco-45', name: 'Rosca no Banco Inclinado 45°', group: 'Bíceps', equipment: 'Halteres & Banco 45°', cue: 'Alongamento máximo da cabeça longa do bíceps.' },
  { id: 'ex-rosca-concentrada-halter', name: 'Rosca Concentrada com Halter Sentado', group: 'Bíceps', equipment: 'Halter', cue: 'Apoio na coxa para eliminar qualquer trapaça.' },

  // 5. TRÍCEPS (9 exercícios)
  { id: 'ex-triceps-corda-polia-alta', name: 'Tríceps Corda na Polia Alta', group: 'Tríceps', equipment: 'Polia Alta & Corda', cue: 'Abertura das pontas da corda na extensão máxima.' },
  { id: 'ex-triceps-pulley-barra-reta', name: 'Tríceps Pulley com Barra Reta', group: 'Tríceps', equipment: 'Polia Alta & Barra Reta', cue: 'Sobrecarga progressiva nos cotovelos fixos.' },
  { id: 'ex-triceps-pulley-barra-v', name: 'Tríceps Pulley com Barra V', group: 'Tríceps', equipment: 'Polia Alta & Barra V', cue: 'Ângulo ergonômico favorável para carga alta.' },
  { id: 'ex-triceps-testa-barra-w', name: 'Tríceps Testa com Barra W no Banco Reto', group: 'Tríceps', equipment: 'Barra W & Banco', cue: 'Descida controlada da barra até o topo da testa.' },
  { id: 'ex-triceps-testa-halteres', name: 'Tríceps Testa com Halteres (Pegada Neutra)', group: 'Tríceps', equipment: 'Halteres', cue: 'Conforto nos tendões do cotovelo e maior arco.' },
  { id: 'ex-triceps-frances-halter', name: 'Tríceps Francês Unilateral com Halter', group: 'Tríceps', equipment: 'Halter', cue: 'Alongamento profundo da cabeça longa acima da cabeça.' },
  { id: 'ex-triceps-frances-polia-corda', name: 'Tríceps Francês na Polia com Corda', group: 'Tríceps', equipment: 'Polia & Corda', cue: 'Tensão de extensão contínua atrás da nuca.' },
  { id: 'ex-mergulho-paralelas-triceps', name: 'Mergulho em Paralelas Foco em Tríceps', group: 'Tríceps', equipment: 'Barras Paralelas', cue: 'Corpo vertical e cotovelos fechados apontando para trás.' },
  { id: 'ex-supino-pegada-fechada', name: 'Supino com Pegada Fechada (Close-Grip)', group: 'Tríceps', equipment: 'Barra Olímpica', cue: 'Mãos na largura dos ombros com cotovelos rentes às costelas.' },

  // 6. QUADRÍCEPS & MEMBROS INFERIORES (13 exercícios)
  { id: 'ex-agachamento-livre-barra', name: 'Agachamento Livre com Barra', group: 'Pernas', equipment: 'Barra Olímpica & Rack', cue: 'Descida até 90° com joelhos alinhados à ponta dos pés.' },
  { id: 'ex-agachamento-frontal-barra', name: 'Agachamento Frontal com Barra (Front Squat)', group: 'Pernas', equipment: 'Barra Olímpica', cue: 'Tronco estritamente vertical e foco em quadríceps.' },
  { id: 'ex-leg-press-45', name: 'Leg Press 45°', group: 'Pernas', equipment: 'Máquina Leg Press 45°', cue: 'Pés na largura dos ombros sem travar articulação no topo.' },
  { id: 'ex-agachamento-hack', name: 'Agachamento Hack na Máquina', group: 'Pernas', equipment: 'Hack Machine', cue: 'Trajetória guiada com segurança e ênfase no vasto lateral.' },
  { id: 'ex-agachamento-smith', name: 'Agachamento no Smith Machine', group: 'Pernas', equipment: 'Smith Machine', cue: 'Pés ligeiramente avançados aliviando cisalhamento lombar.' },
  { id: 'ex-cadeira-extensora', name: 'Cadeira Extensora (Isolador de Quadríceps)', group: 'Pernas', equipment: 'Cadeira Extensora', cue: 'Extensão completa com pico de contração de 1s.' },
  { id: 'ex-agachamento-bulgaro-halteres', name: 'Agachamento Búlgaro com Halteres', group: 'Pernas', equipment: 'Halteres & Banco', cue: 'Pé apoiado no banco com tronco levemente inclinado.' },
  { id: 'ex-passada-avanco-halteres', name: 'Avanço / Passada Caminhando com Halteres', group: 'Pernas', equipment: 'Halteres', cue: 'Passo largo mantendo joelho anterior a 90°.' },
  { id: 'ex-sissy-squat', name: 'Sissy Squat na Máquina ou Livre', group: 'Pernas', equipment: 'Máquina Sissy', cue: 'Alongamento e tensão mecânica extrema no reto femoral.' },
  { id: 'ex-stiff-halteres-rdl', name: 'Stiff com Halteres / RDL', group: 'Pernas', equipment: 'Halteres', cue: 'Empurrar os quadris para trás sem fletir a coluna.' },
  { id: 'ex-stiff-barra-reta', name: 'Stiff com Barra Reta', group: 'Pernas', equipment: 'Barra Olímpica', cue: 'Barra raspando nas pernas para proteção da lombar.' },
  { id: 'ex-mesa-flexora-deitada', name: 'Mesa Flexora Deitada (Leg Curl)', group: 'Pernas', equipment: 'Mesa Flexora', cue: 'Quadril pressionado ao banco na flexão dos joelhos.' },
  { id: 'ex-cadeira-flexora-sentada', name: 'Cadeira Flexora Sentada', group: 'Pernas', equipment: 'Cadeira Flexora', cue: 'Alavanca longa exigindo recrutamento de isquiotibiais.' },

  // 7. GLÚTEOS & PANTURRILHAS (8 exercícios)
  { id: 'ex-elevacao-pelvica-barra', name: 'Elevação Pélvica com Barra (Hip Thrust)', group: 'Glúteos', equipment: 'Barra & Banco', cue: 'Contração máxima no topo com queixo recolhido.' },
  { id: 'ex-elevacao-pelvica-maquina', name: 'Elevação Pélvica na Máquina', group: 'Glúteos', equipment: 'Máquina Hip Thrust', cue: 'Estabilidade guiada para sobrecarga sem desconforto.' },
  { id: 'ex-cadeira-abdutora', name: 'Cadeira Abdutora (Tronco Inclinado à Frente)', group: 'Glúteos', equipment: 'Cadeira Abdutora', cue: 'Tronco inclinado para pico de glúteo médio e mínimo.' },
  { id: 'ex-gluteo-coice-polia-baixa', name: 'Glúteo Coice na Polia Baixa com Caneleira', group: 'Glúteos', equipment: 'Polia Baixa', cue: 'Extensão de quadril pura sem girar a pelve.' },
  { id: 'ex-panturrilha-em-pe-maquina', name: 'Elevação de Panturrilha em Pé na Máquina', group: 'Panturrilhas', equipment: 'Máquina de Panturrilha em Pé', cue: 'Alongamento fascial profundo no gastrocnêmio.' },
  { id: 'ex-panturrilha-sentado-soleo', name: 'Elevação de Panturrilha Sentado (Sóleo)', group: 'Panturrilhas', equipment: 'Máquina de Sóleo', cue: 'Joelhos flexionados a 90° isolando o sóleo.' },
  { id: 'ex-panturrilha-leg-press-45', name: 'Panturrilha no Leg Press 45°', group: 'Panturrilhas', equipment: 'Leg Press 45°', cue: 'Pressão na bola do dedão com arco plantar firme.' },
  { id: 'ex-panturrilha-unilateral-degrau', name: 'Elevação Unilateral no Degrau com Halter', group: 'Panturrilhas', equipment: 'Degrau & Halter', cue: 'Amplitude total eliminando assimetrias entre pernas.' },

  // 8. ABDÔMEN DINÂMICO & CORE (8 exercícios)
  { id: 'ex-cable-crunch-polia-alta', name: 'Abdominal na Polia Alta Ajoelhado (Cable Crunch)', group: 'Abdômen', equipment: 'Polia Alta & Corda', cue: 'Aproxime as costelas do quadril sem puxar com os braços.' },
  { id: 'ex-elevacao-pernas-paralela', name: 'Elevação de Pernas na Torre / Paralelas', group: 'Abdômen', equipment: 'Torre Abdominal', cue: 'Retroverso pélvico no topo ativando o infra-abdominal.' },
  { id: 'ex-ab-wheel-rollout', name: 'Rolamento com Roda Abdominal (Ab Wheel)', group: 'Abdômen', equipment: 'Roda Abdominal', cue: 'Transverso do abdômen ativado sem hiperextensão lombar.' },
  { id: 'ex-crunch-solo-carga', name: 'Abdominal Crunch Tradicional com Carga', group: 'Abdômen', equipment: 'Anilha / Solo', cue: 'Enrolamento torácico controlado sem puxar o pescoço.' },
  { id: 'ex-russian-twist-anilha', name: 'Giro Russo (Russian Twist) com Anilha', group: 'Abdômen', equipment: 'Anilha', cue: 'Rotação controlada do tronco recrutando os oblíquos.' },
  { id: 'ex-stomach-vacuum', name: 'Stomach Vacuum (Vácuo Abdominal)', group: 'Abdômen', equipment: 'Corpo Livre', cue: 'Sucção do umbigo em direção à coluna para estabilidade profunda.' },
  { id: 'ex-elevacao-pernas-barra-fixa', name: 'Elevação de Pernas na Barra Fixa', group: 'Abdômen', equipment: 'Barra Fixa', cue: 'Eleve os joelhos até a linha do peito sem balanço.' },
  { id: 'ex-crunch-declinado', name: 'Crunch no Banco Declinado com Anilha', group: 'Abdômen', equipment: 'Banco Declinado', cue: 'Sobrecarga de flexão espinhal com torque máximo.' },

  // 9. CARDIO & CONDICIONAMENTO METABÓLICO (16 exercícios)
  { id: 'ex-stairmaster-intervalado', name: 'Simulador de Escadas (Stairmaster Intervalado)', group: 'Cardio', equipment: 'Stairmaster', cue: 'Nível 7 a 9 sem apoiar o peso do corpo nos braços.' },
  { id: 'ex-esteira-inclinada-12', name: 'Esteira Inclinada (Incline Treadmill Walk)', group: 'Cardio', equipment: 'Esteira', cue: 'Inclinação de 10% a 12% a 5.4 km/h sem impacto.' },
  { id: 'ex-bicicleta-ergometrica-spinning', name: 'Bicicleta Ergométrica / Spinning Regenerativo', group: 'Cardio', equipment: 'Bicicleta Ergométrica', cue: 'Cadência de 85 a 95 RPM para flush de lactato.' },
  { id: 'ex-corrida-rua-outdoor', name: 'Corrida Contínua / Fartlek com GPS', group: 'Cardio', equipment: 'GPS / Pista', cue: 'Zona 2 cardíaca para expansão da base mitocondrial.' },
  { id: 'ex-skierg-hyrox', name: 'SkiErg Intervalado (Estação Hyrox)', group: 'Cardio', equipment: 'SkiErg', cue: 'Potência na puxada utilizando quadris e dorsais.' },
  { id: 'ex-sled-push-trenoh', name: 'Sled Push (Empurrar Trenó na Pista)', group: 'Cardio', equipment: 'Trenó & Grama', cue: 'Geração contínua de força horizontal nas pernas.' },
  { id: 'ex-wall-balls-cross', name: 'Wall Balls com Medicine Ball', group: 'Cardio', equipment: 'Medicine Ball & Alvo', cue: 'Agachamento completo e arremesso preciso a 3 metros.' },
  { id: 'ex-tiros-50m-natacao', name: 'Tiros de 50m Nado Crawl (Estilo Livre)', group: 'Cardio', equipment: 'Piscina', cue: 'Resistência aeróbica com zero estresse osteoarticular.' },
  { id: 'ex-shadow-boxing-halteres', name: 'Shadow Boxing com Halteres Leves', group: 'Cardio', equipment: 'Halteres de 1kg a 2kg', cue: 'Velocidade e queima metabólica para lutas e boxe.' },
  { id: 'ex-sprawl-defesa-quedas', name: 'Sprawl Explosivo de Defesa de Quedas', group: 'Cardio', equipment: 'Tatame', cue: 'Condicionamento tático para Jiu-Jitsu e MMA.' },
  { id: 'ex-thruster-olimpica', name: 'Thruster com Barra Olímpica', group: 'Cardio', equipment: 'Barra Olímpica', cue: 'Movimento composto de agachamento profundo com push press.' },
  { id: 'ex-salto-areia-fofa', name: 'Salto e Deslocamento na Areia Fofa', group: 'Cardio', equipment: 'Praia / Areia', cue: 'Fortalecimento de tornozelos e queima calórica intensa.' },
  { id: 'ex-muscle-up-barra', name: 'Muscle-Up na Barra Fixa', group: 'Cardio', equipment: 'Barra Alta', cue: 'Transição explosiva da puxada para o mergulho.' },
  { id: 'ex-cardio-dance-ritmico', name: 'Cardio Dance Rítmico', group: 'Cardio', equipment: 'Espaço Livre', cue: 'Frequência cardíaca elevada com alta adesão psicológica.' },
  { id: 'ex-remador-indoor-concept2', name: 'Remo Indoor Concept2', group: 'Cardio', equipment: 'Remo Ergômetro', cue: 'Impulsão com as pernas, tronco em pêndulo e puxada final.' },
  { id: 'ex-bike-airdyne-assault', name: 'Air Bike / Assault Bike (Sprints)', group: 'Cardio', equipment: 'Assault Bike', cue: 'Queima metabólica anaeróbica com esforço total de braços e pernas.' },
];

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  onClose,
  onSelectExercise,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Todos');
  const [previewExercise, setPreviewExercise] = useState<CatalogExercise | null>(null);

  const groups = ['Todos', 'Peitoral', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Panturrilhas', 'Abdômen', 'Cardio'];

  // Filtro Dinâmico
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

        {/* Lista Rolável com os Exercícios */}
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

          {filteredExercises.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              Nenhum exercício encontrado para "{searchTerm}".
            </div>
          )}
        </div>

        {/* Modal de Prévia Biomecânica sem Buffer Infinito */}
        {previewExercise && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0a0e17] border border-cyan-500/50 rounded-3xl max-w-sm w-full p-5 space-y-3.5 shadow-[0_0_40px_rgba(0,210,255,0.25)]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#00d2ff]" />
                  <h4 className="text-xs font-bold text-white truncate max-w-[210px]">
                    {previewExercise.name}
                  </h4>
                </div>
                <button onClick={() => setPreviewExercise(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Caixa Biomecânica Instantânea */}
              <div className="w-full h-52 rounded-2xl bg-gradient-to-b from-cyan-950/40 via-[#0a0e17] to-[#07090e] border border-cyan-500/30 overflow-hidden relative flex flex-col items-center justify-center p-4 text-center shadow-inner">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.3)] mb-2">
                  <Sparkles className="w-7 h-7 animate-pulse text-[#00d2ff]" />
                </div>
                <span className="text-[10px] font-mono text-[#00d2ff] font-bold uppercase block tracking-wider">
                  GUIA BIOMECÂNICO & EXECUÇÃO TÉCNICA
                </span>
                <h5 className="text-sm font-black text-white mt-0.5">{previewExercise.name}</h5>
                <p className="text-xs text-slate-300 mt-1">
                  Aparelho: <strong className="text-white">{previewExercise.equipment}</strong>
                </p>
              </div>

              {/* Ficha Biomecânica */}
              <div className="p-3 rounded-xl bg-[#0f131c] border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Grupamento:</span>
                  <strong className="text-[#00d2ff]">{previewExercise.group}</strong>
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
                  Voltar à Lista
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};