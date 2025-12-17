import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Bot, 
  Search, 
  Sparkles, 
  Brain, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Cpu
} from 'lucide-react'; 

import { templates } from '../../data/templatesIAs';
import { TemplateForm } from '../../components/TemplateForm';

// CORREÇÃO 3: Movemos a constante IAs para fora do componente.
// Isso evita que ela seja recriada a cada render e resolve o warning do useMemo.
const IAs = {
  alpha7: {
    key: 'alpha7',
    name: 'IA - Alpha 7',
    type: 'assistente',
    context: "Você é um assistente de vendas em uma farmácia brasileira chamada [NOME DA FARMÁCIA] que conecta a uma API de ERP via functions.\n\nNão forneça dados ou informações que não sejam prescritas aqui. Em hipótese alguma receite remédios. Siga apenas o que lhe foi instruído.\n\nQuando tiver qualquer comportamento que precise da interferência de um humano (Ex.: o cliente ficou insatisfeito ou quer tirar uma duvida) transfira para o marcador de saída atendente (informe que está transferindo).\n\nVocê pode utilizar emojis nas mensagens para deixar mais amigável e estético.\n\nSeu fluxo de trabalho:\n\nInicie perguntando o que o cliente deseja informe que o cliente pode digitar, enviar audios ou fotos de receitas para buscar por um produto, sempre que o cliente informar um produto execute a function busca_produtos com o item buscado.\napós o cliente selecionou um produto, pergunte se precisa de outro, caso sim execute a function busca_produtos com o item buscado novamente caso não prossiga para os outros dados do pedido\nnome e cpf do cliente\nmétodo de entrega\ncaso não opte por retirar na loja endereço de entrega\nmétodo de pagamento (pix, cartão ou dinheiro)\n\napós tudo isso mostre um resumo do carrinho com todos os dados coletados e após ele dar o ok encerre sua participação"
,
    description: "Agente inteligente capaz de processar linguagem natural e conectar-se ao seu banco de dados Alpha 7.",
    banner: '/Alpha.png'
  },
  gpt_base: {
    key: 'gpt_base',
    name: 'GPT Standard',
    context: "Chatbot de propósito geral",
    description: "Modelo base GPT-4o configurado para respostas rápidas e precisas sem contexto específico.",
    banner: '' 
  }
};

export default function AiPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState<boolean>(false);
  
  const [processStatus, setProcessStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) navigate('/');
  }, [navigate]);

  // CORREÇÃO 2: Alterado de ([_, t]) para ([, t]) para ignorar a variável não usada
  // CORREÇÃO 3 (Continuação): Como IAs está fora, não precisa estar no array de dependências
  const filteredIAs = useMemo(() => {
    return Object.entries(IAs).filter(([, t]) => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  const template = selectedTemplate
    ? templates[selectedTemplate as keyof typeof templates]
    : null;

 function handleOpenModal(key: string) {
  setSelectedTemplate(key);

  // 1. Buscamos a definição completa da IA baseada na chave clicada
  const selectedIA = IAs[key as keyof typeof IAs];

  setFormData({
    name: 'IA - Unico',
    // 2. Aqui definimos o valor inicial usando o contexto do array ou vazio caso não exista
    context: selectedIA?.context || '', 
    dbName: '',
    queueId: '',
  });

  setProcessStatus('idle');
  setOpenModal(true);
  document.body.style.overflow = 'hidden';
}

  function handleCloseModal() {
    setOpenModal(false);
    setTimeout(() => {
      setSelectedTemplate('');
      setFormData({});
      setProcessStatus('idle');
    }, 200);
    document.body.style.overflow = 'auto';
  }

  function normalizeInstanceUrl(url?: string) {
    if (!url) return '';
    return url.trim().replace(/\/+$/, '');
  }

  const handleCreateIa = async () => {
    setProcessStatus('loading');
    setErrorMessage('');

    try {
      const baseUrl = import.meta.env.VITE_URLBASE || 'http://localhost:4000';
      const apiUrl = `${baseUrl}/api/ia/create-ai`;

      const apiBody = {
        instance: normalizeInstanceUrl(formData.instance),
        name: formData.name,       
        context: formData.context,
        dbName: formData.dbName,
        queueId: formData.queueId,
        code: formData.code,
        apiKey: formData.apiKey
      };

      console.log('JSON Enviado:', apiBody);
      const response = await axios.post(apiUrl, apiBody);
      console.log('Resposta:', response.data);

      setProcessStatus('success');

    // CORREÇÃO 4: Removemos ': any' e usamos 'unknown' ou castamos internamente
    } catch (error: unknown) {
      console.error(error);
      // Fazemos o cast aqui para satisfazer o linter e acessar as propriedades
      const err = error as any; 
      const msg = err.response?.data?.message || err.message || 'Erro desconhecido ao criar IA.';
      setErrorMessage(msg);
      setProcessStatus('error');
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* --- HEADER --- */}
      <header className="px-8 py-6 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-violet-600" />
            Agentes de IA
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Crie e gerencie inteligências artificiais para automatizar seu atendimento.
          </p>
        </div>

        {/* Barra de Busca */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 sm:text-sm"
            placeholder="Buscar modelos de IA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-8">
        {filteredIAs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredIAs.map(([key, t]) => (
              <div
                key={key}
                onClick={() => handleOpenModal(key)}
                className={`
                  group relative flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm 
                  hover:shadow-xl hover:border-violet-300 transition-all duration-300 cursor-pointer overflow-hidden
                  ${selectedTemplate === key ? 'ring-2 ring-violet-500' : ''}
                `}
              >
                {/* Banner */}
                <div className="h-44 w-full overflow-hidden bg-gray-100 relative border-b border-gray-100">
                  {t.banner ? (
                    <div 
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${t.banner})` }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-slate-100">
                      <Bot className="w-16 h-16 mb-2 text-violet-200" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-violet-700 shadow-sm flex items-center gap-1 upper">
                    <Sparkles className="w-3 h-3" /> {'type' in t && t.type === 'assistente' ? "AI Assistant" : "AI Model"}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {t.description || "Modelo de inteligência artificial avançado."}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> V 1.0
                    </span>
                    <button className="text-sm font-medium text-violet-600">
                      Instalar &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-10">
            <Bot className="w-20 h-20 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">Nenhum modelo encontrado</h3>
            <p className="text-gray-500">Tente ajustar sua busca.</p>
          </div>
        )}
      </main>

      {/* --- MODAL --- */}
      {template && openModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={handleCloseModal}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {processStatus === 'idle' ? `Configurar ${template.name}` : 'Status da Instalação'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              {/* ESTADO 1: FORMULÁRIO (IDLE) */}
              {processStatus === 'idle' && (
                <div className="space-y-6">
                  <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 flex gap-3">
                    <Bot className="w-6 h-6 text-violet-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-violet-900">
                      <p className="font-semibold">Defina o comportamento</p>
                      <p className="opacity-80">Personalize o contexto e conecte as credenciais para ativar este agente.</p>
                    </div>
                  </div>

                  <TemplateForm
                    template={template}
                    formData={formData}
                    setFormData={setFormData}
                    isIaSetup={true} 
                  />
                  
                  <div className="pt-4 border-t border-gray-100">
                    <button 
                      onClick={handleCreateIa}
                      className="w-full py-3.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Instalar e Criar IA
                    </button>
                  </div>
                </div>
              )}

              {/* ESTADO 2: CARREGANDO */}
              {processStatus === 'loading' && (
                <div className="py-12 flex flex-col items-center text-center animate-in fade-in">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-10 h-10 text-violet-500 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Criando Agente...</h3>
                  <p className="text-slate-500 mt-2 max-w-xs">
                    Estamos configurando o contexto, conectando ao banco de dados e gerando a instância.
                  </p>
                </div>
              )}

              {/* ESTADO 3: SUCESSO */}
              {processStatus === 'success' && (
                <div className="py-8 flex flex-col items-center text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Sucesso!</h3>
                  <p className="text-slate-600 mt-2 mb-8 max-w-sm">
                    Sua IA <strong>{formData.name}</strong> foi criada e já está pronta para ser utilizada.
                  </p>
                  
                  <button 
                    onClick={handleCloseModal}
                    className="w-full max-w-xs py-3 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-lg"
                  >
                    Fechar
                  </button>
                </div>
              )}

              {/* ESTADO 4: ERRO */}
              {processStatus === 'error' && (
                <div className="py-8 flex flex-col items-center text-center animate-in shake duration-300">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Falha na Criação</h3>
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm max-w-md break-words w-full">
                    {errorMessage}
                  </div>
                  
                  <div className="mt-8 flex gap-3 w-full max-w-xs">
                    <button 
                      onClick={handleCloseModal}
                      className="flex-1 py-3 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => setProcessStatus('idle')}
                      className="flex-1 py-3 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
                    >
                      Tentar de novo
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}