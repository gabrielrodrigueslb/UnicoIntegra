/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, Puzzle } from 'lucide-react';

import { templates } from '../../data/templates.ts';
import { TemplateForm } from '../../components/TemplateForm.tsx';
import { IVRGenerator } from '../../components/IVRGenerator.tsx';
import { IntegrationPreviewModal } from '../../components/IntegrationPreviewModal.tsx';

interface ITemplate {
  name: string;
  file: string;
  banner?: string;
  active?: boolean;
  fields: any[];
  description?: string;
  type?: string;
}

type ModalStep = 'none' | 'preview' | 'install';

export default function Integrations() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [modalStep, setModalStep] = useState<ModalStep>('none');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) navigate('/');
  }, [navigate]);

  const filteredTemplates = useMemo(() => {
    return Object.entries(templates as Record<string, ITemplate>).filter(
      ([, t]) => t.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const template = selectedTemplate
    ? (templates[selectedTemplate as keyof typeof templates] as ITemplate)
    : null;

  function handleOpenPreview(key: string) {
    setSelectedTemplate(key);
    setModalStep('preview');
    document.body.style.overflow = 'hidden';
  }

  function handleContinueInstall() {
    setModalStep('install');
  }

  function handleCloseModal() {
    setModalStep('none');
    document.body.style.overflow = 'auto';
    setTimeout(() => {
      setSelectedTemplate('');
      setFormData({});
    }, 200);
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* HEADER */}
      <header className="px-8 py-6 bg-card border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-primary" /> Catálogo de Integrações
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Conecte suas ferramentas favoritas.
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-muted focus:bg-card focus:ring-2 focus:ring-primary transition sm:text-sm text-foreground placeholder:text-muted-foreground outline-none"
            placeholder="Buscar integração..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map(([key, t]) => (
              <div
                key={key}
                onClick={() => handleOpenPreview(key)}
                className={`group relative flex flex-col bg-card rounded-xl border border-border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer overflow-hidden ${
                  selectedTemplate === key ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="h-40 w-full overflow-hidden bg-muted relative">
                  {t.banner ? (
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${t.banner})` }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Puzzle className="w-12 h-12" />
                    </div>
                  )}
                  <div
                    className={`absolute top-3 right-3 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold shadow-sm uppercase ${
                      t.active
                        ? 'bg-background/90 text-green-600 dark:text-green-400'
                        : 'bg-red-200 text-red-500'
                    }`}
                  >
                    {t.active ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {t.description ?? 'Integre e automatize processos.'}
                  </p>
                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t.type || 'Automação'}
                    </span>
                    <button
                      className={`text-sm font-medium ${
                        t.active ? 'text-primary' : 'text-muted-foreground'
                      }`}
                      disabled={!t.active}
                    >
                      Instalar &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-10">
            <Filter className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              Nenhuma integração encontrada
            </h3>
          </div>
        )}
      </main>

      {/* MODALS */}
      {template && modalStep === 'preview' && (
        <IntegrationPreviewModal
          template={template}
          onClose={handleCloseModal}
          onContinue={handleContinueInstall}
        />
      )}

      {template && modalStep === 'install' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                Instalar {template.name}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
                    Preencha os dados abaixo para gerar as credenciais da
                    integração.
                  </div>
                  <TemplateForm
                    template={template}
                    formData={formData}
                    setFormData={setFormData}
                  />
                </div>
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden h-full min-h-[400px]">
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
