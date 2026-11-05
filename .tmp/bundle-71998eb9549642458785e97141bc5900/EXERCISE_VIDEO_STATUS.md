# Demonstrações em vídeo

O projeto tem uma produção própria em Blender, com malha humana, esqueleto,
pesos e parâmetros corporais CC0 do MakeHuman. Não utiliza vídeos comerciais
como entrada. A versão atualizada contém quatro movimentos específicos:

| Exercício do FORZON | Vídeo próprio | Duração |
| --- | --- | --- |
| ex-rosca-direta-barra-reta | barbell-curl.mp4 | 4 s |
| ex-rosca-martelo-halteres | hammer-curl.mp4 | 4 s |
| ex-rosca-alternada-halteres | alternating-curl.mp4 | 8 s |
| ex-supino-reto-barra | bench-press.mp4 | 5 s |

O manifesto `src/data/ownedExerciseVideos.json` registra os arquivos disponíveis
no app. As mídias próprias ficam em `public/assets/exercise-videos/` e são
copiadas para a publicação pelo Vite. O catálogo principal tem 104 exercícios:
este pacote cobre 4; os outros 100 continuam pendentes.

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

As animações têm cenas `.blend` editáveis. A pegada considera a orientação
da palma e o fechamento de cada dedo; a martelo mantém pegada neutra e a
alternada tem supinação e um braço por vez. A roupa tem geometria própria,
com fundo branco e sombra de contato.

Cada quadro é verificado para estabilidade dos cotovelos, âncoras de contato
com o equipamento, amplitude, continuidade, sincronização ou alternância e
fechamento do ciclo. Quadros do MP4 final são decodificados para revisão visual.
O destaque vermelho é regional, não uma segmentação anatômica exata de músculos.
Fontes da técnica estão em `tools/exercise-renderer/motions.json`.

## Revisão de musculatura

O personagem recebe formas musculares CC0 de peitoral, dorsais, ombros, braços,
pernas e tônus abdominal. O processo acrescenta relevo de peitoral e abdômen e
estrias de superfície estilizadas que acompanham a malha durante a animação.
As formas corporais estão em `tools/exercise-renderer/physique.json`.
Os três vídeos do primeiro lote foram atualizados com essa aparência.
Não se trata de um atlas com músculos individualmente segmentados.

## Disponibilidade no sistema

Na Biblioteca de Exercícios, o filtro "Somente exercícios com vídeo" mostra
as demonstrações disponíveis. No pacote atualizado são quatro: barra reta,
martelo, alternada com supinação e supino reto com barra. A variação de rosca
com barra W é outro exercício e permanece
sem vídeo. Os demais exercícios continuam com acesso às instruções escritas.

O player distingue falta de produção de falha de carregamento. Se um vídeo
existente não carregar, mostra "Não foi possível carregar o vídeo" e oferece
uma nova tentativa. As amostras comerciais locais não são anunciadas no site
publicado. Rótulos genéricos da rotina abrem a execução e as instruções, sem
anunciar vídeo para exercícios que ainda não possuem uma demonstração.

## Supino e abertura da biblioteca

O vídeo de supino reto com barra usa banco plano, pegada pronada, apoio dos
pés e trajetória da carga entre a linha do peito e a extensão dos braços.
As checagens desse movimento verificam apoio e orientação dos pés, estabilidade
dos ombros, contato com a barra, amplitude e continuidade; não exigem cotovelos
fixos como nos exercícios de rosca.

Na biblioteca, o nome do exercício também abre a ficha, além do botão lateral.
O service worker de `public/sw.js` passa a buscar a página inicial na rede antes
de recorrer ao cache offline, para evitar referências a scripts de uma versão
anterior após uma publicação. Requisições de vídeo e Range são tratadas pelo
navegador, sem intermediação do cache do service worker.
