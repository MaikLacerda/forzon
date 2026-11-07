# 📦 FORZON — Pacote de Arquivos e Instruções para Envio ao Git (Sem Quebrar o Build)

Este documento reúne todas as informações necessárias, instruções passo a passo de terminal e a estrutura completa de arquivos do projeto **FORZON** para garantir que você suba o código ao GitHub sem nenhum erro de build, lint ou tipagem.

---

## ⚡ Comandos Rápidos no Terminal para Subir Tudo ao Git

Abra o seu terminal (Git Bash, PowerShell ou Terminal macOS/Linux) na pasta raiz do projeto e execute os comandos em ordem:

```bash
# 1. Verificar o status dos arquivos modificados e novos
git status

# 2. Adicionar TODOS os arquivos do projeto (incluindo configs, imagens e componentes)
git add .

# 3. Criar o commit com mensagem padronizada
git commit -m "feat(forzon): atualiza identidade oficial, novas abas, auth firebase e endpoints do coach"

# 4. Enviar para a branch principal no GitHub
git push origin main
```

> **Dica para não quebrar no deploy da Vercel/GitHub:** Antes do push, você pode rodar localmente `npm run build` ou `npm run lint` para checar se o TypeScript e o Vite compilam perfeitamente sem erros.

---

## 📁 Estrutura Completa de Pastas & Arquivos do FORZON

Abaixo está o mapa de todos os arquivos que compõem o projeto funcional e seus respectivos papéis:

```
forzon/
├── index.html                           # Metatags PWA, status bar #090d16, OpenGraph e registro do sw.js
├── package.json                         # Dependências (React 19, Tailwind v4, Lucide, Firebase, Three, Express)
├── package-lock.json                    # Bloqueio de versões exatas de dependências
├── tsconfig.json                        # Configuração do TypeScript ES2022 / React-JSX
├── vite.config.ts                       # Configuração do Vite 8 com Tailwind v4 e aliases '@'
├── server.ts                            # Servidor Express, endpoints do Gemini Coach, biofeedback e downloads
├── firebase.json                        # Configuração do Cloud Firestore
├── firestore.rules                      # Regras de segurança Firestore (isolamento por UID)
│
├── public/                              # Ativos estáticos públicos e PWA
│   ├── forzon-logo.jpg                  # Logo oficial FORZON (squircle cromo + F em cyan neon #00d2ff)
│   ├── icon.svg & favicon.svg           # Ícones vetoriais SVG de alta resolução
│   ├── pwa-192x192.png & 512x512.png    # Ícones de alta resolução padrão Play Store
│   ├── pwa-maskable-512x512.png         # Ícone adaptativo maskable para Android
│   ├── manifest.webmanifest             # Manifesto PWA com id "com.forzon.fitness.app"
│   ├── sw.js                            # Service Worker para cache e uso offline
│   └── .well-known/
│       └── assetlinks.json              # Digital Asset Links para remoção da barra de URL
│
└── src/                                 # Código-fonte React / TypeScript
    ├── main.tsx                         # Ponto de entrada do React
    ├── App.tsx                          # Gerenciamento de rotas e modais centrais
    ├── index.css                        # Estilos globais e tokens de cores Kinetic Obsidian
    ├── types/                           # Tipos TypeScript de treinos, usuários e biofeedback
    ├── data/
    │   ├── firebaseWebConfig.json       # Configuração web do Firebase (projeto forzon-c9339)
    │   └── ownedExerciseVideos.json     # Mapeamento dos 104 vídeos de exercícios
    ├── services/
    │   ├── aiService.ts                 # Integração com endpoints do Coach IA
    │   ├── workoutPlanPolicy.ts         # Regras de prescrição (ABC, Upper/Lower, cotas por nível)
    │   └── workoutSplits.ts             # Divisões e montagem dos treinos
    └── components/
        ├── layout/
        │   ├── Header.tsx               # Top Bar com o emblema oficial FORZON
        │   └── BottomNavigation.tsx     # 5 Abas: Treino, Nutrição, Bio, Comunidade, Perfil
        ├── workout/
        │   ├── LiveWorkoutModal.tsx     # Treino ao vivo, timer persistente, numpad e ATP-CP
        │   └── ExerciseSwapModal.tsx    # Modal de substituição biomecânica
        ├── biofeedback/
        │   └── BiofeedbackReadinessCard.tsx # Painel de Prontidão (84/100), Sono, HRV e GPS
        ├── nutrition/
        │   └── RecoveryMealModal.tsx    # Refeição pós-treino baseada em volume (kg)
        └── ai/
            └── AIWorkoutNutritionIntakeModal.tsx # Anamnese e intake do Coach IA
```

---

## 🔒 Garantias para o Deploy não Falhar

1. **Dependências Corretas**: O arquivo `package.json` já contém o `@google/genai`, `firebase`, `framer-motion`, `lucide-react` e `@tailwindcss/vite` devidamente declarados.
2. **Variáveis de Ambiente**: Os identificadores de conexão web do Firebase estão salvos em `src/data/firebaseWebConfig.json` e não dependem obrigatoriamente de variáveis manuais na Vercel para subir.
3. **Imagens e Vídeos**: A logo oficial `public/forzon-logo.jpg` e os ícones SVGs estão na pasta `public/`, sendo copiados automaticamente para a pasta `dist` durante o comando `npm run build`.

Com o comando `git push origin main`, seu repositório remoto e a esteira de CI/CD (Vercel ou similar) estarão 100% atualizados e prontos para produção!
