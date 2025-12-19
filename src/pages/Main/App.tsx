// src/pages/Main/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.scss';

import Header from '../../components/Header/Header';
import { PkgGenerator } from '../Aplications/PkgGenerator';
import Integrations from '../Integrations/Integrations';
import Automations from '../Automations/Automations';
import AiPage from '../AiPage/AiPage';

// 5. Contexto e Popup
import { GenerationProvider } from '../../context/GenerationContext';
import { GlobalStatusPopup } from '../../components/GlobalStatusPopup';
import Databases from '../Databases/Databases';
import ExtensionManager from '../ExtensionManager/ExtensionManager';
import Home from '../Home/Home';

export default function App() {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="main flex">
      <Header />

      <section className="w-full relative">
        {/* O Provider envolve TUDO nessa seção */}
        <GenerationProvider>
          <Routes>
            <Route path="/" element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="aplications" element={<PkgGenerator />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="automations" element={<Automations />} />
            <Route path="iaPage" element={<AiPage />} />
            <Route path="extensions" element={<ExtensionManager />} />
            <Route path="databases" element={<Databases />} />
          </Routes>

          {/* 2. ADICIONE O POPUP AQUI. 
             Ele está dentro do Provider (para ter acesso aos dados),
             mas fora das Routes (para não sumir quando trocar de página) */}
          <GlobalStatusPopup />
        </GenerationProvider>
      </section>
    </main>
  );
}
