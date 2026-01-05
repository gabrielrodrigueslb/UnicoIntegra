// src/data/templates.ts

export const templates = {
  cashback: {
    name: 'Alpha7 - Cashback ativo',
    file: 'alpha7_cashback_ativo.txt',
    description: 'Consulta automática de cashback no Alpha 7.',
    longDescription:
      'Permite consultar em tempo real o saldo de cashback disponível para o cliente diretamente no ERP Alpha 7. Ideal para fidelização e campanhas de retorno.',
    type: 'Integração',
    active: true,
    banner: '/Alpha.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    benefits: [
      'Consulta em tempo real',
      'Redução de chamadas manuais',
      'Melhora a experiência do cliente',
    ],
    fields: [{ label: 'IP do Cliente', key: 'client_ip' }],
    steps: [
      {
        title: 'Verifique a conexão com o Alpha 7',
        content: 'Certifique-se de que o ERP Alpha 7 está acessível externamente ou que a VPN está configurada corretamente.'
      },
      {
        title: 'Obtenha o IP do Servidor',
        content: 'Identifique o IP fixo ou DNS onde o serviço do Alpha 7 está rodando.',
        code: 'Ex: 192.168.1.100 ou api.suaempresa.com'
      },
      {
        title: 'Instalação',
        content: 'Insira o IP no campo de configuração ao lado e clique em Instalar.'
      }
    ]
  },

  alpha7: {
    name: 'Alpha7 - Orçamento',
    file: 'Alpha7_orcamento.txt',
    banner: '/Alpha.png',
    type: 'Integração',
    description: 'Busca de orçamentos criados no ERP Alpha 7.',
    longDescription:
      'Integração que permite consultar orçamentos criados pelo cliente diretamente no ERP Alpha 7, agilizando o atendimento e permitindo o fechamento de vendas automatizado.',
    active: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    benefits: [
      'Busca automática de orçamentos',
      'Integração direta com ERP',
      'Atendimento mais rápido',
    ],
    fields: [
      { label: 'IP do Cliente', key: 'ip_do_cliente' },
      { label: 'Authorization', key: 'Authorization' },
      { label: 'Nome da empresa', key: 'nome_da_empresa' },
    ],
    steps: [
      {
        title: 'Acesse as Configurações de API',
        content: 'No painel administrativo do Alpha 7, vá até Configurações > Integrações > API.'
      },
      {
        title: 'Gere o Token de Autorização',
        content: 'Gere uma nova chave de API (Authorization Basic ou Bearer) e copie o código completo.',
        code: 'Basic YTJxbj...=='
      },
      {
        title: 'Identifique a Empresa',
        content: 'Caso utilize multi-empresas, pegue o Nome exato da empresa conforme cadastrado no ERP.'
      },
      {
        title: 'Preencha os Dados',
        content: 'Cole o IP, o Token e o Nome da Empresa nos campos do formulário de instalação.'
      }
    ]
  },

  ifood_notificacao: {
    name: 'Ifood - Notificação de pedidos',
    file: 'ifood.txt',
    banner: '/ifood.png',
    description: 'Receba notificações automáticas de novos pedidos.',
    longDescription:
      'Automação que monitora o polling do iFood e notifica seu sistema (CRM ou WhatsApp) sempre que um novo pedido é realizado ou muda de status.',
    type: 'Integração',
    active: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    benefits: [
      'Pedidos em tempo real',
      'Evita perdas de pedidos',
      'Integração oficial iFood',
    ],
    fields: [
      { label: 'ClientId', key: 'ClientId' },
      { label: 'ClientSecret', key: 'ClientSecret' },
    ],
    steps: [
      {
        title: 'Acesse o Portal do Desenvolvedor iFood',
        content: 'Entre na sua conta no iFood Developer Portal.'
      },
      {
        title: 'Crie ou Selecione uma Aplicação',
        content: 'Vá em "Minhas Aplicações". Se não tiver, crie uma nova para obter as credenciais.'
      },
      {
        title: 'Copie as Credenciais',
        content: 'Copie o "ClientId" e o "ClientSecret" disponíveis na aba de autenticação.'
      },
      {
        title: 'Ative a Integração',
        content: 'Insira as credenciais no formulário ao lado e clique em Instalar.'
      }
    ]
  },

  Napp: {
    name: 'Integração NAPP carrinho de compras',
    file: 'integracao_napp.txt',
    banner: '/napp.png',
    description: 'URA com carrinho de compras integrado à NAPP.',
    longDescription:
      'Permite que clientes realizem compras via URA ou Chatbot com produtos sincronizados em tempo real com a plataforma NAPP.',
    type: 'URA',
    active: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    benefits: [
      'Carrinho de compras por telefone',
      'Integração com catálogo',
      'Automação de pedidos',
    ],
    fields: [
      { label: 'CNPJ do Cliente', key: 'cnpjCliente' },
      { label: 'Nome da loja', key: 'nomeDaLoja' },
    ],
    steps: [
      {
        title: 'Valide seu cadastro NAPP',
        content: 'Certifique-se de que sua loja está ativa na plataforma NAPP Solutions.'
      },
      {
        title: 'Obtenha o CNPJ',
        content: 'Tenha em mãos o CNPJ cadastrado na conta principal da loja.'
      },
      {
        title: 'Verifique o Nome da Loja',
        content: 'O nome da loja deve ser exatamente igual ao slug utilizado na URL da sua loja NAPP.',
        code: 'Ex: farmacia-central (se a url for napp.com/farmacia-central)'
      },
      {
        title: 'Finalize',
        content: 'Preencha os campos e instale para sincronizar o catálogo.'
      }
    ]
  },

  Cielo: {
    name: 'Link de pagamento - Cielo',
    file: 'link_cielo.txt',
    banner: '/cielo.png',
    description: 'Geração de links de pagamento Cielo.',
    longDescription:
      'Crie links de pagamento Cielo e envie diretamente para seus clientes de forma rápida e segura através do fluxo de conversa.',
    type: 'Integração',
    active: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    benefits: [
      'Pagamentos rápidos',
      'Integração segura',
      'Aceita cartões e Pix',
    ],
    fields: [
      { label: 'Nome do cliente', key: 'Cliente' },
      { label: 'Basic (ClientId:ClientSecret)', key: 'autenticacao' },
    ],
    steps: [
      {
        title: 'Acesse o Painel Cielo E-commerce',
        content: 'Entre na área de desenvolvedores ou no painel da sua loja Cielo.'
      },
      {
        title: 'Obtenha o Merchant ID e Key',
        content: 'Copie suas credenciais de produção.'
      },
      {
        title: 'Formate a Autenticação',
        content: 'Para o campo Basic, você deve usar o padrão "MerchantId:MerchantKey". Algumas integrações exigem isso codificado em Base64.',
        code: 'MerchantID:MerchantKey'
      },
      {
        title: 'Instalar',
        content: 'Insira o nome de identificação do cliente e a chave de autenticação.'
      }
    ]
  },

  Cielo_webhook: {
    name: 'Cielo Webhook (Notificação)',
    file: 'CieloWebhook.txt',
    banner: '/cielo.png',
    description: 'Notificação automática de status de pagamento.',
    longDescription:
      'Receba eventos de pagamento da Cielo e dispare ações automáticas no seu sistema (como liberar um pedido ou enviar comprovante).',
    type: 'Automação',
    active: true,
    benefits: [
      'Notificações em tempo real',
      'Automação de status',
      'Integração robusta',
    ],
    fields: [
      { label: 'Nome do cliente', key: 'nomecliente' },
      { label: 'ClientId:ClientSecret', key: 'clientcode' },
      { label: 'Instancia de armazenamento', key: 'instancia' },
      { label: 'QueueId', key: 'fila' },
      { label: 'APIKEY', key: 'apikey' },
    ],
    steps: [
      {
        title: 'Configure a Fila (Queue)',
        content: 'Crie uma fila no seu sistema UnicoContato para receber os eventos.'
      },
      {
        title: 'Gere a API Key',
        content: 'Gere uma API Key com permissão de escrita na fila criada.'
      },
      {
        title: 'Obtenha Credenciais Cielo',
        content: 'Tenha em mãos o ClientId e ClientSecret da Cielo.'
      },
      {
        title: 'Configure a URL de Retorno',
        content: 'Preencha todos os campos. O sistema irá gerar uma URL de Webhook que deve ser cadastrada no painel da Cielo.'
      }
    ]
  },

  Getnet: {
    name: 'Link de pagamento - Getnet',
    file: 'Integracao_getnet.txt',
    banner: '/getnet.png',
    description: 'Link de pagamento integrado à Getnet.',
    longDescription:
      'Gere links de pagamento Getnet para cobrança rápida e automatizada diretamente pelo chat.',
    type: 'Integração',
    active: true,
    benefits: [
      'Cobrança simplificada',
      'Alta confiabilidade',
      'Integração direta',
    ],
    fields: [{ label: 'Credencial', key: 'credencial' }],
    steps: [
      {
        title: 'Portal do Desenvolvedor Getnet',
        content: 'Acesse sua conta no portal de desenvolvedores da Getnet.'
      },
      {
        title: 'Crie uma Aplicação',
        content: 'Crie uma nova aplicação para obter o Client ID e Client Secret.'
      },
      {
        title: 'Gere o Token/Credencial',
        content: 'A credencial geralmente é a concatenação de "Client_ID:Client_Secret" codificada em Base64.',
        code: 'Basic Y2xpZW50...=='
      },
      {
        title: 'Instale',
        content: 'Cole a credencial gerada no campo correspondente.'
      }
    ]
  },

  Getnet_webhook: {
    name: 'Webhook - Getnet',
    file: 'getnet_Webhook.txt',
    banner: '/getnet.png',
    description: 'Automação de notificações Getnet.',
    longDescription:
      'Receba eventos de pagamento da Getnet e automatize fluxos internos de confirmação.',
    type: 'Automação',
    active: true,
    benefits: [
      'Eventos em tempo real',
      'Menos polling',
      'Automação completa',
    ],
    fields: [
      { label: 'ID da fila', key: 'queueId' },
      { label: 'API Key', key: 'apikey' },
      { label: 'URL da instância', key: 'url' },
    ],
    steps: [
      {
        title: 'Prepare o Receptor',
        content: 'No seu painel, crie uma fila para processar os pagamentos.'
      },
      {
        title: 'Dados de Acesso',
        content: 'Copie o ID da Fila e gere uma API Key válida.'
      },
      {
        title: 'Instale o Webhook',
        content: 'Preencha os dados e clique em Instalar. O sistema configurará a escuta de eventos.'
      }
    ]
  },

  transcricao_de_receitas: {
    name: 'IA - Transcrição de receita',
    file: 'transcricao_de_receita.txt',
    banner: '/unico.png',
    description: 'Transcrição automática de receitas médicas.',
    longDescription:
      'Utiliza modelos avançados de visão computacional (OCR + IA Generativa) para converter imagens ou áudios de receitas médicas manuscritas em texto estruturado.',
    type: 'Ferramenta de IA',
    active: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    benefits: [
      'Alta precisão na leitura',
      'Redução de erros de interpretação',
      'Processamento em segundos',
    ],
    fields: [],
    steps: [
      {
        title: 'Sem configuração necessária',
        content: 'Esta é uma ferramenta nativa de IA. Basta clicar em instalar para habilitá-la no seu fluxo.'
      },
      {
        title: 'Como usar',
        content: 'Após instalado, envie uma imagem de receita no fluxo configurado para receber a transcrição.'
      }
    ]
  },
};