/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, Puzzle } from 'lucide-react'; // Instale: npm i lucide-react

import { templates } from '../../data/templates.ts';
import { TemplateForm } from '../../components/TemplateForm.tsx';
import { IVRGenerator } from '../../components/IVRGenerator.tsx';

interface ITemplate {
  name: string;
  file: string;
  banner?: string;
  active?: boolean;
  fields: any[];
  description?: string;
  type?: string;
}

export default function Integrations() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const navigate = useNavigate();

  // 🔹 Auth Check
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) navigate('/');
  }, [navigate]);

  const filteredTemplates = useMemo(() => {
    // Cast "as Record..." resolve os erros de 'description' e 'type' faltantes
    return Object.entries(templates as Record<string, ITemplate>).filter(
      ([, t]) => t.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const template = selectedTemplate
    ? (templates[selectedTemplate as keyof typeof templates] as ITemplate)
    : null;

  function handleOpenModal(key: string) {
    setSelectedTemplate(key);
    setOpenModal(true);
    // Bloqueia scroll do body quando modal abre
    document.body.style.overflow = 'hidden';
  }

  function handleCloseModal() {
    setOpenModal(false);
    setTimeout(() => {
      // Pequeno delay para limpar dados após animação (opcional)
      setSelectedTemplate('');
      setFormData({});
    }, 200);
    document.body.style.overflow = 'auto';
  }
console.log(selectedTemplate)
  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 overflow-hidden font-sans text-slate-800">
      {/* --- HEADER --- */}
      <header className="px-8 py-6 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-blue-600" />
            Catálogo de Integrações
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Conecte suas ferramentas favoritas e automatize seus fluxos.
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
            placeholder="Buscar integração (ex: WhatsApp, CRM...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Grid de Integrações */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map(([key, t]) => (
              <div
                key={key}
                onClick={() => handleOpenModal(key)}
                className={`
                  group relative flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm 
                  hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden
                  ${selectedTemplate === key ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                {/* Banner da Integração */}
                <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                  {t.banner ? (
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${t.banner})` }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Puzzle className="w-12 h-12" />
                    </div>
                  )}
                  {/* Badge de Status (Opcional) */}
                  <div
                    className={`absolute top-3 right-3  backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold shadow-sm uppercase ${
                      t.active == true
                        ? 'bg-white/90 text-green-600'
                        : 'bg-red-200 text-red-500'
                    }`}
                  >
                    {t.active == true ? 'Ativo' : 'Inativo'}
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                    {/* Fallback description se não houver no objeto */}
                    {t.description ??
                      'Integre e automatize processos com esta ferramenta para aumentar sua produtividade.'}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {t.type || 'Automação'}
                    </span>
                    {t.active == true ? (
                      <button className="text-sm font-medium text-blue-600">
                        Instalar &rarr;
                      </button>
                    ) : (
                      <button
                        className="text-sm font-medium text-gray-400"
                        disabled
                      >
                        Instalar &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-10">
            <Filter className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Nenhuma integração encontrada
            </h3>
            <p className="text-gray-500">Tente buscar por outro termo.</p>
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
          {/* Backdrop Blur */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Instalar {template.name}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lado Esquerdo: Formulário */}
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                    Preencha os dados abaixo para gerar as credenciais da
                    integração.
                  </div>
                  <TemplateForm
                    template={template}
                    formData={formData}
                    setFormData={setFormData}
                  />
                </div>

                {/* Lado Direito: Painel de Status */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full min-h-[400px]">
                  {/* O componente agora controla todo o espaço interno */}
                  <IVRGenerator
                    template={template}
                    formData={formData}
                    closeModal={handleCloseModal}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
