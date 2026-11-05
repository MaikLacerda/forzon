import { Exercise } from "../types";

export const EXERCISE_LIBRARY: Exercise[] = [
  // =========================================================================
  // --- 1. PEITORAL (CHEST) ---
  // =========================================================================
  {
    id: "ex-supino-reto-barra",
    name: "Supino Reto com Barra",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Tríceps", "Ombros"],
    equipment: "Barra",
    difficulty: "Intermediário",
    instructions: [
      "Deite no banco com os olhos alinhados verticalmente com a barra.",
      "Pegada ligeiramente além da largura dos ombros, punhos firmes e neutros.",
      "Abaixe a barra de forma controlada até o terço inferior do esterno (linha dos mamilos).",
      "Empurre a barra de volta com aceleração sem hiperextender ou projetar os ombros para frente."
    ],
    commonMistakes: [
      "Bater a barra violentamente contra o esterno.",
      "Cotovelos excessivamente abertos em 90 graus (risco ao manguito rotador).",
      "Descolar os glúteos ou a lombar excessivamente do banco."
    ],
    cues: ["Retraia e deprima as escápulas", "Pés cravados no chão (leg drive)", "Quebre a barra ao meio"],
    alternatives: ["Supino Reto com Halteres", "Supino na Máquina Articulada", "Flexão de Braço com Carga"]
  },
  {
    id: "ex-supino-reto-halteres",
    name: "Supino Reto com Halteres",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Tríceps", "Ombros"],
    equipment: "Halteres",
    difficulty: "Iniciante",
    instructions: [
      "Deite no banco segurando os halteres com apoio nos joelhos para entrada segura.",
      "Inicie com os halteres alinhados ao peito com pegada pronada ou semi-neutra.",
      "Desça os halteres alongando as fibras do peitoral até o nível do tronco.",
      "Empurre os halteres para cima convergindo ligeiramente sem encostá-los no topo."
    ],
    commonMistakes: [
      "Bater os halteres no topo perdendo a tensão mecânica.",
      "Deixar os cotovelos caírem abaixo da amplitude segura se houver instabilidade.",
      "Tirar a cabeça ou os glúteos do banco."
    ],
    cues: ["Aperte o peito na subida", "Cotovelos a 60 graus do tronco", "Estabilidade nos punhos"],
    alternatives: ["Supino Reto com Barra", "Supino Reto na Máquina", "Crucifixo Reto com Halteres"]
  },
  {
    id: "ex-supino-inclinado-halteres",
    name: "Supino Inclinado com Halteres",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Ombros", "Tríceps"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Ajuste o banco em uma inclinação anatômica entre 30° e 45°.",
      "Inicie com os halteres na altura do peito superior (porção clavicular).",
      "Empurre os halteres verticalmente em trajetória levemente convergente.",
      "Desça de forma excêntrica em 2 a 3 segundos sentindo o alongamento do feixe superior."
    ],
    commonMistakes: [
      "Inclinar o banco acima de 45° (recrutamento excessivo do deltóide anterior).",
      "Bater os halteres no pico da contração.",
      "Perder a retração escapular na fase concêntrica."
    ],
    cues: ["Peito apontado para o teto", "Cotovelos abaixo da linha dos ombros", "Pés firmes"],
    alternatives: ["Supino Inclinado com Barra", "Crucifixo Inclinado com Cabos", "Supino Inclinado na Máquina"]
  },
  {
    id: "ex-supino-inclinado-barra",
    name: "Supino Inclinado com Barra",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Ombros", "Tríceps"],
    equipment: "Barra",
    difficulty: "Intermediário",
    instructions: [
      "Ajuste o banco inclinado a 30° e segure a barra um pouco mais aberto que os ombros.",
      "Tire a barra do suporte estabilizando o peso acima do queixo/peito superior.",
      "Desça a barra controladamente até encostar de leve na porção superior do peito.",
      "Pressione verticalmente mantendo as escápulas aduzidas."
    ],
    commonMistakes: [
      "Descer a barra na altura do pescoço (risco articular grave).",
      "Tirar o quadril do assento do banco.",
      "Balanço irregular da barra."
    ],
    cues: ["Toque o peito clavicular", "Escápulas travadas no banco", "Punhos eretos"],
    alternatives: ["Supino Inclinado com Halteres", "Supino Inclinado no Smith", "Landmine Press Inclinado"]
  },
  {
    id: "ex-supino-declinado-barra",
    name: "Supino Declinado com Barra (Canadense)",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Tríceps", "Ombros"],
    equipment: "Barra",
    difficulty: "Intermediário",
    instructions: [
      "Prenda firmemente os tornozelos nos rolos do banco declinado (-15° a -30°).",
      "Segure a barra com pegada pronada ligeiramente além dos ombros.",
      "Desça a barra em direção à linha inferior dos peitorais (esterno distal).",
      "Empurre a barra para cima até a extensão controlada dos braços."
    ],
    commonMistakes: [
      "Descer a barra alto demais em direção à garganta.",
      "Soltar as pernas dos suportes de segurança do banco."
    ],
    cues: ["Mire na dobra inferior do peitoral", "Controle rigoroso na descida"],
    alternatives: ["Supino Declinado com Halteres", "Paralelas com Tronco Inclinado", "Crossover na Polia Alta"]
  },
  {
    id: "ex-supino-declinado-halteres",
    name: "Supino Declinado com Halteres",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Tríceps", "Ombros"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Com os pés travados no banco declinado, posicione os halteres acima do peitoral inferior.",
      "Desça os halteres mantendo os antebraços perpendiculares ao chão.",
      "Alongue a porção inferior do peito e empurre convergindo no topo."
    ],
    commonMistakes: ["Perder o equilíbrio dos halteres na descida", "Abrir os cotovelos em linha com as orelhas"],
    cues: ["Concentre no feixe costo-esternal", "Movimento suave e cadenciado"],
    alternatives: ["Supino Declinado com Barra", "Crossover Polia Alta", "Mergulho em Paralelas"]
  },
  {
    id: "ex-supino-maquina-articulada",
    name: "Supino Reto na Máquina Articulada",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Tríceps", "Ombros"],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Regule a altura do banco para que as manoplas fiquem na linha do terço médio do peito.",
      "Apoie completamente as costas e a cabeça no encosto.",
      "Empurre as manoplas para frente sem projetar os ombros à frente no final.",
      "Retorne sentindo o alongamento muscular completo do peito."
    ],
    commonMistakes: ["Deixar as placas baterem na volta", "Deslocar as costas do encosto"],
    cues: ["Mantenha o peito aberto", "Movimento constante sob tensão"],
    alternatives: ["Supino Reto com Halteres", "Supino Reto com Barra"]
  },
  {
    id: "ex-crucifixo-reto-halteres",
    name: "Crucifixo Reto com Halteres",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Ombros"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Deite no banco plano segurando os halteres acima do tórax com pegada neutra.",
      "Mantenha uma leve e constante flexão nos cotovelos (10° a 15°).",
      "Abra os braços em arco lateral até sentir grande alongamento no peitoral.",
      "Traga os halteres de volta como se estivesse abraçando um tonel largo."
    ],
    commonMistakes: [
      "Transformar o crucifixo em supino dobrando os cotovelos na subida.",
      "Descer os braços abaixo do plano do banco sem mobilidade adequada."
    ],
    cues: ["Cotovelos semi-flexionados fixos", "Abrace uma árvore", "Alongue com controle"],
    alternatives: ["Peck Deck / Voador", "Crossover na Polia Média", "Crucifixo no Banco Inclinado"]
  },
  {
    id: "ex-crucifixo-inclinado-halteres",
    name: "Crucifixo Inclinado com Halteres",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Ombros"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Ajuste o banco em inclinação de 30° a 40°.",
      "Eleve os halteres acima do peitoral superior com pegada neutra (palmas voltadas uma para a outra).",
      "Abra os braços em semicírculo amplo até a altura do tórax.",
      "Retorne contraindo a porção clavicular do peitoral."
    ],
    commonMistakes: ["Deixar os punhos cederem com o peso", "Hiperextender a articulação do cotovelo"],
    cues: ["Sinta o feixe superior rasgar de tensão", "Retração firme nas escápulas"],
    alternatives: ["Crucifixo Inclinado na Polia", "Supino Inclinado com Halteres"]
  },
  {
    id: "ex-peck-deck-voador",
    name: "Voador Peitoral / Peck Deck",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Ombros"],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Ajuste o banco para que os cotovelos fiquem na mesma linha do meio do peito.",
      "Segure as manoplas com antebraços paralelos ou apoiados nas almofadas.",
      "Feche os braços à frente unindo as manoplas e espremendo o peitoral por 1 segundo.",
      "Retorne de forma excêntrica e lenta controlando a carga até o ponto de alongamento confortável."
    ],
    commonMistakes: ["Projetar a cabeça para frente na contração", "Bater as placas ao retornar"],
    cues: ["Esmague uma noz entre os peitorais", "Mantenha a coluna firme contra o encosto"],
    alternatives: ["Crucifixo no Crossover", "Crucifixo Reto com Halteres"]
  },
  {
    id: "ex-crossover-polia-media",
    name: "Crucifixo no Crossover (Polia Média)",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Ombros"],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Posicione as polias na altura do peito médio.",
      "Dê um passo à frente com base âncora dividida, cotovelos com leve flexão anatômica.",
      "Aproxime as mãos à frente do peito espremendo o músculo no ponto de pico de contração.",
      "Retorne lentamente controlando a tensão contínua dos cabos."
    ],
    commonMistakes: ["Usar impulso do tronco", "Flexionar e estender os braços como em um supino"],
    cues: ["Abrace uma árvore gigante", "Mantenha o peito erguido", "Tensão constante"],
    alternatives: ["Peck Deck (Voador)", "Crucifixo com Halteres"]
  },
  {
    id: "ex-crossover-polia-alta",
    name: "Crossover na Polia Alta (Foco Inferior)",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Ombros", "Tríceps"],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Ajuste os carrinhos das polias no ponto mais alto das torres.",
      "Dê um passo à frente com o tronco ligeiramente inclinado.",
      "Puxe os cabos em trajetória descendente, cruzando ou tocando as mãos na frente do púbis.",
      "Segure a contração isométrica por 1 segundo na parte inferior."
    ],
    commonMistakes: ["Balançar o tronco para gerar inércia", "Subir os cotovelos acima dos ombros de maneira descontrolada"],
    cues: ["Traga os punhos para a cintura", "Esmague a base inferior do peito"],
    alternatives: ["Supino Declinado com Barra", "Mergulho em Paralelas"]
  },
  {
    id: "ex-crossover-polia-baixa",
    name: "Crossover na Polia Baixa (Foco Superior)",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Ombros"],
    equipment: "Polia/Cabos",
    difficulty: "Intermediário",
    instructions: [
      "Ajuste as polias na posição mais baixa do suporte.",
      "Segure as manoplas com palmas voltadas para cima (supinação).",
      "Puxe os cabos em arco ascendente em direção à linha do queixo/olhos.",
      "Aperte o topo da porção clavicular do peitoral e desça controlando a carga."
    ],
    commonMistakes: ["Tirar a força das pernas dando trancos", "Dobrar os cotovelos como rosca direta"],
    cues: ["Puxe para cima e para dentro", "Foque na porção de cima do peito"],
    alternatives: ["Supino Inclinado com Halteres", "Crucifixo Inclinado com Halteres"]
  },
  {
    id: "ex-mergulho-paralelas-peito",
    name: "Paralelas com Foco em Peitoral (Chest Dips)",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Tríceps", "Ombros"],
    equipment: "Peso Corporal",
    difficulty: "Avançado",
    instructions: [
      "Apoie-se nas barras paralelas com os braços estendidos e corpo suspenso.",
      "Incline o tronco para frente em aproximadamente 30° e cruze as pernas para trás.",
      "Permita que os cotovelos se abram levemente enquanto desce até 90° de flexão.",
      "Empurre de volta contraindo com força a parte inferior e média do peitoral."
    ],
    commonMistakes: [
      "Descer excessivamente gerando estresse na cápsula anterior do ombro.",
      "Ficar com o tronco totalmente vertical (transfere foco total para o tríceps)."
    ],
    cues: ["Tronco inclinado para frente", "Queixo próximo ao peito", "Pressione com o peitoral"],
    alternatives: ["Supino Declinado com Barra", "Crossover Polia Alta", "Flexão Declinada"]
  },
  {
    id: "ex-flexao-solo-deficit",
    name: "Flexão de Braço com Déficit / Carga",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Tríceps", "Ombros", "Abdômen & Core"],
    equipment: "Peso Corporal",
    difficulty: "Intermediário",
    instructions: [
      "Apoie as mãos sobre anilhas ou blocos para permitir amplitude além do nível do solo.",
      "Mantenha o corpo em prancha alinhada do calcanhar à nuca.",
      "Abaixe o tronco até o peito ultrapassar a linha das mãos sentindo o estiramento.",
      "Empurre o solo com força retornando à posição inicial."
    ],
    commonMistakes: ["Deixar o quadril ceder em hiperlordose", "Não atingir a profundidade do déficit"],
    cues: ["Glúteos e abdômen de pedra", "Afunde o peito entre os apoios"],
    alternatives: ["Flexão Tradicional", "Supino Reto com Halteres"]
  },
  {
    id: "ex-pullover-halter",
    name: "Pullover com Halter no Banco Plano",
    primaryMuscle: "Peitoral",
    secondaryMuscles: ["Costas", "Tríceps", "Abdômen & Core"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Deite perpendicularmente ou transversalmente sobre um banco plano apoiando a parte superior das costas.",
      "Segure a anilha interna do halter com as duas mãos formando um triângulo com os polegares e indicadores.",
      "Desça o halter em arco atrás da cabeça mantendo os braços com leve flexão estável.",
      "Ao sentir o alongamento máximo do peitoral e serrátil, retorne até a altura dos olhos."
    ],
    commonMistakes: ["Flexionar e estender os cotovelos parecendo tríceps francês", "Descer o quadril descontroladamente"],
    cues: ["Expanda a caixa torácica na inspiração", "Cotovelos estáveis em arco"],
    alternatives: ["Pullover na Polia Alta com Corda", "Crossover Polia Alta"]
  },

  // =========================================================================
  // --- 2. COSTAS (BACK & LATS) ---
  // =========================================================================
  {
    id: "ex-puxada-frontal-polia",
    name: "Puxada Frontal na Polia Alta",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Bíceps", "Ombros"],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Sente-se com as coxas firmemente travadas sob as almofadas de apoio.",
      "Segure a barra com pegada pronada ligeiramente aberta.",
      "Inicie o movimento deprimindo as escápulas e puxe a barra em direção ao esterno superior.",
      "Retorne controladamente estendendo totalmente o grande dorsal na fase excêntrica."
    ],
    commonMistakes: ["Inclinar o tronco excessivamente para trás gerando inércia", "Puxar a barra atrás da nuca"],
    cues: ["Puxe os cotovelos para os bolsos traseiros", "Peito alto em direção à barra"],
    alternatives: ["Barra Fixa Pronada (Pull-up)", "Puxada com Triângulo"]
  },
  {
    id: "ex-barra-fixa-pronada",
    name: "Barra Fixa com Pegada Pronada (Pull-Up)",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Bíceps", "Ombros", "Abdômen & Core"],
    equipment: "Peso Corporal",
    difficulty: "Avançado",
    instructions: [
      "Suspenda-se na barra fixa com pegada pronada (palmas para frente) além dos ombros.",
      "Ative as escápulas deprimindo-as antes de dobrar os braços.",
      "Puxe o corpo para cima até que o queixo ultrapasse com folga a linha da barra.",
      "Desça com total controle até os braços ficarem quase retos sob tensão muscular."
    ],
    commonMistakes: ["Balançar o corpo com o 'kip' sem controle estrito", "Fazer apenas meia amplitude"],
    cues: ["Puxe a barra em direção ao peitoral", "Cotovelos para baixo e para trás"],
    alternatives: ["Puxada Frontal na Polia", "Barra Fixa Graviton / com Elástico"]
  },
  {
    id: "ex-barra-fixa-supinada",
    name: "Barra Fixa com Pegada Supinada (Chin-Up)",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Bíceps", "Abdômen & Core"],
    equipment: "Peso Corporal",
    difficulty: "Intermediário",
    instructions: [
      "Segure a barra fixa com pegada supinada (palmas voltadas para você) na largura dos ombros.",
      "Puxe o corpo verticalmente concentrando no feixe inferior do latíssimo e nos bíceps.",
      "Leve o queixo acima da barra mantendo os cotovelos apontados para o solo.",
      "Desça de forma excêntrica e lenta."
    ],
    commonMistakes: ["Chutar com as pernas para conseguir subir", "Não estender os braços na descida"],
    cues: ["Peito no topo", "Controle de 3 segundos na descida"],
    alternatives: ["Puxada Supinada na Polia", "Rosca Direta com Barra"]
  },
  {
    id: "ex-puxada-triangulo",
    name: "Puxada Alta com Triângulo (Pegada Neutra)",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Bíceps", "Ombros"],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Conecte o acessório triângulo na polia alta.",
      "Segure com as palmas voltadas uma para a outra.",
      "Incline o tronco levemente (10° a 15°) e puxe o triângulo até o esterno médio.",
      "Esprema a musculatura do meio das costas e dorsal por 1 segundo no final."
    ],
    commonMistakes: ["Puxar na altura da barriga inclinando as costas para trás", "Despencar os braços na volta"],
    cues: ["Rasgue as dorsais para baixo", "Sinta o meio das costas fechar"],
    alternatives: ["Puxada Frontal com Barra", "Remada Cavalinho"]
  },
  {
    id: "ex-remada-curvada-barra",
    name: "Remada Curvada com Barra",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Bíceps", "Abdômen & Core", "Pernas (Posterior)"],
    equipment: "Barra",
    difficulty: "Avançado",
    instructions: [
      "Pés na largura dos quadris, incline o tronco em ~45° mantendo a coluna lombar rigorosamente neutra.",
      "Segure a barra com pegada pronada ou supinada na largura dos ombros.",
      "Puxe a barra em direção ao umbigo / parte inferior do abdômen, aproximando as escápulas.",
      "Desça a barra controladamente sem arredondar as costas."
    ],
    commonMistakes: [
      "Arredondar a coluna lombar (perigo de lesão discal).",
      "Usar impulso dos joelhos e da pelve para levantar a carga."
    ],
    cues: ["Empurre os quadris para trás", "Cotovelos raspando as costelas", "Core travado como concreto"],
    alternatives: ["Remada Cavalinho (T-Bar)", "Remada com Halteres no Banco Inclinado", "Remada Articulada"]
  },
  {
    id: "ex-remada-unilateral-serrote",
    name: "Remada Unilateral com Halter (Serrote)",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Bíceps", "Abdômen & Core"],
    equipment: "Halteres",
    difficulty: "Iniciante",
    instructions: [
      "Apoie um joelho e a mão do mesmo lado sobre um banco plano.",
      "Mantenha a coluna paralela ao chão com a outra perna firme no solo.",
      "Com a mão livre segurando o halter, puxe o cotovelo para cima e para trás em direção ao quadril.",
      "Desça o halter sentindo o grande dorsal se alongar totalmente sem girar o tronco."
    ],
    commonMistakes: [
      "Girar os ombros e a cintura na subida como um moinho de vento.",
      "Puxar o halter na vertical para o peito em vez de puxar para o quadril."
    ],
    cues: ["Puxe com o cotovelo, não com a mão", "Mantenha o tronco nivelado"],
    alternatives: ["Remada no Cabo Unilateral", "Remada Curvada com Halteres"]
  },
  {
    id: "ex-remada-cavalinho-tbar",
    name: "Remada Cavalinho / T-Bar com Barra",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Bíceps", "Ombros", "Abdômen & Core"],
    equipment: "Barra",
    difficulty: "Intermediário",
    instructions: [
      "Posicione a barra em um landmine ou no canto da sala com puxador em V sob a barra.",
      "Fique de pé com as pernas montadas sobre a barra e joelhos flexionados a 45°.",
      "Segure as manoplas, trave a coluna e puxe a carga até o abdômen superior.",
      "Aperte os rombóides e latíssimo no ponto de contração máxima."
    ],
    commonMistakes: ["Ficar em pé ereto perdendo a inclinação torácica", "Dobrar a lombar durante o esforço"],
    cues: ["Apoie o peso nos calcanhares", "Puxe o peso contra o peito/abdômen"],
    alternatives: ["Remada Curvada com Barra", "Remada Baixa no Triângulo"]
  },
  {
    id: "ex-remada-baixa-triangulo",
    name: "Remada Baixa com Triângulo",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Bíceps", "Ombros"],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Sente-se com os joelhos levemente destravados e pés firmes na plataforma.",
      "Mantenha a coluna ereta e puxe o triângulo até a altura do abdômen inferior.",
      "Aperte as escápulas por 1 segundo no final com o peito estufado.",
      "Alongue as costas na volta sem dobrar a coluna para a frente."
    ],
    commonMistakes: ["Hiperestender a coluna lombar no topo jogando o corpo para trás", "Empurrar com as pernas"],
    cues: ["Escápulas móveis, coluna estável", "Ombros longe das orelhas"],
    alternatives: ["Remada Articulada na Máquina", "Remada Curvada com Halteres"]
  },
  {
    id: "ex-remada-articulada-maquina",
    name: "Remada Articulada na Máquina (Pegada Neutra)",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Bíceps"],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Ajuste a altura do assento e do apoio peitoral na máquina.",
      "Apoie o peito firmemente contra a almofada e segure as manoplas.",
      "Puxe os braços para trás aproximando as escápulas.",
      "Retorne estendendo os braços e permitindo que as escápulas se abram com controle."
    ],
    commonMistakes: ["Descolar o peito da almofada de suporte", "Dar tranco com o pescoço"],
    cues: ["Peito colado no apoio", "Concentre na contração dorsal"],
    alternatives: ["Remada Baixa na Polia", "Remada Cavalinho"]
  },
  {
    id: "ex-pulldown-polia-alta",
    name: "Pulldown na Polia Alta com Barra Reta / Corda",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Tríceps", "Abdômen & Core"],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Em pé, segure a barra na polia alta com braços estendidos e pegada pronada.",
      "Dê um passo atrás e incline o tronco em 30° com cotovelos levemente flexionados e travados.",
      "Abaixe a barra em arco até encostar nas coxas usando puramente o grande dorsal.",
      "Retorne controlando até a altura dos olhos sentindo as asas das costas expandirem."
    ],
    commonMistakes: ["Flexionar e estender os braços transformando em tríceps corda", "Usar impulso dos quadris"],
    cues: ["Mantenha os cotovelos travados no mesmo ângulo", "Abaixe a barra com as axilas"],
    alternatives: ["Pullover com Halter", "Puxada Frontal"]
  },
  {
    id: "ex-levantamento-terra-convencional",
    name: "Levantamento Terra Convencional com Barra",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Pernas (Posterior)", "Glúteos", "Pernas (Quadríceps)", "Abdômen & Core"],
    equipment: "Barra",
    difficulty: "Avançado",
    instructions: [
      "Posicione os pés na largura dos quadris com a barra sobre o meio do peito do pé.",
      "Incline-se flexionando quadris e joelhos, segurando a barra logo por fora das canelas.",
      "Estufe o peito, deprima as dorsais e tire a folga da barra antes de puxar.",
      "Empurre o chão com os pés estendendo quadris e joelhos simultaneamente até ficar ereto."
    ],
    commonMistakes: [
      "Arredondar a coluna lombar ao sair do chão.",
      "Deixar a barra afastar-se do corpo durante a trajetória.",
      "Hiperextender a lombar para trás no topo do movimento."
    ],
    cues: ["Empurre o chão para longe", "Barra raspando nas canelas", "Tranque as dorsais"],
    alternatives: ["Levantamento Terra com Trap Bar", "Levantamento Terra Sumô", "RDL com Halteres"]
  },
  {
    id: "ex-crucifixo-invertido-halteres",
    name: "Crucifixo Invertido com Halteres (Deltóide Posterior)",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Ombros"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Incline o tronco à frente a quase 90° ou apoie o peito em um banco inclinado a 30°.",
      "Com halteres sob o peito e cotovelos semiflexionados, eleve os braços para os lados.",
      "Concentre a força na parte de trás dos ombros e no meio das costas.",
      "Desça resistindo à gravidade sem balanceio."
    ],
    commonMistakes: ["Usar halteres pesados demais e roubar com o tronco", "Encolher os ombros ativando trapézio superior"],
    cues: ["Abra os braços como asas", "Mire nos cotovelos para o teto"],
    alternatives: ["Voador Invertido no Peck Deck", "Crucifixo Invertido no Crossover", "Face Pull"]
  },
  {
    id: "ex-crucifixo-invertido-peck-deck",
    name: "Voador Invertido no Peck Deck (Máquina)",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Ombros"],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Sente-se de frente para o encosto do voador com o peito apoiado.",
      "Ajuste os braços da máquina na posição mais recuada.",
      "Segure as manoplas na altura dos ombros com pegada neutra ou pronada.",
      "Abra os braços lateralmente até alinhar com o tronco, apertando os deltóides posteriores."
    ],
    commonMistakes: ["Elevar os ombros em direção às orelhas", "Impulsionar as costas para trás"],
    cues: ["Cotovelos alinhados com o ombro", "Sinta a parte de trás do ombro queimar"],
    alternatives: ["Crucifixo Invertido com Halteres", "Face Pull na Polia"]
  },
  {
    id: "ex-extensao-lombar-banco",
    name: "Hiperextensão Lombar no Banco 45°",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Glúteos", "Pernas (Posterior)"],
    equipment: "Peso Corporal",
    difficulty: "Iniciante",
    instructions: [
      "Apoie as coxas nas almofadas do banco com a crista ilíaca livre para dobrar o quadril.",
      "Cruze os braços sobre o peito com a coluna alinhada.",
      "Desça o tronco flexionando os quadris até a sensação de alongamento.",
      "Suba até que o corpo forme uma linha reta contínua sem hiperextender excessivamente a coluna."
    ],
    commonMistakes: ["Jogar a coluna muito para trás no topo", "Movimento brusco e rápido"],
    cues: ["Suba até o alinhamento neutro", "Aperte os glúteos e eretores da espinha"],
    alternatives: ["Good Morning com Barra", "Stiff com Barra"]
  },

  // =========================================================================
  // --- 3. OMBROS & DELTÓIDES (SHOULDERS) ---
  // =========================================================================
  {
    id: "ex-desenvolvimento-halteres",
    name: "Desenvolvimento com Halteres Sentado",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Tríceps"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Sentado no banco com encosto a 80°-85°, segure os halteres na altura das orelhas.",
      "Empurre os halteres para cima em trajetória ligeiramente convergente até a extensão quase total.",
      "Desça até a linha dos queixos/orelhas mantendo a tensão contínua.",
      "Mantenha o abdômen firme contraído e os pés apoiados."
    ],
    commonMistakes: ["Arquear a lombar descolando as costas do encosto", "Bater os halteres no topo"],
    cues: ["Costas coladas no encosto", "Suba sem travar os cotovelos"],
    alternatives: ["Desenvolvimento Militar com Barra", "Desenvolvimento Máquina"]
  },
  {
    id: "ex-desenvolvimento-militar-barra",
    name: "Desenvolvimento Militar em Pé com Barra (OHP)",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Tríceps", "Abdômen & Core"],
    equipment: "Barra",
    difficulty: "Avançado",
    instructions: [
      "Fique em pé com os pés na largura dos ombros e segure a barra logo à frente da clavícula.",
      "Contraia fortemente os glúteos, abdômen e quadríceps para formar uma base sólida.",
      "Pressione a barra verticalmente para cima, passando rente ao rosto.",
      "Trave a barra acima da cabeça alinhada com as orelhas e a coluna."
    ],
    commonMistakes: ["Inclinar o tronco para trás virando um supino inclinado", "Usar impulso dos joelhos (push press)"],
    cues: ["Glúteos travados", "Encolha o queixo na subida", "Empurre o chão"],
    alternatives: ["Desenvolvimento com Halteres", "Desenvolvimento no Smith", "Desenvolvimento Arnold"]
  },
  {
    id: "ex-desenvolvimento-arnold",
    name: "Desenvolvimento Arnold com Halteres",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Tríceps"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Comece sentado com os halteres na frente do peito e as palmas voltadas para você (supinação).",
      "Ao iniciar a subida, rotacione os braços para fora abrindo os cotovelos.",
      "Termine no topo com as palmas voltadas para frente (pronação).",
      "Inverta a rotação de forma coordenada durante a descida até a posição inicial."
    ],
    commonMistakes: ["Girar muito rápido sem sincronia", "Usar cargas pesadas demais sacrificando a articulação"],
    cues: ["Movimento espiralado fluido", "Controle cada centímetro"],
    alternatives: ["Desenvolvimento com Halteres Tradicional", "Desenvolvimento Militar"]
  },
  {
    id: "ex-desenvolvimento-maquina",
    name: "Desenvolvimento de Ombros na Máquina Articulada",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Tríceps"],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Ajuste a altura do assento para que as manoplas fiquem na linha dos ombros.",
      "Segure as manoplas com pegada pronada ou neutra.",
      "Empurre para cima com movimento constante e sem trancos.",
      "Desça de forma controlada até a altura do queixo."
    ],
    commonMistakes: ["Soltar a respiração e relaxar no ponto mais baixo", "Projetar a cabeça para frente"],
    cues: ["Mantenha a cabeça encostada", "Força constante nos dois braços"],
    alternatives: ["Desenvolvimento com Halteres", "Desenvolvimento no Smith"]
  },
  {
    id: "ex-elevacao-lateral-halteres",
    name: "Elevação Lateral com Halteres",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Mobilidade"],
    equipment: "Halteres",
    difficulty: "Iniciante",
    instructions: [
      "Em pé com tronco ligeiramente inclinado (5° a 10°) e halteres ao lado das coxas.",
      "Eleve os braços no plano escapular (30° à frente da linha do tronco) até a altura dos ombros.",
      "Mantenha os cotovelos com discreta flexão e ligeiramente acima dos punhos.",
      "Desça resistindo à gravidade em 2 a 3 segundos mantendo o deltóide sob tensão."
    ],
    commonMistakes: [
      "Usar impulso balançando o corpo para subir os halteres.",
      "Elevar as mãos acima da linha dos cotovelos (recruta trapézio em excesso)."
    ],
    cues: ["Lidere o movimento pelos cotovelos", "Despeje a água de uma jarra", "Ombros baixos"],
    alternatives: ["Elevação Lateral na Polia Baixa", "Elevação Lateral na Máquina", "Elevação Lateral Inclinada"]
  },
  {
    id: "ex-elevacao-lateral-polia",
    name: "Elevação Lateral Unilateral na Polia Baixa",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Mobilidade"],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Ajuste a polia na altura do tornozelo e segure a manopla com o braço oposto cruzado por trás ou pela frente.",
      "Incline o corpo ligeiramente para o lado de trabalho para aumentar a tensão no ponto de estiramento.",
      "Eleve o braço lateralmente até a altura do ombro mantendo tensão contínua do cabo.",
      "Desça de maneira excêntrica controlada até cruzar o tronco."
    ],
    commonMistakes: ["Girar o tronco para ajudar o movimento", "Deixar o cabo puxar o braço de volta sem frear"],
    cues: ["Tensão do início ao fim", "Cotovelo guia a subida"],
    alternatives: ["Elevação Lateral com Halteres", "Elevação Lateral no Banco Inclinado"]
  },
  {
    id: "ex-elevacao-lateral-inclinada",
    name: "Elevação Lateral no Banco Inclinado",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Mobilidade"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Deite-se de lado em um banco ajustado a 30° a 45° de inclinação.",
      "Segure o halter com o braço superior apoiado junto à coxa.",
      "Eleve o halter lateralmente até a altura perpendicular ao solo.",
      "Desça lentamente sentindo a resistência constante mesmo no início da amplitude."
    ],
    commonMistakes: ["Usar inércia na subida", "Deixar o halter cair descontrolado"],
    cues: ["Isolamento puro do deltóide lateral", "Movimento estrito"],
    alternatives: ["Elevação Lateral na Polia", "Elevação Lateral Tradicional"]
  },
  {
    id: "ex-elevacao-frontal-halteres",
    name: "Elevação Frontal Alternada com Halteres",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Peitoral"],
    equipment: "Halteres",
    difficulty: "Iniciante",
    instructions: [
      "Em pé, segure os halteres à frente das coxas com pegada pronada ou semi-neutra.",
      "Eleve um braço à frente até a altura dos olhos com cotovelo semiflexionado.",
      "Pause por 1 segundo no topo e desça controlando enquanto sobe o outro braço."
    ],
    commonMistakes: ["Jogar o tronco para trás para erguer a carga", "Subir os pesos acima da cabeça"],
    cues: ["Tronco imóvel como pilar", "Controle total na descida"],
    alternatives: ["Elevação Frontal com Barra", "Elevação Frontal na Polia com Corda"]
  },
  {
    id: "ex-elevacao-frontal-corda",
    name: "Elevação Frontal na Polia Baixa com Corda",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Peitoral", "Abdômen & Core"],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Posicione a corda na polia mais baixa e fique de costas para a máquina, com a corda passando entre as pernas.",
      "Segure as pontas da corda com pegada neutra.",
      "Eleve os braços à frente até a altura dos ombros/olhos.",
      "Desça controlando a tensão sem deixar a polia bater."
    ],
    commonMistakes: ["Dar trancos com o quadril", "Arquear a lombar"],
    cues: ["Puxe a corda para a frente dos olhos", "Tensão constante do cabo"],
    alternatives: ["Elevação Frontal com Halteres", "Elevação Frontal com Barra"]
  },
  {
    id: "ex-face-pull-corda",
    name: "Face Pull na Polia Alta com Corda",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Costas", "Mobilidade"],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Posicione a polia na altura dos olhos ou testa com acessório de corda dupla.",
      "Segure as pontas da corda com os polegares voltados para você.",
      "Dê um passo atrás e puxe a corda em direção ao rosto, separando as mãos.",
      "No final, faça uma rotação externa dos ombros trazendo os polegares para trás das orelhas."
    ],
    commonMistakes: ["Puxar na altura da barriga virando remada", "Deixar os cotovelos caírem para baixo"],
    cues: ["Cotovelos altos", "Gire os punhos para trás das orelhas", "Postura imponente"],
    alternatives: ["Crucifixo Invertido no Peck Deck", "Crucifixo Invertido com Halteres"]
  },
  {
    id: "ex-remada-alta-barra-w",
    name: "Remada Alta com Barra W",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Costas", "Bíceps"],
    equipment: "Barra",
    difficulty: "Intermediário",
    instructions: [
      "Segure a barra W com pegada na largura dos ombros (evite pegada muito fechada).",
      "Mantenha a postura ereta e puxe a barra verticalmente rente ao corpo.",
      "Suba até que os cotovelos atinjam a linha dos ombros.",
      "Desça controladamente estendendo os braços."
    ],
    commonMistakes: [
      "Usar pegada muito estreita (provoca impacto femoroacetabular / impacto subacromial no ombro).",
      "Puxar a barra acima do queixo com elevação excessiva das mãos."
    ],
    cues: ["Pegada aberta na largura dos ombros", "Cotovelos lideram a subida"],
    alternatives: ["Remada Alta na Polia Baixa", "Elevação Lateral com Halteres"]
  },
  {
    id: "ex-encolhimento-barra",
    name: "Encolhimento de Ombros com Barra (Trapézio)",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Ombros"],
    equipment: "Barra",
    difficulty: "Iniciante",
    instructions: [
      "Segure a barra à frente das coxas na largura dos ombros com os braços totalmente estendidos.",
      "Eleve os ombros diretamente para cima em direção às orelhas em linha reta vertical.",
      "Segure o pico de contração no topo por 2 segundos.",
      "Abaixe a barra lentamente até sentir o trapézio alongar."
    ],
    commonMistakes: [
      "Rotacionar os ombros para frente ou para trás (desgaste articular inútil).",
      "Dobrar os cotovelos para ajudar a levantar a barra."
    ],
    cues: ["Ombros nas orelhas", "Apenas movimento vertical estrito", "Segure no topo"],
    alternatives: ["Encolhimento com Halteres", "Encolhimento no Smith por Trás"]
  },
  {
    id: "ex-encolhimento-halteres",
    name: "Encolhimento com Halteres com Isometria",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Ombros"],
    equipment: "Halteres",
    difficulty: "Iniciante",
    instructions: [
      "Fique em pé segurando halteres pesados ao lado do corpo com pegada neutra.",
      "Eleve os ombros verticalmente em direção às orelhas sem fletir os braços.",
      "Segure a contração isométrica por 2 segundos espremendo o trapézio superior.",
      "Desça de forma suave e controlada."
    ],
    commonMistakes: ["Fazer rotações circulares com os ombros", "Usar impulso dos joelhos"],
    cues: ["Suba reto como um elevador", "Contração firme no topo"],
    alternatives: ["Encolhimento com Barra", "Encolhimento na Máquina"]
  },

  // =========================================================================
  // --- 4. PERNAS: QUADRÍCEPS (QUADS) ---
  // =========================================================================
  {
    id: "ex-agachamento-livre-barra",
    name: "Agachamento Livre com Barra",
    primaryMuscle: "Pernas (Quadríceps)",
    secondaryMuscles: ["Glúteos", "Pernas (Posterior)", "Abdômen & Core"],
    equipment: "Barra",
    difficulty: "Avançado",
    instructions: [
      "Apoie a barra firme sobre os trapézios (high bar) ou espinha da escápula (low bar).",
      "Pés afastados na largura dos ombros com pontas ligeiramente apontadas para fora (15° a 30°).",
      "Inicie a descida flexionando quadris e joelhos simultaneamente até que as coxas quebrem a linha paralela.",
      "Empurre o solo com força homogênea nos calcanhares e metatarsos, subindo em linha reta."
    ],
    commonMistakes: [
      "Joelhos colapsando para dentro durante a subida (valgo dinâmico).",
      "Calcanhares descolando do chão devido à falta de dorsiflexão do tornozelo.",
      "Perder a neutralidade da coluna lombar (arredondamento/buttwink excessivo)."
    ],
    cues: ["Abra os joelhos na direção dos dedos", "Mantenha o peito orgulhoso", "Aparafuse os pés no chão"],
    alternatives: ["Leg Press 45°", "Agachamento Hack", "Agachamento Frontal com Barra"]
  },
  {
    id: "ex-agachamento-frontal-barra",
    name: "Agachamento Frontal com Barra (Front Squat)",
    primaryMuscle: "Pernas (Quadríceps)",
    secondaryMuscles: ["Glúteos", "Abdômen & Core"],
    equipment: "Barra",
    difficulty: "Avançado",
    instructions: [
      "Apoie a barra na parte frontal dos ombros e deltóides com pegada clean ou braços cruzados.",
      "Mantenha os cotovelos altos apontados para frente durante toda a execução.",
      "Desça o tronco em ângulo muito vertical até profundidade completa.",
      "Empurre de volta mantendo os cotovelos elevados e o core firme."
    ],
    commonMistakes: ["Deixar os cotovelos caírem derrubando a barra", "Inclinar o tronco para frente"],
    cues: ["Cotovelos altos como faróis", "Tronco reto como parede"],
    alternatives: ["Agachamento Goblet", "Agachamento no Smith", "Hack Squat"]
  },
  {
    id: "ex-leg-press-45",
    name: "Leg Press 45°",
    primaryMuscle: "Pernas (Quadríceps)",
    secondaryMuscles: ["Glúteos"],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Apoie toda a extensão da coluna e glúteos firmemente no encosto.",
      "Posicione os pés no meio da plataforma na largura dos ombros.",
      "Destrave a máquina e desça o trenó controladamente até os joelhos atingirem 90° ou mais.",
      "Empurre a plataforma pelos calcanhares sem travar as articulações no topo (sem hiperextensão)."
    ],
    commonMistakes: [
      "Tirar o quadril/lombar do banco no final da descida (retroversão perigosa).",
      "Bater e travar os joelhos de forma abrupta na fase final da extensão."
    ],
    cues: ["Puxe as manoplas com as mãos para travar os glúteos no banco", "Calcanhares colados na chapa"],
    alternatives: ["Agachamento Hack", "Leg Press Horizontal", "Agachamento Livre"]
  },
  {
    id: "ex-hack-squat-maquina",
    name: "Agachamento Hack na Máquina",
    primaryMuscle: "Pernas (Quadríceps)",
    secondaryMuscles: ["Glúteos"],
    equipment: "Máquina",
    difficulty: "Intermediário",
    instructions: [
      "Posicione os ombros e as costas no acolchoado do Hack Machine.",
      "Pés na plataforma ligeiramente à frente, com pontas abertas a 20°.",
      "Destrave e desça até obter flexão profunda dos joelhos com excelente estímulo nos quadríceps.",
      "Empurre subindo até antes do bloqueio articular."
    ],
    commonMistakes: ["Tirar a lombar do apoio", "Deixar os joelhos fecharem na subida"],
    cues: ["Esprema as coxas na subida", "Desça controlado em 3 segundos"],
    alternatives: ["Leg Press 45°", "Agachamento Frontal", "Agachamento no Smith"]
  },
  {
    id: "ex-agachamento-smith",
    name: "Agachamento no Smith Machine com Pés Avançados",
    primaryMuscle: "Pernas (Quadríceps)",
    secondaryMuscles: ["Glúteos"],
    equipment: "Máquina",
    difficulty: "Intermediário",
    instructions: [
      "Posicione a barra nos ombros e avance os pés cerca de 20-30 cm à frente da linha do trilho.",
      "Mantenha o tronco ereto e desça dobrando os joelhos em profundidade.",
      "Concentre a força nos quadríceps isolados devido ao alívio do equilíbrio lombar.",
      "Retorne à posição inicial sem trancos."
    ],
    commonMistakes: ["Colocar os pés muito recuados forçando o tendão patelar", "Arredondar a coluna"],
    cues: ["Apoie o peso no suporte dos trilhos", "Mergulhe os quadris"],
    alternatives: ["Hack Squat", "Leg Press 45°"]
  },
  {
    id: "ex-cadeira-extensora",
    name: "Cadeira Extensora (Isolador de Quadríceps)",
    primaryMuscle: "Pernas (Quadríceps)",
    secondaryMuscles: [],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Ajuste o encosto de forma que a articulação do joelho fique alinhada com o eixo da máquina.",
      "Ajuste a almofada inferior para repousar logo acima dos tornozelos.",
      "Estenda as pernas totalmente contraindo o reto femoral e vastos no topo com 1 segundo de isometria.",
      "Retorne descendo a carga de forma lenta e resistida."
    ],
    commonMistakes: ["Chutar o peso gerando impacto brusco no joelho", "Tirar as nádegas do assento"],
    cues: ["Trave as manoplas e afunde no assento", "Aperte as coxas no topo"],
    alternatives: ["Sissy Squat", "Agachamento no Smith"]
  },
  {
    id: "ex-agachamento-bulgaro-halteres",
    name: "Agachamento Búlgaro com Halteres",
    primaryMuscle: "Pernas (Quadríceps)",
    secondaryMuscles: ["Glúteos", "Pernas (Posterior)"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Fique de costas para um banco e apoie o dorso de um dos pés sobre ele.",
      "Com a perna da frente a um passo largo de distância, segure os halteres ao lado do tronco.",
      "Abaixe o corpo até o joelho traseiro quase encostar no chão e a coxa frontal ficar paralela.",
      "Empurre pelo calcanhar dianteiro para retornar à posição inicial."
    ],
    commonMistakes: [
      "Colocar o pé da frente muito próximo do banco sobrecarregando o joelho.",
      "Perder o equilíbrio por não fixar o olhar em um ponto fixo à frente."
    ],
    cues: ["Afunde o joelho de trás", "Peso centrado no pé da frente", "Tronco ereto"],
    alternatives: ["Avanço / Passada com Halteres", "Leg Press Unilateral", "Afundo no Smith"]
  },
  {
    id: "ex-afundo-passada-halteres",
    name: "Avanço / Passada Caminhando com Halteres",
    primaryMuscle: "Pernas (Quadríceps)",
    secondaryMuscles: ["Glúteos", "Panturrilhas"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Segure halteres ao lado do corpo e dê um passo longo para frente.",
      "Flexione ambos os joelhos em ângulos de aproximadamente 90°.",
      "Empurre com a perna da frente e dê o próximo passo de forma contínua e ritmada.",
      "Mantenha o abdômen ativado e o tronco ereto durante a passada."
    ],
    commonMistakes: ["Dar passos muito curtos", "Bater o joelho de trás com força no solo"],
    cues: ["Passada firme", "Desça vertical", "Equilíbrio contínuo"],
    alternatives: ["Agachamento Búlgaro", "Leg Press 45°"]
  },
  {
    id: "ex-sissy-squat",
    name: "Sissy Squat Livre ou na Máquina",
    primaryMuscle: "Pernas (Quadríceps)",
    secondaryMuscles: ["Abdômen & Core"],
    equipment: "Peso Corporal",
    difficulty: "Avançado",
    instructions: [
      "Na base do Sissy Squat com canelas travadas ou em pé segurando um suporte fixo.",
      "Incline o tronco para trás mantendo uma linha reta dos ombros aos joelhos.",
      "Flexione os joelhos profundamente projetando-os à frente enquanto o tronco vai para trás.",
      "Estenda os joelhos usando puramente a força excêntrica e concêntrica dos quadríceps."
    ],
    commonMistakes: ["Dobrar o quadril em vez de manter o corpo reto", "Realizar se houver histórico de dor patelar aguda"],
    cues: ["Corpo reto como uma prancha", "Alongamento extremo dos quadríceps"],
    alternatives: ["Cadeira Extensora", "Agachamento Hack"]
  },

  // =========================================================================
  // --- 5. PERNAS: POSTERIOR DE COXA / ISQUIOTIBIAIS (HAMSTRINGS) ---
  // =========================================================================
  {
    id: "ex-stiff-halteres",
    name: "Stiff com Halteres / RDL",
    primaryMuscle: "Pernas (Posterior)",
    secondaryMuscles: ["Glúteos", "Abdômen & Core"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Em pé, segure os halteres rente à frente das coxas com pegada pronada.",
      "Joelhos mantidos em discreta flexão isométrica fixa durante todo o exercício.",
      "Empurre os quadris para trás como se quisesse fechar uma porta com os glúteos.",
      "Desça os halteres rente às canelas até sentir o estiramento máximo dos isquiotibiais.",
      "Retorne contraindo os glúteos e estendendo os quadris."
    ],
    commonMistakes: [
      "Flexionar demais os joelhos transformando o stiff em agachamento.",
      "Arredondar a coluna torácica ou lombar para alcançar o chão."
    ],
    cues: ["Movimento dominado pelo quadril (hip hinge)", "Pesos raspando nas pernas", "Peito aberto"],
    alternatives: ["Stiff com Barra", "Mesa Flexora", "Cadeira Flexora"]
  },
  {
    id: "ex-stiff-barra",
    name: "Stiff com Barra Reta",
    primaryMuscle: "Pernas (Posterior)",
    secondaryMuscles: ["Glúteos", "Costas"],
    equipment: "Barra",
    difficulty: "Intermediário",
    instructions: [
      "Retire a barra do suporte ou do chão com pegada na largura dos ombros.",
      "Com joelhos semiflexionados e fixos, projete o quadril para trás.",
      "Abaixe a barra rente à tíbia mantendo as escápulas aduzidas e coluna neutra.",
      "Retorne até ficar ereto apertando os glúteos e posteriores."
    ],
    commonMistakes: ["Soltar as escápulas deixando os ombros caírem à frente", "Descer além da mobilidade individual"],
    cues: ["Quadris para trás", "Coluna neutra e firme", "Sinta o posterior queimar"],
    alternatives: ["Stiff com Halteres", "Mesa Flexora", "Good Morning com Barra"]
  },
  {
    id: "ex-mesa-flexora",
    name: "Mesa Flexora Deitada (Leg Curl)",
    primaryMuscle: "Pernas (Posterior)",
    secondaryMuscles: ["Panturrilhas"],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Deite de bruços na máquina com o apoio almofadado posicionado logo abaixo das panturrilhas.",
      "Segure firme nas manoplas mantendo a pelve e os quadris colados no banco.",
      "Flexione os joelhos trazendo os calcanhares em direção aos glúteos com força contínua.",
      "Segure 1 segundo no topo e retorne controlando a descida em 3 segundos."
    ],
    commonMistakes: [
      "Elevar o quadril do banco durante a flexão (compensação lombar).",
      "Deixar as placas caírem sem resistência na volta."
    ],
    cues: ["Cole o quadril no acolchoado", "Pés em dorsiflexão neutra", "Aperte os calcanhares na bunda"],
    alternatives: ["Cadeira Flexora", "Stiff com Halteres", "Flexão Nórdica"]
  },
  {
    id: "ex-cadeira-flexora",
    name: "Cadeira Flexora Sentada",
    primaryMuscle: "Pernas (Posterior)",
    secondaryMuscles: [],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Ajuste o encosto de modo que o eixo do joelho coincida perfeitamente com a rotação da máquina.",
      "Trave a almofada superior firmemente sobre as coxas para evitar qualquer elevação da perna.",
      "Puxe os calcanhares para baixo e para trás com flexão vigorosa dos joelhos.",
      "Retorne lentamente estendendo as pernas sentindo o estiramento profundo sob carga."
    ],
    commonMistakes: ["Deixar o apoio das coxas frouxo", "Fazer movimentos rápidos sem controlar a fase excêntrica"],
    cues: ["Pressione as coxas contra o apoio", "Flexão completa até o fim do curso"],
    alternatives: ["Mesa Flexora", "Stiff com Barra"]
  },
  {
    id: "ex-good-morning-barra",
    name: "Good Morning (Bom Dia) com Barra",
    primaryMuscle: "Pernas (Posterior)",
    secondaryMuscles: ["Glúteos", "Costas"],
    equipment: "Barra",
    difficulty: "Avançado",
    instructions: [
      "Apoie a barra firme nos trapézios como no agachamento high bar.",
      "Com pés na largura dos ombros e joelhos levemente destravados, incline o tronco à frente empurrando o quadril para trás.",
      "Desça até o tronco ficar quase paralelo ao chão mantendo as costas rigorosamente retas.",
      "Suba contraindo posteriores e glúteos."
    ],
    commonMistakes: ["Arredondar a coluna lombar com carga alta", "Dobrar os joelhos em excesso"],
    cues: ["Tronco reto como uma tábua", "Sinta os isquiotibiais se esticarem"],
    alternatives: ["Stiff com Barra", "Hiperextensão Lombar no Banco 45°"]
  },

  // =========================================================================
  // --- 6. GLÚTEOS (GLUTES) ---
  // =========================================================================
  {
    id: "ex-elevacao-pelvica-barra",
    name: "Elevação Pélvica com Barra (Hip Thrust)",
    primaryMuscle: "Glúteos",
    secondaryMuscles: ["Pernas (Posterior)", "Abdômen & Core"],
    equipment: "Barra",
    difficulty: "Intermediário",
    instructions: [
      "Apoie as escápulas na borda de um banco estável (altura logo abaixo das escápulas).",
      "Posicione a barra com acolchoamento protetor sobre a dobra dos quadris.",
      "Pés afastados na largura dos ombros com canelas verticais no topo do movimento.",
      "Eleve os quadris até que coxas e tronco formem uma linha reta horizontal.",
      "Segure 1 a 2 segundos no topo com contração máxima dos glúteos e desça controladamente."
    ],
    commonMistakes: [
      "Hiperextender a lombar no topo em vez de usar a extensão de quadril.",
      "Olhar para o teto em vez de manter o queixo colado ao peito.",
      "Posicionar os pés muito perto ou longe demais (canelas não verticais)."
    ],
    cues: ["Queixo colado no peito", "Pressão firme nos calcanhares", "Esmague os glúteos no topo"],
    alternatives: ["Elevação Pélvica na Máquina", "Glute Bridge no Solo", "Agachamento Búlgaro"]
  },
  {
    id: "ex-elevacao-pelvica-maquina",
    name: "Elevação Pélvica na Máquina (Hip Thrust Machine)",
    primaryMuscle: "Glúteos",
    secondaryMuscles: ["Pernas (Posterior)"],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Prenda o cinto acolchoado de segurança sobre o quadril.",
      "Ajuste a distância dos pés na chapa para garantir 90° nos joelhos no topo.",
      "Empurre o quadril para cima até o alinhamento total.",
      "Segure o pico de contração de glúteo e retorne sem tocar as placas."
    ],
    commonMistakes: ["Fazer repetições curtas sem extensão completa", "Deslocar os pés durante a série"],
    cues: ["Trave os glúteos no ápice", "Desça mantendo tensão contínua"],
    alternatives: ["Elevação Pélvica com Barra", "Cadeira Abdutora"]
  },
  {
    id: "ex-cadeira-abdutora",
    name: "Cadeira Abdutora (Tronco Inclinado à Frente)",
    primaryMuscle: "Glúteos",
    secondaryMuscles: [],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Sente-se na máquina com as almofadas na parte externa dos joelhos.",
      "Incline o tronco para a frente em aproximadamente 30° a 45° mantendo a coluna alinhada (ativa glúteo médio e superior).",
      "Abra as pernas com força máxima empurrando os joelhos para fora.",
      "Segure 1 segundo no ponto de abertura total e feche controlando o movimento."
    ],
    commonMistakes: ["Fazer o movimento com impulsos rápidos e curtos", "Bater os pesos no retorno"],
    cues: ["Empurre com os joelhos, não com os pés", "Aperte o glúteo lateral"],
    alternatives: ["Glúteo na Polia com Caneleira", "Passada Lateral com Elástico"]
  },
  {
    id: "ex-gluteo-coice-polia",
    name: "Glúteo Coice / Extensão de Quadril na Polia Baixa",
    primaryMuscle: "Glúteos",
    secondaryMuscles: ["Pernas (Posterior)"],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Prenda a tornozeleira na polia baixa e fique de frente para a torre segurando os apoios.",
      "Com a perna de apoio levemente flexionada e tronco inclinado a 45°, estenda a perna de trabalho para trás.",
      "Eleve a perna contraindo fortemente o glúteo sem arquear excessivamente a lombar.",
      "Retorne lentamente até a perna voltar à frente da linha do quadril."
    ],
    commonMistakes: ["Hiperextender a lombar compensando falta de mobilidade", "Girar a pelve para o lado"],
    cues: ["Chute para trás e aperte a nádega", "Mantenha a bacia apontada para a frente"],
    alternatives: ["Glúteo 4 Apoios com Caneleira", "Elevação Pélvica"]
  },
  {
    id: "ex-agachamento-sumo-halter",
    name: "Agachamento Sumô sobre Steps com Halter",
    primaryMuscle: "Glúteos",
    secondaryMuscles: ["Pernas (Quadríceps)", "Pernas (Posterior)"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Posicione dois steps paralelos e fique em pé sobre eles com base bem aberta e pés rodados a 45° para fora.",
      "Segure um halter pesado com as duas mãos entre as pernas com braços estendidos.",
      "Agache profundamente até o halter ultrapassar a altura dos steps.",
      "Suba empurrando os calcanhares no step e espremendo os glúteos e adutores."
    ],
    commonMistakes: ["Deixar os joelhos fecharem para dentro", "Inclinar o tronco excessivamente à frente"],
    cues: ["Joelhos acompanham os dedos dos pés", "Desça vertical", "Aperte os glúteos na subida"],
    alternatives: ["Levantamento Terra Sumô", "Elevação Pélvica com Barra"]
  },

  // =========================================================================
  // --- 7. PANTURRILHAS (CALVES) ---
  // =========================================================================
  {
    id: "ex-panturrilha-em-pe-maquina",
    name: "Elevação de Panturrilhas em Pé na Máquina (Gastrocnêmio)",
    primaryMuscle: "Panturrilhas",
    secondaryMuscles: [],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Apoie os ombros sob as almofadas acolchoadas com o corpo ereto e joelhos semiflexionados/estendidos sob controle.",
      "Apoie apenas o terço anterior dos pés (metatarsos) na borda do degrau da máquina.",
      "Desça os calcanhares ao ponto de máximo alongamento sentindo a fáscia e tendão de Aquiles.",
      "Eleve-se na ponta máxima dos pés contraindo por 2 segundos completos no topo."
    ],
    commonMistakes: [
      "Fazer repetições elásticas e quicantes aproveitando o tendão sem gerar hipertrofia.",
      "Flexionar os joelhos durante a subida (transformando em meio agachamento)."
    ],
    cues: ["Pausa no fundo, explosão no topo, pausa de 2s", "Fique na ponta dos dedões"],
    alternatives: ["Panturrilha no Leg Press 45°", "Panturrilha Unilateral no Degrau"]
  },
  {
    id: "ex-panturrilha-sentado-soleo",
    name: "Elevação de Panturrilha Sentado (Máquina Sóleo)",
    primaryMuscle: "Panturrilhas",
    secondaryMuscles: [],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Sente-se com as almofadas acolchoadas ajustadas firmemente sobre a porção distal das coxas.",
      "Apoie os metatarsos na borda do apoio com calcanhares suspensos.",
      "Abaixe os calcanhares o máximo possível para alongamento do músculo sóleo.",
      "Eleve os calcanhares ao ponto mais alto sustentando a contração por 1 a 2 segundos."
    ],
    commonMistakes: ["Usar carga excessiva limitando a amplitude do tornozelo", "Tirar as coxas da almofada"],
    cues: ["Alongamento profundo", "Suba até a ponta máxima"],
    alternatives: ["Panturrilha em Pé na Máquina", "Panturrilha no Leg Press"]
  },
  {
    id: "ex-panturrilha-leg-press-45",
    name: "Panturrilha no Leg Press 45°",
    primaryMuscle: "Panturrilhas",
    secondaryMuscles: [],
    equipment: "Máquina",
    difficulty: "Iniciante",
    instructions: [
      "Sente-se no Leg Press com as costas apoiadas e travas de segurança acionadas.",
      "Apoie a ponta dos pés na borda inferior da plataforma com os calcanhares livres.",
      "Com joelhos destravados mantidos firmes, flexione os tornozelos para frente e para trás.",
      "Sinta o pico de contração dos gêmeos e desça até alongar completamente."
    ],
    commonMistakes: ["Destravar a máquina sem deixar as travas de limite mínimo seguras", "Dobrar os joelhos durante o movimento"],
    cues: ["Joelhos firmes", "Apenas mobilidade do tornozelo"],
    alternatives: ["Panturrilha em Pé na Máquina", "Panturrilha Unilateral com Halter"]
  },
  {
    id: "ex-panturrilha-unilateral-degrau",
    name: "Elevação de Panturrilha Unilateral no Degrau com Halter",
    primaryMuscle: "Panturrilhas",
    secondaryMuscles: [],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Fique na ponta de um pé na borda de um degrau ou step segurando um halter na mão do mesmo lado.",
      "Segure em um corrimão ou suporte com a outra mão para manter o equilíbrio.",
      "Desça o calcanhar até o alongamento máximo.",
      "Suba na ponta do dedão até contração máxima e pause por 2 segundos."
    ],
    commonMistakes: ["Dar pequenos impulsos", "Perder o equilíbrio"],
    cues: ["Controle absoluto", "Amplitude máxima de tornozelo"],
    alternatives: ["Panturrilha em Pé na Máquina", "Panturrilha no Leg Press"]
  },

  // =========================================================================
  // --- 8. BRAÇOS: BÍCEPS & ANTEBRAÇO ---
  // =========================================================================
  {
    id: "ex-rosca-direta-barra-w",
    name: "Rosca Direta com Barra W",
    primaryMuscle: "Bíceps",
    secondaryMuscles: ["Abdômen & Core"],
    equipment: "Barra",
    difficulty: "Iniciante",
    instructions: [
      "Em pé com postura ereta, segure a barra W nas curvaturas anguladas (pegada semi-supinada ergonômica).",
      "Cotovelos colados firmemente ao lado das costelas.",
      "Flexione os antebraços trazendo a barra até a altura do peito sem mover os ombros.",
      "Desça totalmente alongando o bíceps com controle excêntrico de 3 segundos."
    ],
    commonMistakes: [
      "Jogar os cotovelos para frente no topo do movimento (alivia a tensão do bíceps).",
      "Balançar o tronco gerando inércia a partir da coluna lombar."
    ],
    cues: ["Cotovelos colados no corpo", "Aperte o bíceps no topo", "Descida lenta"],
    alternatives: ["Rosca Direta com Barra Reta", "Rosca Scott", "Rosca Alternada com Halteres"]
  },
  {
    id: "ex-rosca-direta-barra-reta",
    name: "Rosca Direta com Barra Reta",
    primaryMuscle: "Bíceps",
    secondaryMuscles: ["Abdômen & Core"],
    equipment: "Barra",
    difficulty: "Intermediário",
    instructions: [
      "Segure a barra reta com pegada supinada na largura dos ombros.",
      "Fixe os cotovelos na linha da cintura.",
      "Erga a barra curvando os antebraços e sinta a supinação máxima forçar a cabeça curta e longa do bíceps.",
      "Desça até a extensão completa antes da próxima repetição."
    ],
    commonMistakes: ["Curvar os punhos em flexão excessiva", "Usar impulso dos joelhos"],
    cues: ["Punhos firmes e alinhados", "Foco no pico do bíceps"],
    alternatives: ["Rosca Direta com Barra W", "Rosca com Halteres"]
  },
  {
    id: "ex-rosca-alternada-halteres",
    name: "Rosca Alternada com Halteres e Supinação",
    primaryMuscle: "Bíceps",
    secondaryMuscles: [],
    equipment: "Halteres",
    difficulty: "Iniciante",
    instructions: [
      "Fique em pé ou sentado segurando os halteres ao lado do corpo em pegada neutra.",
      "Inicie a flexão de um dos braços e rotacione o punho para fora (supinação) a partir do meio do movimento.",
      "No ponto mais alto, a palma da mão deve estar voltada para o ombro com o dedinho apontado para cima.",
      "Abaixe controlando e alterne com o outro braço."
    ],
    commonMistakes: ["Fazer a rotação tarde demais", "Girar os ombros para frente"],
    cues: ["Gire o punho com vigor para fora", "Cotovelo fixo como dobradiça"],
    alternatives: ["Rosca Direta com Barra", "Rosca Inclinada com Halteres"]
  },
  {
    id: "ex-rosca-martelo-halteres",
    name: "Rosca Martelo com Halteres (Braquial e Braquiorradial)",
    primaryMuscle: "Bíceps",
    secondaryMuscles: [],
    equipment: "Halteres",
    difficulty: "Iniciante",
    instructions: [
      "Em pé ou sentado, segure os halteres com as palmas voltadas uma para a outra (pegada neutra).",
      "Sem girar os punhos, flexione os braços trazendo os halteres em direção aos ombros.",
      "Aperte o músculo braquial e antebraço no topo.",
      "Abaixe suavemente resistindo à descida."
    ],
    commonMistakes: ["Girar as palmas para cima", "Balançar os quadris"],
    cues: ["Pegada como segurando um martelo", "Concentre na espessura do braço"],
    alternatives: ["Rosca Martelo na Polia com Corda", "Rosca Inversa com Barra"]
  },
  {
    id: "ex-rosca-martelo-corda",
    name: "Rosca Martelo na Polia Baixa com Corda",
    primaryMuscle: "Bíceps",
    secondaryMuscles: [],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Conecte a corda na polia baixa e segure pelas extremidades com pegada neutra.",
      "Mantenha os cotovelos colados ao tronco e flexione os antebraços.",
      "No topo, mantenha as palmas frente a frente e aperte o braquial.",
      "Retorne controlando até a extensão quase total."
    ],
    commonMistakes: ["Abrir os cotovelos para os lados", "Usar o corpo para puxar"],
    cues: ["Puxe a corda em linha reta", "Tensão constante do cabo"],
    alternatives: ["Rosca Martelo com Halteres", "Rosca Inversa com Barra W"]
  },
  {
    id: "ex-rosca-scott-barra-w",
    name: "Rosca Scott no Banco com Barra W",
    primaryMuscle: "Bíceps",
    secondaryMuscles: [],
    equipment: "Barra",
    difficulty: "Intermediário",
    instructions: [
      "Apoie os braços e o peito firmemente no estofado inclinado do banco Scott.",
      "Segure a barra W na curvatura interna.",
      "Flexione os cotovelos erguendo a barra até a posição vertical.",
      "Desça lentamente alongando o bíceps com cuidado especial no final do curso."
    ],
    commonMistakes: [
      "Estender bruscamente o cotovelo no ponto mais baixo (risco de estiramento ou ruptura tendínea).",
      "Tirar os braços do estofado para alavancar."
    ],
    cues: ["Axilas coladas no topo do banco", "Descida lenta e controlada", "Sem hiperextensão abrupta"],
    alternatives: ["Rosca Scott na Máquina", "Rosca Concentrada com Halter"]
  },
  {
    id: "ex-rosca-inclinada-45-halteres",
    name: "Rosca Bíceps no Banco Inclinado a 45°",
    primaryMuscle: "Bíceps",
    secondaryMuscles: [],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Ajuste o banco em uma inclinação de 45° e apoie totalmente as costas.",
      "Segure os halteres com os braços estendidos pendendo para trás da linha do tronco (alongamento da cabeça longa).",
      "Flexione os cotovelos supinando as mãos e trazendo os halteres para cima.",
      "Desça lentamente sentindo o alongamento profundo dos bíceps."
    ],
    commonMistakes: ["Projetar os cotovelos para frente durante a subida", "Tirar a cabeça do encosto"],
    cues: ["Cotovelos apontados para o chão", "Alongamento máximo na descida"],
    alternatives: ["Rosca Scott", "Rosca Alternada em Pé"]
  },
  {
    id: "ex-rosca-concentrada-halter",
    name: "Rosca Concentrada com Halter",
    primaryMuscle: "Bíceps",
    secondaryMuscles: [],
    equipment: "Halteres",
    difficulty: "Iniciante",
    instructions: [
      "Sentado na beirada de um banco, apoie a parte de trás do braço na face interna da coxa correspondente.",
      "Com o braço estendido segurando o halter, flexione o cotovelo levando o peso em direção ao ombro.",
      "Esprema o bíceps no topo por 1 segundo e desça com amplitude completa."
    ],
    commonMistakes: ["Balançar o tronco para subir o peso", "Apoiar o cotovelo em cima da coxa em vez da face interna"],
    cues: ["Braço travado na perna", "Pico de contração no topo"],
    alternatives: ["Rosca Scott", "Rosca Aranha (Spider Curl)"]
  },
  {
    id: "ex-rosca-aranha-spider-curl",
    name: "Rosca Aranha (Spider Curl) no Banco Inclinado",
    primaryMuscle: "Bíceps",
    secondaryMuscles: [],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Deite o tronco de bruços sobre o encosto de um banco inclinado a 45°.",
      "Deixe os braços caírem verticalmente perpendiculares ao solo segurando halteres ou barra W.",
      "Flexione os cotovelos subindo a carga sem mover os braços para trás.",
      "Aperte o topo da contração e desça suavemente."
    ],
    commonMistakes: ["Mover os cotovelos para trás transformando em remada", "Usar impulsos da coluna cervical"],
    cues: ["Braços perpendiculares ao chão o tempo todo", "Foco no pico da cabeça curta"],
    alternatives: ["Rosca Scott", "Rosca Concentrada"]
  },

  // =========================================================================
  // --- 9. BRAÇOS: TRÍCEPS ---
  // =========================================================================
  {
    id: "ex-triceps-corda-polia",
    name: "Tríceps Corda na Polia Alta",
    primaryMuscle: "Tríceps",
    secondaryMuscles: [],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Segure as extremidades da corda na polia alta com pegada neutra.",
      "Com cotovelos colados ao tronco e tronco levemente inclinado à frente, estenda os braços para baixo.",
      "No ponto mais baixo da extensão, afaste as pontas da corda para fora para máxima contração da cabeça lateral.",
      "Retorne controlando até os antebraços ficarem paralelos ao solo."
    ],
    commonMistakes: [
      "Mover os cotovelos para frente e para trás como se estivesse remando.",
      "Usar o peso do corpo inclinando-se excessivamente sobre a corda."
    ],
    cues: ["Trave os cotovelos nas costelas", "Abra a corda no final", "Estenda até o bloqueio muscular"],
    alternatives: ["Tríceps Pulley com Barra Reta", "Tríceps Testa", "Tríceps Francês"]
  },
  {
    id: "ex-triceps-pulley-barra-reta",
    name: "Tríceps Pulley na Polia com Barra Reta",
    primaryMuscle: "Tríceps",
    secondaryMuscles: [],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Segure a barra reta com pegada pronada na largura dos ombros.",
      "Cotovelos colados ao tronco e coluna alinhada.",
      "Empurre a barra para baixo até estender completamente os braços.",
      "Retorne até 90° de flexão mantendo os cotovelos imóveis."
    ],
    commonMistakes: ["Subir a barra até o queixo deslocando os cotovelos", "Abrir os cotovelos para fora"],
    cues: ["Pressione a barra para o chão", "Cotovelos colados"],
    alternatives: ["Tríceps Corda", "Tríceps Pulley Barra V"]
  },
  {
    id: "ex-triceps-pulley-barra-v",
    name: "Tríceps Pulley com Barra V",
    primaryMuscle: "Tríceps",
    secondaryMuscles: [],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Segure a barra V com as palmas voltadas semi-para dentro.",
      "Mantenha a postura firme e empurre a barra para baixo até a contração plena.",
      "Desça de forma explosiva sob controle e suba resistindo."
    ],
    commonMistakes: ["Tirar os cotovelos do tronco", "Empurrar com o peito"],
    cues: ["Mantenha punhos neutros", "Estenda totalmente"],
    alternatives: ["Tríceps Corda", "Tríceps Barra Reta"]
  },
  {
    id: "ex-triceps-testa-barra-w",
    name: "Tríceps Testa com Barra W no Banco Reto (Skull Crusher)",
    primaryMuscle: "Tríceps",
    secondaryMuscles: [],
    equipment: "Barra",
    difficulty: "Intermediário",
    instructions: [
      "Deite no banco plano segurando a barra W na pegada mais estreita, braços estendidos acima do peito/olhos.",
      "Incline os braços ligeiramente para trás (cerca de 10° a 15°) para manter tensão na cabeça longa.",
      "Flexione apenas os cotovelos descendo a barra controladamente em direção à testa ou topo da cabeça.",
      "Estenda os antebraços de volta sem deixar os cotovelos abrirem para fora."
    ],
    commonMistakes: [
      "Abrir excessivamente os cotovelos para os lados (estresse na articulação do cotovelo).",
      "Mover os braços inteiros como pullover em vez de dobrar apenas os cotovelos."
    ],
    cues: ["Cotovelos fechados apontados para o teto", "Desça a barra na linha da nuca/testa"],
    alternatives: ["Tríceps Testa com Halteres", "Tríceps Francês", "Tríceps Corda"]
  },
  {
    id: "ex-triceps-testa-halteres",
    name: "Tríceps Testa com Halteres (Pegada Neutra)",
    primaryMuscle: "Tríceps",
    secondaryMuscles: [],
    equipment: "Halteres",
    difficulty: "Iniciante",
    instructions: [
      "Deite no banco plano segurando dois halteres com pegada neutra (palmas frente a frente).",
      "Flexione os cotovelos descendo os halteres ao lado das orelhas.",
      "Estenda os braços para cima até contrair fortemente o tríceps sem bater os pesos."
    ],
    commonMistakes: ["Deixar os halteres caírem rápido", "Abrir os cotovelos"],
    cues: ["Desça nas laterais da cabeça", "Cotovelos imóveis"],
    alternatives: ["Tríceps Testa com Barra W", "Tríceps Corda"]
  },
  {
    id: "ex-triceps-frances-unilateral",
    name: "Tríceps Francês Unilateral com Halter",
    primaryMuscle: "Tríceps",
    secondaryMuscles: [],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Sentado com o tronco ereto, eleve o braço acima da cabeça com o halter seguro verticalmente.",
      "Dobre o cotovelo descendo o halter atrás do pescoço sentindo alongamento profundo da cabeça longa.",
      "Estenda o antebraço verticalmente até contrair o tríceps.",
      "Use a outra mão para apoiar e estabilizar o cotovelo de trabalho se necessário."
    ],
    commonMistakes: ["Arquear a lombar para compensar falta de mobilidade de ombro", "Abrir o cotovelo demais"],
    cues: ["Cotovelo voltado para o teto", "Alongamento total atrás da cabeça"],
    alternatives: ["Tríceps Francês na Polia com Corda", "Tríceps Testa"]
  },
  {
    id: "ex-triceps-frances-polia-corda",
    name: "Tríceps Francês na Polia com Corda Acima da Cabeça",
    primaryMuscle: "Tríceps",
    secondaryMuscles: [],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Ajuste a polia na altura média ou baixa com a corda.",
      "Fique de costas para a torre, puxe a corda por trás da cabeça e dê um passo à frente.",
      "Incline o tronco e estenda os braços para frente e para cima em diagonal.",
      "Flexione os cotovelos de volta atrás da cabeça sentindo o estiramento."
    ],
    commonMistakes: ["Perder o equilíbrio com a tração do cabo", "Mover os ombros"],
    cues: ["Estenda em diagonal à frente", "Alongamento intenso da cabeça longa"],
    alternatives: ["Tríceps Francês com Halter", "Tríceps Corda"]
  },
  {
    id: "ex-triceps-paralelas-peso",
    name: "Mergulho em Barras Paralelas Foco em Tríceps",
    primaryMuscle: "Tríceps",
    secondaryMuscles: ["Peitoral", "Ombros"],
    equipment: "Peso Corporal",
    difficulty: "Avançado",
    instructions: [
      "Suspenda o corpo nas barras paralelas mantendo o tronco rigorosamente ereto e cotovelos próximos às costelas.",
      "Flexione os cotovelos descendo até 90° mantendo os braços paralelos ao solo.",
      "Empurre para cima estendendo os cotovelos com força pura dos tríceps."
    ],
    commonMistakes: ["Inclinar o tronco para frente (vira exercício de peitoral)", "Descer demais forçando a cápsula anterior do ombro"],
    cues: ["Corpo ereto como uma estátua", "Cotovelos colados no corpo"],
    alternatives: ["Tríceps Banco", "Supino com Pegada Fechada"]
  },
  {
    id: "ex-supino-fechado-barra",
    name: "Supino com Pegada Fechada (Close-Grip Bench Press)",
    primaryMuscle: "Tríceps",
    secondaryMuscles: ["Peitoral", "Ombros"],
    equipment: "Barra",
    difficulty: "Intermediário",
    instructions: [
      "Deite no banco plano e segure a barra com pegada na largura dos ombros (cerca de 30-40cm de distância).",
      "Abaixe a barra mantendo os cotovelos colados junto às costelas até tocar o peitoral inferior.",
      "Empurre verticalmente focando a extensão dos cotovelos pelos tríceps."
    ],
    commonMistakes: [
      "Segurar com as mãos muito juntas (menos de 20cm), o que sobrecarrega os punhos inutilmente.",
      "Abrir os cotovelos para os lados."
    ],
    cues: ["Cotovelos raspando as costelas", "Foco no tríceps na subida"],
    alternatives: ["Mergulho em Paralelas", "Tríceps Testa"]
  },
  {
    id: "ex-triceps-coice-polia",
    name: "Tríceps Coice Unilateral na Polia (Kickback)",
    primaryMuscle: "Tríceps",
    secondaryMuscles: [],
    equipment: "Polia/Cabos",
    difficulty: "Iniciante",
    instructions: [
      "Ajuste a polia na altura do quadril sem acessório (segurando na bolinha do cabo).",
      "Incline o tronco paralelo ao chão com o cotovelo fixo e colado na costela.",
      "Estenda o antebraço totalmente para trás alinhando com o tronco.",
      "Segure a contração isométrica por 1 segundo e retorne até 90°."
    ],
    commonMistakes: ["Deixar o cotovelo cair durante a extensão", "Usar balanço do ombro"],
    cues: ["Cotovelo colado no teto", "Aperte a cabeça lateral no final"],
    alternatives: ["Tríceps Coice com Halter", "Tríceps Corda"]
  },

  // =========================================================================
  // --- 10. ABDÔMEN & CORE ---
  // =========================================================================
  {
    id: "ex-prancha-isometrica",
    name: "Prancha Frontal Isométrica",
    primaryMuscle: "Abdômen & Core",
    secondaryMuscles: ["Glúteos", "Ombros"],
    equipment: "Peso Corporal",
    difficulty: "Iniciante",
    instructions: [
      "Apoie os antebraços no solo alinhados verticalmente sob os ombros.",
      "Estenda as pernas apoiando na ponta dos pés na largura dos quadris.",
      "Mantenha cabeça, tronco, pelve e calcanhares em uma linha rígida sem afundar a lombar.",
      "Sustente a posição respirando com ritmo contínuo enquanto contrai o abdômen e glúteos."
    ],
    commonMistakes: ["Deixar o quadril cair em hiperlordose", "Prender a respiração"],
    cues: ["Puxe o umbigo para as costas", "Glúteos de pedra", "Empurre o chão com os antebraços"],
    alternatives: ["Abdominal na Roda (Ab Wheel)", "Prancha Lateral", "Deadbug"]
  },
  {
    id: "ex-abdominal-polia-cable-crunch",
    name: "Abdominal na Polia Alta Ajoelhado (Cable Crunch com Corda)",
    primaryMuscle: "Abdômen & Core",
    secondaryMuscles: [],
    equipment: "Polia/Cabos",
    difficulty: "Intermediário",
    instructions: [
      "Ajoelhe-se de frente para a polia alta segurando a corda ao lado das orelhas/têmporas.",
      "Fixe o quadril em posição estável sem sentar nos calcanhares.",
      "Flexione a coluna torácica e lombar enrolando o tronco e levando os cotovelos em direção às coxas.",
      "Esprema o abdômen por 1 segundo e retorne estendendo a coluna de forma controlada."
    ],
    commonMistakes: [
      "Sentar nos calcanhares dobrando os quadris em vez de flexionar a coluna abdominal.",
      "Puxar a corda com a força dos braços e tríceps."
    ],
    cues: ["Enrole o tronco como um caracol", "Aproxime as costelas da bacia", "Quadril travado"],
    alternatives: ["Abdominal no Solo com Carga", "Abdominal na Máquina"]
  },
  {
    id: "ex-abdominal-infra-paralela",
    name: "Elevação de Pernas na Paralela / Torre Abdominal",
    primaryMuscle: "Abdômen & Core",
    secondaryMuscles: [],
    equipment: "Peso Corporal",
    difficulty: "Intermediário",
    instructions: [
      "Apoie os antebraços nas almofadas da torre e encoste as costas no suporte.",
      "Com as pernas juntas, eleve os joelhos (ou pernas estendidas) em direção ao peito.",
      "No ponto mais alto, faça uma retroversão pélvica tirando a lombar do apoio para ativar o reto abdominal.",
      "Desça com controle evitando qualquer balanço."
    ],
    commonMistakes: ["Usar apenas os flexores de quadril sem enrolar a pelve", "Balançar o corpo como pêndulo"],
    cues: ["Enrole a pelve para cima", "Controle absoluto na descida"],
    alternatives: ["Elevação de Pernas Suspenso na Barra", "Abdominal Infra no Solo"]
  },
  {
    id: "ex-roda-abdominal-abwheel",
    name: "Rolamento com Roda Abdominal (Ab Wheel Rollout)",
    primaryMuscle: "Abdômen & Core",
    secondaryMuscles: ["Costas", "Ombros"],
    equipment: "Peso Corporal",
    difficulty: "Avançado",
    instructions: [
      "Ajoelhe-se em um colchonete segurando as manoplas da roda no chão abaixo dos ombros.",
      "Arredonde ligeiramente a coluna torácica e contraia o abdômen firmemente.",
      "Role a roda para frente estendendo o corpo o máximo que conseguir sem perder a estabilidade lombar.",
      "Puxe o corpo de volta contraindo o abdômen até a posição inicial."
    ],
    commonMistakes: [
      "Deixar a lombar ceder em arco côncavo durante a extensão (alto risco de estresse lombar).",
      "Puxar de volta com os quadris em vez do abdômen."
    ],
    cues: ["Costas levemente abauladas", "Trave o abdômen antes de rolar", "Retorne pela força da barriga"],
    alternatives: ["Prancha Isométrica", "Prancha com Pés na Bola Suíça"]
  },
  {
    id: "ex-abdominal-supra-solo",
    name: "Abdominal Crunch Tradicional no Solo",
    primaryMuscle: "Abdômen & Core",
    secondaryMuscles: [],
    equipment: "Peso Corporal",
    difficulty: "Iniciante",
    instructions: [
      "Deite de costas com os joelhos dobrados e pés firmes no chão.",
      "Mãos apoiadas na nuca ou cruzadas sobre o peito (sem puxar o pescoço).",
      "Eleve as escápulas do chão enrolando as costelas em direção ao umbigo.",
      "Segure a contração máxima por 1 segundo soltando todo o ar e desça controladamente."
    ],
    commonMistakes: ["Puxar o pescoço com as mãos flexionando a cervical", "Subir o tronco inteiro tirando a lombar do chão"],
    cues: ["Olhar para o teto", "Esmague as costelas contra a pelve", "Solte o ar na subida"],
    alternatives: ["Abdominal na Polia com Corda", "Abdominal Declinado"]
  },
  {
    id: "ex-prancha-lateral-estatica",
    name: "Prancha Lateral Isométrica (Oblíquos)",
    primaryMuscle: "Abdômen & Core",
    secondaryMuscles: ["Glúteos"],
    equipment: "Peso Corporal",
    difficulty: "Iniciante",
    instructions: [
      "Deite de lado apoiado sobre um antebraço com o cotovelo posicionado diretamente sob o ombro.",
      "Pernas estendidas com os pés sobrepostos ou alinhados no solo.",
      "Eleve o quadril formando uma linha reta dos ombros aos pés.",
      "Mantenha a posição sustentada contraindo os oblíquos do lado de apoio."
    ],
    commonMistakes: ["Deixar o quadril despencar em direção ao chão", "Rotacionar o tronco para a frente"],
    cues: ["Quadril alto", "Peito aberto", "Linha reta perfeita"],
    alternatives: ["Russian Twist", "Woodchopper na Polia"]
  },
  {
    id: "ex-russian-twist-anilha",
    name: "Giro Russo (Russian Twist) com Anilha / Halter",
    primaryMuscle: "Abdômen & Core",
    secondaryMuscles: [],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Sente-se no solo com os joelhos dobrados e incline o tronco para trás em cerca de 45°.",
      "Mantenha os pés suspensos do chão ou calcanhares apoiados.",
      "Segure a anilha com as duas mãos e faça uma rotação controlada do tronco levando o peso de um lado para o outro.",
      "Gire os ombros acompanhando o movimento sem mover as pernas."
    ],
    commonMistakes: ["Mover apenas os braços sem girar o tronco", "Arredondar a coluna lombar"],
    cues: ["Gire a partir das costelas", "Controle na desaceleração lateral"],
    alternatives: ["Prancha Lateral", "Woodchopper na Polia"]
  },
  {
    id: "ex-abdominal-vacuum",
    name: "Stomach Vacuum (Vácuo Abdominal e Transverso)",
    primaryMuscle: "Abdômen & Core",
    secondaryMuscles: [],
    equipment: "Peso Corporal",
    difficulty: "Intermediário",
    instructions: [
      "Fique em pé ou em quatro apoios e expire completamente todo o ar dos pulmões.",
      "Sem inspirar, expanda a caixa torácica e sugue a parede abdominal para dentro e para cima, colando o umbigo na coluna vertebral.",
      "Mantenha a sucção isométrica do vácuo por 10 a 20 segundos.",
      "Relaxe e inspire suavemente pelo nariz."
    ],
    commonMistakes: ["Inspirar ar durante a sustentação", "Estufar a barriga"],
    cues: ["Afunde a barriga como se quisesse colocar uma calça apertada", "Segure a pressão interna"],
    alternatives: ["Prancha Frontal Isométrica", "Deadbug"]
  },

  // =========================================================================
  // --- 11. MODALIDADES ESPORTIVAS, FUNCIONAIS & HÍBRIDAS ---
  // =========================================================================
  {
    id: "ex-corrida-ao-ar-livre",
    name: "Corrida Contínua / Fartlek",
    primaryMuscle: "Cardio & Resistência",
    secondaryMuscles: ["Pernas (Quadríceps)", "Panturrilhas", "Glúteos"],
    equipment: "Peso Corporal",
    difficulty: "Intermediário",
    instructions: [
      "Aquecimento dinâmico com trote leve e mobilidade de tornozelos por 5 min.",
      "Mantenha cadência entre 165-175 passos por minuto.",
      "Postura ereta com inclinação sutil a partir dos tornozelos.",
      "Pouso no mediopé sob o centro de gravidade."
    ],
    commonMistakes: ["Overstriding (aterrissar com o calcanhar muito à frente)", "Tensões nos ombros e mandíbula"],
    cues: ["Passadas leves e silenciosas", "Braços relaxados balançando a 90°"],
    alternatives: ["Ciclismo Outdoor", "Remo Ergométrico", "Pular Corda"]
  },
  {
    id: "ex-hyrox-skierg",
    name: "SkiErg Intervalado (Hyrox Station)",
    primaryMuscle: "Cardio & Resistência",
    secondaryMuscles: ["Costas", "Tríceps", "Abdômen & Core"],
    equipment: "Máquina",
    difficulty: "Avançado",
    instructions: [
      "Pés na largura dos ombros de frente para a máquina.",
      "Inicie com os braços elevados e pegada firme nas manoplas.",
      "Puxe para baixo flexionando quadris e joelhos simultaneamente, usando o peso do corpo.",
      "Estenda os quadris na subida retornando à posição inicial de forma fluida."
    ],
    commonMistakes: ["Usar apenas os braços sem dobrar o quadril", "Arredondar a coluna lombar na puxada"],
    cues: ["Puxe com o tronco e dorsais", "Solte o ar na descida"],
    alternatives: ["Remo Ergométrico", "Slam Ball"]
  },
  {
    id: "ex-hyrox-sled-push",
    name: "Sled Push (Empurrar Trenó na Pista)",
    primaryMuscle: "Pernas (Quadríceps)",
    secondaryMuscles: ["Glúteos", "Panturrilhas", "Abdômen & Core"],
    equipment: "Peso Corporal",
    difficulty: "Avançado",
    instructions: [
      "Segure as barras verticais do trenó com os braços estendidos ou cotovelos semiflexionados.",
      "Incline o tronco a 45 graus formando uma linha reta dos ombros aos calcanhares.",
      "Empurre a pista dando passadas firmes com a ponta dos pés gerando tração contínua."
    ],
    commonMistakes: ["Manter o quadril muito alto", "Passadas excessivamente longas"],
    cues: ["Abaixe o centro de gravidade", "Empurre o chão para trás"],
    alternatives: ["Leg Press Pesado", "Passada com Halteres"]
  },
  {
    id: "ex-hyrox-wall-balls",
    name: "Wall Balls (Arremesso no Alvo)",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Pernas (Quadríceps)", "Glúteos", "Tríceps"],
    equipment: "Peso Corporal",
    difficulty: "Intermediário",
    instructions: [
      "Segure a medicine ball de 6-9kg na altura do queixo.",
      "Agache profundamente até que os quadris fiquem abaixo dos joelhos.",
      "Suba com impulsão máxima das pernas e arremesse a bola no alvo a 3m de altura.",
      "Apanhe a bola na descida e entre diretamente no próximo agachamento."
    ],
    commonMistakes: ["Parar a bola no peito pausando o ritmo", "Agachar sem profundidade"],
    cues: ["Use a impulsão das pernas", "Olhos no alvo superior"],
    alternatives: ["Thruster com Halteres", "Dumbbell Push Press"]
  },
  {
    id: "ex-fight-shadow",
    name: "Shadow Boxing com Halteres Leves",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Abdômen & Core", "Cardio & Resistência"],
    equipment: "Halteres",
    difficulty: "Intermediário",
    instructions: [
      "Adote a base de combate mantendo o queixo recolhido e guarda alta.",
      "Desfira combinações de jab, direto, cruzado e upper mantendo cotovelos protegendo o tronco.",
      "Gire o quadril e o calcanhar traseiro para transferir a potência mecânica do solo."
    ],
    commonMistakes: ["Estender e hiperextender bruscamente o cotovelo", "Baixar a guarda após bater"],
    cues: ["Bate e volta na bochecha", "Respira a cada golpe"],
    alternatives: ["Manopla de Foco", "Saco de Pancadas"]
  },
  {
    id: "ex-fight-sprawl",
    name: "Sprawl Explosivo de Defesa de Queda",
    primaryMuscle: "Pernas (Quadríceps)",
    secondaryMuscles: ["Abdômen & Core", "Cardio & Resistência"],
    equipment: "Peso Corporal",
    difficulty: "Intermediário",
    instructions: [
      "A partir da base de luta, jogue as pernas rapidamente para trás.",
      "Projete os quadris contra o solo com o peito erguido bloqueando a entrada imaginária de queda.",
      "Retorne instantaneamente à base de combate pronto para contra-atacar."
    ],
    commonMistakes: ["Cair de joelhos no solo", "Demorar para voltar em pé"],
    cues: ["Quadris pesados no chão", "Volta rápido em base"],
    alternatives: ["Burpees sem Salto", "Agachamento Pliométrico"]
  },
  {
    id: "ex-swim-crawl-sprints",
    name: "Tiros de 50m Nado Crawl (Estilo Livre)",
    primaryMuscle: "Cardio & Resistência",
    secondaryMuscles: ["Costas", "Ombros", "Tríceps"],
    equipment: "Peso Corporal",
    difficulty: "Intermediário",
    instructions: [
      "Mantenha o corpo alinhado horizontalmente na superfície da água com o olhar voltado para o fundo.",
      "Braçada com pegada alta (high elbow catch) puxando a água sob a linha do corpo.",
      "Respiração bilateral a cada 3 braçadas para equilíbrio muscular.",
      "Pernada contínua a partir do quadril."
    ],
    commonMistakes: ["Levantar a cabeça para respirar afundando as pernas", "Dobrar excessivamente os joelhos na pernada"],
    cues: ["Corpo como uma flecha", "Puxe a água até a coxa"],
    alternatives: ["Nado Costas", "Remo Ergométrico"]
  },
  {
    id: "ex-crossfit-thruster",
    name: "Thruster com Barra Olímpica",
    primaryMuscle: "Ombros",
    secondaryMuscles: ["Pernas (Quadríceps)", "Glúteos", "Tríceps", "Abdômen & Core"],
    equipment: "Barra",
    difficulty: "Avançado",
    instructions: [
      "Barra apoiada nos ombros na posição de front rack, cotovelos altos.",
      "Realize um agachamento frontal completo abaixo da linha paralela.",
      "Exploda na subida e use a aceleração para impulsionar a barra diretamente para cima da cabeça.",
      "Trave os braços no topo alinhados com as orelhas."
    ],
    commonMistakes: ["Empurrar a barra antes de completar a extensão das pernas", "Deixar os cotovelos caírem no agachamento"],
    cues: ["Cotovelos altos", "Salto sem tirar os pés"],
    alternatives: ["Thruster com Halteres", "Wall Balls"]
  },
  {
    id: "ex-fut-sand-header-jump",
    name: "Salto de Cabeceio na Areia Fofa",
    primaryMuscle: "Glúteos",
    secondaryMuscles: ["Pernas (Quadríceps)", "Panturrilhas", "Abdômen & Core"],
    equipment: "Peso Corporal",
    difficulty: "Intermediário",
    instructions: [
      "Posicione-se em base de ataque na areia fofa.",
      "Flexione os joelhos e salte verticalmente com impulsão simultânea dos dois pés.",
      "Projete o peito e teste a bola no ponto mais alto com arqueamento e flexão rápida de tronco.",
      "Aterrisse amortecendo com a planta dos pés na areia."
    ],
    commonMistakes: ["Saltar apenas com uma perna perdendo equilíbrio na areia", "Cabecear com os olhos fechados"],
    cues: ["Impulsione para o alto", "Ataque a bola na subida"],
    alternatives: ["Box Jump na Caixa", "Salto Vertical com Agachamento"]
  },
  {
    id: "ex-dance-samba-funk-burst",
    name: "Cardio Dance Rítmico (FitDance / Zumba)",
    primaryMuscle: "Cardio & Resistência",
    secondaryMuscles: ["Glúteos", "Pernas (Quadríceps)", "Abdômen & Core"],
    equipment: "Peso Corporal",
    difficulty: "Iniciante",
    instructions: [
      "Siga a cadência musical alternando passadas de sambada e agachamento rítmico.",
      "Eleve os braços em sincronia com as rotações de quadril.",
      "Mantenha a intensidade aeróbica sustentada com sorriso e respiração contínua."
    ],
    commonMistakes: ["Reter a respiração", "Movimentos rígidos sem soltura articular"],
    cues: ["Sinta o ritmo da música", "Solte os quadris e core"],
    alternatives: ["Pular Corda", "Step Aeróbico"]
  },
  {
    id: "ex-cal-muscle-up",
    name: "Muscle-Up na Barra Fixa",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Tríceps", "Peitoral", "Ombros", "Abdômen & Core"],
    equipment: "Peso Corporal",
    difficulty: "Avançado",
    instructions: [
      "Pegada falsa ou pronada com dedos sobre a barra.",
      "Inicie com balanço controlado (kip) ou subida estrita puxando a barra em direção ao abdômen superior.",
      "Transicione os cotovelos rapidamente por cima da barra.",
      "Empurre até a extensão completa dos braços na parte superior (dip)."
    ],
    commonMistakes: [
      "Subir um braço de cada vez ('asa de frango')",
      "Puxar a barra muito perto do queixo sem espaço de rotação"
    ],
    cues: ["Puxe a barra para o umbigo", "Gire os punhos velozmente"],
    alternatives: ["Barra Fixa Pega Peito", "Mergulho em Paralelas com Carga"]
  }
];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find((e) => e.id === id);
}

function normalizeSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

export function resolveExerciseDetails(
  nameOrId: string,
  fallbackMuscle?: string
): Exercise {
  if (!nameOrId) {
    return {
      id: "ex-custom",
      name: "Exercício Personalizado",
      primaryMuscle: (fallbackMuscle as any) || "Peitoral",
      secondaryMuscles: ["Abdômen & Core"],
      equipment: "Barra",
      difficulty: "Intermediário",
      instructions: [
        "Ajuste a postura mantendo a curvatura anatômica da coluna.",
        "Execute a fase excêntrica de forma controlada (2-3 segundos).",
        "Ative a contração muscular no pico da fase concêntrica."
      ],
      commonMistakes: [
        "Uso de impulso ou compensações posturais excessivas.",
        "Amplitude de movimento incompleta."
      ],
      cues: ["Conexão mente-músculo", "Controle excêntrico", "Respiração fluida"],
      alternatives: ["Variação com Halteres", "Variação na Polia"]
    };
  }

  // 1. Direct ID match
  const byId = EXERCISE_LIBRARY.find(
    (e) => e.id.toLowerCase() === nameOrId.toLowerCase()
  );
  if (byId) return byId;

  const normalizedQuery = normalizeSearch(nameOrId);

  // 2. Exact or high-match by name
  const byNameExact = EXERCISE_LIBRARY.find(
    (e) => normalizeSearch(e.name) === normalizedQuery
  );
  if (byNameExact) return byNameExact;

  // 3. Partial match (query contains library name or library name contains query)
  const byNamePartial = EXERCISE_LIBRARY.find((e) => {
    const normName = normalizeSearch(e.name);
    return normName.includes(normalizedQuery) || normalizedQuery.includes(normName);
  });
  if (byNamePartial) return byNamePartial;

  // 4. Keyword tokens match
  const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 2);
  let bestMatch: Exercise | null = null;
  let maxScore = 0;

  for (const ex of EXERCISE_LIBRARY) {
    const norm = normalizeSearch(`${ex.name} ${ex.primaryMuscle} ${ex.equipment}`);
    let score = 0;
    for (const token of queryTokens) {
      if (norm.includes(token)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = ex;
    }
  }

  if (bestMatch && maxScore >= 2) {
    return bestMatch;
  }

  // 5. Intelligent fallback synthesizing full biomechanical guide
  const cleanTitle = nameOrId
    .replace(/\s*\(\d+x.*?\)/gi, "")
    .replace(/^Treino\s+[A-Z]\s*—\s*/gi, "")
    .trim();

  const isCardio =
    cleanTitle.toLowerCase().includes("esteira") ||
    cleanTitle.toLowerCase().includes("escada") ||
    cleanTitle.toLowerCase().includes("bicicleta") ||
    cleanTitle.toLowerCase().includes("cardio") ||
    cleanTitle.toLowerCase().includes("corrida") ||
    cleanTitle.toLowerCase().includes("hiit");

  if (isCardio) {
    return {
      id: `ex-cardio-${normalizedQuery.slice(0, 15)}`,
      name: cleanTitle,
      primaryMuscle: "Cardio & Resistência",
      secondaryMuscles: ["Pernas (Quadríceps)", "Glúteos", "Panturrilhas"],
      equipment: "Máquina",
      difficulty: "Iniciante",
      instructions: [
        "Inicie com 2 a 3 minutos de aquecimento dinâmico em cadência moderada.",
        "Mantenha o tronco alinhado, abdômen levemente ativo e ombros relaxados para baixo.",
        "Mantenha a frequência cardíaca na Zona 2 (65-75% da FC máxima) ou em tiros de HIIT conforme o protocolo.",
        "Conclua com 2 minutos de resfriamento para desaceleração gradual do débito cardíaco."
      ],
      commonMistakes: [
        "Apoiar todo o peso do corpo sobre o corrimão (reduz em até 30% o gasto calórico).",
        "Inclinar o pescoço excessivamente para baixo durante o exercício.",
        "Interromper o movimento bruscamente na velocidade máxima."
      ],
      cues: ["Tronco ereto sem segurar com força", "Passadas firmes e cadenciadas", "Respiração nasal/bucal ritmada"],
      alternatives: ["Simulador de Escada", "Esteira Inclinada", "Bicicleta Ergométrica", "Elíptico"]
    };
  }

  const guessedMuscle = (fallbackMuscle as any) || "Peitoral";

  return {
    id: `ex-gen-${normalizedQuery.slice(0, 15)}`,
    name: cleanTitle,
    primaryMuscle: guessedMuscle,
    secondaryMuscles: ["Abdômen & Core", "Ombros"],
    equipment: cleanTitle.toLowerCase().includes("halteres")
      ? "Halteres"
      : cleanTitle.toLowerCase().includes("polia") || cleanTitle.toLowerCase().includes("cabo")
      ? "Polia/Cabos"
      : cleanTitle.toLowerCase().includes("máquina")
      ? "Máquina"
      : "Barra",
    difficulty: "Intermediário",
    instructions: [
      `Ajuste o equipamento ou pesos para o alinhamento anatômico de ${guessedMuscle}.`,
      "Estabilize o core, deprima as escápulas e mantenha a coluna em posição neutra.",
      "Execute a fase excêntrica de 2 a 3 segundos com alongamento completo sob controle.",
      "Conduza a fase concêntrica acelerando com intenção máxima de ativação muscular."
    ],
    commonMistakes: [
      "Perder a tensão excêntrica deixando o peso despencar.",
      "Hiperextender articulações no ponto de bloqueio articular.",
      "Compensar o movimento com balanço do tronco ou impulso lombar."
    ],
    cues: ["Retraia as escápulas", "Controle a descida em 3 segundos", "Foque na contração do músculo alvo"],
    alternatives: ["Variação com Halteres", "Variação na Polia", "Variação em Máquina Articulada"]
  };
}
