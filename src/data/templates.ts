// src/data/templates.ts
export const templates = {
  cashback: {
    name: 'Alpha7_Cashback_ativo',
    file: 'Alpha7_cashback_ativo.txt',
    fields: [{ label: 'IP do Cliente', key: 'client_ip' }],
  },
  alpha7: {
    name: 'Alpha7-Orçamento',
    file: 'Alpha7_orcamento.txt',
    fields: [
      { label: 'IP do Cliente', key: 'ip_do_cliente' },
      { label: 'Authorization', key: 'Authorization' },
      { label: 'Nome da empresa', key: 'nome_da_empresa' },
    ],
  },
  ifood_notificacao: {
    name: 'Ifood - Notificação de pedidos',
    file: 'ifood.txt',
    fields: [
      { label: 'ClientId', key: 'ClientId' },
      { label: 'ClientSecret', key: 'ClientSecret' },
    ],
  },
  Napp: {
    name: 'Integração_NAPP_carrinho_de_compras',
    file: 'integracao_napp.txt',
    fields: [
      { label: 'CNPJ do Cliente', key: 'cnpjCliente' },
      { label: 'Nome da loja', key: 'nomeDaLoja' },
    ],
  },

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
