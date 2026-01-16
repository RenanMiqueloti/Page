# 🚀 Como Testar o Site Localmente

Este guia mostra como rodar o site na sua máquina para testar as mudanças antes de fazer deploy na Vercel.

## 📋 Pré-requisitos

Certifique-se de ter instalado:
- **Node.js** (versão 14 ou superior)
- **npm** ou **yarn** (gerenciador de pacotes)

Para verificar se estão instalados, abra o terminal e execute:
```bash
node --version
npm --version
# ou
yarn --version
```

## 🛠️ Passo a Passo

### 1. Navegue até a pasta do projeto

Abra o terminal (PowerShell no Windows) e navegue até a pasta `Page`:

```bash
cd Page
```

Se você já está na pasta `projects`, use:
```bash
cd Page
```

### 2. Instale as dependências

Se for a primeira vez rodando o projeto, ou se foram adicionadas novas dependências:

**Com npm:**
```bash
npm install
```

**Com yarn:**
```bash
yarn install
```

Isso vai instalar todas as dependências listadas no `package.json` (Next.js, React, Tailwind CSS, etc.).

### 3. Inicie o servidor de desenvolvimento

Execute o comando para iniciar o servidor local:

**Com npm:**
```bash
npm run dev
```

**Com yarn:**
```bash
yarn dev
```

Você verá uma mensagem no terminal indicando que o servidor está rodando, algo como:

```
✓ Ready on http://localhost:3000
```

### 4. Abra no navegador

Abra seu navegador favorito e acesse:

```
http://localhost:3000
```

O site estará rodando localmente! 🎉

## 📝 Comandos Úteis

### Desenvolvimento
```bash
npm run dev
# ou
yarn dev
```
Inicia o servidor de desenvolvimento na porta 3000. O site recarrega automaticamente quando você salva mudanças nos arquivos.

### Build de Produção
```bash
npm run build
# ou
yarn build
```
Cria uma versão otimizada do site para produção.

### Iniciar Versão de Produção
```bash
npm run start
# ou
yarn start
```
Inicia o servidor com a versão de produção (precisa rodar `build` antes).

### Verificar Código (Lint)
```bash
npm run lint
# ou
yarn lint
```
Verifica problemas de código seguindo as regras do ESLint.

## 🔧 Troubleshooting

### Erro: "Port 3000 is already in use"
Se a porta 3000 já estiver em uso, você pode:
- Fechar o outro processo que está usando a porta
- Ou especificar outra porta: `npm run dev -- -p 3001`

### Erro: "Module not found"
Execute novamente `npm install` ou `yarn install` para garantir que todas as dependências estão instaladas.

### Erro ao compilar CSS
Certifique-se de que o Tailwind CSS está configurado corretamente. Se necessário, execute:
```bash
npm run build
```

## 🌐 URL Pública (Vercel)

O site está hospedado em produção na Vercel:
**https://renanmiqueloti.vercel.app/**

As mudanças no código serão automaticamente deployadas quando você fizer push para o repositório conectado à Vercel.

## 💡 Dicas

- O servidor de desenvolvimento tem **Hot Reload**: quando você salva um arquivo, o navegador atualiza automaticamente
- Use `Ctrl + C` no terminal para parar o servidor
- Para testar em dispositivos móveis na mesma rede, use seu IP local: `http://[SEU_IP]:3000`
