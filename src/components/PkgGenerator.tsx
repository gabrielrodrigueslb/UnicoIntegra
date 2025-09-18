import { useState } from 'react';
import LoadingScreen from './LoadingScreen/LoadingScreen';
import "./PkgGenerator.scss"

// Define a interface para os dados do nosso formulário
interface PkgFormData {
  nome_cliente: string;
  db_host: string;
  db_user: string;
  db_password: string;
  db_database: string;
  access_key: string;
}

export function PkgGenerator() {
  // Estado para guardar os dados do formulário
  const [formData, setFormData] = useState<PkgFormData>({
    nome_cliente: '',
    db_host: '',
    db_user: '',
    db_password: '',
    db_database: '',
    access_key: '',
  });

  // Estados para feedback visual
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Função para lidar com a mudança nos inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  /* 145.223.27.100 */

  // Função para enviar os dados para o back-end
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback('Gerando aplicação, por favor aguarde...');

    try {
      const response = await fetch('http://145.223.27.100:8000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Falha no servidor ao gerar o arquivo.',
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      const contentDisposition = response.headers.get('content-disposition');
      let filename = `app-${formData.nome_cliente || 'cliente'}.zip`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      a.remove();

      setFeedback('Aplicação gerada com sucesso! O download foi iniciado.');
      /* setFormData({
        nome_cliente: '',
        db_host: '',
        db_user: '',
        db_password: '',
        db_database: '',
        access_key: '',
      }); */
    } catch (error) {
      // Não precisa mais do ': unknown'
      console.error('Erro ao tentar gerar a aplicação:', error);
      let errorMessage = 'Ocorreu um erro desconhecido.';
      if (error instanceof Error) {
        errorMessage = `Erro: ${error.message}`;
      }
      setFeedback(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    
       {isLoading && <LoadingScreen loadingMessage={feedback || 'Aguarde, seu app está sendo gerado...'}/>} 
      <div className="card h-screen py-8 pr-5 flex flex-col justify-center">
        <h2 className='text-3xl font-semibold opacity-90 mb-8'>Gerador de Executável</h2>
        <section className='form'>
           <form onSubmit={handleSubmit} className="space-y-4 mb-6 grid grid-cols-3 gap-4">
          <div>
            <label className="block font-medium">Nome do Cliente</label>
            <input
              type="text"
              name="nome_cliente"
              className=" p-3 w-full rounded-xl bg-gray-200"
              value={formData.nome_cliente}
              onChange={handleChange}
              placeholder="Drogaria de exemplo"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Usuário do Banco</label>
            <input
              type="text"
              name="db_user"
              className="p-3 w-full rounded-xl bg-gray-200"
              value={formData.db_user}
              onChange={handleChange}
              placeholder="usuario_database"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Senha do Banco</label>
            <input
              type="text"
              name="db_password"
              className="p-3 w-full rounded-xl bg-gray-200"
              value={formData.db_password}
              placeholder="Senha"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block font-medium">Host do Banco de Dados</label>
            <input
              type="text"
              name="db_host"
              className="p-3 w-full rounded-xl bg-gray-200"
              value={formData.db_host}
              onChange={handleChange}
              placeholder="000.0.000.0"
              required
            />
          </div>

          <div>
            <label className="block font-medium">
              Nome do Banco (Database)
            </label>
            <input
              type="text"
              name="db_database"
              className="p-3 w-full rounded-xl bg-gray-200"
              value={formData.db_database}
              onChange={handleChange}
              placeholder="nome_database"
              required
            />
          </div>

          <div>
            <label className="block font-medium">
              Chave de Acesso (Authorization)
            </label>
            <input
              type="text"
              name="access_key"
              className="p-3 w-full rounded-xl bg-gray-200"
              value={formData.access_key}
              onChange={handleChange}
              placeholder="Authorization"
              required
            />
          </div>

          <button type="submit" className="btn-primary bg-(--color-primary) text-(--text-color-primary) rounded-xl p-3 hover:bg-gray-100 hover:text-(--color-primary) transition-all font-semibold flex items-center justify-center" disabled={isLoading}>
            {isLoading ? 'Gerando...' : 'Gerar Aplicação'} <img src="/Zy84sEEoSG.gif" className='h-6 download-ping hidden transition-all' alt="" />
          </button>
        </form>
        </section>
       

        
      </div>
    </>
  );
}
