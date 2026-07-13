import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Trash2,
} from 'lucide-react';
import {
  deleteBancoUnicoImport,
  listBancoUnicoImports,
  type BancoUnicoImportJob,
} from '../../../services/bancoUnicoImports.service';
import { extractErrorMessage } from '../../../utils/error';
import { statusInfo } from '../../Aplications/bancoUnicoImports.ui';
import StatusBadge from '../../Aplications/StatusBadge';
import ConfirmModal from '../../Aplications/ConfirmModal';

type ImportJobListProps = {
  clientId: number;
  onSelectJob: (job: BancoUnicoImportJob) => void;
  refreshKey?: number;
};

const ACTIVE_JOB_STATUSES = new Set(['pending', 'running', 'paused', 'cancelling']);

export default function ImportJobList({ clientId, onSelectJob, refreshKey }: ImportJobListProps) {
  const [jobs, setJobs] = useState<BancoUnicoImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<BancoUnicoImportJob | null>(null);
  const [flashMessage, setFlashMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  async function loadJobs(options?: { silent?: boolean }) {
    if (!options?.silent) setLoading(true);
    try {
      const response = await listBancoUnicoImports({
        page,
        limit: 8,
        search,
        clientId,
      });
      setJobs(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.totalItems);
    } catch (error) {
      if (!options?.silent) {
        setFlashMessage({ tone: 'error', text: extractErrorMessage(error, 'Erro ao carregar importacoes.') });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadJobs();
  }, [page, search, refreshKey]);

  useEffect(() => {
    const id = window.setInterval(() => void loadJobs({ silent: true }), 5000);
    return () => window.clearInterval(id);
  }, [page, search, clientId]);

  useEffect(() => {
    if (!flashMessage) return;
    const id = window.setTimeout(() => setFlashMessage(null), 4000);
    return () => window.clearTimeout(id);
  }, [flashMessage]);

  const activeCount = useMemo(
    () => jobs.filter((j) => ACTIVE_JOB_STATUSES.has(j.status)).length,
    [jobs],
  );

  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Importacoes</h3>
          {activeCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums">
              <span className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
              {activeCount} ativa{activeCount !== 1 ? 's' : ''}
            </span>
          ) : null}
        </div>
        <span className="text-xs text-foreground/45 tabular-nums">
          {totalItems} registro{totalItems !== 1 ? 's' : ''}
        </span>
      </div>

      {flashMessage ? (
        <div
          className={`mx-5 mt-3 flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium ${
            flashMessage.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
              : 'border-rose-200 bg-rose-50/80 text-rose-800'
          }`}
        >
          {flashMessage.tone === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          )}
          {flashMessage.text}
        </div>
      ) : null}

      <div className="px-5 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/35" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-foreground/[0.02] py-2 pl-8 pr-3 text-xs outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
            placeholder="Buscar por ID ou mensagem..."
          />
        </div>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-foreground/40">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-foreground/45">
            Nenhuma importacao encontrada para este cliente.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {jobs.map((job) => {
              const info = statusInfo(job.status);
              const deletable = !ACTIVE_JOB_STATUSES.has(job.status);
              return (
                <li key={job.id} className="group flex items-center">
                  <button
                    type="button"
                    onClick={() => onSelectJob(job)}
                    className="grid flex-1 cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3 text-left transition-colors hover:bg-foreground/[0.02]"
                  >
                    <span className="text-xs font-medium text-foreground/40 tabular-nums">
                      #{job.id}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-foreground/55">
                        {job.currentMessage || 'Sem detalhes recentes.'}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-foreground/[0.06]">
                          <div
                            className="h-full rounded-full bg-primary transition-[width]"
                            style={{ width: `${job.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] tabular-nums text-foreground/45">
                          {job.progressPercent}%
                        </span>
                        <span className="text-[11px] tabular-nums text-foreground/45">
                          {job.totalExisting} existentes · {job.totalSkipped} pulados
                        </span>
                      </div>
                    </div>
                    <StatusBadge label={info.label} tone={info.tone} />
                  </button>

                  {deletable ? (
                    <button
                      type="button"
                      title="Excluir"
                      onClick={() => setDeleteTarget(job)}
                      className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground/25 opacity-0 transition-colors hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-border px-5 py-2">
          <span className="text-[11px] text-foreground/45">
            Pagina {page} de {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((c) => Math.max(1, c - 1))}
              disabled={page === 1}
              className="rounded-md border border-border px-2 py-1 text-[11px] font-medium transition-colors hover:bg-foreground/[0.03] disabled:opacity-35"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((c) => Math.min(totalPages, c + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-border px-2 py-1 text-[11px] font-medium transition-colors hover:bg-foreground/[0.03] disabled:opacity-35"
            >
              Proxima
            </button>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <ConfirmModal
          title="Excluir importacao"
          description={`Isso remove permanentemente a importacao #${deleteTarget.id}, seus itens e eventos. Essa acao nao pode ser desfeita.`}
          confirmLabel="Excluir"
          confirmingLabel="Excluindo..."
          tone="danger"
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await deleteBancoUnicoImport(deleteTarget.id);
            setDeleteTarget(null);
            setFlashMessage({ tone: 'success', text: `Importacao #${deleteTarget.id} excluida.` });
            await loadJobs({ silent: true });
          }}
        />
      ) : null}
    </div>
  );
}
