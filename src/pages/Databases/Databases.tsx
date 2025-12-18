/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  Search, 
  Plus, 
  Server, 
  MoreVertical, 
  HardDrive,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LayoutGrid, 
  List as ListIcon,
  X // Importar o X para fechar modal
} from 'lucide-react'; 

import { 
  getDatabases, 
  createDatabase, // Importar a função corrigida
  type DatabaseItem, 
  type PaginatedResponse 
} from '../../services/database.service';

export default function Databases() {
  // Estados de Dados
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Filtro e Paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // NOVOS ESTADOS PARA O MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDbName, setNewDbName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) navigate('/');
  }, [navigate]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]); 

  const fetchData = async () => {
    setLoading(true);
    try {
      const limit = viewMode === 'list' ? 10 : 9; 
      const response: PaginatedResponse = await getDatabases(page, limit, searchTerm); 
      setDatabases(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.totalItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); 
  };

  // --- FUNÇÃO DE CRIAR BANCO ---
  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDbName.trim()) return;

    setIsCreating(true);
    try {
      await createDatabase(newDbName);
      
      // Sucesso: fecha modal, limpa input e recarrega lista
      setIsModalOpen(false);
      setNewDbName('');
      alert('Banco criado com sucesso!'); // Pode trocar por um toast notification depois
      fetchData(); 
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || 'Erro ao criar banco.';
      alert(msg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* HEADER */}
      <header className="px-8 py-6 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-600" />
            Gerenciador de Bancos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visualize, crie e gerencie as bases de dados do sistema.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Barra de Busca */}
          <div className="relative w-full md:w-64 lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 
                         focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         transition duration-150 sm:text-sm placeholder-gray-400"
              placeholder="Buscar database..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Botão Criar: Agora abre o Modal */}
          <button 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Novo Banco</span>
          </button>
        </div>
      </header>

      {/* BODY (Grid/List) ... (Todo o código do main e footer permanece igual) ... */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* ... Código existente da listagem e paginação ... */}
           {/* COPIAR O CONTEÚDO DO MAIN E DO FOOTER QUE JÁ FIZEMOS ANTES AQUI */}
           <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-in fade-in">
               <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
               <p>Carregando databases...</p>
             </div>
          ) : databases.length > 0 ? (
            <>
              {/* --- MODO GRADE (GRID) --- */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
                  {databases.map((db, index) => (
                    <div 
                      key={index}
                      className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 p-5 flex flex-col relative animate-in fade-in zoom-in-95"
                    >
                      <button className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition-colors">
                          <Server className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-lg truncate pr-8" title={db.name}>
                            {db.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Online</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-1.5" title="Tamanho em disco">
                          <HardDrive className="w-4 h-4" />
                          {db.size || 'N/A'}
                        </div>
                        <button 
                          className="text-blue-600 font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => alert(`Editar ${db.name}`)}
                        >
                          Gerenciar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* --- MODO LISTA (TABLE) --- */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Nome do Banco</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Tamanho</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {databases.map((db, index) => (
                        <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Database className="w-5 h-5" />
                              </div>
                              <span className="font-medium text-slate-700">{db.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Online</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <HardDrive className="w-4 h-4 text-gray-400" />
                              {db.size || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline px-3 py-1 rounded hover:bg-blue-50 transition-all"
                              onClick={() => alert(`Editar ${db.name}`)}
                            >
                              Gerenciar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            /* EMPTY STATE */
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Database className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Nenhum banco encontrado</h3>
              <p className="text-gray-500 mt-1">Tente buscar por outro termo ou crie um novo banco.</p>
            </div>
          )}
        </main>

        {/* --- FOOTER (PAGINAÇÃO FIXA) --- */}
        <div className="border-t border-gray-200 bg-white p-4 shrink-0 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <span className="text-sm text-gray-500 hidden sm:inline">
            Mostrando <span className="font-medium text-slate-900">{databases.length}</span> de <span className="font-medium text-slate-900">{totalItems}</span> resultados
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg min-w-[100px] text-center">
              Página {page} de {totalPages || 1}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL DE CRIAÇÃO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Criar Nova Database
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleCreateDatabase} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Banco de Dados
                </label>
                <input 
                  type="text"
                  autoFocus
                  placeholder="Ex: cliente_loja_01"
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={newDbName}
                  onChange={(e) => setNewDbName(e.target.value)}
                  disabled={isCreating}
                />
                <p className="text-xs text-gray-500 mt-2">
                  O nome será higienizado automaticamente (apenas minúsculas e underscores).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isCreating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newDbName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Banco'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}