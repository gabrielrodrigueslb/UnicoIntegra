/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Plus} from 'lucide-react';
import { createLicense, type InstanceData, type ConfigData } from '../../../services/extension.service';
import { SearchableSelect } from './CustomSelects';
import ModalConfirmacao from '../../../components/modalConfirmacao'; // Importe o Modal

interface CreateLicenseFormProps {
  instancesList: InstanceData[];
  configsList: ConfigData[];
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function CreateLicenseForm({ instancesList, configsList, onSuccess, onError }: CreateLicenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado do Modal
  const [formData, setFormData] = useState({ instance_url: '', config_id: '' });

  // Lógica de Salvamento Separada
  const executeSave = async () => {
    setLoading(true);
    try {
      await createLicense(formData.instance_url, Number(formData.config_id));
      setFormData({ instance_url: '', config_id: '' });
      onSuccess();
      setShowModal(false);
    } catch (error: any) {
      onError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit abre o modal
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleShowModal();
  };

  function handleShowModal() {
     if (!formData.instance_url || !formData.config_id) {
       return;
    }
    setShowModal(true);
  }

  const instanceOptions = instancesList.map((inst) => ({
    value: inst.instance_url,
    label: inst.client_name,
    subLabel: inst.instance_url,
  }));

  const configOptions = configsList.map((conf) => ({
    value: conf.id,
    label: `${conf.id} - ${conf.config_name}`,
    subLabel: conf.instancias?.client_name || 'Sem Instância',
  }));

  // Helpers para exibir nomes bonitos no modal
  const selectedInstanceName = instancesList.find(i => i.instance_url === formData.instance_url)?.client_name || 'Desconhecido';
  const selectedConfigName = configsList.find(c => c.id === Number(formData.config_id))?.config_name || 'Desconhecida';

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
        <Plus className="w-6 h-6 text-violet-600" /> 3. Gerar Licença
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione a Instância</label>
          <SearchableSelect
            options={instanceOptions}
            value={formData.instance_url}
            onChange={(val) => setFormData({ ...formData, instance_url: String(val) })}
            placeholder="Buscar instância..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione a Configuração</label>
          <SearchableSelect
            options={configOptions}
            value={Number(formData.config_id)}
            onChange={(val) => setFormData({ ...formData, config_id: String(val) })}
            placeholder="Buscar configuração por ID ou Nome..."
          />
          <p className="text-xs text-gray-400 mt-1">Exibe: ID - Nome Config | Cliente vinculado</p>
        </div>
        
        {/* Botão agora é type="button" e abre modal */}
        <button
          type="button" 
          onClick={handleShowModal}
          className="w-full py-3 mt-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Gerar Chave de Licença
        </button>

        {showModal && (
          <ModalConfirmacao
            loading={loading}
            description={
              <p>Gerar nova licença para o cliente <strong>{selectedInstanceName}</strong> usando a configuração <strong>{selectedConfigName}</strong>?</p>
            }
            confirmText={'Gerar Licença'}
            showModal={() => setShowModal(false)}
            onConfirm={() => executeSave()}
          />
        )}
      </form>
    </div>
  );
}