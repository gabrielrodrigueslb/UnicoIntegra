// src/App.tsx
import { useState } from 'react';
import { templates } from './data/templates.ts';
import { TemplateForm } from './components/TemplateForm';
import { IVRGenerator } from './components/IVRGenerator';
import './App.scss'; 

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  const template = selectedTemplate ? templates[selectedTemplate as keyof typeof templates] : null;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🛠️ Gerador de Arquivo IVR</h1>
      </header>

      <main className="app-main">
        <div className="card">
          <label htmlFor="templateSelect">Selecione um modelo:</label>
          <select
            id="templateSelect"
            className="dropdown"
            onChange={(e) => setSelectedTemplate(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Escolha uma opção</option>
            {Object.entries(templates).map(([key, t]) => (
              <option key={key} value={key}>{t.name}</option>
            ))}
          </select>

          {template && (
            <>
              <TemplateForm template={template} formData={formData} setFormData={setFormData} />
              <IVRGenerator template={template} formData={formData} />
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>UnicoIntegra © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}