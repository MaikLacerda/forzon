# 🐙 FORZON — Guia de Publicação no GitHub

O repositório Git local já foi inicializado com a branch `main` e todos os arquivos alterados e criados estão rastreados e prontos para envio.

---

## ⚡ 1. Comandos para Enviar para o GitHub

Para publicar o código no seu repositório do GitHub, execute os seguintes passos no seu terminal ou ambiente de desenvolvimento:

```bash
# 1. Crie um novo repositório vazio no GitHub (ex: forzon-app) sem README inicial

# 2. Conecte o repositório local ao seu repositório remoto no GitHub:
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# 3. Defina a branch principal como main:
git branch -M main

# 4. Envie todos os arquivos e histórico para o GitHub:
git push -u origin main
```

---

## 📋 2. Resumo das Alterações Realizadas

### Marca & Identidade Visual
- **Nome Oficial**: `FORZON`
- **Slogan**: `MORE THAN FITNESS. A WAY OF LIFE.`
- **Sub-slogan**: `Train together. Fuel your body. Share your progress.`
- **Paleta de Cores**: Mantida a estética de alto impacto com **Azul Neon / Cyan Elétrico** (`#00d2ff`, `text-cyan-400`).
- **Logo Oficial**: Emblema squircle com haltere cromado e letra "F" aerodinâmica com acabamento azul neon, acompanhado da tipografia **FOR<span style="color:#00d2ff">Z</span>ON** com o "Z" em azul ciano.
- **Ativos**:
  - `public/forzon-logo.jpg` e `public/forzon-hero.jpg` gerados diretamente do asset anexado.
  - `public/icon.svg` e `public/favicon.svg` atualizados com arte vetorial do novo símbolo.
  - `src/components/layout/Header.tsx`: Exibe o novo emblema FORZON e tipografia estilizada.
  - `src/components/brand/ForzonBrandBanner.tsx`: Banner de posicionamento de marca na tela inicial com os 3 pilares (`TRAIN`, `NUTRITION`, `COMMUNITY`) e botão interativo de conformidade com a Play Store.

### Google Play Store & TWA
- `public/manifest.webmanifest` & `public/manifest.json`: Configurados com `id: "com.forzon.fitness.app"`, nome completo, orientação, display standalone e atalhos rápidos.
- `public/.well-known/assetlinks.json`: Configurado com o package `com.forzon.fitness.app`.
- `index.html`: Metatags de PWA, OpenGraph e Twitter cards atualizadas para FORZON.
- `public/sw.js`: Service worker ativado para cache offline e inicialização rápida.

### Inteligência Artificial & Backend
- `server.ts` & `src/services/aiService.ts`: Calibrados para o **FORZON Coach** com integração resiliente aos modelos mais recentes do Gemini, respeitando os objetivos do atleta definidos no onboarding.
- Todos os componentes de UI (`SettingsModal`, `AICoachDrawer`, `OnboardingModal`, `LiveWorkoutModal`, `UpgradePlanModal`, `SocialView`, `WorkoutsView`, etc.) atualizados para a nova marca.
