export const iaDocOrder = ['alpha7', 'trier', 'vannon', 'vetor'] as const;

export type IaDocKey = (typeof iaDocOrder)[number];

interface IaDocDefinition {
  slug: string;
  title: string;
  badge: string;
  cardDescription: string;
  points: string[];
  highlights: string[];
  steps: string[];
}

export const iaDocs: Record<IaDocKey, IaDocDefinition> = {
  alpha7: {
    slug: 'alpha7',
    title: 'IA Alpha7',
    badge: 'IA integrada ao ERP',
    cardDescription:
      'Gerencie as APIs que alimentam as IAs, com criacao de instancias, status operacional, logs e reinicio.',
    points: [
      'Busca de produtos direto no banco de dados',
      'Atendimento humanizado',
      'Alta eficiencia',
    ],
    highlights: [
      'Consulta dados do ecossistema Alpha 7 direto na operacao da loja.',
      'Combina API key, porta local e unidade de negocio para montar o contexto.',
      'Ideal para equipes que ja trabalham com o ERP Alpha 7 no dia a dia.',
    ],
    steps: [
      'Cadastre a loja, a API key, a porta local e a unidade de negocio da operacao.',
      'Valide a conectividade da API antes de liberar a instancia para atendimento.',
      'Acompanhe logs e reinicie o servico quando houver mudanca de ambiente.',
    ],
  },
  trier: {
    slug: 'trier',
    title: 'IA Trier',
    badge: 'Integracao Trier',
    cardDescription:
      'Documentacao da IA conectada a Trier, com configuracao enxuta e foco no provisionamento rapido.',
    points: [
      'API global centralizada',
      'Configuracao por porta local',
      'Fluxo objetivo de integracao',
    ],
    highlights: [
      'Usa uma API key global para padronizar o acesso entre clientes Trier.',
      'Mantem a configuracao operacional simples com nome da loja e porta da API.',
      'Boa opcao para ambientes que precisam publicar instancias com agilidade.',
    ],
    steps: [
      'Informe o nome da loja e a porta em que a API local responde.',
      'Associe a API key global da operacao Trier ao cadastro da instancia.',
      'Revise a resposta da integracao e publique a IA apos a validacao inicial.',
    ],
  },
  vannon: {
    slug: 'vannon',
    title: 'IA Vannon',
    badge: 'Integracao Vannon',
    cardDescription:
      'Pagina de referencia da IA Vannon, com dados de e-commerce e contexto logistico por loja.',
    points: [
      'Endpoint do e-commerce',
      'Contexto por CEP da loja',
      'API key dedicada',
    ],
    highlights: [
      'Integra o atendimento ao endpoint da loja no ecossistema Vannon.',
      'Leva em conta o CEP da unidade para contextualizar consultas operacionais.',
      'Exige poucas informacoes para preparar a instancia e iniciar a validacao.',
    ],
    steps: [
      'Cadastre nome da loja, API key e o endpoint usado no e-commerce.',
      'Preencha o CEP da unidade para manter o contexto operacional correto.',
      'Teste a conectividade da instancia antes de disponibilizar a IA para uso.',
    ],
  },
  vetor: {
    slug: 'vetor',
    title: 'IA Vetor',
    badge: 'Integracao Vetor',
    cardDescription:
      'Referencia tecnica da IA Vetor, com autenticacao por token dedicado e configuracao direta.',
    points: [
      'Token Vetor dedicado',
      'Configuracao simples da loja',
      'Provisionamento direto',
    ],
    highlights: [
      'Combina API key da plataforma com token especifico da integracao Vetor.',
      'Fluxo direto para lojas que precisam ativar a IA com poucas etapas.',
      'Facilita a revisao dos dados obrigatorios antes de publicar a instancia.',
    ],
    steps: [
      'Cadastre o nome da loja e a API key que sera usada na comunicacao.',
      'Informe o token Vetor valido para autenticar a integracao.',
      'Execute a validacao final e libere a IA somente apos confirmar a conexao.',
    ],
  },
};
