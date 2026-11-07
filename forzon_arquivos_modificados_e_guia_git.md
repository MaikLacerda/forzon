# 📦 FORZON — Resumo de Arquivos Modificados & Guia de Commit Git

Abaixo estão todos os arquivos modificados e criados no projeto **FORZON**, juntamente com os comandos exatos de terminal para enviar tudo ao seu repositório no GitHub.

---

## ⚡ Comandos Rápidos no Terminal (Git)

Abra o seu terminal (Git Bash, PowerShell ou Terminal macOS/Linux) dentro da pasta raiz do projeto FORZON e execute:

```bash
# 1. Adicionar todos os arquivos modificados e novos
git add .

# 2. Criar o commit com mensagem descritiva
git commit -m "feat(forzon): atualiza identidade visual oficial, novas abas de treino e biofeedback, auth Firebase e integracoes"

# 3. Enviar para o repositório remoto na branch principal
git push origin main
```

---

## 📁 Relação dos Arquivos Modificados & Criados

### 1. Marca, Branding & Identidade Visual
* **`public/forzon-logo.jpg`** — Imagem oficial da logo FORZON (squircle escuro, haltere e letra F aerodinâmica com acabamento em cromo e cyan elétrico `#00d2ff`).
* **`public/icon.svg` & `public/favicon.svg`** — Ícone vetorial SVG oficial de alta resolução para navegador e telas mobile.
* **`public/pwa-192x192.png` & `public/pwa-512x512.png`** — Ícones padrão para PWA e Google Play Store.
* **`public/pwa-maskable-512x512.png`** — Ícone adaptativo maskable para Android.
* **`index.html`** — Atualizado com metatags PWA completas, `theme-color: #090d16`, título oficial: *"FORZON — More Than Fitness. A Way of Life."*, Open Graph e registro do Service Worker.

### 2. Autenticação & Banco de Dados (Firebase Spark)
* **`src/data/firebaseWebConfig.json`** — Configuração web do projeto Firebase `forzon-c9339`.
* **`firestore.rules`** — Regras de segurança do Firestore (isolamento por UID e exigência de e-mail verificado).
* **`firebase.json`** — Configuração de integração das regras do Firestore.
* **`LEIA-ME-CONTAS.md`** — Documento técnico sobre autenticação e garantia de contas limpas sem dados falsos.

### 3. Telas & Componentes de Treino e Biofeedback
* **`src/components/layout/Header.tsx`** — Cabeçalho com o emblema oficial FORZON e tipografia estilizada.
* **`src/components/layout/BottomNavigation.tsx`** — Nova barra de navegação com as abas: **Treino**, **Nutrição**, **Bio (Desempenho)**, **Comunidade** e **Perfil**.
* **`src/components/workout/LiveWorkoutModal.tsx`** — Execução ao vivo com cronômetro contínuo persistente, numpad tátil para kg e reps, e timer de descanso ATP-CP com botões incrementais táteis (`+15s`, `+30s`, `+60s`).
* **`src/components/workout/ExerciseSwapModal.tsx`** — Modal de troca biomecânica de exercício por aparelho ocupado.
* **`src/components/nutrition/RecoveryMealModal.tsx`** — Sugestão de refeição de recuperação pós-treino baseada no volume levantado (kg).
* **`src/components/ai/AIWorkoutNutritionIntakeModal.tsx`** — Avaliação completa de intake com Coach e Nutricionista IA.
* **`src/components/biofeedback/BiofeedbackReadinessCard.tsx`** — Aba dedicada de Desempenho & Biofeedback com prontidão 84/100, sono, HRV e estresse.

### 4. Backend Express, Inteligência Artificial & Políticas
* **`server.ts`** — Endpoints de IA calibrados para o FORZON Coach (Gemini 2.5/Flash), sincronização de treinos e rotas de suporte.
* **`src/services/workoutPlanPolicy.ts`** — Diretrizes de volume por nível (Iniciante, Intermediário, Avançado e Atleta), proibição de prancha isométrica e cardio integrado.
* **`src/services/workoutSplits.ts`** — Divisões ABC, Upper/Lower e Full Body.

### 5. Configuração PWA & Google Play Store (TWA / AAB)
* **`public/manifest.webmanifest` & `public/manifest.json`** — ID fixado em `com.forzon.fitness.app`, display standalone e atalhos de app.
* **`public/.well-known/assetlinks.json`** — Vínculo de segurança Digital Asset Links para eliminar a barra de navegador no Android.
* **`public/sw.js`** — Service worker para suporte offline aos 104 vídeos de exercícios e telas.
* **`PLAYSTORE_TWA_GUIDE.md`** — Guia passo a passo para gerar o pacote `.aab` via Bubblewrap CLI ou PWABuilder.

---

## 💡 Verificação Rápida Pré-Commit

Caso queira inspecionar exatamente quais arquivos foram alterados antes do commit, rode:
```bash
git status
```
Para ver as diferenças linha a linha:
```bash
git diff
```
Após o `git push origin main`, seu repositório no GitHub e o deploy automático na Vercel estarão 100% atualizados!
