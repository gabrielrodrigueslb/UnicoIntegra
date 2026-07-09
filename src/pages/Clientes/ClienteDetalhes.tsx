import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Database,
  Filter,
  Package,
  Search,
  X,
} from 'lucide-react';

type ProductStatus = 'published' | 'classified' | 'prepared' | 'error' | 'skipped';

type Product = {
  id: number;
  ean: string;
  nome: string;
  fabricante: string;
  principioAtivo: string;
  status: ProductStatus;
  temNoBanco: boolean;
};

type ClienteData = {
  id: number;
  nome: string;
  instancia: string;
  cnpj: string;
  provider: string;
  status: string;
  totalProdutosEstoque: number;
  totalNoBanco: number;
};

const MOCK_CLIENTE: ClienteData = {
  id: 1,
  nome: 'Farmácia Vida Nova',
  instancia: 'instancia-01',
  cnpj: '12.345.678/0001-90',
  provider: 'Alpha7',
  status: 'Ativo',
  totalProdutosEstoque: 4820,
  totalNoBanco: 3615,
};

const MOCK_PRODUTOS: Product[] = [
  { id: 1, ean: '7891234560001', nome: 'Dipirona 500mg 10cp', fabricante: 'Medley', principioAtivo: 'Dipirona Sódica', status: 'published', temNoBanco: true },
  { id: 2, ean: '7891234560002', nome: 'Amoxicilina 500mg 21cp', fabricante: 'Eurofarma', principioAtivo: 'Amoxicilina', status: 'published', temNoBanco: true },
  { id: 3, ean: '7891234560003', nome: 'Ibuprofeno 600mg 20cp', fabricante: 'Germed', principioAtivo: 'Ibuprofeno', status: 'classified', temNoBanco: true },
  { id: 4, ean: '7891234560004', nome: 'Omeprazol 20mg 28cp', fabricante: 'Pague Menos', principioAtivo: 'Omeprazol', status: 'published', temNoBanco: true },
  { id: 5, ean: '7891234560005', nome: 'Losartana 50mg 30cp', fabricante: 'Medley', principioAtivo: 'Losartana Potássica', status: 'prepared', temNoBanco: true },
  { id: 6, ean: '7891234560006', nome: 'Metformina 850mg 30cp', fabricante: 'Eurofarma', principioAtivo: 'Metformina Cloridrato', status: 'published', temNoBanco: true },
  { id: 7, ean: '7891234560007', nome: 'Sinvastatina 20mg 30cp', fabricante: 'Germed', principioAtivo: 'Sinvastatina', status: 'error', temNoBanco: false },
  { id: 8, ean: '7891234560008', nome: 'Azitromicina 500mg 3cp', fabricante: 'Medley', principioAtivo: 'Azitromicina', status: 'published', temNoBanco: true },
  { id: 9, ean: '7891234560009', nome: 'Captopril 25mg 30cp', fabricante: 'Eurofarma', principioAtivo: 'Captopril', status: 'skipped', temNoBanco: false },
  { id: 10, ean: '7891234560010', nome: 'Rivotril 2mg 30cp', fabricante: 'Roche', principioAtivo: 'Clonazepam', status: 'classified', temNoBanco: true },
  { id: 11, ean: '7891234560011', nome: 'Dorflex 36cp', fabricante: 'Sanofi', principioAtivo: 'Dipirona + Orfenadrina', status: 'published', temNoBanco: true },
  { id: 12, ean: '7891234560012', nome: 'Nimesulida 100mg 20cp', fabricante: 'Germed', principioAtivo: 'Nimesulida', status: 'published', temNoBanco: true },
  { id: 13, ean: '7891234560013', nome: 'Prednisona 20mg 20cp', fabricante: 'Medley', principioAtivo: 'Prednisona', status: 'prepared', temNoBanco: true },
  { id: 14, ean: '7891234560014', nome: 'Fluoxetina 20mg 30cp', fabricante: 'Eurofarma', principioAtivo: 'Fluoxetina Cloridrato', status: 'error', temNoBanco: false },
  { id: 15, ean: '7891234560015', nome: 'Pantoprazol 40mg 28cp', fabricante: 'Pague Menos', principioAtivo: 'Pantoprazol Sódico', status: 'published', temNoBanco: true },
  { id: 16, ean: '7891234560016', nome: 'Enalapril 20mg 30cp', fabricante: 'Medley', principioAtivo: 'Enalapril Maleato', status: 'classified', temNoBanco: true },
  { id: 17, ean: '7891234560017', nome: 'Hidroclorotiazida 25mg 30cp', fabricante: 'Germed', principioAtivo: 'Hidroclorotiazida', status: 'published', temNoBanco: true },
  { id: 18, ean: '7891234560018', nome: 'Atenolol 50mg 30cp', fabricante: 'Eurofarma', principioAtivo: 'Atenolol', status: 'skipped', temNoBanco: false },
  { id: 19, ean: '7891234560019', nome: 'Clonazepam 2mg 30cp', fabricante: 'Eurofarma', principioAtivo: 'Clonazepam', status: 'published', temNoBanco: true },
  { id: 20, ean: '7891234560020', nome: 'Dexametasona 4mg 20cp', fabricante: 'Medley', principioAtivo: 'Dexametasona', status: 'classified', temNoBanco: true },
  { id: 21, ean: '7891234560021', nome: 'Cefalexina 500mg 21cp', fabricante: 'Germed', principioAtivo: 'Cefalexina', status: 'published', temNoBanco: true },
  { id: 22, ean: '7891234560022', nome: 'Paracetamol 750mg 20cp', fabricante: 'Medley', principioAtivo: 'Paracetamol', status: 'published', temNoBanco: true },
  { id: 23, ean: '7891234560023', nome: 'Rivotril 0,5mg 30cp', fabricante: 'Roche', principioAtivo: 'Clonazepam', status: 'error', temNoBanco: false },
  { id: 24, ean: '7891234560024', nome: 'Zolpidem 10mg 30cp', fabricante: 'Eurofarma', principioAtivo: 'Zolpidem Tartrato', status: 'published', temNoBanco: true },
  { id: 25, ean: '7891234560025', nome: 'Escitalopram 10mg 30cp', fabricante: 'Medley', principioAtivo: 'Escitalopram Oxalato', status: 'prepared', temNoBanco: true },
];

const STATUS_LABELS: Record<ProductStatus, string> = {
  published: 'Publicado',
  classified: 'Clarificado',
  prepared: 'Preparado',
  error: 'Erro',
  skipped: 'Pulado',
};

const STATUS_TONES: Record<ProductStatus, string> = {
  published: 'text-emerald-600',
  classified: 'text-primary',
  prepared: 'text-amber-600',
  error: 'text-rose-600',
  skipped: 'text-foreground/45',
};

const STATUS_DOTS: Record<ProductStatus, string> = {
  published: 'bg-emerald-500',
  classified: 'bg-primary',
  prepared: 'bg-amber-500',
  error: 'bg-rose-500',
  skipped: 'bg-foreground/30',
};

const PRODUCT_STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'classified', label: 'Clarificados' },
  { value: 'prepared', label: 'Preparados' },
  { value: 'error', label: 'Erros' },
  { value: 'skipped', label: 'Pulados' },
] as const;

const PAGE_SIZE = 10;

export default function ClienteDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const cliente = MOCK_CLIENTE;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const porcentagem = cliente.totalProdutosEstoque > 0
    ? Math.round((cliente.totalNoBanco / cliente.totalProdutosEstoque) * 100)
    : 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return MOCK_PRODUTOS.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (q && !p.ean.includes(q) && !p.nome.toLowerCase().includes(q) && !p.fabricante.toLowerCase().includes(q) && !p.principioAtivo.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeStatusFilter(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MOCK_PRODUTOS.length };
    for (const p of MOCK_PRODUTOS) {
      counts[p.status] = (counts[p.status] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <main className="w-full p-6">
      {/* Header */}
      <header className="flex items-center gap-3 pb-6">
        <button
          onClick={() => navigate('/main/clientes')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div className="h-6 w-px shrink-0 bg-border" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{cliente.nome}</h1>
          <p className="text-sm text-foreground/50">
            {cliente.instancia} &middot; {cliente.provider}
          </p>
        </div>
      </header>

      {/* Client info */}
      <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoBlock label="Instância" value={cliente.instancia} />
        <InfoBlock label="CNPJ" value={cliente.cnpj} />
        <InfoBlock label="Origem" value={cliente.provider} />
        <InfoBlock label="Status" value={cliente.status} />
      </section>

      {/* Metrics */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon={<Package className="h-5 w-5 text-foreground/35" />}
          label="Produtos no estoque"
          value={cliente.totalProdutosEstoque}
        />
        <MetricCard
          icon={<Database className="h-5 w-5 text-foreground/35" />}
          label="No banco Unico"
          value={cliente.totalNoBanco}
        />
        <MetricCard
          icon={
            <div className="relative h-5 w-5">
              <svg viewBox="0 0 20 20" className="h-5 w-5 -rotate-90">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-foreground/[0.06]" />
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray={`${(porcentagem / 100) * 50.27} 50.27`}
                  className="text-primary"
                />
              </svg>
            </div>
          }
          label="Cobertura"
          value={porcentagem}
          suffix="%"
        />
      </section>

      {/* Products section */}
      <section>
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="border border-border flex items-center gap-2 px-3 rounded-lg max-w-[320px] w-full">
            <Search size={15} className="text-foreground/35" />
            <input
              type="text"
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              className="outline-none flex flex-1 py-2 text-sm bg-transparent"
              placeholder="EAN, nome, fabricante..."
            />
          </span>

          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-foreground/40" />
            {PRODUCT_STATUS_FILTERS.map((f) => {
              const isActive = statusFilter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => changeStatusFilter(f.value)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground/70'
                  }`}
                >
                  {f.label}
                  <span className="ml-1 tabular-nums text-foreground/35">
                    {statusCounts[f.value] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-foreground/[0.025]">
              <tr className="border-b border-border text-xs font-semibold text-foreground/55">
                <th className="px-4 py-2.5 text-left w-[14%]">EAN</th>
                <th className="px-4 py-2.5 text-left w-[28%]">Produto</th>
                <th className="px-4 py-2.5 text-left w-[18%]">Fabricante</th>
                <th className="px-4 py-2.5 text-left w-[22%]">Princípio Ativo</th>
                <th className="px-4 py-2.5 text-left w-[10%]">Status</th>
                <th className="px-4 py-2.5 text-center w-[8%]">Banco</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-foreground/40">
                    Nenhum produto encontrado para os filtros atuais.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 hover:bg-foreground/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm tabular-nums text-foreground/70 font-mono">
                      {p.ean}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {p.nome}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground/65">
                      {p.fabricante}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground/65">
                      {p.principioAtivo}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${STATUS_TONES[p.status]}`}>
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOTS[p.status]}`} />
                        {STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.temNoBanco ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                          <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground/[0.05]">
                          <X size={11} className="text-foreground/30" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <footer className="flex items-center justify-between border-t border-border px-4 py-2.5">
            <span className="text-xs text-foreground/50">
              {filtered.length} produto{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((c) => Math.max(1, c - 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-foreground/60 border border-border rounded-lg disabled:cursor-not-allowed disabled:opacity-40 hover:bg-foreground/5 transition-colors"
              >
                <ArrowLeft size={14} /> Anterior
              </button>
              <span className="px-3 py-1.5 text-xs font-medium text-foreground/60 tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((c) => Math.min(totalPages, c + 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-foreground/60 border border-border rounded-lg disabled:cursor-not-allowed disabled:opacity-40 hover:bg-foreground/5 transition-colors"
              >
                Próximo <ArrowRight size={14} />
              </button>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <span className="text-xs font-medium text-foreground/45">{label}</span>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  suffix = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-lg border border-border px-5 py-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-foreground/45">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
        {value.toLocaleString('pt-BR')}{suffix}
      </p>
    </div>
  );
}
