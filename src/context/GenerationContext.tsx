import { createContext, useContext, useState } from 'react';
// CORREÇÃO 1: Importação de tipo explícita
import type { ReactNode } from 'react';

// Interfaces
export interface PkgFormData {
  nome_cliente: string;
  db_host: string;
  db_user: string;
  db_password: string;
  db_database: string;
  access_key: string;
}

type ProcessStatus = 'idle' | 'generating' | 'success' | 'error';

interface GenerationContextData {
  status: ProcessStatus;
  feedback: string;
  isMinimized: boolean;
  generateApp: (data: PkgFormData) => Promise<void>;
  closePopup: () => void;
  toggleMinimize: () => void;
}

const GenerationContext = createContext<GenerationContextData>({} as GenerationContextData);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [feedback, setFeedback] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  function closePopup() {
    setStatus('idle');
    setFeedback('');
    setIsMinimized(false);
  }

  function toggleMinimize() {
    setIsMinimized((prev) => !prev);
  }

  async function generateApp(formData: PkgFormData) {
    setStatus('generating');
    setFeedback('Compilando e gerando executável...');
    setIsMinimized(false); 

    try {
      const response = await fetch('https://unicocontato.tech/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no servidor.');
      }

      setFeedback('Baixando arquivo...');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      const contentDisposition = response.headers.get('content-disposition');
      let filename = `app-${formData.nome_cliente || 'cliente'}.zip`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      setTimeout(() => a.remove(), 100);

      setStatus('success');
      setFeedback('Download concluído com sucesso!');

    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      setStatus('error');
      setFeedback(msg);
    }
  }

  return (
    <GenerationContext.Provider 
      value={{ status, feedback, isMinimized, generateApp, closePopup, toggleMinimize }}
    >
      {children}
    </GenerationContext.Provider>
  );
}

// CORREÇÃO 2: Ignorar regra do fast-refresh para o hook exportado
// eslint-disable-next-line react-refresh/only-export-components
export const useGeneration = () => useContext(GenerationContext);