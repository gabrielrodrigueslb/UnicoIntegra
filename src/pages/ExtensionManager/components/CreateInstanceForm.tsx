/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Server } from 'lucide-react';
import { createInstance } from '../../../services/extension.service'; // Ajuste o caminho
import ModalConfirmacao from '../../../components/modalConfirmacao';

interface CreateInstanceFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function CreateInstanceForm({
  onSuccess,
  onError,
}: CreateInstanceFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    instance_Url: '',
  });
  const [showModal, setShowModal] = useState(false);

  const executeSave = async () => {
    setLoading(true);
    try {
      await createInstance(formData.client_name, formData.instance_Url);
      setFormData({ client_name: '', instance_Url: '' });
      onSuccess();
      setShowModal(false); // Fecha o modal após sucesso
    } catch (error: any) {
      onError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Se o usuário der Enter nos inputs, abrimos o modal em vez de salvar direto
    handleShowModal();
  };

  function handleShowModal() {
    // Evita abrir o modal se os campos estiverem vazios (opcional, mas recomendado)
    if (!formData.client_name || !formData.instance_Url) {
      // Opcional: alert("Preencha os campos");
      return;
    }
    setShowModal(!showModal);
  }

  function handleConfirm() {
    executeSave();
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
        <Server className="w-6 h-6 text-violet-600" /> Criar Cliente
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Cliente
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Farmácia Central"
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
            value={formData.client_name}
            onChange={(e) =>
              setFormData({ ...formData, client_name: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL da Instância
          </label>
          <input
            type="text"
            required
            placeholder="https://instancia.z-api.io/..."
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
            value={formData.instance_Url}
            onChange={(e) =>
              setFormData({ ...formData, instance_Url: e.target.value })
            }
          />
        </div>
        <button
          type="button"
          onClick={handleShowModal}
          className="w-full py-3 mt-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Criar
        </button>
        {showModal && (
          <ModalConfirmacao
            loading={loading}
            // Agora passamos JSX com as tags strong
            description={
              <p>Tem certeza que deseja criar o cliente{' '}
                <b>{formData.client_name}</b> da instância{' '}
                <b>{formData.instance_Url}</b>?</p>
            }
            confirmText={'Criar'}
            showModal={() => setShowModal(false)}
            onConfirm={handleConfirm}
          />
        )}
      </form>
    </div>
  );
}
