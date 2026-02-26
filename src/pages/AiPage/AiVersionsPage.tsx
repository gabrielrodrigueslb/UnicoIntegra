import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  RefreshCcw,
  Search,
  Eye,
  Server,
  FileJson,
  Calendar,
  Copy,
  Check,
} from 'lucide-react';
import {
  fetchAiVersions,
  type AiVersionItem,
} from '../../services/aiVersions.service';

export default function AiVersionsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AiVersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AiVersionItem | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
      try {
      const data = await fetchAiVersions({ limit: 300, latestOnly: true });
      setItems(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Falha ao carregar as IAs salvas.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCopiedJson(false);
  }, [selected]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      const haystack = [
        item.instance,
        item.name ?? '',
        item.signaturename ?? '',
        item.aiId != null ? String(item.aiId) : '',
        item.description ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [items, search]);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date(value));

  const handleCopyJson = async () => {
    if (!selected) return;

    const jsonText = JSON.stringify(selected.payload, null, 2);

    try {
      await navigator.clipboard.writeText(jsonText);
      setCopiedJson(true);
      window.setTimeout(() => setCopiedJson(false), 1800);
    } catch (error) {
      console.error('Falha ao copiar JSON:', error);
      setError('Não foi possível copiar o JSON.');
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-screen space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <button
                onClick={() => navigate('/main/iaPage')}
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para criação de IAs
              </button>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                <Brain className="h-7 w-7 text-violet-600" />
                IAs Atuais (Última Versão)
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Mostra a versão mais recente de cada IA salva no banco.
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Atualizar
            </button>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por instância, nome, assinatura ou ID da IA..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-200"
            />
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
              IAs atuais encontradas: {filtered.length}
            </div>

            <div className="max-h-[68vh] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">IA</th>
                    <th className="px-4 py-3 font-semibold">Instância</th>
                    <th className="px-4 py-3 font-semibold">Versão</th>
                    <th className="px-4 py-3 font-semibold">Criado em</th>
                    <th className="px-4 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        Nenhuma IA encontrada.
                      </td>
                    </tr>
                  )}

                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-slate-50 ${
                        selected?.id === item.id ? 'bg-violet-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-slate-800">
                          {item.signaturename || item.name || 'Sem nome'}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          ID IA: {item.aiId ?? '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                          <Server className="h-3.5 w-3.5" />
                          <span className="max-w-[240px] truncate">{item.instance}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="inline-flex rounded-md bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">
                          v{item.version}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(item.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <button
                          onClick={() => setSelected(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver payload
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4 text-violet-600" />
                <h2 className="text-sm font-semibold text-slate-800">
                  Payload JSON
                </h2>
              </div>

              <button
                onClick={handleCopyJson}
                disabled={!selected}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                title="Copiar JSON"
              >
                {copiedJson ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar JSON
                  </>
                )}
              </button>
            </div>

            {selected ? (
              <div className="space-y-4 p-5">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700">
                  <div>
                    <strong>IA:</strong>{' '}
                    {selected.signaturename || selected.name || 'Sem nome'}
                  </div>
                  <div>
                    <strong>Instância:</strong> {selected.instance}
                  </div>
                  <div>
                    <strong>Versão:</strong> v{selected.version}
                  </div>
                </div>

                <pre
                  className="w-full max-w-full min-w-0 max-h-[58vh] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                  style={{ tabSize: 2 }}
                >
                  {JSON.stringify(selected.payload, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-500">
                Selecione um registro para visualizar o payload usado na criação
                da IA.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
