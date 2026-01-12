import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GrIntegration } from 'react-icons/gr';
import { AiOutlineHome } from 'react-icons/ai';
/* import { TbSettingsAutomation } from "react-icons/tb";
 */ import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import { Cpu, Database } from 'lucide-react';
import { MdLogout } from 'react-icons/md';
import './Header.scss';
import { BsPuzzle } from 'react-icons/bs';

export default function Header() {
  const navigate = useNavigate();
  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('authUsername');
    localStorage.removeItem('authPassword');

    navigate('/'); // Redireciona para a página de login
  }

  const location = useLocation();
  console.log(location);

  const menuItems = [
    { path: '/main', icon: <AiOutlineHome />, description: 'Início' },
    {
      path: '/main/databases',
      icon: <Database />,
      description: 'Bancos de Dados',
    },
    {
      path: '/main/aplications',
      icon: <AiOutlineAppstoreAdd />,
      description: 'Aplicações',
    },
    {
      path: '/main/integrations',
      icon: <GrIntegration />,
      description: 'Integrações',
    },
    { path: '/main/extensions', icon: <BsPuzzle />, description: 'Extensões' },
    { path: '/main/iaPage', icon: <Cpu />, description: 'IAs' },
  ];

  return (
    <>
      <header className="header h-screen px-4 bg-background">
        <nav className="navbar flex-col flex justify-between h-full items-end">
          <ul className="nav-list flex-col flex gap-3">
            {menuItems.map((item, index) => (
              <Link to={item.path} key={index} className="relative group">
                <li
                  className={`p-3.5 bg-gray-950 text-white rounded-full text-2xl cursor-pointer transition-colors duration-150 relative hover:flex ${
                    item.path == location.pathname ? 'active' : ''
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
            onClick={handleLogout}
            className="logout-button p-4 bg-gray-950 text-white rounded-full text-2xl cursor-pointer relative"
          >
            <MdLogout />
          </button>
        </nav>
      </header>
    </>
  );
}
