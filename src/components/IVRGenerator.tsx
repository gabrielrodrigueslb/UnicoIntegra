import { useState } from 'react';
import { SuccessModal } from './SucessModal';

interface Props {
  template: { name: string; file: string; fields: { key: string }[] };
  formData: Record<string, string>;
}

export function IVRGenerator({ template, formData }: Props) {
  const [generated, setGenerated] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async () => {
    const res = await fetch(`/templates/${template.file}`);
    const json = await res.json();

    const jsonString = JSON.stringify(json).replace(/{{(.*?)}}/g, (_, key) => {
      const value = formData[key.trim()];
      return value !== undefined && value !== '' ? value : `{{${key.trim()}}}`;
    });

    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    setGenerated(base64);
    setShowModal(true);
  };

  return (
    <>
      <button className="btn-primary" onClick={handleGenerate}>
        Gerar IVR
      </button>

      {showModal && generated && (
        <SuccessModal
          base64={generated}
          filename={`${template.name.replace(/\\s+/g, '_').toLowerCase()}.ivr`}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
