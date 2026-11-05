# Produção própria de vídeos FORZON

Produção independente em Blender, com malha humana, esqueleto, pesos e
parâmetros corporais CC0 do MakeHuman. Os vídeos comerciais de amostra não
são entrada deste processo. Licença dos dados em `assets/LICENSE.CC0.txt`.

## Estado real

- O primeiro lote contém rosca direta com barra reta, martelo e alternada com supinação.
- O supino reto com barra foi acrescentado com banco plano e cinemática própria.
- Os movimentos têm animações e equipamentos próprios em `motions.json`.
- A biblioteca principal tem 104 vídeos no estilo anterior. A revisão de
  musculatura é produzida separadamente, conforme `ANATOMY_V3.md`.
- O catálogo e o manifesto do app registram exatamente os vídeos disponíveis.
- O destaque vermelho é uma região pintada, não segmentação anatômica exata.
- `physique.json` controla as formas CC0 de peitoral, dorsais, abdômen,
  ombros, braços e pernas, combinadas com um relevo de superfície próprio.
- A definição e as estrias da superfície são ilustração muscular estilizada.
  As coordenadas das estrias acompanham a deformação da malha durante o movimento.
- As checagens mecânicas não equivalem a uma avaliação profissional da técnica.

## Renderização

Com Blender 4.5 instalado, a partir da raiz do projeto:

```powershell
& '.tools/blender-4.5.14-windows-x64/blender.exe' --background --python tools/exercise-renderer/render.py -- --exercise hammer-curl --frame 48
& '.tools/blender-4.5.14-windows-x64/blender.exe' --background --python tools/exercise-renderer/render.py -- --exercise hammer-curl --video
& '.tools/blender-4.5.14-windows-x64/blender.exe' --background --python tools/exercise-renderer/audit.py -- hammer-curl
& '.tools/blender-4.5.14-windows-x64/blender.exe' --background --python tools/exercise-renderer/review_frames.py -- hammer-curl
node --import tsx tools/exercise-renderer/publish.mjs
node --import tsx tools/exercise-renderer/inventory.mjs
```

As saídas ficam em `output/`, incluindo cena editável `.blend`, quadros PNG e
vídeo MP4 H.264. Blender portátil e saídas são ignorados pelo Git.
O renderizador utiliza OptiX/CUDA quando disponível e permite `--device CPU`.
As exportações são 640 × 640, 24 fps, com 4 segundos por repetição nas roscas;
a alternada tem 8 segundos para mostrar uma repetição de cada braço e o supino
tem 5 segundos por ciclo.

`audit.py` verifica todos os quadros: identidade do exercício, estabilidade dos
cotovelos, âncoras de pegada no equipamento, continuidade de posições, amplitude
e alternância ou sincronização dos braços. `review_frames.py` decodifica quadros
do MP4 final para revisão visual. Só executar `publish.mjs` após essa revisão.
O publicador exige relatórios mecânicos aprovados e metadados válidos dos
vídeos; copia apenas mídia própria e gera a correspondência de IDs no app.
Os endereços de vídeo e pôster incluem uma versão derivada do conteúdo para
evitar que o navegador continue exibindo a aparência anterior em cache.

No supino, a checagem adicional inclui posição e orientação das plantas dos pés,
estabilidade dos ombros, linha de contato da barra, amplitude de extensão e
posição dos antebraços no ponto baixo. As formas do peitoral usam referências
do esqueleto da malha para posicionar relevo, fibras e destaque muscular.

## Para ampliar a biblioteca

Cada exercício requer especificação própria de postura, articulações,
equipamento, pegada, amplitude, câmera e tempo. Variações em banco inclinado,
máquinas, cabos e pegadas não devem reutilizar indiscriminadamente o mesmo
vídeo. Publicar apenas após revisar início, meio, pico e repetição do ciclo.

## Lote único dos 100 restantes

`production-plan.json` fixa os 100 IDs pendentes. `author_remaining.mjs`
prepara especificações individuais em `remaining-motion-specs.json`; elas são
rascunhos, e não evidência de que as animações estejam concluídas.

`motion_engine.py` fornece equipamentos, postura, mãos e restrições. As famílias
ficam nos arquivos `motions_upper.py`, `motions_lower.py` e
`motions_core_sports.py`. Famílias/variantes não implementadas lançam erro,
em vez de produzir uma animação genérica ou estática silenciosamente.

Para produzir internamente um exercício já implementado:

```powershell
& tools/exercise-renderer/render_batch.ps1 -ExerciseIds ex-supino-reto-halteres
```

O comando cria a cena, audita todos os quadros, renderiza o MP4 e extrai os
quadros do arquivo codificado, nessa ordem. Executa uma instância do Blender
por vez. A auditoria referencia o SHA-256 da cena e o vídeo registra a mesma
referência. Revisar os quadros antes de registrar aprovação manual em
`visual-reviews.json`, com `approved: true` e `videoSha256` do MP4 revisado.

`node tools/exercise-renderer/batch_status.mjs` atualiza a contagem verificável.
O publicador e o gerador do ZIP exigem o lote completo, sem disponibilizar
parcialmente os novos vídeos no app.
