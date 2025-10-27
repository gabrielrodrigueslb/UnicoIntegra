import { useState } from 'react';
import axios from 'axios';
import { SuccessModal } from './SucessModal';
import { base64ToUtf8, utf8ToBase64 } from '../utils/utils'; 

interface Props {
  template: { name: string; file: string; fields: { key: string }[] };
  formData: Record<string, string>;
  closeModal: () => void;
}

export function IVRGenerator({ template, formData, closeModal }: Props) {
  const [generated, setGenerated] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    try {
      const res = await fetch(`/templates/${template.file}`);
      const templateContent = await res.text();

      // Correção 1: Remove a tag do conteúdo do arquivo
      const templateBase64 = templateContent.replace(/\//g, '').trim();

      const decoded = base64ToUtf8(templateBase64);
      const json = JSON.parse(decoded);

      const jsonString = JSON.stringify(json).replace(
        /{{(.*?)}}/g,
        (_, key) => {
          const value = formData[key.trim()];
          return value !== undefined && value !== ''
            ? value
            : `{{${key.trim()}}}`;
        },
      );
      
      // Correção 2: Remove a barra "/" do final da URL da instância
      const instanceURL = formData['instanceURL'] || '';
      const sanitizedInstanceURL = instanceURL.replace(/\/$/, '');

      const ivrPayload = {
        instance: sanitizedInstanceURL,
        integrationData: JSON.parse(jsonString),
      };
      
      console.log('Enviando payload para a API:', ivrPayload);

      const installResponse = await axios.post(
        'https://unicocontato.tech/install/integration',
        ivrPayload,
      );

      console.log('Installation successful:', installResponse.data);

      const finalBase64 = utf8ToBase64(jsonString);

      setGenerated(finalBase64);
      setShowModal(true);

    } catch (error) {
      console.error('Failed to generate or install IVR:', error);
      setError('Falha na geração ou instalação do IVR. Verifique o console para mais detalhes.');
    }
  };

  const handleCloseSuccessModal = () => {
    setShowModal(false);
    closeModal();
  };

  return (
    <>
      <button className="btn-primary py-3 px-5 bg-(--color-primary) text-(--text-color-primary) font-semibold rounded-xl"  onClick={handleGenerate}>
        Gerar IVR
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {showModal && generated && (
        <SuccessModal
          base64={generated}
          filename={`${template.name.replace(/\s+/g, '_').toLowerCase()}.ivr`}
          onClose={handleCloseSuccessModal}
        />
      )}
    </>
  );
}