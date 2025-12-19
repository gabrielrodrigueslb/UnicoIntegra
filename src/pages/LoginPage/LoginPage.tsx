import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.scss';
import axios from 'axios';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redireciona se já houver token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/main');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl =
        'https://ambientesdetesteunicocontato.atenderbem.com/login';
      const response = await axios.post(apiUrl, { username, password, code });
      console.log(response.data)
       localStorage.setItem('authToken', response.data.token);
       localStorage.setItem('username',response.data.user.fullname )

      // Redireciona após login bem-sucedido
      navigate('/main');
      console.log('logou');
    } catch (err) {
      console.error(err);
      setError('Usuário ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      {loading && <LoadingScreen loadingMessage='Carregando...'/>}
      <section className="banner-section ">
        <picture className="logo-container">
          <img
            src="/logo-branca-na-ponta_20230831_131618_0001-e1693505469301-768x231 1.svg"
            alt=""
          />
        </picture>
      </section>
      <section className="form-section ">
        <form onSubmit={handleLogin} className="login-form flex items-center flex-col">
          <picture className='pb-12'>
            <img src="/loginunico.svg" alt="" />
          </picture>
          <h2 className='self-start pb-4'>Acesso ao Sistema</h2>
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="code">Código 2FA</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Digite seu código de 2FA"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </section>
    </main>
  );
}
