import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { templates } from '../../data/templates.ts';
import { TemplateForm } from '../../components/TemplateForm.tsx';
import { IVRGenerator } from '../../components/IVRGenerator.tsx';
import { PkgGenerator } from '../../components/PkgGenerator.tsx';

export default function Automations() {

      const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
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

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🛠️ Gerador de Arquivos</h1>

      </header>

      <main className="app-main">
        <div className="card">
          <h2>💬 Gerador de Arquivo IVR</h2>
          <label htmlFor="templateSelect">Selecione um modelo de IVR:</label>
          <select
            id="templateSelect"
            className="dropdown"
            onChange={(e) => setSelectedTemplate(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Escolha uma opção
            </option>
            {Object.entries(templates).map(([key, t]) => (
              <option key={key} value={key} className=''>
                {t.name}
              </option>
            ))}
          </select>

          {template && (
            <>
              <TemplateForm
                template={template}
                formData={formData}
                setFormData={setFormData}
              />
              <IVRGenerator template={template} formData={formData} closeModal={() => { /* Add your modal closing logic here */ }} />
            </>
          )}
        </div>

        <PkgGenerator />
      </main>

      
    </div>
  )
}
