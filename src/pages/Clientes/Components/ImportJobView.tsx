import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Clock3,
  Database,
  Loader2,
  Pause,
  Play,
  Search,
  StopCircle,
} from 'lucide-react';
import {
  cancelBancoUnicoImport,
  getBancoUnicoImport,
  listBancoUnicoImportItems,
  pauseBancoUnicoImport,
  resumeBancoUnicoImport,
  type BancoUnicoImportEvent,
  type BancoUnicoImportItem,
  type BancoUnicoImportJobDetail,
} from '../../../services/bancoUnicoImports.service';
import { API_BASE } from '../../../services/api';
import {
  formatDateTime,
  itemStatusLabel,
  itemStatusTone,
  MODE_LABEL,
  SOURCE_TYPE_LABEL,
  statusInfo,
} from '../../Aplications/bancoUnicoImports.ui';
import StatusBadge from '../../Aplications/StatusBadge';
import BancoUnicoImportConsole from '../../Aplications/BancoUnicoImportConsole';

type ImportJobViewProps = {
  jobId: number;
  onBack: () => void;
};

const ACTIVE_JOB_STATUSES = new Set(['pending', 'running', 'paused', 'cancelling']);

const FUNNEL_STEPS: Array<{
  key: keyof Pick<
    BancoUnicoImportJobDetail,
    'totalSelected' | 'totalExisting' | 'totalPrepared' | 'totalSkipped' | 'totalPublished' | 'totalErrors'
  >;
  label: string;
  tone: string;
}> = [
  { key: 'totalSelected', label: 'Selecionados', tone: 'text-foreground' },
  { key: 'totalExisting', label: 'Ja existiam', tone: 'text-foreground/70' },
  { key: 'totalPrepared', label: 'Preparados', tone: 'text-primary' },
  { key: 'totalSkipped', label: 'Pulados', tone: 'text-amber-600' },
  { key: 'totalPublished', label: 'Subidos', tone: 'text-emerald-600' },
  { key: 'totalErrors', label: 'Erros', tone: 'text-rose-600' },
];

const ITEM_STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'loaded', label: 'Carregados' },
  { value: 'classified', label: 'Clarificados' },
  { value: 'prepared', label: 'Preparados' },
  { value: 'published', label: 'Publicados' },
  { value: 'already_exists', label: 'Existiam' },
  { value: 'invalid_ean', label: 'EAN invalido' },
  { value: 'classification_error', label: 'Erro class.' },
  { value: 'publish_error', label: 'Erro pub.' },
] as const;

export default function ImportJobView({ jobId, onBack }: ImportJobViewProps) {
  const [job, setJob] = useState<BancoUnicoImportJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<BancoUnicoImportEvent[]>([]);
  const [streamConnected, setStreamConnected] = useState(false);
  const [queueAction, setQueueAction] = useState<'pause' | 'resume' | 'cancel' | null>(null);

  const [items, setItems] = useState<BancoUnicoImportItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsSearch, setItemsSearch] = useState('');
  const [itemsStatus, setItemsStatus] = useState('all');
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const [itemsTotalItems, setItemsTotalItems] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const itemsTickRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function loadJob(options?: { replaceEvents?: boolean }) {
    try {
      const detail = await getBancoUnicoImport(jobId);
      setJob(detail);
      if (options?.replaceEvents) {
        setEvents(detail.recentEvents || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  async function loadItems(options?: { silent?: boolean }) {
    if (!options?.silent) setItemsLoading(true);
    try {
      const response = await listBancoUnicoImportItems(jobId, {
        page: itemsPage,
        limit: 10,
        search: itemsSearch || undefined,
        status: itemsStatus === 'all' ? undefined : itemsStatus,
      });
      setItems(response.data);
      setItemsTotalPages(response.meta.totalPages);
      setItemsTotalItems(response.meta.totalItems);
    } catch {
      /* silent */
    } finally {
      setItemsLoading(false);
    }
  }

  // SSE
  useEffect(() => {
    void loadJob({ replaceEvents: true });

    const es = new EventSource(`${API_BASE}/api/banco-unico-imports/${jobId}/stream`);
    eventSourceRef.current = es;

    es.addEventListener('job', ((event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as BancoUnicoImportJobDetail;
        setJob(data);
      } catch { /* ignore */ }
    }) as EventListener);

    es.addEventListener('event', ((event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as BancoUnicoImportEvent;
        setEvents((prev) => {
          if (prev.some((e) => e.id === data.id)) return prev;
          const next = [...prev, data];
          return next.length > 300 ? next.slice(-300) : next;
        });
      } catch { /* ignore */ }
    }) as EventListener);

    es.addEventListener('items_changed', (() => {
      if (itemsTickRef.current) clearTimeout(itemsTickRef.current);
      itemsTickRef.current = setTimeout(() => void loadItems({ silent: true }), 120);
    }) as EventListener);

    es.addEventListener('heartbeat', (() => {
      setStreamConnected(true);
    }) as EventListener);

    es.onerror = () => setStreamConnected(false);

    return () => {
      es.close();
      eventSourceRef.current = null;
      if (itemsTickRef.current) clearTimeout(itemsTickRef.current);
    };
  }, [jobId]);

  // Polling fallback
  useEffect(() => {
    const isActive = job && ACTIVE_JOB_STATUSES.has(job.status);
    if (!isActive) return;

    const interval = streamConnected ? 8000 : 3000;
    const id = window.setInterval(() => {
      void loadJob();
      void loadItems({ silent: true });
    }, interval);
    return () => window.clearInterval(id);
  }, [job?.status, streamConnected]);

  // Items filter changes
  useEffect(() => {
    void loadItems();
  }, [itemsPage, itemsSearch, itemsStatus]);

  async function handleCancel() {
    setQueueAction('cancel');
    try {
      await cancelBancoUnicoImport(jobId);
      void loadJob();
    } catch {
      /* silent */
    } finally {
      setQueueAction(null);
    }
  }

  async function handlePause() {
    setQueueAction('pause');
    try {
      await pauseBancoUnicoImport(jobId);
      void loadJob();
    } finally {
      setQueueAction(null);
    }
  }

  async function handleResume() {
    setQueueAction('resume');
    try {
      await resumeBancoUnicoImport(jobId);
      void loadJob();
    } finally {
      setQueueAction(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-foreground/40">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-foreground/45">
        Importacao nao encontrada.
      </div>
    );
  }

  const info = statusInfo(job.status);
  const isActive = ACTIVE_JOB_STATUSES.has(job.status);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground/40 tabular-nums">#{job.id}</span>
            <StatusBadge label={info.label} tone={info.tone} />
          </div>
          {job.currentMessage ? (
            <p className="mt-1 truncate text-xs text-foreground/55">{job.currentMessage}</p>
          ) : null}
        </div>
        {isActive ? (
          <div className="flex items-center gap-2">
            {job.status === 'paused' ? (
              <button
                onClick={() => void handleResume()}
                disabled={queueAction !== null}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-primary/35 hover:text-primary disabled:opacity-40"
              >
                {queueAction === 'resume' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                Retomar
              </button>
            ) : job.status !== 'cancelling' ? (
              <button
                onClick={() => void handlePause()}
                disabled={queueAction !== null}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-amber-200 hover:text-amber-700 disabled:opacity-40"
              >
                {queueAction === 'pause' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pause className="h-3 w-3" />}
                Pausar
              </button>
            ) : null}
            <button
              onClick={() => void handleCancel()}
              disabled={queueAction !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-rose-200 hover:text-rose-600 disabled:opacity-40"
            >
              {queueAction === 'cancel' ? <Loader2 className="h-3 w-3 animate-spin" /> : <StopCircle className="h-3 w-3" />}
              Cancelar
            </button>
          </div>
        ) : null}
      </div>

      {/* Progress + Funnel + Details — one bordered block, internal dividers only */}
      <div className="border border-border">
        <div className="p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground/55">Progresso</span>
            <span className="tabular-nums text-foreground/70">
              {job.progressCurrent.toLocaleString('pt-BR')} / {job.progressTotal.toLocaleString('pt-BR')} ({job.progressPercent}%)
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${job.progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid divide-y divide-border border-t border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="p-4">
            <h4 className="text-xs font-semibold text-foreground/55">Funil</h4>
            <div className="mt-3 flex items-stretch gap-1 overflow-x-auto">
              {FUNNEL_STEPS.map((step, index) => (
                <div key={step.key} className="flex items-stretch">
                  <div className="flex min-w-[80px] flex-col justify-center px-2 py-1">
                    <span className="text-[10px] text-foreground/40">{step.label}</span>
                    <span className={`mt-0.5 text-lg font-semibold tabular-nums ${step.tone}`}>
                      {job[step.key]}
                    </span>
                  </div>
                  {index < FUNNEL_STEPS.length - 1 ? (
                    <div className="flex items-center px-0.5 text-foreground/15">&rarr;</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4">
            <h4 className="text-xs font-semibold text-foreground/55">Detalhes</h4>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-foreground/45">
                  <Database className="h-3 w-3" /> Origem
                </dt>
                <dd className="font-medium text-foreground/75">
                  {SOURCE_TYPE_LABEL[job.sourceType] || job.sourceType}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-foreground/45">
                  <Boxes className="h-3 w-3" /> Modo
                </dt>
                <dd className="font-medium text-foreground/75">
                  {MODE_LABEL[job.mode] || job.mode}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-foreground/45">
                  <Clock3 className="h-3 w-3" /> Criada
                </dt>
                <dd className="text-foreground/60">{formatDateTime(job.createdAt)}</dd>
              </div>
              {job.startedAt ? (
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-foreground/45">
                    <Clock3 className="h-3 w-3" /> Iniciada
                  </dt>
                  <dd className="text-foreground/60">{formatDateTime(job.startedAt)}</dd>
                </div>
              ) : null}
              {job.finishedAt ? (
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-foreground/45">
                    <CheckCircle2 className="h-3 w-3" /> Finalizada
                  </dt>
                  <dd className="text-foreground/60">{formatDateTime(job.finishedAt)}</dd>
                </div>
              ) : null}
              <div className="border-t border-border pt-2" />
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-foreground/45">
                <span>Amostra: <strong className="font-semibold text-foreground/65">{job.totalSampled}</strong></span>
                <span>Valido: <strong className="font-semibold text-foreground/65">{job.totalCatalogValid}</strong></span>
                <span>EANs invalidos: <strong className="font-semibold text-foreground/65">{job.totalInvalidEans}</strong></span>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Console */}
      <BancoUnicoImportConsole
        jobId={jobId}
        events={events}
        streamConnected={streamConnected}
      />

      {/* Items Table */}
      <div className="rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h4 className="text-xs font-semibold text-foreground/55">
            Itens processados
            <span className="ml-2 tabular-nums text-foreground/35">{itemsTotalItems}</span>
          </h4>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-foreground/30" />
              <input
                value={itemsSearch}
                onChange={(event) => {
                  setItemsSearch(event.target.value);
                  setItemsPage(1);
                }}
                className="w-40 rounded-lg border border-border bg-foreground/[0.02] py-1.5 pl-7 pr-2 text-xs outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary sm:w-52"
                placeholder="EAN ou nome..."
              />
            </div>
            <select
              value={itemsStatus}
              onChange={(event) => {
                setItemsStatus(event.target.value);
                setItemsPage(1);
              }}
              className="rounded-lg border border-border bg-foreground/[0.02] px-2 py-1.5 text-xs outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
            >
              {ITEM_STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold text-foreground/45">
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">EAN</th>
                <th className="px-4 py-2 text-left">Produto</th>
                <th className="px-4 py-2 text-left">Fabricante</th>
                <th className="px-4 py-2 text-left">Erro</th>
              </tr>
            </thead>
            <tbody>
              {itemsLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-foreground/40">
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-foreground/40">
                    Nenhum item encontrado.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-foreground/[0.02] transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        label={itemStatusLabel(item.status)}
                        tone={itemStatusTone(item.status)}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-xs tabular-nums font-mono text-foreground/70">
                      {item.ean || '-'}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      <span className="font-medium text-foreground">
                        {item.nameNormalized || item.nameOriginal || '-'}
                      </span>
                      {item.nameNormalized && item.nameOriginal && item.nameNormalized !== item.nameOriginal ? (
                        <span className="ml-1.5 text-foreground/35">
                          ({item.nameOriginal})
                        </span>
                      ) : null}
                      {item.activeIngredient ? (
                        <span className="ml-1.5 text-foreground/35">
                          {item.activeIngredient}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-foreground/55">
                      {item.manufacturer || '-'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-rose-500">
                      {item.errorMessage || ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {itemsTotalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <span className="text-[11px] text-foreground/45">
              Pagina {itemsPage} de {itemsTotalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setItemsPage((c) => Math.max(1, c - 1))}
                disabled={itemsPage === 1}
                className="rounded-md border border-border px-2 py-1 text-[11px] font-medium transition-colors hover:bg-foreground/[0.03] disabled:opacity-35"
              >
                Anterior
              </button>
              <button
                onClick={() => setItemsPage((c) => Math.min(itemsTotalPages, c + 1))}
                disabled={itemsPage >= itemsTotalPages}
                className="rounded-md border border-border px-2 py-1 text-[11px] font-medium transition-colors hover:bg-foreground/[0.03] disabled:opacity-35"
              >
                Proxima
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
