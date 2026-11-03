# Cadastro, login e dados pessoais — FORZON

O código está preparado para Supabase. Ainda é necessário criar e configurar o projeto abaixo para liberar o acesso real. Sem configuração, a página mostra o formulário com envio desabilitado; nenhum cadastro é simulado.

## 1. Preparar o Supabase

1. Crie um projeto na sua conta em [Supabase](https://supabase.com/dashboard).
2. Abra **SQL Editor**, cole o conteúdo de `supabase/migrations/20261103_accounts.sql` e execute. Ele cria a tabela, as políticas RLS e a função de gravação com controle de versão. Cada usuário acessa somente sua própria linha.
3. Em **Authentication → Providers**, habilite **Email**, mantenha a confirmação de e-mail e configure senha com pelo menos 8 caracteres.
4. Em **Authentication → URL Configuration**, use `https://forzon.vercel.app` como Site URL. Autorize os redirecionamentos `https://forzon.vercel.app/` e `http://localhost:3000/`. Se usar outro domínio, adicione-o também. Para uma prévia em outra porta, adicione o endereço correspondente.
5. Obtenha **Project URL** e **Publishable key** no painel de conexão/API Keys do projeto. A chave pública antiga `anon` também é suportada por `VITE_SUPABASE_ANON_KEY`.
6. Configure o envio de e-mails de autenticação (SMTP) antes de abrir os cadastros ao público. Confirme recebimento de confirmação e recuperação de senha com um e-mail seu.

Documentação oficial: [senhas e confirmação](https://supabase.com/docs/guides/auth/passwords), [chaves públicas e secretas](https://supabase.com/docs/guides/getting-started/api-keys), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 2. Configurar neste computador

Crie `.env.local` na raiz, usando suas informações:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Não use `service_role`, chave secreta, senha do banco ou chave Gemini nessas variáveis públicas. Não envie `.env.local` ao GitHub. `.env.example` pode ser enviado porque contém apenas campos vazios.

No Git Bash:

```bash
npm install
npm run lint
npm run test:accounts
npm run dev
```

Reinicie o servidor depois de alterar as variáveis. `Ctrl+C` encerra a prévia. O servidor Express e a IA usam `.env` para `GEMINI_API_KEY`, caso sejam executados; essa chave fica somente no servidor.

## 3. Publicar na Vercel

No projeto FORZON, abra **Settings → Environment Variables** e adicione as duas variáveis `VITE_SUPABASE_*`, nos ambientes desejados. Faça novo deploy: o Vite lê essas variáveis durante o build. Não basta alterar a configuração de um deploy que já terminou.

Cadastro/login e gravação no Supabase funcionam no site estático. Os endpoints Gemini do `server.ts` exigem um backend executando Express; o build estático da Vercel não publica esses endpoints sozinho. Sem backend, permanece a geração local de planos, agora também com a regra de abdominais. Não coloque chave Gemini no navegador para contornar isso.

## 4. Conferir antes de liberar

- Cadastre uma conta, confirme o e-mail, entre e recupere a senha por e-mail.
- Uma conta nova mostra zero treinos, zero volume e nenhum histórico, refeição consumida ou bioimpedância de exemplo. Complete a avaliação para gerar o primeiro plano.
- Conclua um treino, aguarde a gravação e entre na mesma conta em outro navegador: o registro deve aparecer.
- Saia e entre em outra conta: os registros da primeira não podem aparecer. Teste também acesso pela API com o token de outra conta; a RLS deve bloquear a leitura/gravação alheia.
- As alterações offline permanecem separadas por conta neste aparelho. Havendo conflito entre aparelhos, o app preserva o cache e oferece backup; a opção de carregar a nuvem também guarda uma cópia local anterior.

Os testes automatizados usam um transporte controlado, sem criar contas externas. Confirmação de e-mail, recuperação real, permissões SQL e acesso entre aparelhos precisam dessa verificação no seu projeto Supabase; não foram certificados em um projeto real ainda.

## Dados antigos e abdominais

Os antigos dados locais de demonstração foram preservados, mas não são importados automaticamente para contas novas. Não há senha local inventada nem liberação Pro baseada no nome do usuário. Esta entrega não implementa cobrança de assinaturas: o fluxo Pro anterior ainda precisa de um provedor de pagamentos antes de vender assinaturas reais.

Novos planos gerados recebem abdominais dinâmicos em até duas sessões da semana, com no máximo seis exercícios por sessão e redução de séries para caber no tempo informado. A prancha estática é removida desses planos. A escolha de abdominal usa solo em casa e polia na academia. Restrições de coluna, gestação ou cirurgia sinalizam avaliação profissional antes de inclusão automática. Os planos antigos já salvos não são reescritos: gere e aprove um novo plano para aplicar a mudança.

## Comandos para enviar

```bash
git add src server.ts package.json package-lock.json .env.example supabase tools/check-accounts.mjs tools/exercise-renderer/package_update.ps1 LEIA-ME-CONTAS.md
git commit -m "Adiciona login Supabase, contas vazias e abdominais nos planos"
git push origin main
```

O ZIP e `.env.local` ficam fora do commit.
