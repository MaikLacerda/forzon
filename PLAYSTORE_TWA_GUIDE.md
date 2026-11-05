# 🚀 FORZON — Guia de Publicação na Google Play Store (TWA / AAB)

Este documento descreve todos os arquivos e configurações implementados para publicar o **FORZON** na **Google Play Store** através do padrão oficial do Google: **Trusted Web Activity (TWA)** e geração do pacote **Android App Bundle (.aab)**.

---

## 📱 1. Dados Cadastrais do Aplicativo na Google Play

| Parâmetro | Valor Configurado |
| :--- | :--- |
| **Nome do App (Play Store)** | `FORZON — More Than Fitness. A Way of Life.` |
| **Nome Curto (Launcher / Ícone)** | `FORZON` |
| **Package ID / Application ID** | `com.forzon.fitness.app` |
| **Slogan Oficial** | *MORE THAN FITNESS. A WAY OF LIFE.* |
| **Subtítulo** | *Train together. Fuel your body. Share your progress.* |
| **Pilares da Plataforma** | TRAIN · NUTRITION · COMMUNITY |
| **Cor Primária / Acento** | Azul Neon / Cyan (`#00d2ff`, `text-cyan-400`) |
| **Theme Color (Barra de Status)** | `#090d16` |
| **Modo de Exibição** | `standalone` (tela cheia sem barra de navegador) |
| **Orientação Padrão** | `portrait-primary` |

---

## 📁 2. Arquivos Modificados e Criados no Projeto

### A. Metadados e Manifesto PWA
1. **`public/manifest.webmanifest` & `public/manifest.json`**:
   - ID fixado em `com.forzon.fitness.app`.
   - Atalhos rápidos configurados para a gaveta de aplicativos Android: *Treinar*, *Nutrição*, *Comunidade*, *Ao Vivo*.
   - Associação nativa via `related_applications` com plataforma `play`.

2. **`public/.well-known/assetlinks.json`**:
   - Arquivo do protocolo **Digital Asset Links** que valida o vínculo entre o domínio web e o aplicativo Android (eliminando a barra de endereço da URL ao abrir o app).

3. **`index.html`**:
   - Metatags PWA completas: `mobile-web-app-capable`, `theme-color`, Open Graph e Twitter Cards com imagem de alta resolução do FORZON.
   - Registro automático do Service Worker `sw.js`.

4. **`public/sw.js`**:
   - Service worker para cache de assets e funcionamento offline completo.

### B. Ativos Visuais e Ícones
1. **`public/forzon-logo.jpg`**:
   - Imagem oficial enviada (emblema em squircle escuro com barra e "F" aerodinâmico em cromo e azul ciano + tipografia FORZON com o "Z" ciano).
2. **`public/icon.svg` & `public/favicon.svg`**:
   - Vetor SVG de alta resolução com acabamento cromado e brilho elétrico.
3. **`public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-maskable-512x512.png`**:
   - Ícones nos padrões exigidos pela Google Play Store (inclusive modo adaptativo/maskable).

---

## 🛠️ 3. Como Gerar o Arquivo `.aab` para o Google Play Console

### Método 1: Via Bubblewrap CLI (Oficial da equipe do Google Chrome / Android)
O Bubblewrap cria um projeto nativo Android a partir do `manifest.webmanifest`:

1. Instale o Bubblewrap CLI:
   ```bash
   npm install -g @bubblewrap/cli
   ```

2. Inicialize o projeto apontando para o seu domínio publicado:
   ```bash
   bubblewrap init --manifest=https://seu-dominio-forzon.com/manifest.webmanifest
   ```

3. Compile o pacote de produção Android App Bundle:
   ```bash
   bubblewrap build
   ```
   *(O comando solicitará sua chave de assinatura Keystore ou gerará uma nova automaticamente).*

4. O arquivo final **`app-release-bundle.aab`** estará pronto para upload no Google Play Console!

---

### Método 2: Via PWABuilder (Interface Visual)
1. Acesse [https://www.pwabuilder.com](https://www.pwabuilder.com).
2. Digite a URL onde seu FORZON está publicado.
3. Clique em **Build My PWA** e escolha a opção **Android**.
4. Defina o Package ID como `com.forzon.fitness.app`.
5. Baixe o pacote `.aab` assinado e envie na faixa de produção ou teste interno no Play Console.

---

## 🛡️ 4. Configuração do Digital Asset Links no Domínio

Quando você publicar no Google Play Console, a Google fornecerá a impressão digital **SHA-256** da sua chave de assinatura (App Signing Key). 
Basta colar essa chave no arquivo `public/.well-known/assetlinks.json` dentro do array `sha256_cert_fingerprints`.
