/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Cpu,
} from 'lucide-react';

// Importa o objeto templates refatorado
import { templates } from '../../data/templates_ia';
import { TemplateForm } from '../../components/TemplateForm';

// Para usar no useMemo (evita recriar a cada render)
const IAs = templates;

export default function AiPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [processStatus, setProcessStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) navigate('/');
  }, [navigate]);

  const filteredIAs = useMemo(() => {
    return Object.entries(IAs).filter(
      ([, t]) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description &&
          t.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [searchTerm]);

  const template = selectedTemplate
    ? templates[selectedTemplate as keyof typeof templates]
    : null;
  const uiTemplate = useMemo(() => {
    if (!template) return null;
    if (selectedTemplate !== 'alpha7') return template;

    const blockedDbKeys = new Set([
      'dbname',
      'db_name',
      'database',
      'banco',
      'nome_banco',
    ]);

    return {
      ...template,
      fields: (template.fields || []).filter(
        (field: { key?: string }) =>
          !blockedDbKeys.has((field?.key || '').toLowerCase()),
      ),
    };
  }, [template, selectedTemplate]);

  function handleOpenModal(key: string) {
    setSelectedTemplate(key);

    // Pega o template selecionado para preencher o contexto padrão
    const selectedIA = IAs[key as keyof typeof IAs];

    setFormData({
      name: 'IA - Unico',
      context: selectedIA?.context || '',
      // Não precisamos inicializar dbName, queueId, etc. Eles serão criados dinamicamente se existirem no template
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

  // --- NOVA LÓGICA DE ENVIO GENÉRICA ---
  const handleCreateIa = async () => {
    setProcessStatus('loading');
    setErrorMessage('');

    try {
      const baseUrl =
        import.meta.env.VITE_URLBASE || 'https://unicocontato.tech';

      const commonPath = '/api/ia/create-ai';
      const endpointSuffix = template?.endpoint || '';
      const apiUrl = `${baseUrl}${commonPath}${endpointSuffix}`;
      const username = localStorage.getItem('authUsername');
      const password = localStorage.getItem('authPassword');

      const apiBody: Record<string, unknown> = {
        ...formData,
        instance: normalizeInstanceUrl(formData.instance),
        name: formData.name,
        username: username,
        password: password,
        context: formData.context,
        code: formData.code,
      };

      if (selectedTemplate === 'alpha7') {
        delete apiBody.dbName;
        delete apiBody.db_name;
        delete apiBody.database;
        delete apiBody.Banco;
      }

      console.log(`Enviando para ${apiUrl}:`, apiBody);

      const response = await axios.post(apiUrl, apiBody);
      console.log('Resposta:', response.data);

      setProcessStatus('success');
    } catch (error: unknown) {
      console.error(error);
      const err = error as any;
      const backendError = err?.response?.data?.error;
      const normalizedBackendError =
        typeof backendError === 'string'
          ? backendError
          : backendError
            ? JSON.stringify(backendError)
            : '';
      const msg =
        normalizedBackendError ||
        err.response?.data?.message ||
        err.message ||
        'Erro desconhecido ao criar IA.';
      setErrorMessage(msg);
      setProcessStatus('error');
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* HEADER */}
      <header className="px-8 py-6 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-violet-600" />
            Agentes de IA
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Crie e gerencie inteligências artificiais para automatizar seu
            atendimento.
          </p>
          <button
            onClick={() => navigate('/main/iaPage/list')}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
          >
            <Brain className="w-4 h-4" />
            Ver IAs criadas
          </button>
        </div>

        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-500 transition duration-150 sm:text-sm placeholder-gray-400"
            placeholder="Buscar modelos de IA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* MAIN CONTENT */}
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
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-violet-700 shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />{' '}
                    {'type' in t && t.type === 'assistente'
                      ? 'AI Assistant'
                      : 'AI Model'}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {t.description ||
                      'Modelo de inteligência artificial avançado.'}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> V 1.0
                    </span>
                    <button className="text-sm font-medium text-violet-600 group-hover:underline">
                      Configurar &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-10">
            <Bot className="w-20 h-20 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">
              Nenhum modelo encontrado
            </h3>
            <p className="text-gray-500">Tente ajustar sua busca.</p>
          </div>
        )}
      </main>

      {/* MODAL */}
      {uiTemplate && openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {processStatus === 'idle'
                  ? `Configurar ${uiTemplate.name}`
                  : 'Status da Instalação'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 py-3 overflow-y-auto custom-scrollbar">
              {/* STATUS: FORMULÁRIO */}
              {processStatus === 'idle' && (
                <div className="space-y-6">
                  <div className="bg-violet-50 border border-violet-100 rounded-lg p-3 flex gap-3">
                    <Bot className="w-6 h-6 text-violet-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-violet-900">
                      <p className="font-semibold">Defina o comportamento</p>
                      <p className="opacity-80">
                        Preencha os campos abaixo para configurar o agente.
                      </p>
                    </div>
                  </div>

                  <TemplateForm
                    template={uiTemplate}
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

              {/* STATUS: LOADING */}
              {processStatus === 'loading' && (
                <div className="py-12 flex flex-col items-center text-center animate-in fade-in">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-10 h-10 text-violet-500 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Criando Agente...
                  </h3>
                  <p className="text-slate-500 mt-2 max-w-xs">
                    Estamos configurando o contexto e gerando a instância.
                  </p>
                </div>
              )}

              {/* STATUS: SUCCESS */}
              {processStatus === 'success' && (
                <div className="py-8 flex flex-col items-center text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Sucesso!
                  </h3>
                  <p className="text-slate-600 mt-2 mb-8 max-w-sm">
                    Sua IA <strong>{formData.name}</strong> foi criada e já está
                    pronta.
                  </p>
                  <button
                    onClick={handleCloseModal}
                    className="w-full max-w-xs py-3 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-lg"
                  >
                    Fechar
                  </button>
                </div>
              )}

              {/* STATUS: ERROR */}
              {processStatus === 'error' && (
                <div className="py-8 flex flex-col items-center text-center animate-in shake duration-300">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Falha na Criação
                  </h3>
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
