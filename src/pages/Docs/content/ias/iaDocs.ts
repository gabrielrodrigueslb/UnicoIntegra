import { templates } from '../../../../data/templates_ia'

interface ParamDoc {
  field: string
  type: string
  required: boolean
  description: string
}

interface IaDocLink {
  label: string
  path: string
}

export interface IaDocDefinition {
  slug: string
  docsPath: string
  title: string
  badge: string
  version: string
  description: string
  summary: string
  endpoint: string
  highlights: string[]
  steps: string[]
  requestFields: ParamDoc[]
  installedTemplates: string[]
  payloadExample: string
  checklist: string[]
  links: IaDocLink[]
}

export const iaDocOrder = [
  'alpha7',
  'trier',
  'vannon',
  'vetor',
  'atendimento',
] as const

export type IaDocKey = (typeof iaDocOrder)[number]

const endpointBase = '/api/ia/create-ai'

export const commonIaRequestFields: ParamDoc[] = [
  {
    field: 'instance',
    type: 'string',
    required: true,
    description: 'URL da instância alvo. A instalação deve usar a URL completa, com https e sem barra final.',
  },
  {
    field: 'username',
    type: 'string',
    required: true,
    description: 'Credencial da instância enviada automaticamente pela sessão autenticada.',
  },
  {
    field: 'password',
    type: 'string',
    required: true,
    description: 'Senha da instância enviada automaticamente pela sessão autenticada.',
  },
  {
    field: 'code',
    type: 'string',
    required: true,
    description: 'Código 2FA informado na etapa de segurança da instalação.',
  },
  {
    field: 'name',
    type: 'string',
    required: true,
    description: 'Nome que será exibido para a IA criada.',
  },
]

export const iaDocs: Record<IaDocKey, IaDocDefinition> = {
  alpha7: {
    slug: 'alpha7',
    docsPath: '/main/docs/ias/alpha7',
    title: 'IA Alpha 7',
    badge: 'IAs - Alpha 7',
    version: templates.alpha7.version || '1.0',
    description: 'Fluxo com coleta inicial, liberação de acesso ao banco, criação do serviço Alpha 7 API e instalação da IA.',
    summary:
      'Coleta dados do cliente, libera acesso ao banco, valida a unidade de negócio, cria o serviço e conclui a instalação da IA.',
    endpoint: `${endpointBase}${templates.alpha7.endpoint || ''}`,
    highlights: [
      'Exige liberação de leitura no banco e abertura de acesso externo.',
      'Depende da unidade de negócio validada no teste de conexão.',
      'Requer conferência da API key da fila antes da homologação.',
    ],
    steps: [],
    requestFields: [],
    installedTemplates: [],
    payloadExample: '',
    checklist: [
      'Confirmar unidade de negócio.',
      'Gerar e armazenar a OPENAI_API_KEY antes de criar o serviço.',
      'Criar o serviço Alpha 7 API.',
      'Validar API key da fila.',
    ],
    links: [
      { label: 'Visão geral das IAs', path: '/main/docs/ias' },
      { label: 'IA Trier', path: '/main/docs/ias/trier' },
      { label: 'IA Vannon', path: '/main/docs/ias/vannon' },
    ],
  },
  trier: {
    slug: 'trier',
    docsPath: '/main/docs/ias/trier',
    title: 'IA Trier',
    badge: 'IAs - Trier',
    version: templates.trier.version || '1.0',
    description: 'Fluxo com solicitação de integração à Trier, recebimento do token, criação do serviço e instalação da IA.',
    summary:
      'Solicita a integração junto à Trier, recebe o token, cria o serviço IA Trier API e valida a fila antes da homologação.',
    endpoint: `${endpointBase}${templates.trier.endpoint || ''}`,
    highlights: [
      'Começa pela solicitação da integração diretamente à Trier.',
      'Depende do token enviado pela Trier.',
      'Exige conferência da API key da fila antes da liberação.',
    ],
    steps: [],
    requestFields: [],
    installedTemplates: [],
    payloadExample: '',
    checklist: [
      'Receber o token da Trier.',
      'Gerar e armazenar a OPENAI_API_KEY antes de criar o serviço.',
      'Criar o serviço IA Trier API.',
      'Conferir API key global e API key da fila.',
    ],
    links: [
      { label: 'Visão geral das IAs', path: '/main/docs/ias' },
      { label: 'IA Alpha 7', path: '/main/docs/ias/alpha7' },
      { label: 'IA Vetor', path: '/main/docs/ias/vetor' },
    ],
  },
  vannon: {
    slug: 'vannon',
    docsPath: '/main/docs/ias/vannon',
    title: 'IA Vannon',
    badge: 'IAs - Vannon',
    version: templates.vannon.version || '1.0',
    description: 'Fluxo com solicitação de credenciais no grupo, validação interna, instalação da IA e homologação.',
    summary:
      'Solicita credenciais no grupo, valida internamente, instala a IA Vannon com endpoint público e CEP da loja, e confere a fila.',
    endpoint: `${endpointBase}${templates.vannon.endpoint || ''}`,
    highlights: [
      'Exige validação interna antes da instalação.',
      'Usa endpoint público e CEP real da unidade.',
      'Depende da API key global e da API key da fila.',
    ],
    steps: [],
    requestFields: [],
    installedTemplates: [],
    payloadExample: '',
    checklist: [
      'Receber as credenciais da Vannon.',
      'Gerar e armazenar a OPENAI_API_KEY antes de instalar a IA.',
      'Informar endpoint público e CEP real da loja.',
      'Conferir API key global e API key da fila.',
    ],
    links: [
      { label: 'Visão geral das IAs', path: '/main/docs/ias' },
      { label: 'IA Alpha 7', path: '/main/docs/ias/alpha7' },
      { label: 'IA Vetor', path: '/main/docs/ias/vetor' },
    ],
  },
  vetor: {
    slug: 'vetor',
    docsPath: '/main/docs/ias/vetor',
    title: 'IA Vetor',
    badge: 'IAs - Vetor',
    version: templates.vetor.version || '1.0',
    description: 'Fluxo com solicitação de credenciais no grupo, validação interna, instalação da IA e homologação.',
    summary:
      'Solicita credenciais no grupo, valida internamente, instala a IA Vetor com token dedicado e confere a API key da fila.',
    endpoint: `${endpointBase}${templates.vetor.endpoint || ''}`,
    highlights: [
      'Exige token enviado pela Vetor.',
      'Depende de validação interna antes da instalação.',
      'Requer conferência da API key da fila antes da homologação.',
    ],
    steps: [],
    requestFields: [],
    installedTemplates: [],
    payloadExample: '',
    checklist: [
      'Receber o token da Vetor.',
      'Gerar e armazenar a OPENAI_API_KEY antes de instalar a IA.',
      'Validar internamente com Maicon ou Moara.',
      'Conferir API key global e API key da fila.',
    ],
    links: [
      { label: 'Visão geral das IAs', path: '/main/docs/ias' },
      { label: 'IA Trier', path: '/main/docs/ias/trier' },
      { label: 'IA Vannon', path: '/main/docs/ias/vannon' },
    ],
  },
  atendimento: {
    slug: 'atendimento',
    docsPath: '/main/docs/ias/atendimento',
    title: 'IA Atendimento',
    badge: 'IAs - Atendimento',
    version: templates.atendimento.version || '1.0',
    description: 'Fluxo de instalação direta da IA de atendimento com contexto customizado e homologação.',
    summary:
      'Instala uma IA de atendimento com contexto customizado, valida a fila e exige homologação antes da produção.',
    endpoint: `${endpointBase}${templates.atendimento.endpoint || ''}`,
    highlights: [
      'Depende da revisão do contexto antes da instalação.',
      'Pode ser usada em fluxos sem ERP específico.',
      'Também exige validação da API key da fila.',
    ],
    steps: [],
    requestFields: [],
    installedTemplates: [],
    payloadExample: '',
    checklist: [
      'Gerar e armazenar a OPENAI_API_KEY antes de provisionar o ambiente.',
      'Revisar o contexto da IA.',
      'Validar API key da fila.',
      'Homologar antes da produção.',
    ],
    links: [
      { label: 'Visão geral das IAs', path: '/main/docs/ias' },
      { label: 'IA Alpha 7', path: '/main/docs/ias/alpha7' },
      { label: 'IA Vannon', path: '/main/docs/ias/vannon' },
    ],
  },
}
