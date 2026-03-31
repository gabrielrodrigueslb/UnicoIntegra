import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GrIntegration } from 'react-icons/gr';
import { AiOutlineHome } from 'react-icons/ai';
import { Cpu, Database, Logs, Boxes, Book, Bot} from 'lucide-react';
import { MdLogout } from 'react-icons/md';
import ConfirmDialog from '../ConfirmDialog';
import './Header.scss';
import { BsPuzzle } from 'react-icons/bs';
import { clearAuthSession } from '../../utils/authSession';

export default function Header() {
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  function handleLogout() {
    setIsLogoutDialogOpen(false);
    clearAuthSession();

    navigate('/'); // Redireciona para a página de login
  }

  const location = useLocation();

  function isMenuItemActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  const menuItems = [
    { path: '/main/home', icon: <AiOutlineHome size={20}/>, description: 'Início' },
    {
      path: '/main/databases',
      icon: <Database size={20}/>,
      description: 'Bancos de Dados',
    },
    {
      path: '/main/link-ai',
      icon: <Bot size={20}/>,
      description: 'Link IA',
    },
    {
      path: '/main/aplications',
      icon: <Boxes size={20}/>,
      description: 'Serviços',
    },
    {
      path: '/main/integrations',
      icon: <GrIntegration size={20}/>,
      description: 'Integrações',
    },
    { path: '/main/extensions', icon: <BsPuzzle size={20}/>, description: 'Extensões' },
    { path: '/main/iaPage', icon: <Cpu size={20}/>, description: 'IAs' },
    { path: '/main/docs', icon: <Book size={20}/>, description: 'Documentação' },
    { path: '/main/logs', icon: <Logs size={20}/>, description: 'Logs do sistema' },
  ];

  return (
    <>
      <header className="header h-screen p-2 bg-background">
        <nav className="navbar bg-gray-950 flex-col flex p-3 rounded-2xl  h-full items-center">
          <img className="w-10 pt-3 pb-6" src="/unico-fav.svg" alt="" />
          <div className="justify-between flex flex-col h-full items-center">
            <ul className="nav-list justify-between flex-col flex gap-3">
              {menuItems.map((item, index) => (
                <Link to={item.path} key={index} className="relative group">
                  <li
                    className={`p-3 bg-gray-950 text-white rounded-full text-xl cursor-pointer transition-colors duration-150 relative items-center justify-center flex ${
                      isMenuItemActive(item.path) ? 'active' : ''
                    }`}
                    key={index}
                  >
                    {item.icon}
                  </li>

                  <div
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2
      p-2 bg-background border border-border rounded-xl
      text-sm whitespace-nowrap
      hidden group-hover:flex
      z-20 "
                  >
                    {item.description}
                  </div>
                </Link>
              ))}
            </ul>
            <button
              onClick={() => setIsLogoutDialogOpen(true)}
              className="logout-button p-4 bg-gray-950 text-white rounded-full text-2xl cursor-pointer relative"
            >
              <MdLogout size={25}/>
            </button>
          </div>
        </nav>
      </header>

      {isLogoutDialogOpen ? (
        <ConfirmDialog
          title="Deseja realmente sair?"
          description={
            <>
              Você será desconectado da plataforma.
              <br />
              Se houver alterações não salvas, elas sero perdidas.
            </>
          }
          confirmText="Sair da conta"
          cancelText="Continuar no painel"
          tone="danger"
          onClose={() => setIsLogoutDialogOpen(false)}
          onConfirm={handleLogout}
        />
      ) : null}
    </>
  );
}
