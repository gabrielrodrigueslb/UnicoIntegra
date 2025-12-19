import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GrIntegration } from 'react-icons/gr';
import { AiOutlineHome } from 'react-icons/ai';
/* import { TbSettingsAutomation } from "react-icons/tb";
 */import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { 
  Cpu, Database
} from 'lucide-react'; 
import { MdLogout } from 'react-icons/md';
import './Header.scss';
import { BsPuzzle } from 'react-icons/bs';

export default function Header() {
  const navigate = useNavigate();
  function handleLogout() {
    localStorage.removeItem('authToken');
    navigate('/'); // Redireciona para a página de login
  }

  const location = useLocation()
  console.log(location)

  const menuItems = [
    { path: '/main', icon: <AiOutlineHome /> },
    { path: '/main/databases', icon: < Database/> },
    { path: '/main/aplications', icon: <AiOutlineAppstoreAdd/> },
    { path: '/main/integrations', icon: <GrIntegration /> },
    { path: '/main/extensions', icon: <BsPuzzle /> },
    { path: '/main/iaPage', icon: <Cpu  /> },
    

  ];

  return (
    <>
      <header className="header h-screen px-4">
        <nav className="navbar flex flex-col justify-between h-full items-end">
          <ul className="nav-list flex flex-col gap-3">
            {menuItems.map((item, index) => (
              <Link to={item.path}>
              <li
                className={`p-3.5 bg-gray-950 text-white rounded-full text-2xl cursor-pointer ${item.path == location.pathname ? "active": ""} hover:bg-(--color-primary)`}
                key={index}
              >
               {item.icon}
              </li>
              </Link>
            ))}
          </ul>
          <button
            onClick={handleLogout}
            className="logout-button p-4 bg-gray-950 text-white rounded-full text-2xl cursor-pointer"
          >
            <MdLogout />
          </button>
        </nav>
      </header>
    </>
  );
}
