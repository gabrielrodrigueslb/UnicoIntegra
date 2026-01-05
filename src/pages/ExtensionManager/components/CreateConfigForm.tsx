/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Settings} from 'lucide-react';
import { createConfig, type InstanceData } from '../../../services/extension.service';
import { SearchableSelect, CreatableSelect } from './CustomSelects';
import ModalConfirmacao from '../../../components/modalConfirmacao'; // Importe o Modal

interface CreateConfigFormProps {
  instancesList: InstanceData[];
  databaseOptions: string[];
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function CreateConfigForm({ instancesList, databaseOptions, onSuccess, onError }: CreateConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado do Modal
  const [formData, setFormData] = useState({
    config_name: '',
    instance_url: '',
    dbName: '',
    clientToken: '',
  });

  // Lógica de Salvamento Separada
  const executeSave = async () => {
    setLoading(true);
    try {
      await createConfig(formData.config_name, formData.instance_url, formData.dbName, formData.clientToken);
      setFormData({ config_name: '', instance_url: '', dbName: '', clientToken: '' });
      onSuccess();
      setShowModal(false);
    } catch (error: any) {
      onError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit abre o modal (via Enter ou botão)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleShowModal();
  };

  function handleShowModal() {
    // Validação básica antes de abrir modal
    if (!formData.config_name || !formData.instance_url || !formData.dbName || !formData.clientToken) {
       // Opcional: alert("Preencha todos os campos");
       return;
    }
    setShowModal(true);
  }

  const instanceOptions = instancesList.map((inst) => ({
    value: inst.instance_url,
    label: inst.client_name,
    subLabel: inst.instance_url,
  }));

  // Encontra o nome do cliente selecionado para exibir no modal (UX melhor)
  const selectedInstanceName = instancesList.find(i => i.instance_url === formData.instance_url)?.client_name || formData.instance_url;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
        <Settings className="w-6 h-6 text-violet-600" /> Criar Configuração
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Configuração</label>
          <input
            type="text"
            required
            placeholder="Ex: Config Padrão V1"
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
            value={formData.config_name}
            onChange={(e) => setFormData({ ...formData, config_name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vincular Instância</label>
          <SearchableSelect
            options={instanceOptions}
            value={formData.instance_url}
            onChange={(val) => setFormData({ ...formData, instance_url: String(val) })}
            placeholder="Pesquise e selecione a instância..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Banco</label>
            <CreatableSelect
              options={databaseOptions}
              value={formData.dbName}
              onChange={(val) => setFormData({ ...formData, dbName: val })}
              placeholder="Selecione ou digite..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Token</label>
            <input
              type="password"
              required
              placeholder="Token Z-API"
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
              value={formData.clientToken}
              onChange={(e) => setFormData({ ...formData, clientToken: e.target.value })}
            />
          </div>
        </div>
        
        {/* Botão agora é type="button" e abre modal */}
        <button
          type="button" 
          onClick={handleShowModal}
          className="w-full py-3 mt-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Salvar Configuração
        </button>

        {showModal && (
          <ModalConfirmacao
            loading={loading}
            description={
              <p>Deseja salvar a configuração <strong>{formData.config_name}</strong> para o cliente <strong>{selectedInstanceName}</strong> no banco <strong>{formData.dbName}</strong>?</p>
            }
            confirmText={'Salvar'}
            showModal={() => setShowModal(false)}
            onConfirm={() => executeSave()}
          />
        )}
      </form>
    </div>
  );
}