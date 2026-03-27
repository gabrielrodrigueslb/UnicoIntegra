// src/pages/Main/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.scss';

import Header from '../../components/Header/Header';
import ApplicationsHub from '../Aplications/ApplicationsHub';
import AiServicesManager from '../Aplications/AiServicesManager';
import { PkgGenerator } from '../Aplications/PkgGenerator';
import Integrations from '../Integrations/Integrations';
import Automations from '../Automations/Automations';
import AiPage from '../AiPage/AiPage';
import AiVersionsPage from '../AiPage/AiVersionsPage';

// 5. Contexto e Popup
import { GenerationProvider } from '../../context/GenerationContext';
import { GlobalStatusPopup } from '../../components/GlobalStatusPopup';
import Databases from '../Databases/Databases';
import ExtensionManager from '../ExtensionManager/ExtensionManager';
import Home from '../Home/Home';
import Logs from '../SystemLogs/Logs';
import { getAuthSession } from '../../utils/authSession';
import DocsRouter from '../Docs/DocsRouter';

export default function App() {
  const session = getAuthSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="main flex-row">
      <Header />

      <section className="w-full relative max-h-screen overflow-y-hidden">
        {/* O Provider envolve TUDO nessa seção */}
        <GenerationProvider>
          <Routes>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="aplications" element={<ApplicationsHub />} />
            <Route path="aplications/pkg-generator" element={<PkgGenerator />} />
            <Route path="aplications/ia-services" element={<AiServicesManager />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="automations" element={<Automations />} />
            <Route path="iaPage" element={<AiPage />} />
            <Route path="iaPage/list" element={<AiVersionsPage />} />
            <Route path="extensions" element={<ExtensionManager />} />
            <Route path="databases" element={<Databases />} />
            <Route path="docs/*" element={<DocsRouter />} />
            <Route path="logs" element={<Logs/>} />
            <Route path="*" element={<Navigate to="home" replace />} />
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
