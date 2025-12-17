import { useState } from 'react';
import { HardDriveDownload, Zap } from 'lucide-react';

// CORREÇÃO: Adicione 'type' antes de PkgFormData ou separe as importações
import {
  useGeneration,
  type PkgFormData,
} from '../../context/GenerationContext';

export function PkgGenerator() {
  const { generateApp, status } = useGeneration();

  const [formData, setFormData] = useState<PkgFormData>({
    nome_cliente: '',
    db_host: '',
    db_user: '',
    db_password: '',
    db_database: '',
    access_key: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateApp(formData);
  };

  return (
    <div className="relative h-full w-full">
      <div className="card h-screen py-8 pr-5 flex flex-col justify-center">
        <h2 className="text-3xl font-semibold opacity-90 mb-8 flex items-center gap-3">
          <HardDriveDownload className="w-8 h-8 text-blue-600" />
          Gerador de Executável
        </h2>

        <section className="form">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Campos do Formulário */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Nome do Cliente
              </label>
              <input
                type="text"
                name="nome_cliente"
                className="p-3 w-full rounded-xl bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.nome_cliente}
                onChange={handleChange}
                placeholder="Ex: Drogaria Central"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Usuário do Banco
              </label>
              <input
                type="text"
                name="db_user"
                className="p-3 w-full rounded-xl bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.db_user}
                onChange={handleChange}
                placeholder="postgres"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Senha do Banco
              </label>
              <input
                type="text"
                name="db_password"
                className="p-3 w-full rounded-xl bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.db_password}
                placeholder="********"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Host (IP)
              </label>
              <input
                type="text"
                name="db_host"
                className="p-3 w-full rounded-xl bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.db_host}
                onChange={handleChange}
                placeholder="192.168.x.x"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Database Name
              </label>
              <input
                type="text"
                name="db_database"
                className="p-3 w-full rounded-xl bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.db_database}
                onChange={handleChange}
                placeholder="db_cliente"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Chave de Acesso
              </label>
              <input
                type="text"
                name="access_key"
                className="p-3 w-full rounded-xl bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.access_key}
                onChange={handleChange}
                placeholder="Auth Key"
                required
              />
            </div>

            {/* Botão de Ação */}
            <div className="md:col-span-3 flex justify-end mt-4">
              <button
                type="submit"
                disabled={status === 'generating'}
                className={`
                  rounded-xl px-8 py-3 font-semibold text-white transition-all shadow-lg flex items-center gap-2
                  ${
                    status === 'generating'
                      ? 'bg-blue-400 cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'
                  }
                `}
              >
                {status === 'generating'
                  ? 'Gerando em 2º plano...'
                  : 'Iniciar Geração'}
                <Zap className="w-4 h-4 fill-current" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
