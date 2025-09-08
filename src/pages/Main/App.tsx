import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import './App.scss';
import Integrations from '../Integrations/Integrations';
import Automations from '../Automations/Automations';
import Header from '../../components/Header/Header';

export default function App() {
  const token = localStorage.getItem('authToken')

  if(!token){
    return <Navigate to='/' replace/>
  }

  return (
    <>
      <main className="main">
        <Header />
        <section>
          <Outlet />
        </section>
        <Routes>
          <Route path="integrations" element={<Integrations />} />
          <Route path="automations" element={<Automations />} />
        </Routes>
      </main>
    </>
  );
}
