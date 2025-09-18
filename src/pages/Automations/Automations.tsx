// Automations.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { templates } from '../../data/templates.ts';
import { TemplateForm } from '../../components/TemplateForm.tsx';
import { IVRGenerator } from '../../components/IVRGenerator.tsx';

import './Automations.scss';

export default function Automations() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [openModal, setOpenModal] = useState<boolean>(false);
  const navigate = useNavigate();

  // 🔹 Redireciona se não houver authToken
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const template = selectedTemplate
    ? templates[selectedTemplate as keyof typeof templates]
    : null;

  function handleOpenModal(key: string) {
    setSelectedTemplate(key);
    setOpenModal(true);
  }

  function handleCloseModal() {
    setOpenModal(false);
    setSelectedTemplate('');
    setFormData({});
  }

  return (
    <div className="app-container flex flex-col max-h-screen h-screen py-8 pr-5 max-w-screen overflow-hidden">
      <header className="app-header mb-8">
        <h1 className="text-3xl font-semibold opacity-90">Gerador de Arquivos</h1>
      </header>

      <main className="app-main overflow-y-auto max-w-screen h-full ">
        <div className="cards-grid grid grid-cols-4 gap-5 pt-2 ">
          {Object.entries(templates).map(([key, t]) => (
            <div
              key={key}
              className={`integration-card ${
                selectedTemplate === key ? 'active' : ''
              }`}
              onClick={() => handleOpenModal(key)}
            >
              <div
                className={`h-50 w-full bg-center bg-cover rounded-xl bg-gray-300`}
                style={{ backgroundImage: `url(${t.banner})` }}
              ></div>
              <h3 className='font-semibold pt-4 px-2 text-ellipsis overflow-hidden text-nowrap'>{t.name}</h3>
              {/* <p>{t.description ?? 'Integração personalizada'}</p> */}
            </div>
          ))}
        </div>

        {template && openModal && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="close-button" onClick={handleCloseModal}>
                ✖
              </button>

              <TemplateForm
                template={template}
                formData={formData}
                setFormData={setFormData}
              />
              <IVRGenerator
                template={template}
                formData={formData}
                closeModal={handleCloseModal}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
