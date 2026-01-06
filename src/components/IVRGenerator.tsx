/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import axios from 'axios';
import { 
  HardDriveDownload, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Rocket, 
  Server 
} from 'lucide-react'; // Certifique-se de ter lucide-react instalado
import { base64ToUtf8, utf8ToBase64 } from '../utils/utils';

interface Props {
  template: { name: string; file: string; fields: { key: string }[]; description?: string; type?: string };
  formData: Record<string, string>;
  closeModal: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function IVRGenerator({ template, formData, closeModal }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [generatedBase64, setGeneratedBase64] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lógica de Download extraída do seu SuccessModal antigo
  const handleDownload = () => {
    if (!generatedBase64) return;
    const filename = `${template.name.replace(/\s+/g, '_').toLowerCase()}.ivr`;
    const blob = new Blob([generatedBase64], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleGenerate = async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      // 1. Busca e processamento do Template
      const res = await fetch(`/templates/${template.file}`);
      const templateContent = await res.text();
      const templateBase64 = templateContent.replace(/\//g, '').trim(); //
      
      const decoded = base64ToUtf8(templateBase64);
      const json = JSON.parse(decoded);

      // 2. Substituição de variáveis
      const jsonString = JSON.stringify(json).replace(
        /{{(.*?)}}/g,
        (_, key) => {
          const value = formData[key.trim()];
          return value !== undefined && value !== '' ? value : `{{${key.trim()}}}`;
        },
      );

      // 3. Sanitização e Payload
      const instanceURL = formData['instanceURL'] || '';
      const sanitizedInstanceURL = instanceURL.replace(/\/$/, '');
      const code = formData['code'] || '';

      const ivrPayload = {
        instance: sanitizedInstanceURL,
        integrationData: JSON.parse(jsonString),
        code: code
      };

      console.log('Enviando payload:', ivrPayload);

      // 4. Instalação via API
      await axios.post(
        'https://unicocontato.tech/install/integration',
        ivrPayload,
      );

      // Sucesso
      const finalBase64 = utf8ToBase64(jsonString);
      setGeneratedBase64(finalBase64);
      setStatus('success');

    } catch (error: any) {
      console.error('Failed:', error);
      // Se houver response do axios, usa a mensagem, senão usa genérica
      const msg = error.response?.data?.message || 'Falha na conexão ou instalação.';
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  // --- RENDERIZAÇÃO DOS ESTADOS ---

  return (
    <div className="h-full flex flex-col justify-between min-h-[300px] bg-primary-foreground">
      
      {/* AREA DE STATUS CENTRAL */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        
        {/* ESTADO: IDLE (Aguardando) */}
        {status === 'idle' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Rocket className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Pronto para Instalar</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
              Revise os dados ao lado e clique em instalar para configurar o <strong>{template.name}</strong> na sua instância.
            </p>
          </div>
        )}

        {/* ESTADO: LOADING (Instalando) */}
        {status === 'loading' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Server className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Instalando Integração...</h3>
            <p className="text-sm text-gray-500 mt-2">
              Conectando com a instância e configurando fluxos.
            </p>
          </div>
        )}

        {/* ESTADO: SUCCESS (Instalado) */}
        {status === 'success' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Instalação Concluída!</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
              A integração foi aplicada com sucesso na sua instância.
            </p>
            
            {/* Opção de Download de Backup */}
            <div className="mt-6 pt-4 border-t border-gray-100 w-full">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Backup Manual</p>
              <button 
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <HardDriveDownload className="w-4 h-4" />
                Baixar arquivo .IVR
              </button>
            </div>
          </div>
        )}

        {/* ESTADO: ERROR (Erro) */}
        {status === 'error' && (
          <div className="animate-in shake duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Erro na Instalação</h3>
            <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-100">
              {errorMessage}
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Verifique os dados da URL e Token e tente novamente.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-auto p-6  flex gap-3 items-center">
        {status === 'success' ? (
          <button 
            onClick={closeModal}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            Fechar Janela
          </button>
        ) : (
          <button 
            onClick={handleGenerate}
            disabled={status === 'loading'}
            className={`
              w-full py-3 px-4 rounded-xl font-medium text-white shadow-lg transition-all flex items-center justify-center gap-2
              ${status === 'loading' 
                ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                : status === 'error' 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5'
              }
            `}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processando...
              </>
            ) : status === 'error' ? (
              'Tentar Novamente'
            ) : (
              'Instalar Integração'
            )}
          </button>
        )}
      </div>
    </div>
  );
}