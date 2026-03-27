export interface SidebarItem {
  label: string
  path?: string
  items?: SidebarItem[]
}

const DOCS_BASE = '/main/docs'

export const sidebarConfig: SidebarItem[] = [
  {
    label: 'Introducao',
    path: DOCS_BASE,
  },
  {
    label: 'Getting Started',
    items: [
      { label: 'Autenticacao', path: `${DOCS_BASE}/getting-started/autenticacao` },
      { label: 'Ambientes', path: `${DOCS_BASE}/getting-started/ambientes` },
      { label: 'Primeiros Passos', path: `${DOCS_BASE}/getting-started/primeiros-passos` },
    ],
  },
  {
    label: 'Conceitos',
    items: [
      { label: 'Contatos', path: `${DOCS_BASE}/conceitos/contatos` },
      { label: 'Conversas', path: `${DOCS_BASE}/conceitos/conversas` },
      { label: 'Webhooks', path: `${DOCS_BASE}/conceitos/webhooks` },
    ],
  },
  {
    label: 'Guias',
    items: [
      { label: 'Criar um Contato', path: `${DOCS_BASE}/guias/criar-contato` },
      { label: 'Enviar Mensagem', path: `${DOCS_BASE}/guias/enviar-mensagem` },
      { label: 'Configurar Webhook', path: `${DOCS_BASE}/guias/configurar-webhook` },
    ],
  },
  {
    label: 'Referencia da API',
    items: [
      {
        label: 'Contatos',
        items: [
          { label: 'Listar Contatos', path: `${DOCS_BASE}/referencia/contatos/listar` },
          { label: 'Criar Contato', path: `${DOCS_BASE}/referencia/contatos/criar` },
          { label: 'Atualizar Contato', path: `${DOCS_BASE}/referencia/contatos/atualizar` },
          { label: 'Deletar Contato', path: `${DOCS_BASE}/referencia/contatos/deletar` },
        ],
      },
      {
        label: 'Mensagens',
        items: [
          { label: 'Enviar Mensagem', path: `${DOCS_BASE}/referencia/mensagens/enviar` },
          { label: 'Listar Mensagens', path: `${DOCS_BASE}/referencia/mensagens/listar` },
        ],
      },
      {
        label: 'Webhooks',
        items: [
          { label: 'Criar Webhook', path: `${DOCS_BASE}/referencia/webhooks/criar` },
          { label: 'Listar Webhooks', path: `${DOCS_BASE}/referencia/webhooks/listar` },
        ],
      },
    ],
  },
  {
    label: 'Erros',
    path: `${DOCS_BASE}/erros`,
  },
  {
    label: 'Changelog',
    path: `${DOCS_BASE}/changelog`,
  },
]
