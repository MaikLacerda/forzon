# Contas FORZON — Firebase (plano Spark)

O aplicativo usa Firebase Authentication para cadastro/login e Cloud Firestore para o histórico. O Supabase foi retirado da conexão ativa. O projeto é forzon-c9339.

## O que já está no código

- Login por e-mail/senha, confirmação de e-mail, reenvio da confirmação e recuperação de senha.
- Contas novas sem treinos, refeições consumidas, medidas corporais ou resultados de demonstração.
- Cache e gravação separados pelo UID do usuário; troca de conta desmonta o painel anterior.
- Gravação com controle de versão: conflitos entre aparelhos preservam o cache e oferecem backup.
- Históricos divididos em documentos para respeitar o limite de tamanho de cada documento Firestore. O limite de sincronização desta versão é 20 blocos de até 60.000 caracteres; acima disso o cache é preservado e o usuário pode exportá-lo.
- A configuração WEB pública do projeto está em src/data/firebaseWebConfig.json. Esses identificadores públicos não são uma conta de serviço nem uma senha de banco. A proteção dos registros está nas regras de acesso, não no sigilo dessa configuração.

## Configuração aplicada no Firebase Console

1. Authentication → Método de login: habilitar E-mail/senha. Login por link sem senha não é utilizado.
2. Authentication → Configurações → Domínios autorizados: adicionar forzon.vercel.app. Para testes locais, autorizar localhost se necessário.
3. Cloud Firestore: criar o banco (default), edição Standard, região southamerica-east1 (São Paulo), em modo de produção. Não habilitar faturamento Blaze.
4. Firestore → Regras: substituir o conteúdo pelo arquivo firestore.rules e publicar. Essas regras exigem usuário autenticado, e-mail confirmado e UID igual ao dono da conta. Não usar modo de teste com acesso público.
5. Authentication → Modelos: conferir os e-mails de confirmação e recuperação. Os links podem usar o manipulador padrão do Firebase e voltar ao site depois.

Em 04/11/2026 foram confirmados no painel: E-mail/senha ativado; forzon.vercel.app autorizado; banco (default) Standard criado em southamerica-east1; regras publicadas. O simulador negou leitura anônima e de outro UID, e permitiu leitura do próprio UID com e-mail verificado. Ainda é preciso publicar o código na Vercel e testar o cadastro e o e-mail reais com sua própria conta.

## Publicação na Vercel

A configuração pública já acompanha o código; não é necessário criar variáveis Supabase. Envie o commit e aguarde um novo deploy da Vercel. Se quiser usar outro projeto Firebase, substitua os quatro campos de src/data/firebaseWebConfig.json ou defina juntos VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID e VITE_FIREBASE_APP_ID.

Nunca coloque senha, chave privada de conta de serviço, credencial administrativa ou GEMINI_API_KEY em VITE_*.

```bash
npm install
npm run lint
npm run test:accounts
npm run build
npm run dev
```

Cadastre sua conta no site, confirme o e-mail recebido (confira o spam) e entre. As senhas devem ter pelo menos oito caracteres. A senha não é armazenada pelo app nem enviada ao Firestore.

## Verificação real antes de liberar aos testadores

- Criar conta e confirmar e-mail; tentar entrar antes da confirmação deve ser bloqueado.
- Recuperar senha por e-mail e entrar com a nova senha.
- Concluir um treino, esperar a gravação e conferir a mesma conta em outro navegador.
- Entrar com outra conta: nenhum registro da primeira deve aparecer.
- Verificar no Firebase que contas não conseguem ler/gravar caminhos de outro UID e que acesso anônimo é bloqueado.
- Conferir isolamento e preservação das alterações offline em caso de conflito.

Os testes automatizados locais cobrem o cache, as transições de conta, conflitos, estados vazios e serialização dos históricos. Eles não substituem o teste de e-mail e das regras no projeto real. Nenhuma conta pessoal foi criada automaticamente para testar senhas.

## Custos e outros serviços

Authentication e Firestore utilizam as cotas do plano gratuito Spark. Quando uma cota é excedida, o serviço pode limitar operações; não há promessa de uso ilimitado. Não é necessário Firebase Hosting, Cloud Functions ou Cloud Storage para esta integração. Os vídeos continuam em public/assets/exercise-videos na hospedagem do site.

O fluxo de assinatura Pro anterior ainda não é uma integração real de pagamentos. A IA Gemini do server.ts exige um backend Express; publicar somente o build estático na Vercel não publica esses endpoints. Sem esse backend, os planos usam a alternativa local.

## Commit

```bash
git add src package.json package-lock.json .env.example firebase.json firestore.rules tools/check-accounts.mjs tools/exercise-renderer/package_update.ps1 LEIA-ME-CONTAS.md LEIA-ME-VIDEOS.txt
git commit -m "Migra cadastro e dados dos treinos para Firebase"
git push origin main
```

O SQL antigo na pasta supabase permanece apenas como referência histórica. Não precisa executá-lo para usar Firebase.

Documentação: https://firebase.google.com/docs/auth/web/start e https://firebase.google.com/docs/firestore/security/get-started
