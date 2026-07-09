import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash,
  X,
} from 'lucide-react';
import { BiExport } from 'react-icons/bi';
import { useClickOutside } from '../../hooks/useClickOutside';

type ClienteStatus = 'criado' | 'setup' | 'ativo';

type Cliente = {
  id: number;
  nome: string;
  instancia: string;
  porcentagem: number;
  status: ClienteStatus;
  createdAt: string;
};

// ponytail: dados mockados só pra dar vida à busca/paginação/filtro; troca por fetch real quando ligar no backend.
const MOCK_CLIENTES: Cliente[] = [
  { id: 1, nome: 'Farmácia Vida Nova', instancia: 'instancia-01', porcentagem: 100, status: 'ativo', createdAt: '2026-06-02' },
  { id: 2, nome: 'Drogaria Bem Estar', instancia: 'instancia-02', porcentagem: 85, status: 'ativo', createdAt: '2026-06-10' },
  { id: 3, nome: 'Farmácia Popular SP', instancia: 'instancia-03', porcentagem: 40, status: 'setup', createdAt: '2026-06-18' },
  { id: 4, nome: 'Rede Saúde Total', instancia: 'instancia-04', porcentagem: 0, status: 'criado', createdAt: '2026-06-22' },
  { id: 5, nome: 'Drogaria Central', instancia: 'instancia-05', porcentagem: 100, status: 'ativo', createdAt: '2026-05-14' },
  { id: 6, nome: 'Farmácia Boa Saúde', instancia: 'instancia-06', porcentagem: 60, status: 'setup', createdAt: '2026-06-30' },
  { id: 7, nome: 'Drogaria Nova Era', instancia: 'instancia-07', porcentagem: 0, status: 'criado', createdAt: '2026-07-01' },
  { id: 8, nome: 'Farmácia São José', instancia: 'instancia-08', porcentagem: 100, status: 'ativo', createdAt: '2026-04-28' },
  { id: 9, nome: 'Drogaria Popular RJ', instancia: 'instancia-09', porcentagem: 75, status: 'ativo', createdAt: '2026-05-30' },
  { id: 10, nome: 'Farmácia Vitalis', instancia: 'instancia-10', porcentagem: 20, status: 'setup', createdAt: '2026-06-25' },
  { id: 11, nome: 'Rede Cuidar+', instancia: 'instancia-11', porcentagem: 0, status: 'criado', createdAt: '2026-07-03' },
  { id: 12, nome: 'Drogaria Ideal', instancia: 'instancia-12', porcentagem: 100, status: 'ativo', createdAt: '2026-03-19' },
];

const TABS: Array<{ key: 'todos' | ClienteStatus; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'criado', label: 'Criados' },
  { key: 'setup', label: 'Em setup' },
  { key: 'ativo', label: 'Ativos' },
];

const PAGE_SIZE = 5;

export default function Clientes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'todos' | ClienteStatus>('todos');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [minPercent, setMinPercent] = useState('');
  const [pendingMinPercent, setPendingMinPercent] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filterRef = useClickOutside<HTMLDivElement>(() => setIsFilterOpen(false));

  const tabCounts = useMemo(() => {
    const counts: Record<'todos' | ClienteStatus, number> = {
      todos: MOCK_CLIENTES.length,
      criado: 0,
      setup: 0,
      ativo: 0,
    };

    for (const cliente of MOCK_CLIENTES) {
      counts[cliente.status] += 1;
    }

    return counts;
  }, []);

  const filteredClientes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const minPercentValue = minPercent ? Number(minPercent) : null;

    return MOCK_CLIENTES.filter((cliente) => {
      if (activeTab !== 'todos' && cliente.status !== activeTab) {
        return false;
      }

      if (
        normalizedSearch &&
        !cliente.nome.toLowerCase().includes(normalizedSearch) &&
        !cliente.instancia.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      if (dateFilter && cliente.createdAt !== dateFilter) {
        return false;
      }

      if (minPercentValue !== null && cliente.porcentagem < minPercentValue) {
        return false;
      }

      return true;
    });
  }, [activeTab, search, dateFilter, minPercent]);

  const totalPages = Math.max(1, Math.ceil(filteredClientes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function changeTab(tab: 'todos' | ClienteStatus) {
    setActiveTab(tab);
    setPage(1);
  }

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeDateFilter(value: string) {
    setDateFilter(value);
    setPage(1);
  }

  function openFilters() {
    setPendingMinPercent(minPercent);
    setIsFilterOpen(true);
  }

  function applyFilters() {
    setMinPercent(pendingMinPercent);
    setPage(1);
    setIsFilterOpen(false);
  }

  function clearFilters() {
    setPendingMinPercent('');
    setMinPercent('');
    setPage(1);
    setIsFilterOpen(false);
  }

  const hasActiveMinPercent = minPercent.trim().length > 0;

  return (
    <main className="w-full p-6">
      <header className="flex justify-between items-center pb-6">
        <span>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-[#90A1B9] text-sm">Gerenciar bancos de clientes</p>
        </span>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border-2 border-[#155DFC] text-[#155DFC] rounded-[6px] flex items-center gap-1 font-medium">
            <BiExport /> Exportar
          </button>
          <button className="bg-[#155DFC] px-4 py-2 rounded-[6px] text-white flex items-center gap-1 font-medium">
            <Plus size={18} /> Novo Cliente
          </button>
        </div>
      </header>

      <nav className="flex flex-1 border-b-2 border-[#155DFC]/10 mb-6">
        <ul className="flex gap-4">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <li
                key={tab.key}
                onClick={() => changeTab(tab.key)}
                className={`flex items-center gap-1 px-4 py-1.5 border-b-3 select-none cursor-pointer font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-[#155DFC] text-[#155DFC]'
                    : 'border-[#155DFC]/0 text-[#90A1B9] hover:text-[#373C43]'
                }`}
              >
                {tab.label}{' '}
                <span className="inline-flex size-5 items-center justify-center text-xs bg-[#155DFC]/10 rounded-[4px]">
                  {tabCounts[tab.key]}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>

      <section>
        <div className="flex justify-between items-center gap-2 mb-6">
          <span className="border border-primary/10 flex items-center gap-2 px-4 rounded-[6px] max-w-[350px] w-full">
            <Search size={16} className="text-[#90A1B9]" />
            <input
              type="text"
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              className="outline-none flex flex-1 py-2 text-sm"
              placeholder="Pesquisar clientes..."
            />
          </span>

          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => changeDateFilter(event.target.value)}
              className="outline-none border border-primary/15 py-2 px-3 text-sm rounded-[8px] cursor-pointer"
            />

            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => (isFilterOpen ? setIsFilterOpen(false) : openFilters())}
                className={`flex gap-1 items-center px-4 py-2 border rounded-[6px] text-sm transition-colors ${
                  hasActiveMinPercent
                    ? 'border-[#155DFC] text-[#155DFC] bg-[#155DFC]/5'
                    : 'border-primary/10 text-[#373C43]'
                }`}
              >
                <Filter size={14} /> Filtros
                {hasActiveMinPercent ? (
                  <span className="inline-flex size-4 items-center justify-center rounded-full bg-[#155DFC] text-[10px] text-white">
                    1
                  </span>
                ) : null}
              </button>

              {isFilterOpen ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-64 rounded-[8px] border border-primary/10 bg-white p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#373C43]">Filtros</h3>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="text-[#90A1B9] hover:text-[#373C43]"
                      aria-label="Fechar filtros"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <label className="mt-4 block text-xs font-medium text-[#90A1B9]">
                    Porcentagem mínima
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={pendingMinPercent}
                    onChange={(event) => setPendingMinPercent(event.target.value)}
                    placeholder="Ex: 50"
                    className="mt-1.5 w-full rounded-[6px] border border-primary/15 px-3 py-2 text-sm outline-none focus:border-[#155DFC]"
                  />

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-3 py-1.5 text-sm text-[#90A1B9] hover:text-[#373C43]"
                    >
                      Limpar
                    </button>
                    <button
                      type="button"
                      onClick={applyFilters}
                      className="rounded-[6px] bg-[#155DFC] px-3 py-1.5 text-sm font-medium text-white"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <section className="border-[2px] border-[#155DFC]/10 rounded-[8px] overflow-hidden">
          <table className="flex flex-col flex-1">
            <thead className="bg-[#F9F9FB]">
              <tr className="flex flex-1 items-center border-b border-primary/10 py-2 text-sm text-[#373C43]">
                <th className="font-semibold w-[10%]">ID</th>
                <th className="font-semibold w-[30%]">Nome</th>
                <th className="font-semibold w-[30%]">Instância</th>
                <th className="font-semibold w-[10%]">Porcentagem</th>
                <th className="font-semibold w-[25%]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClientes.length === 0 ? (
                <tr className="flex flex-1 items-center justify-center py-10 text-sm text-[#90A1B9]">
                  <td>Nenhum cliente encontrado para os filtros atuais.</td>
                </tr>
              ) : (
                paginatedClientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="flex flex-1 items-center border-b border-primary/10 text-sm text-[#373C43] py-2 last:border-0"
                  >
                    <td className="w-[10%] h-full py-2 text-center">{cliente.id}</td>
                    <td className="w-[30%] h-full py-2 text-center">{cliente.nome}</td>
                    <td className="w-[30%] h-full py-2 text-center">{cliente.instancia}</td>
                    <td className="w-[10%] h-full py-2 text-center">{cliente.porcentagem}%</td>
                    <td className="w-[25%] h-full text-center flex gap-[5px] justify-center">
                      <button
                        onClick={() => navigate(`/main/clientes/${cliente.id}`)}
                        className="text-[#373C43] hover:text-primary/80 p-2 rounded-[6px] border border-primary/10"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="text-[#373C43] hover:text-primary/80 p-2 rounded-[6px] border border-primary/10">
                        <Pencil size={18} />
                      </button>
                      <button className="text-red-400 hover:text-red-400/80 p-2 rounded-[6px] border border-primary/10">
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <footer className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-[#373C43]">
              Mostrando {paginatedClientes.length} de {filteredClientes.length} cliente(s)
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex items-center gap-1 px-4 py-2 text-sm text-[#373C43] border-primary/20 border rounded-[6px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={16} /> Anterior
              </button>
              <span className="flex items-center gap-1 px-4 py-2 text-sm text-[#373C43] border-primary/20 border rounded-[6px]">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="flex items-center gap-1 px-4 py-2 text-sm text-[#373C43] border-primary/20 border rounded-[6px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próximo <ArrowRight size={16} />
              </button>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}
