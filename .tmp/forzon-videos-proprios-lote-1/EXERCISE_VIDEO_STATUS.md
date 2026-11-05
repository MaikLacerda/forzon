# Demonstrações em vídeo

O projeto tem uma produção própria em Blender, com malha humana, esqueleto,
pesos e parâmetros corporais CC0 do MakeHuman. Não utiliza vídeos comerciais
como entrada. O primeiro lote contém três movimentos específicos:

| Exercício do FORZON | Vídeo próprio | Duração |
| --- | --- | --- |
| ex-rosca-direta-barra-reta | barbell-curl.mp4 | 4 s |
| ex-rosca-martelo-halteres | hammer-curl.mp4 | 4 s |
| ex-rosca-alternada-halteres | alternating-curl.mp4 | 8 s |

O manifesto `src/data/ownedExerciseVideos.json` registra os arquivos disponíveis
no app. As mídias próprias ficam em `public/assets/exercise-videos/` e são
copiadas para a publicação pelo Vite. O catálogo principal tem 104 exercícios:
este lote cobre 3; os outros 101 continuam pendentes.

## Amostras comerciais para comparação

Há também duas amostras oficiais MoveKit, obtidas em
https://movekit.com/free-sample, disponíveis apenas na prévia local.

## Correspondência exata

| Exercício do FORZON | Vídeo |
| --- | --- |
| ex-crucifixo-reto-halteres | dumbbell-chest-fly.mp4 |
| ex-barra-fixa-pronada | pull-ups.mp4 |

O modelo geométrico anterior foi removido da tela de demonstração.

## Prévia

Execute `npm run dev`, abra o app e consulte os exercícios das tabelas acima.
O player inicia sem áudio, repete em loop e oferece controles nativos.
As amostras comerciais ficam em `.private/exercise-videos`, fora do Git e de
`public`. O servidor oferece essas amostras apenas em desenvolvimento e para
conexões locais. Essa restrição não se aplica aos vídeos próprios deste lote.
É necessário reiniciar o servidor após a atualização de `server.ts`.

## Licença e publicação

Amostras e aviso de licença: `.private/exercise-videos/LICENSE.txt`.
Termos: https://movekit.com/license.
Não colocar os vídeos brutos em repositório público ou ZIP público.
A licença permite exibição no produto, mas restringe distribuição dos arquivos
brutos. A publicação desses vídeos exige configurar entrega privada para os
usuários do aplicativo. A rota desta prévia não é habilitada em produção.

Nenhuma compra foi feita e nenhuma autorização de reutilização dos vídeos
do Hevy foi identificada. A biblioteca completa ainda depende de conteúdo
licenciado ou produção e validação de novas animações.

## Produção e revisão

`tools/exercise-renderer/` contém um processo de renderização Blender com
malha humana, esqueleto e parâmetros corporais CC0 do MakeHuman. A licença
acompanha os dados. Não utiliza os vídeos MoveKit como entrada.

As três animações têm cenas `.blend` editáveis. A pegada considera a orientação
da palma e o fechamento de cada dedo; a martelo mantém pegada neutra e a
alternada tem supinação e um braço por vez. A roupa tem geometria própria,
com fundo branco e sombra de contato.

Cada quadro é verificado para estabilidade dos cotovelos, âncoras de contato
com o equipamento, amplitude, continuidade, sincronização ou alternância e
fechamento do ciclo. Quadros do MP4 final são decodificados para revisão visual.
O destaque vermelho é regional, não uma segmentação anatômica exata de músculos.
Fontes da técnica estão em `tools/exercise-renderer/motions.json`.
