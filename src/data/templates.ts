// src/data/templates.ts
export const templates = {
  cashback: {
    name: 'Alpha7 - Cashback ativo',
    file: 'alpha7_cashback_ativo.txt',
    banner: '/Alpha.png',
    fields: [{ label: 'IP do Cliente', key: 'client_ip' }],
  },
  alpha7: {
    name: 'Alpha7 - Orçamento',
    file: 'Alpha7_orcamento.txt',
    banner: '/Alpha.png',
    fields: [
      { label: 'IP do Cliente', key: 'ip_do_cliente' },
      { label: 'Authorization', key: 'Authorization' },
      { label: 'Nome da empresa', key: 'nome_da_empresa' },
    ],
  },
  alpha7Carrinho: {
    name: 'Alpha7 - Carrinho de compras',
    banner: '/Alpha.png',
    file: 'Alpha7_Carrinho_de_produto.txt',
    fields: [
      { label: 'Nome do Banco de Dados', key: 'nome_do_banco' },
      { label: 'Nome da empresa', key: 'nome_do_cliente' }
    ],
  },
  ifood_notificacao: {
    name: 'Ifood - Notificação de pedidos',
    file: 'ifood.txt',
    banner: '/ifood.png',
    fields: [
      { label: 'ClientId', key: 'ClientId' },
      { label: 'ClientSecret', key: 'ClientSecret' },
    ],
  },
  Napp: {
    name: 'Integração NAPP carrinho de compras',
    file: 'integracao_napp.txt',
    banner: '/napp.png',
    fields: [
      { label: 'CNPJ do Cliente', key: 'cnpjCliente' },
      { label: 'Nome da loja', key: 'nomeDaLoja' },
    ],
  },
  Cielo: {
    name: 'Link de pagamento - Cielo',
    file: 'link_cielo.txt',
    banner: '/cielo.png',
    fields: [
      { label: 'Nome do cliente', key: 'nomecliente' },
      { label: 'ClientId:ClientSecret', key: 'clientcode' },
    ],
  },
  Cielo_webhook: {
    name: 'Cielo Webhook (Notificação)',
    file: 'CieloWebhook.txt',
    banner: '/cielo.png',
    fields: [
      { label: 'Nome do cliente', key: 'nomecliente' },
      { label: 'ClientId:ClientSecret', key: 'clientcode' },
      { label: 'Instancia de armazenamento', key: 'instancia' },
      { label: 'QueueId', key: 'fila' },
      { label: 'APIKEY', key: 'apikey' },
    ],
  },

};
