import { useState } from 'react';
import { SuccessModal } from './SucessModal';
import {base64ToUtf8, utf8ToBase64} from '../utils/utils';

interface Props {
  template: { name: string; file: string; fields: { key: string }[] };
  formData: Record<string, string>;
  // MUDANÇA 1: Definir o tipo correto para a função
  closeModal: () => void;
}

export function IVRGenerator({ template, formData, closeModal }: Props) {
  const [generated, setGenerated] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async () => {
    const res = await fetch(`/templates/${template.file}`);
    const templateBase64 = await res.text() 
    
    //decodifica de Base64 para UTF-8
    const decoded = base64ToUtf8(templateBase64);

    const json = JSON.parse(decoded);

    const jsonString = JSON.stringify(json).replace(/{{(.*?)}}/g, (_, key) => {
      const value = formData[key.trim()];
      return value !== undefined && value !== '' ? value : `{{${key.trim()}}}`;
    });

    //codifica de volta para base64 -> UTF-8
    const base64 = utf8ToBase64(jsonString);

    setGenerated(base64);
    setShowModal(true)
  }

  //  Criar uma função para lidar com o fechamento do modal de sucesso
  const handleCloseSuccessModal = () => {
    setShowModal(false); 
    closeModal();
  };

  return (
    <>
      <button className="btn-primary" onClick={handleGenerate}>
        Gerar IVR
      </button>

      {showModal && generated && (
        <SuccessModal
          base64={generated}
          filename={`${template.name.replace(/\s+/g, '_').toLowerCase()}.ivr`}
          // MUDANÇA 3: Passar a função para a propriedade obrigatória "onClose"
          onClose={handleCloseSuccessModal}
        />
      )}
    </>
  );
}