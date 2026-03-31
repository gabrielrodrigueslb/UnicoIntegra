import { Navigate, Route, Routes } from 'react-router-dom';
import './App.scss';
import Header from '../../components/Header/Header';
import { GlobalStatusPopup } from '../../components/GlobalStatusPopup';
import { GenerationProvider } from '../../context/GenerationContext';
import ApplicationsHub from '../Aplications/ApplicationsHub';
import AiServicesManager from '../Aplications/AiServicesManager';
import { PkgGenerator } from '../Aplications/PkgGenerator';
import TrierExtensionGenerator from '../Aplications/TrierExtensionGenerator';
import Automations from '../Automations/Automations';
import Databases from '../Databases/Databases';
import DocsRouter from '../Docs/DocsRouter';
import ExtensionManager from '../ExtensionManager/ExtensionManager';
import Home from '../Home/Home';
import AiPage from '../AiPage/AiPage';
import AiVersionsPage from '../AiPage/AiVersionsPage';
import Integrations from '../Integrations/Integrations';
import LinkAi from '../LinkAi/LinkAi';
import Logs from '../SystemLogs/Logs';
import { getAuthSession } from '../../utils/authSession';

export default function App() {
  const session = getAuthSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="main flex-row">
      <Header />

      <section className="relative max-h-screen w-full overflow-y-hidden">
        <GenerationProvider>
          <Routes>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="link-ai" element={<LinkAi />} />
            <Route path="aplications" element={<ApplicationsHub />} />
            <Route path="aplications/pkg-generator" element={<PkgGenerator />} />
            <Route
              path="aplications/trier-extension"
              element={<TrierExtensionGenerator />}
            />
            <Route
              path="aplications/ia-services"
              element={<AiServicesManager />}
            />
            <Route path="integrations" element={<Integrations />} />
            <Route path="automations" element={<Automations />} />
            <Route path="iaPage" element={<AiPage />} />
            <Route path="iaPage/list" element={<AiVersionsPage />} />
            <Route path="extensions" element={<ExtensionManager />} />
            <Route path="databases" element={<Databases />} />
            <Route path="docs/*" element={<DocsRouter />} />
            <Route path="logs" element={<Logs />} />
            <Route path="*" element={<Navigate to="home" replace />} />
          </Routes>

          <GlobalStatusPopup />
        </GenerationProvider>
      </section>
    </main>
  );
}
