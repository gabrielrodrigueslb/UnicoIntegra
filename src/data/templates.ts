// src/data/templates.ts
export const templates = {
  GerarQRCode: {
    name: 'Gerar QR code',
    file: 'gerarQRcode.txt',
    banner:'/unico.png',
    fields: [
      { label: 'intância do cliente', key: 'urlInstancia', },
      {label:"APIKEY", key:"apiKeyFila", defaultValue:"unicocontato"},
    ],
  },
  cashback: {
    name: 'Alpha7 - Cashback ativo',
    file: 'alpha7_cashback_ativo.txt',
    banner:'/Alpha.png',
    fields: [{ label: 'IP do Cliente', key: 'client_ip' }],
  },
  alpha7: {
    name: 'Alpha7 - Orçamento',
    file: 'Alpha7_orcamento.txt',
    banner:'/Alpha.png',
    fields: [
      { label: 'IP do Cliente', key: 'ip_do_cliente' },
      { label: 'Authorization', key: 'Authorization' },
      { label: 'Nome da empresa', key: 'nome_da_empresa' },
    ],
  },
  ifood_notificacao: {
    name: 'Ifood - Notificação de pedidos',
    file: 'ifood.txt',
    banner:'/ifood.png',
    fields: [
      { label: 'ClientId', key: 'ClientId' },
      { label: 'ClientSecret', key: 'ClientSecret' },
    ],
  },
  Napp: {
    name: 'Integração NAPP carrinho de compras',
    file: 'integracao_napp.txt',
      banner:'/napp.png',
    fields: [
      { label: 'CNPJ do Cliente', key: 'cnpjCliente' },
      { label: 'Nome da loja', key: 'nomeDaLoja' },
    ],
  },
  Cielo: {
    name: 'Link de pagamento - Cielo',
    file: 'link_cielo.txt',
    banner:'/cielo.png',
    fields: [
      { label: 'Nome do cliente', key: 'nomecliente' },
      { label: 'ClientId:ClientSecret', key: 'clientcode' },
    ],
  },
  Cielo_webhook: {
    name: 'Cielo Webhook (Notificação)',
    file: 'CieloWebhook.txt',
    banner:'/cielo.png',
    fields: [
      { label: 'Nome do cliente', key: 'nomecliente' },
      { label: 'ClientId:ClientSecret', key: 'clientcode' },
      {label: 'Instancia de armazenamento', key:"instancia"},
      {label:"QueueId", key:"fila"},
      {label:"APIKEY", key:"apikey"},
    ],
  }

  /* ,
  alpha7Carrinho: {
    name: "Alpha7 - Carrinho de compras",
    file: "Alpha7_carrinho_de_compra.json",
    fields: [
      { label: "Nome do Banco de Dados", key: "db_name" },
      { label: "Schema do Banco de Dados", key: "db_schema" },
      { label: "Nome da empresa", key: "nome_da_empresa" },
      { label: "Authorization", key: "Authorization" },
    ],
  }, */
};
