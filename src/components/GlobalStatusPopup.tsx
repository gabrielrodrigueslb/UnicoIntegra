import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Minimize2, 
} from 'lucide-react';
import { useGeneration } from '../context/GenerationContext'; // Ajuste o caminho

export function GlobalStatusPopup() {
  const { status, feedback, isMinimized, closePopup, toggleMinimize } = useGeneration();

  if (status === 'idle') return null;

  return (
    <div 
      className={`
        fixed bottom-6 right-6 z-[9999] bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ease-in-out
        ${isMinimized ? 'w-16 h-16 rounded-full cursor-pointer hover:scale-105' : 'w-96'}
      `}
      onClick={isMinimized ? toggleMinimize : undefined}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 ${isMinimized ? 'h-full justify-center p-0' : 'bg-gray-50 border-b border-gray-100'}`}>
        
        {isMinimized ? (
          <div className="relative flex items-center justify-center w-full h-full">
            {status === 'generating' && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
            {status === 'error' && <AlertCircle className="w-6 h-6 text-red-600" />}
          </div>
        ) : (
          <>
            <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
              {status === 'generating' ? 'Gerando App' : status === 'success' ? 'Concluído' : 'Erro'}
            </h4>
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              {(status === 'success' || status === 'error') && (
                <button 
                  onClick={(e) => { e.stopPropagation(); closePopup(); }}
                  className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-lg text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Body (Apenas quando expandido) */}
      {!isMinimized && (
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-1">
              {status === 'generating' && <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />}
              {status === 'success' && <CheckCircle className="w-8 h-8 text-green-500" />}
              {status === 'error' && <AlertCircle className="w-8 h-8 text-red-500" />}
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">
                {status === 'generating' ? 'Trabalhando em segundo plano' : status === 'success' ? 'Sucesso!' : 'Falha'}
              </p>
              <p className="text-sm text-gray-500 leading-snug break-words">
                {feedback}
              </p>
            </div>
          </div>

          {status === 'generating' && (
            <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 w-2/3 animate-[shimmer_1.5s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)]"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}