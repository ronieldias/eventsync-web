# EventSync Web

Aplicação web para gerenciamento de eventos acadêmicos. Organizadores criam e gerenciam eventos, participantes descobrem eventos e gerenciam suas inscrições.

## Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| Next.js 14 | Framework React com App Router |
| TypeScript | Tipagem estática |
| Tailwind CSS | Framework de estilização |
| Axios | Cliente HTTP |
| React Hook Form | Gerenciamento de formulários |
| Zod | Validação de dados |
| date-fns | Formatação de datas |

## Arquitetura

O projeto utiliza o **App Router** do Next.js 14, separando o código em camadas:

```
src/
├── app/                    # Páginas (rotas da aplicação)
│   ├── auth/               # Login e cadastro
│   ├── dashboard/          # Área do organizador
│   ├── events/             # Detalhes de eventos
│   ├── my-subscriptions/   # Inscrições do participante
│   └── profile/            # Perfil do usuário
│
├── components/
│   ├── ui/                 # Componentes base (Button, Input, Toast)
│   ├── features/           # Componentes de negócio (EventCard, NotificationBell)
│   └── layouts/            # Componentes de layout (Header)
│
├── hooks/                  # Hooks customizados (useAuth)
├── services/               # Configuração da API (Axios)
├── types/                  # Interfaces e tipos TypeScript
└── lib/                    # Funções utilitárias
```

## Páginas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Listagem de eventos | Público |
| `/auth/login` | Login | Público |
| `/auth/register` | Cadastro | Público |
| `/events/[id]` | Detalhes do evento | Público |
| `/dashboard` | Painel do organizador | Organizador |
| `/dashboard/events/new` | Criar evento | Organizador |
| `/dashboard/events/[id]` | Gerenciar evento | Organizador |
| `/my-subscriptions` | Minhas inscrições | Participante |
| `/profile` | Configurações | Autenticado |

## Como Rodar

### Pré-requisitos

- Node.js 18+
- Backend EventSync rodando em `http://localhost:3333`

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Configurar variável de ambiente (opcional)
echo "NEXT_PUBLIC_API_URL=http://localhost:3333/api" > .env.local

# Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Gera build otimizado para produção |
| `npm start` | Inicia servidor de produção |
| `npm run lint` | Verifica erros de linting |

## Funcionalidades

**Organizadores:**
- Criar, editar e excluir eventos
- Controlar status e inscrições
- Gerenciar participantes
- Enviar notificações

**Participantes:**
- Buscar e visualizar eventos
- Inscrever-se e cancelar inscrições
- Acompanhar suas inscrições
- Receber notificações
