// src/data/templates.ts
export const templates = {
  cashback: {
    name: 'Alpha7 - Cashback ativo',
    file: 'alpha7_cashback_ativo.txt',
    description: 'Integração para consulta de cashback do Alpha 7.',
    type: 'integração',
    active:true,
    banner: '/Alpha.png',
    fields: [{ label: 'IP do Cliente', key: 'client_ip' }],
  },
  alpha7: {
    name: 'Alpha7 - Orçamento',
    file: 'Alpha7_orcamento.txt',
    banner: '/Alpha.png',
    type: 'integração',
    description: 'Integração para buscar orçamentos criados pelo cliente no ERP para o sistema.',
    active:true,
    fields: [
      { label: 'IP do Cliente', key: 'ip_do_cliente' },
      { label: 'Authorization', key: 'Authorization' },
      { label: 'Nome da empresa', key: 'nome_da_empresa' },
    ],
  },
  ifood_notificacao: {
    name: 'Ifood - Notificação de pedidos',
    file: 'ifood.txt',
    banner: '/ifood.png',
    description: 'Integração do Ifood para recebimento de notificação de novo pedido.',
    type: 'integração',
    active:true,
    fields: [
      { label: 'ClientId', key: 'ClientId' },
      { label: 'ClientSecret', key: 'ClientSecret' },
    ],
  },
  Napp: {
    name: 'Integração NAPP carrinho de compras',
    file: 'integracao_napp.txt',
    banner: '/napp.png',
    description: 'Ura carrinho de produtos integrada com a NAPP',
    type:'URA',
    active:true,
    fields: [
      { label: 'CNPJ do Cliente', key: 'cnpjCliente' },
      { label: 'Nome da loja', key: 'nomeDaLoja' },
    ],
  },
  Cielo: {
    name: 'Link de pagamento - Cielo',
    file: 'link_cielo.txt',
    banner: '/cielo.png',
    description: 'Integração link de pagamento da Cielo.',
    type: 'integração',
    active:true,
    fields: [
      { label: 'Nome do cliente', key: 'Cliente' },
      { label: 'Basic (ClientId:ClientSecret)', key: 'autenticacao' },
    ],
  },
  Cielo_webhook: {
    name: 'Cielo Webhook (Notificação)',
    file: 'CieloWebhook.txt',
    banner: '/cielo.png',
    description: 'Automação para envio do status de pagamento da Cielo.',
    type:'Automação',
    active:true,
    fields: [
      { label: 'Nome do cliente', key: 'nomecliente' },
      { label: 'ClientId:ClientSecret', key: 'clientcode' },
      { label: 'Instancia de armazenamento', key: 'instancia' },
      { label: 'QueueId', key: 'fila' },
      { label: 'APIKEY', key: 'apikey' },
    ],
  },
  Getnet:{
    name: 'Link de pagamento - Getnet',
    file: 'Integracao_getnet.txt',
    banner: '/getnet.png',
    description: 'Integração link de pagamento da Getnet.',
    type: 'integração',
    active:true,
    fields: [
      {label:'Credêncial', key: 'credencial'}
    ]
  },
  Getnet_webhook:{
    name: 'Webhook - Getnet',
    file: 'getnet_Webhook.txt',
    banner: '/getnet.png',
      description: 'Automação para envio do status de pagamento da Getnet.',
    type:'Automação',
    active: true,
    fields: [
      {label:'ID da fila', key: 'queueId'},
      {label:'API Key', key: 'apikey'},
      {label:'URL da instância', key: 'url'}
    ]
  },
  transcricao_de_receitas: {
    name: 'IA - Transcrição de receita',
    file: 'transcricao_de_receita.txt',
    banner: '/unico.png',
    description: 'Ferramenta de IA para transcrever receita.',
    type: 'Ferramenta de IA',
    active:true,
    fields: []
  },

};
