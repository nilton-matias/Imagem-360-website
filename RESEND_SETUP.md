# Configuração do Resend e GitHub Secrets

Este projeto integra o serviço **Resend** para envio de emails a partir do formulário de contacto do website e possui integração com o **GitHub** para publicação de alterações feitas no Painel Admin.

---

## 1. Integração com Resend (Formulário de Contacto)

### Como funciona:
- O formulário envia uma requisição `POST /api/contact`.
- **Localmente (Vite dev server)**: O Vite intercepta e processa o envio com as variáveis do ficheiro `.env`.
- **Em Produção (Vercel)**: A Serverless Function `api/contact.ts` recebe os dados e faz o envio via API REST da Resend (`https://api.resend.com/emails`).
- O remetente recebe uma confirmação automática de receção e a equipa da Imagem 360 recebe todos os detalhes do contacto (Nome, Email, Telefone, Assunto e Mensagem).

### Variáveis no `.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Imagem 360 <onboarding@resend.dev>
CONTACT_TO_EMAIL=seu-email@dominio.com
```

> **Atenção:** Em contas gratuitas ou em modo de teste, a Resend só permite enviar emails para o próprio endereço de email associado à conta Resend. Para enviar para qualquer domínio, adicione e verifique o domínio no painel da [Resend](https://resend.com/domains).

---

## 2. Regra dos Secrets no GitHub (`GH_` vs `GITHUB_`)

### ⚠️ Regra Crítica do GitHub:
> **O GitHub Secrets e GitHub Actions proíbem nomes que iniciam com o prefixo `GITHUB_`** (erro: *"Secret names cannot begin with the GITHUB_ prefix"*).

Por essa razão, o código foi implementado para aceitar tanto `GH_` como `GITHUB_`. No painel do GitHub (ou Vercel), configure:

| Variável Recomendada | Alternativa Aceite | Descrição |
|---|---|---|
| `GH_TOKEN` | `GITHUB_TOKEN` | Personal Access Token com permissão `repo` |
| `GH_OWNER` | `GITHUB_OWNER` | Utilizador ou Organização no GitHub |
| `GH_REPO` | `GITHUB_REPO` | Nome do repositório (ex: `Imagem-360-website`) |
| `GH_BRANCH` | `GITHUB_BRANCH` | Branch principal (ex: `main`) |
| `RESEND_API_KEY` | - | Chave de API do Resend |
| `RESEND_FROM_EMAIL` | - | Remetente (ex: `Imagem 360 <onboarding@resend.dev>`) |
| `CONTACT_TO_EMAIL` | `QUOTE_TO_EMAIL` | Destinatário dos contactos |

---

## 3. Teste do Formulário

1. O servidor local já está a correr.
2. Navegue até à secção **Contacto**.
3. Preencha os campos e submeta.
4. O email será enviado diretamente para a Resend com feedback visual em tempo real!
