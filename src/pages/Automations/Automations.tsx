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
    <div className="app-container">
      <header className="app-header">
        <h1>🛠️ Gerador de Arquivos</h1>
      </header>

      <main className="app-main">
        <h2>💬 Selecione uma integração</h2>
        
        <div className="cards-grid">
          {Object.entries(templates).map(([key, t]) => (
            <div
              key={key}
              className={`integration-card ${selectedTemplate === key ? 'active' : ''}`}
              onClick={() => handleOpenModal(key)}
            >
              <h3>{t.name}</h3>
              {/* <p>{t.description ?? 'Integração personalizada'}</p> */}
            </div>
          ))}
        </div>

        {template && openModal && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="close-button" onClick={handleCloseModal}>✖</button>

              <TemplateForm
                template={template}
                formData={formData}
                setFormData={setFormData}
              />
              <IVRGenerator template={template} formData={formData} closeModal={handleCloseModal}/>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>UnicoIntegra © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
