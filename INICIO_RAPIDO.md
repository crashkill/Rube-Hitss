# 🚀 INÍCIO RÁPIDO - Open Rube

## ✅ Status Atual

- [x] Projeto clonado
- [x] Dependências instaladas (531 pacotes)
- [x] Arquivo `.env.local` configurado com suas credenciais
- [ ] **FALTA: Executar script SQL no Supabase**
- [ ] **FALTA: Iniciar o projeto**

---

## 📋 PRÓXIMO PASSO: Configurar Banco de Dados

### **1. Acesse o Supabase SQL Editor**

Você já tem o Supabase aberto no navegador. Siga estes passos:

1. **Faça login** (se ainda não estiver logado)
2. No menu lateral esquerdo, clique em **"SQL Editor"**
3. Clique em **"New Query"** (ou use o botão "+")

### **2. Execute o Script SQL**

1. **Abra o arquivo** `supabase-setup.sql` (está na raiz do projeto)
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole no SQL Editor** do Supabase (Ctrl+V)
4. **Clique em RUN** (ou pressione Ctrl+Enter)

### **3. Verifique se funcionou**

Você deve ver mensagens como:
```
✓ Tabela "conversations" criada com sucesso
✓ Tabela "messages" criada com sucesso
```

Depois, vá em **"Table Editor"** no menu lateral e confirme que existem as tabelas:
- `conversations`
- `messages`

---

## 🎯 DEPOIS DE CONFIGURAR O BANCO

### **Inicie o projeto:**

```bash
npm run dev
```

### **Acesse no navegador:**

http://localhost:3000

---

## 📝 O QUE ESPERAR

1. **Primeira tela**: Login/Cadastro (Supabase Auth)
2. **Após login**: Interface de chat
3. **Aba "Apps"**: Conecte aplicativos (Gmail, Slack, GitHub, etc.)
4. **Aba "Chat"**: Converse com a IA e peça para executar ações

---

## 🔑 SUAS CREDENCIAIS (já configuradas)

✅ **Composio API Key**: `ak_WGGQy6_U6G63ORS6AFSR`
✅ **OpenAI API Key**: Configurada
✅ **Supabase URL**: `https://zzjckirfxvvnmnmbnarp.supabase.co`
✅ **Supabase Anon Key**: Configurada

---

## 🆘 PROBLEMAS?

### Erro ao executar SQL:
- Certifique-se de copiar TODO o conteúdo do arquivo
- Verifique se está no projeto correto do Supabase

### Erro ao iniciar o projeto:
- Verifique se o script SQL foi executado
- Confirme que o `.env.local` está correto

### Porta 3000 ocupada:
```bash
PORT=3001 npm run dev
```

---

## 📞 COMANDOS ÚTEIS

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar build de produção
npm start

# Verificar erros
npm run lint
```

---

**Após executar o script SQL, volte aqui e execute `npm run dev`!** 🚀
