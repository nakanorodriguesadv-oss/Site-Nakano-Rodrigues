# Site — Nakano & Rodrigues Advogados

Este é o projeto completo do site, pronto para publicar. Ele já está conectado
ao Supabase (login, clientes, processos, financeiro).

## Como publicar (sem usar linha de comando)

### Passo 1 — Criar uma conta no GitHub (se ainda não tiver)
Acesse github.com e crie uma conta gratuita.

### Passo 2 — Criar um repositório novo
1. Clique em **New repository**
2. Dê um nome (ex.: `site-nakano-rodrigues`)
3. Deixe como **Private** (ou Public, tanto faz — não há segredo neste código,
   a chave que ele usa é a "publishable key", feita para ser pública)
4. Clique em **Create repository**

### Passo 3 — Subir os arquivos
1. Na página do repositório recém-criado, clique em **uploading an existing file**
2. Arraste **todos os arquivos e pastas de dentro desta pasta** (não a pasta
   em si, o conteúdo dela) para a área de upload
3. Clique em **Commit changes**

### Passo 4 — Conectar ao Vercel
1. Acesse vercel.com e crie uma conta (pode entrar direto com o GitHub)
2. Clique em **Add New** → **Project**
3. Selecione o repositório que você acabou de criar
4. O Vercel já reconhece automaticamente que é um projeto Vite/React —
   não precisa mudar nenhuma configuração
5. Clique em **Deploy**

Em cerca de um minuto, o site estará no ar, com um endereço temporário
(algo como `site-nakano-rodrigues.vercel.app`).

### Passo 5 — Domínio próprio
Depois que o site estiver no ar, é só ir em **Project Settings → Domains**
no Vercel e adicionar o domínio de vocês (ex.: `nakanorodrigues.adv.br`),
seguindo as instruções que o próprio Vercel mostra na tela (geralmente é
adicionar 1 ou 2 registros no painel onde o domínio foi comprado).

## Rodar no seu computador (opcional, exige Node.js instalado)

```
npm install
npm run dev
```

## Onde estão as configurações do Supabase

O endereço do projeto e a chave pública ficam no início do arquivo
`src/App.jsx`, nas constantes `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
