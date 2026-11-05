# Revisão anatômica dos vídeos

A referência enviada foi analisada apenas visualmente. A produção utiliza as cenas e a malha humana CC0 próprias do projeto; não reutiliza quadros, personagem ou texturas do vídeo comercial.

O estilo acrescenta volume de peitoral, deltoides, braços, quadríceps e panturrilhas, relevo abdominal e fibras ilustradas. A malha continua sendo uma ilustração, não uma segmentação clínica de cada músculo. O vermelho indica a região principal do exercício, não uma medição de ativação ou uma promessa de resultado.

## Produção isolada

Os arquivos anteriores em `output` e os 104 vídeos publicados em `public/assets/exercise-videos` são preservados. A nova produção fica em `output/anatomy-v3`.

```powershell
& tools/exercise-renderer/render_anatomy_batch.ps1
```

O lote executa apenas uma instância do Blender por vez. Em cada exercício:

1. Reestiliza uma cópia da cena aprovada.
2. Compara todas as articulações e transformações de equipamentos, em todos os quadros, com a cena original. Alterar o movimento interrompe a produção.
3. Renderiza MP4 H.264 em 768 × 768, 24 fps.
4. Decodifica cinco momentos do próprio MP4 e comprova que há quadros diferentes.

`batch-state.json` registra o progresso real. Renderizar e passar na comparação mecânica não equivale à aprovação visual. O lote não publica automaticamente: revisar os quadros e a região muscular de cada vídeo antes de integrar ao aplicativo.

## Referências de anatomia para as massas e fibras ilustradas

- OpenStax, arranjo convergente do peitoral maior: https://openstax.org/books/anatomy-and-physiology-2e/pages/11-1-interactions-of-skeletal-muscles-their-fascicle-arrangement-and-their-lever-systems
- OpenStax, parede abdominal e tórax: https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax

As referências de técnica de cada exercício permanecem em `motions.json` e `remaining-motion-specs.json`.
