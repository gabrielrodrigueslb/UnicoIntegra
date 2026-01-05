import { CircleQuestionMark, Loader2 } from 'lucide-react';

// Altere 'string' para 'React.ReactNode'
interface ModalProps {
  loading: boolean;
  description: React.ReactNode;
  confirmText: string;
  showModal: () => void;
  onConfirm: () => void;
}

export default function ModalConfirmacao({
  loading,
  description,
  confirmText,
  showModal,
  onConfirm,
}: ModalProps) {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 z-50 flex items-center justify-center backdrop-blur-[2px] transition-opacity">
      <div className="bg-background rounded-lg shadow-lg flex flex-col p-6 max-w-110 text-center justify-center">
        <span className="bg-amber-200/70 p-2 self-center rounded-2xl mb-3">
          <CircleQuestionMark className="text-amber-400" size={50} />
        </span>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Confirmar ação
        </h2>

        <div className="mb-6 text-gray-600 overflow-hidden">
          {description || 'Essa ação não poderá ser desfeita. Deseja continuar?'}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={showModal}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors flex-1"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-1 flex justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              confirmText || 'Confirmar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
