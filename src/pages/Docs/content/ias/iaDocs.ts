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
    description: 'URL da instância alvo. O frontend normaliza removendo a barra final.',
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
    description: 'Código 2FA informado na etapa de segurança do modal.',
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
    description: 'Modelo integrado ao ecossistema Alpha 7 para busca de produtos e atendimento assistido.',
    summary:
      'Usa a instância do cliente para criar um assistente completo, com busca de produtos, pré-processamento e URAs auxiliares.',
    endpoint: `${endpointBase}${templates.alpha7.endpoint || ''}`,
    highlights: [
      'Conecta a IA ao fluxo operacional do Alpha 7 usando API key, porta local e unidade de negócio.',
      'Cria automaticamente componentes auxiliares para busca de produtos, download de imagem e transferência.',
      'Funciona bem para operações que já trabalham com Alpha 7 no dia a dia.',
    ],
    steps: [
      'Autentica na instância com username, password e código 2FA da sessão atual.',
      'Cria um assistente base e guarda o id retornado pela instância.',
      'Instala automações de download, busca de produtos, URA principal, filtro AB e pré-processamento.',
      'Renderiza o template atual da IA Alpha 7 e faz update do assistente com os ids criados.',
      'Tenta registrar um snapshot da configuração para versionamento.',
    ],
    requestFields: [
      ...commonIaRequestFields,
      {
        field: 'nome_cliente',
        type: 'string',
        required: true,
        description: 'Nome da loja usado no template e nas automações auxiliares.',
      },
      {
        field: 'apiKey',
        type: 'string',
        required: true,
        description: 'API key usada pelos fluxos internos da integração Alpha 7.',
      },
      {
        field: 'porta_cliente',
        type: 'string',
        required: true,
        description: 'Porta da API local exposta pela operação do cliente.',
      },
      {
        field: 'unidade_negocio',
        type: 'string',
        required: true,
        description: 'Identificador da unidade de negócio usada nas consultas do Alpha 7.',
      },
    ],
    installedTemplates: [
      'ia/alpha7/alpha_download_imagem.json',
      'ia/alpha7/alpha_busca_produtos.json',
      'ia/alpha7/alpha_ura.json',
      'ia/alpha7/alpha_ab.json',
      'ia/alpha7/alpha_pre_processamento.json',
      'ia/alpha7/alpha_ia_config.json',
    ],
    payloadExample: `{
  "instance": "https://cliente.exemplo.com",
  "username": "operacao@cliente.com",
  "password": "senha-da-instancia",
  "code": "123456",
  "name": "IA - Alpha 7 Loja Centro",
  "nome_cliente": "Farmácia Centro",
  "apiKey": "alpha7-api-key",
  "porta_cliente": "5235",
  "unidade_negocio": "74579"
}`,
    checklist: [
      'Confirme se a URL da instância está sem barra final.',
      'Valide a porta exposta pela operação antes de iniciar a criação.',
      'Use a unidade de negócio correta para não apontar a IA para a loja errada.',
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
    description: 'Modelo com configuração enxuta para operações conectadas ao ambiente Trier.',
    summary:
      'Provisiona a IA Trier com um conjunto reduzido de campos e instala automaticamente os fluxos auxiliares necessários.',
    endpoint: `${endpointBase}${templates.trier.endpoint || ''}`,
    highlights: [
      'Padroniza o provisionamento usando uma API key global e a porta local da operação.',
      'Mantém um fluxo direto para equipes que precisam publicar instâncias com rapidez.',
      'A controller aceita alias de nome e porta, mas a UI atual envia o formato definido no catálogo do frontend.',
    ],
    steps: [
      'Autentica na instância usando as credenciais vinculadas à sessão atual.',
      'Cria um assistente vazio e captura o id retornado.',
      'Instala download de imagem, busca de produtos, URA principal, filtro AB e pré-processamento.',
      'Aplica o template Trier atual no assistente com as referências recém-criadas.',
      'Registra a versão da configuração quando o snapshot conclui com sucesso.',
    ],
    requestFields: [
      ...commonIaRequestFields,
      {
        field: 'nomeCliente',
        type: 'string',
        required: true,
        description: 'Nome da loja. O backend normaliza esse alias para nome_cliente.',
      },
      {
        field: 'porta_cliente',
        type: 'string',
        required: true,
        description: 'Porta da API local usada pela operação Trier.',
      },
      {
        field: 'apiKey',
        type: 'string',
        required: true,
        description: 'API key global usada pelos fluxos internos do modelo Trier.',
      },
    ],
    installedTemplates: [
      'ia/trier/trier_download_imagem.json',
      'ia/trier/trier_busca_produtos.json',
      'ia/trier/trier_ura.json',
      'ia/trier/trier_ab.json',
      'ia/trier/trier_pre_processamento.json',
      'ia/trier/trier_ia_config.json',
    ],
    payloadExample: `{
  "instance": "https://cliente.exemplo.com",
  "username": "operacao@cliente.com",
  "password": "senha-da-instancia",
  "code": "123456",
  "name": "IA - Trier Loja Centro",
  "nomeCliente": "Farmácia Centro",
  "porta_cliente": "5235",
  "apiKey": "trier-global-key"
}`,
    checklist: [
      'Confirme o nome comercial da loja exatamente como deve aparecer no assistente.',
      'Valide a porta local da API antes de publicar a IA.',
      'Garanta que a API key global usada na operação Trier está atualizada.',
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
    description: 'Modelo voltado para e-commerce, com contexto da loja e endpoint operacional da Vannon.',
    summary:
      'Cria a IA Vannon com automações de busca, pré-processamento e URA, usando endpoint do e-commerce e CEP da loja como contexto.',
    endpoint: `${endpointBase}${templates.vannon.endpoint || ''}`,
    highlights: [
      'Usa o endpoint do e-commerce para derivar o identificador operacional da loja.',
      'Considera o CEP informado para compor o contexto usado pelo fluxo Vannon.',
      'Exige poucos campos no modal, mas monta várias automações no backend.',
    ],
    steps: [
      'Autentica na instância e cria um assistente base.',
      'Instala os fluxos de download, busca de produtos, pré-processamento, URA principal e URA AB.',
      'Renderiza o template Vannon atual com os ids de automações criadas.',
      'Atualiza o assistente final e tenta salvar o snapshot da versão.',
    ],
    requestFields: [
      ...commonIaRequestFields,
      {
        field: 'clientName',
        type: 'string',
        required: true,
        description: 'Nome da loja usado no template e no contexto operacional.',
      },
      {
        field: 'apiKey',
        type: 'string',
        required: true,
        description: 'API key usada nas chamadas internas para o fluxo Vannon.',
      },
      {
        field: 'clientEndpoint',
        type: 'string',
        required: true,
        description: 'Endpoint do e-commerce. O backend extrai o domínio base para montar variáveis do template.',
      },
      {
        field: 'cepLoja',
        type: 'number',
        required: true,
        description: 'CEP da loja usado para o contexto logístico do modelo.',
      },
    ],
    installedTemplates: [
      'ia/vannon/download_de_imagens_IA_Vannon.json',
      'ia/vannon/busca_produtos.json',
      'ia/vannon/pre_processamento.json',
      'ia/vannon/ura_vannon.json',
      'ia/vannon/vannon_ab.json',
      'ia/vannon/Vannon_ai_config.json',
    ],
    payloadExample: `{
  "instance": "https://cliente.exemplo.com",
  "username": "operacao@cliente.com",
  "password": "senha-da-instancia",
  "code": "123456",
  "name": "IA - Vannon Loja Centro",
  "clientName": "Farmácia Centro",
  "apiKey": "vannon-api-key",
  "clientEndpoint": "https://farmaciacentro.vannon.app",
  "cepLoja": 30140071
}`,
    checklist: [
      'Informe um endpoint de e-commerce válido e acessível.',
      'Use o CEP real da unidade para manter o contexto da loja consistente.',
      'Teste a conectividade da instância logo após a criação da IA.',
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
    description: 'Modelo com autenticação por token dedicado para integrações Vetor.',
    summary:
      'Provisiona a IA Vetor a partir da instância do cliente, da API key da plataforma e do token específico da integração.',
    endpoint: `${endpointBase}${templates.vetor.endpoint || ''}`,
    highlights: [
      'Usa um token Vetor dedicado em conjunto com a API key do cliente.',
      'Mantém um fluxo direto e com poucos campos para provisionamento.',
      'Instala automaticamente busca de produtos, pré-processamento e rotas de transferência.',
    ],
    steps: [
      'Autentica na instância e cria um assistente base.',
      'Instala download de imagens, busca de produtos, pré-processamento, URA principal e URA AB.',
      'Renderiza o template Vetor atual com os ids e variáveis da integração.',
      'Atualiza o assistente e tenta gerar o snapshot da configuração final.',
    ],
    requestFields: [
      ...commonIaRequestFields,
      {
        field: 'clientName',
        type: 'string',
        required: true,
        description: 'Nome da loja exibido no modelo Vetor.',
      },
      {
        field: 'apiKey',
        type: 'string',
        required: true,
        description: 'API key usada pelas automações instaladas junto com a IA.',
      },
      {
        field: 'vetorToken',
        type: 'string',
        required: true,
        description: 'Token dedicado da integração Vetor usado nas chamadas do fluxo.',
      },
    ],
    installedTemplates: [
      'ia/vetor/download_de_imagens_IA_Vannon.json',
      'ia/vetor/busca_produtos.json',
      'ia/vetor/pre_processamento.json',
      'ia/vetor/ura_vetor.json',
      'ia/vetor/vannon_ab.json',
      'ia/vetor/vetor_ai_config.json',
    ],
    payloadExample: `{
  "instance": "https://cliente.exemplo.com",
  "username": "operacao@cliente.com",
  "password": "senha-da-instancia",
  "code": "123456",
  "name": "IA - Vetor Loja Centro",
  "clientName": "Farmácia Centro",
  "apiKey": "vetor-api-key",
  "vetorToken": "AgAAAGmNu9AtfU9..."
}`,
    checklist: [
      'Valide o token Vetor antes de iniciar o provisionamento.',
      'Use o nome comercial correto da loja para manter o template consistente.',
      'Teste o fluxo final de busca para confirmar que o token está respondendo.',
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
    description: 'Modelo genérico de atendimento com prompt editável e pré-processamento padrão.',
    summary:
      'Cria um assistente de atendimento humano com contexto editável, indicado para fluxos que não dependem de um ERP específico.',
    endpoint: `${endpointBase}${templates.atendimento.endpoint || ''}`,
    highlights: [
      'Exibe o prompt do sistema no modal para ajuste fino antes da criação.',
      'Instala um pré-processamento padrão e depois aplica o template principal da IA.',
      'Serve como base para operações que precisam de atendimento inicial humanizado.',
    ],
    steps: [
      'Autentica na instância usando a sessão atual e o código 2FA informado.',
      'Instala a automação default_pre_automation.json na instância.',
      'Cria um assistente base e aplica o template principal com o contexto informado.',
      'Atualiza o assistente final e tenta salvar a versão gerada.',
    ],
    requestFields: [
      ...commonIaRequestFields,
      {
        field: 'context',
        type: 'string',
        required: true,
        description: 'Prompt do sistema editável no modal. Define regras, tom e escopo do atendimento.',
      },
    ],
    installedTemplates: [
      'default_pre_automation.json',
      'ia/default_atendimento_ia_config.json',
    ],
    payloadExample: `{
  "instance": "https://cliente.exemplo.com",
  "username": "operacao@cliente.com",
  "password": "senha-da-instancia",
  "code": "123456",
  "name": "IA - Atendimento Loja Centro",
  "context": "Você é o assistente humano da Farmácia Centro. Coleta dados do pedido e transfere para atendente quando necessário."
}`,
    checklist: [
      'Revise o prompt antes de instalar, porque ele define o comportamento da IA.',
      'Evite instruções que permitam diagnóstico, prescrição ou promessa de estoque.',
      'Depois da criação, teste um atendimento simples e uma transferência para atendente.',
    ],
    links: [
      { label: 'Visão geral das IAs', path: '/main/docs/ias' },
      { label: 'IA Alpha 7', path: '/main/docs/ias/alpha7' },
      { label: 'Tabela de erros', path: '/main/docs/erros' },
    ],
  },
}
