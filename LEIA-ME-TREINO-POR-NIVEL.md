# Correção da montagem por nível

Os arquivos foram alterados diretamente neste projeto. Publicar na Vercel e gerar novamente o treino na avaliação do Coach. Treinos já salvos e históricos não são reescritos.

## Comportamento

- A seleção da avaliação (Iniciante, Intermediário, Avançado, Atleta) chega à mesma política usada pelo servidor e pelo fallback local.
- Exercícios de musculação: três séries de trabalho para iniciantes e intermediários; quatro para avançados e atletas. Abdominais: duas para iniciantes, três nos demais. O bloco cronometrado de cardio tem um registro de duração, não séries de musculação.
- A seleção permite mais variações nos níveis superiores. A partir do intermediário, reserva duas variações de bíceps ou tríceps quando o grupo pertence à sessão. Uma variação faltante só é preenchida com equipamento disponível e sem restrição relatada que exija escolher a adaptação; caso contrário, aparece aviso.
- O cardio mantém os minutos escolhidos na avaliação. A política não corta séries para uma nem encurta o cardio para encaixar artificialmente na disponibilidade.
- A duração estimada soma aquecimento, musculação e cardio. Se ultrapassar a disponibilidade, o resultado mostra o conflito e exige que o usuário revise e aceite os avisos antes de aplicar. É possível refazer a avaliação. A estimativa não é uma garantia de duração real.
- As cargas começam zeradas. Nível maior não aumenta automaticamente o peso nem exige treinar até a falha.

Os números acima são regras configuradas para o produto, não mínimos universais determinados pela literatura. A atualização de 2026 da ACSM enfatiza adequar o treino ao objetivo e à pessoa e observa que técnicas avançadas não são obrigatórias: [ACSM — atualização das diretrizes](https://acsm.org/resistance-training-guidelines-update-2026/).

## Validação

Testes cobrem os três níveis principais, volume diferente, duas variações de braços, minutos exatos do cardio, conflitos de tempo, aplicação repetida da política e preservação dos dados de entrada. TypeScript e build de produção também foram executados.

## Publicar esta correção

```bash
git add server.ts src/services/workoutPlanPolicy.ts src/components/ai/AIWorkoutNutritionIntakeModal.tsx src/types/index.ts tools/check-accounts.mjs LEIA-ME-TREINO-POR-NIVEL.md
git commit -m "Respeita nivel, volume de bracos e minutos do cardio"
git push origin main
```

A revisão dos vídeos é separada: `tools/exercise-renderer/ANATOMY_V3_REVIEW.md`. Os MP4s novos ainda não foram integrados ao aplicativo.
