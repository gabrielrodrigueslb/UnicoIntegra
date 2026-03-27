import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Database,
  Eye,
  FileText,
  Filter,
  Lock,
  PauseCircle,
  Plus,
  RefreshCw,
  Search,
  ServerCog,
  SquareTerminal,
} from 'lucide-react';

import ConfirmDialog from '../../components/ConfirmDialog';
import { ModalFrame } from '../../components/ModalFrame';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useRequireAuth } from '../../hooks/useAuthRedirect';
import {
  createAiServiceInstance,
  fetchAiServiceInstanceLogs,
  fetchAiServiceInstanceStatus,
  listAiServiceInstances,
  restartAiServiceInstance,
  stopAiServiceInstance,
  type AiServiceInstance,
  type AiServiceInstanceStatus,
} from '../../services/aiServiceInstances.service';
import { extractErrorMessage } from '../../utils/error';

type InstanceActionType = 'restart' | 'stop';
type StatusFilter = 'all' | 'online' | 'stopped';

interface AiServiceFormData {
  nome: string;
  openai_api_key: string;
  db_host: string;
  db_port: string;
  db_name: string;
  db_user: string;
  db_password: string;
  unidade_negocio_id: string;
}

interface FlashMessage {
  tone: 'success' | 'error';
  text: string;
}

const INITIAL_FORM_DATA: AiServiceFormData = {
  nome: '',
  openai_api_key: '',
  db_host: '',
  db_port: '5432',
  db_name: '',
  db_user: '',
  db_password: '',
  unidade_negocio_id: '',
};

function normalizeNumericValue(value: string) {
  const normalized = value.trim();
  return /^\d+$/.test(normalized) ? Number(normalized) : normalized;
}

function statusPresentation(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'online') return { label: 'Online', dotClassName: 'bg-emerald-500', textClassName: 'text-emerald-700', borderClassName: 'border-emerald-200', bgClassName: 'bg-emerald-50' };
  if (normalized === 'stopped' || normalized === 'offline') return { label: 'Parada', dotClassName: 'bg-amber-500', textClassName: 'text-amber-700', borderClassName: 'border-amber-200', bgClassName: 'bg-amber-50' };
  if (normalized === 'errored') return { label: 'Erro', dotClassName: 'bg-red-500', textClassName: 'text-red-700', borderClassName: 'border-red-200', bgClassName: 'bg-red-50' };
  return { label: status || 'Desconhecido', dotClassName: 'bg-gray-400', textClassName: 'text-gray-600', borderClassName: 'border-gray-200', bgClassName: 'bg-gray-50' };
}

export default function AiServicesManager() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AiServiceFormData>(INITIAL_FORM_DATA);
  const [instances, setInstances] = useState<AiServiceInstance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [refreshingList, setRefreshingList] = useState(false);
  
  // Modais e Estados de Confirmação
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmingCreate, setConfirmingCreate] = useState(false); // Novo estado para o ConfirmDialog de criação
  const [creating, setCreating] = useState(false);
  
  const [selectedStatus, setSelectedStatus] = useState<AiServiceInstanceStatus | null>(null);
  const [logsModal, setLogsModal] = useState<{ instanceName: string; lines: string[]; loading: boolean } | null>(null);
  const [pendingAction, setPendingAction] = useState<{ type: InstanceActionType; instance: AiServiceInstance } | null>(null);
  const [actionLoadingName, setActionLoadingName] = useState<string | null>(null);

  useRequireAuth();
  useBodyScrollLock(isCreateModalOpen || confirmingCreate || Boolean(selectedStatus) || Boolean(logsModal) || Boolean(pendingAction));

  useEffect(() => {
    if (!flashMessage) return;
    const timeoutId = window.setTimeout(() => setFlashMessage(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [flashMessage]);

  async function loadInstances(options?: { silent?: boolean }) {
    if (options?.silent) setRefreshingList(true);
    else setLoadingList(true);

    try {
      const data = await listAiServiceInstances();
      setInstances(data);
    } catch (error) {
      setFlashMessage({ tone: 'error', text: extractErrorMessage(error, 'Erro ao carregar instâncias.') });
    } finally {
      setLoadingList(false);
      setRefreshingList(false);
    }
  }

  useEffect(() => {
    void loadInstances();
  }, []);

  const filteredInstances = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return instances.filter((inst) => {
      const matchesSearch = 
        !search || 
        inst.nome.toLowerCase().includes(search) || 
        inst.porta.toLowerCase().includes(search);
      
      const instStatus = inst.status.trim().toLowerCase();
      const isOnline = instStatus === 'online';
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'online' && isOnline) || 
        (statusFilter === 'stopped' && !isOnline);

      return matchesSearch && matchesStatus;
    });
  }, [instances, searchTerm, statusFilter]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((curr) => ({ ...curr, [name]: value }));
  }

  // Abre o ConfirmDialog ao invés de chamar a API direto
  function handleFormSubmit(event: React.FormEvent) {
    event.preventDefault();
    setConfirmingCreate(true);
  }

  // Execução real da criação, chamada pelo ConfirmDialog
  async function executeCreateInstance() {
    if (creating) return;

    setCreating(true);
    try {
      const payload = {
        ...formData,
        db_port: normalizeNumericValue(formData.db_port),
        unidade_negocio_id: normalizeNumericValue(formData.unidade_negocio_id),
      };

      await createAiServiceInstance(payload);
      
      setFormData(INITIAL_FORM_DATA);
      setConfirmingCreate(false);
      setIsCreateModalOpen(false);
      setFlashMessage({ tone: 'success', text: `Instância "${payload.nome}" criada com sucesso.` });
      
      await loadInstances({ silent: true });
    } catch (error) {
      setConfirmingCreate(false); // Fecha o dialog de confirmação para poder corrigir
      setFlashMessage({ tone: 'error', text: extractErrorMessage(error, 'Erro ao criar instância.') });
    } finally {
      setCreating(false);
    }
  }

  async function handleOpenStatus(instanceName: string) {
    try {
      const data = await fetchAiServiceInstanceStatus(instanceName);
      setSelectedStatus(data);
    } catch (error) {
      setFlashMessage({ tone: 'error', text: extractErrorMessage(error, 'Erro ao consultar status.') });
    }
  }

  async function handleOpenLogs(instanceName: string) {
    setLogsModal({ instanceName, lines: [], loading: true });
    try {
      const data = await fetchAiServiceInstanceLogs(instanceName, 50);
      setLogsModal({ instanceName, lines: data.linhas ?? [], loading: false });
    } catch (error) {
      setLogsModal({ instanceName, lines: ['Erro ao carregar os logs.'], loading: false });
    }
  }

  async function handleConfirmAction() {
    if (!pendingAction) return;
    const { instance, type } = pendingAction;
    setActionLoadingName(instance.nome);

    try {
      if (type === 'restart') {
        await restartAiServiceInstance(instance.nome);
        setFlashMessage({ tone: 'success', text: `Instância "${instance.nome}" reiniciada.` });
      } else {
        await stopAiServiceInstance(instance.nome);
        setFlashMessage({ tone: 'success', text: `Instância "${instance.nome}" parada.` });
      }
      setPendingAction(null);
      await loadInstances({ silent: true });
    } catch (error) {
      setFlashMessage({ tone: 'error', text: extractErrorMessage(error, 'Erro ao executar ação.') });
    } finally {
      setActionLoadingName(null);
    }
  }

  // Helpers CSS para formulário
  const labelClass = "mb-2 block text-[10px] font-bold uppercase tracking-wider text-foreground/50";
  const inputClass = "w-full rounded-xl border border-border bg-background p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-foreground/30";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-50/50 font-sans text-foreground">
      
      <header className="sticky top-0 z-10 shrink-0 flex flex-wrap justify-between gap-4 border-b border-border bg-background px-6 py-5 shadow-sm w-full sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            onClick={() => navigate('/main/aplications')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground/60 transition-colors hover:bg-gray-50 hover:text-foreground"
            title="Voltar para Aplicações"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-xl font-bold text-foreground truncate">
              <ServerCog className="h-6 w-6 text-primary shrink-0" /> <span className="truncate">Serviços IA</span>
            </h1>
            <p className="mt-0.5 text-sm text-foreground/60 truncate hidden sm:block">
              Provisionamento e monitoramento de instâncias operacionais.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nova Instância
          </button>
        </div>
      </header>

      <main className="custom-scrollbar mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col gap-6 overflow-y-auto p-6 lg:flex-row lg:items-start lg:gap-8 lg:p-8 min-w-0">
        
        {/* SIDEBAR */}
        <aside className="flex w-full shrink-0 flex-col gap-6 lg:sticky lg:top-0 lg:w-[320px] lg:self-start">
          <div className="rounded-2xl border border-border bg-background p-5 shadow-sm space-y-6">
            
            <div>
              <label className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/50">
                <Search className="h-4 w-4" /> Pesquisar
              </label>
              <input
                type="text"
                placeholder="Nome ou porta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-border bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
              />
            </div>

            <hr className="border-border" />

            <div>
              <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/50">
                <Filter className="h-4 w-4" /> Status Operacional
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'all', label: 'Todas as instâncias' },
                  { id: 'online', label: 'Apenas Online', dot: 'bg-emerald-500' },
                  { id: 'stopped', label: 'Apenas Paradas', dot: 'bg-amber-500' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setStatusFilter(filter.id as StatusFilter)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      statusFilter === filter.id
                        ? 'border-primary/30 bg-primary/5 text-primary shadow-sm'
                        : 'border-transparent text-foreground/70 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${statusFilter === filter.id ? 'border-primary' : 'border-gray-300'}`}>
                      {statusFilter === filter.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span className="flex items-center gap-2">
                      {filter.dot && <span className={`h-2 w-2 rounded-full ${filter.dot}`} />}
                      {filter.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            <div>
               <button
                  onClick={() => void loadInstances({ silent: true })}
                  disabled={refreshingList}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshingList ? 'animate-spin' : ''}`} />
                  {refreshingList ? 'Atualizando...' : 'Atualizar Lista'}
                </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="rounded-2xl border border-border bg-background p-4 shadow-sm text-center">
                <div className="text-2xl font-black text-foreground">{instances.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mt-1">Total</div>
             </div>
             <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm text-center">
                <div className="text-2xl font-black text-emerald-700">{instances.filter(i => i.status === 'online').length}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 mt-1">Online</div>
             </div>
          </div>
        </aside>

        {/* LISTA */}
        <section className="flex min-w-0 flex-1 flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
          
          {flashMessage ? (
            <div className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${flashMessage.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
              {flashMessage.text}
            </div>
          ) : null}

          {loadingList ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-background border-dashed text-foreground/50">
              <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  <span>Carregando instâncias...</span>
              </div>
            </div>
          ) : filteredInstances.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-border bg-background border-dashed text-foreground/50">
              <Bot className="mb-3 h-10 w-10 text-gray-300" />
              <span className="font-medium text-foreground/80">Nenhuma instância encontrada</span>
              <span className="text-sm mt-1 text-center px-4">Ajuste os filtros ou crie uma nova instância.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-8 min-w-0">
              {filteredInstances.map((instance) => {
                const statusInfo = statusPresentation(instance.status);
                const isActionBusy = actionLoadingName === instance.nome;

                return (
                  <article key={instance.nome} className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-background p-5 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between hover:border-gray-300 hover:shadow-md group">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${statusInfo.dotClassName}`} title={statusInfo.label} />
                        <h3 className="truncate font-bold text-foreground text-lg group-hover:text-primary transition-colors">{instance.nome}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusInfo.borderClassName} ${statusInfo.bgClassName} ${statusInfo.textClassName}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-sm text-foreground/60 font-medium">
                          Porta {instance.porta || '-'}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button onClick={() => void handleOpenStatus(instance.nome)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm font-medium text-foreground/80 hover:bg-gray-50 transition-colors">
                        <Eye className="h-4 w-4 text-gray-400" /> Status
                      </button>
                      <button onClick={() => void handleOpenLogs(instance.nome)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm font-medium text-foreground/80 hover:bg-gray-50 transition-colors">
                        <FileText className="h-4 w-4 text-gray-400" /> Logs
                      </button>
                      
                      <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

                      <button onClick={() => setPendingAction({ type: 'restart', instance })} disabled={isActionBusy} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs sm:text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
                        <RefreshCw className="h-4 w-4" /> Restart
                      </button>
                      <button onClick={() => setPendingAction({ type: 'stop', instance })} disabled={isActionBusy} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                        <PauseCircle className="h-4 w-4" /> Parar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MODAL DE CRIAÇÃO (Fomulário) */}
      {isCreateModalOpen ? (
        <ModalFrame
          onClose={() => setIsCreateModalOpen(false)}
          maxWidthClassName="max-w-2xl"
          bodyClassName="p-0"
          header={
            <div className="flex items-center justify-between border-b border-border bg-background px-6 py-5">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><ServerCog className="h-6 w-6 text-primary"/> Nova Instância</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-foreground/50 hover:text-foreground transition-colors p-2">✕</button>
            </div>
          }
        >
          {/* Note o onSubmit={handleFormSubmit} - Isso abre o ConfirmDialog! */}
          <form onSubmit={handleFormSubmit} className="bg-gray-50/50 flex flex-col max-h-[75vh]">
             <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                
                <section>
                  <label className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <ServerCog className="h-4 w-4" /> Informações Básicas
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Nome da Loja</label>
                      <input name="nome" required placeholder="Ex: alpha7-loja-centro" value={formData.nome} onChange={handleInputChange} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Unidade de Negócio (ID)</label>
                      <input name="unidade_negocio_id" required placeholder="Ex: 65984" value={formData.unidade_negocio_id} onChange={handleInputChange} className={inputClass} />
                    </div>
                  </div>
                </section>

                <hr className="border-border" />

                <section className='flex flex-col'>
                  <label className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Database className="h-4 w-4" /> Banco de Dados
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>DB Host</label>
                      <input name="db_host" required placeholder="localhost" value={formData.db_host} onChange={handleInputChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>DB Port</label>
                      <input name="db_port" required placeholder="5432" value={formData.db_port} onChange={handleInputChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>DB Name</label>
                      <input name="db_name" required placeholder="meu_banco" value={formData.db_name} onChange={handleInputChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>DB User</label>
                      <input name="db_user" required placeholder="usuario" value={formData.db_user} onChange={handleInputChange} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>DB Password</label>
                      <input name="db_password" type="password" required placeholder="••••••••" value={formData.db_password} onChange={handleInputChange} className={inputClass} />
                    </div>
                  </div>
                </section>

                <hr className="border-border" />

                <section>
                  <label className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Lock className="h-4 w-4" /> Segurança
                  </label>
                  <div>
                    <label className={labelClass}>OpenAI API Key</label>
                    <input name="openai_api_key" type="password" required placeholder="sk-proj-..." value={formData.openai_api_key} onChange={handleInputChange} className={inputClass} />
                  </div>
                </section>

             </div>

             <div className="border-t border-border bg-background p-6 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl px-6 py-3 text-sm font-semibold text-foreground hover:bg-gray-100 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90">
                  <Plus className="h-4 w-4" /> Configurar Instância
                </button>
             </div>
          </form>
        </ModalFrame>
      ) : null}

      {/* CONFIRMAÇÃO DE CRIAÇÃO DA INSTÂNCIA (Usa o ConfirmDialog padrão) */}
      {confirmingCreate ? (
        <ConfirmDialog
          title="Criar Instância"
          description={
            <span>
              Você está prestes a provisionar a instância <strong>{formData.nome}</strong> vinculada a unidade de negócio <strong>{formData.unidade_negocio_id}</strong>. Deseja prosseguir?
            </span>
          }
          confirmText="Provisionar"
          tone="primary"
          loading={creating}
          onClose={() => {
            if (!creating) setConfirmingCreate(false);
          }}
          onConfirm={() => void executeCreateInstance()}
        />
      ) : null}

      {/* MODAL DE STATUS */}
      {selectedStatus ? (
        <ModalFrame
          onClose={() => setSelectedStatus(null)}
          maxWidthClassName="max-w-2xl"
          bodyClassName="p-0"
          header={
            <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
              <h2 className="text-lg font-bold text-foreground truncate pr-4">Status: {selectedStatus.nome}</h2>
              <button onClick={() => setSelectedStatus(null)} className="shrink-0 text-foreground/50 hover:text-foreground">Fechar</button>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50/50">
            <div className="rounded-xl bg-background p-4 border border-border shadow-sm min-w-0"><span className="block text-xs uppercase tracking-wider font-bold text-foreground/50 mb-1">Status</span><span className={`truncate block font-semibold text-base ${statusPresentation(selectedStatus.status).textClassName}`}>{statusPresentation(selectedStatus.status).label}</span></div>
            <div className="rounded-xl bg-background p-4 border border-border shadow-sm min-w-0"><span className="block text-xs uppercase tracking-wider font-bold text-foreground/50 mb-1">Porta</span><span className="truncate block font-bold text-base text-foreground">{selectedStatus.porta || '-'}</span></div>
            <div className="rounded-xl bg-background p-4 border border-border shadow-sm min-w-0"><span className="block text-xs uppercase tracking-wider font-bold text-foreground/50 mb-1">Memória</span><span className="truncate block font-bold text-base text-foreground">{selectedStatus.memoria_mb} MB</span></div>
            <div className="rounded-xl bg-background p-4 border border-border shadow-sm min-w-0"><span className="block text-xs uppercase tracking-wider font-bold text-foreground/50 mb-1">CPU</span><span className="truncate block font-bold text-base text-foreground">{selectedStatus.cpu_percent}%</span></div>
          </div>
        </ModalFrame>
      ) : null}

      {/* MODAL DE LOGS */}
      {logsModal ? (
        <ModalFrame
          onClose={() => setLogsModal(null)}
          maxWidthClassName="max-w-4xl"
          bodyClassName="p-0"
          header={
            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 truncate pr-4"><SquareTerminal className="h-5 w-5 shrink-0"/> <span className="truncate">Logs: {logsModal.instanceName}</span></h2>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => void handleOpenLogs(logsModal.instanceName)} className="rounded-lg text-sm font-medium px-4 py-2 bg-gray-800 text-white transition-colors hover:bg-gray-700">Atualizar</button>
                <button onClick={() => setLogsModal(null)} className="rounded-lg text-sm font-medium px-4 py-2 bg-gray-800 text-white transition-colors hover:bg-gray-700">Fechar</button>
              </div>
            </div>
          }
        >
          <div className="bg-gray-950 p-6">
             {logsModal.loading ? (
                <div className="flex items-center justify-center text-gray-400 p-8 h-40">
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Carregando logs...
                </div>
             ) : (
                <div className="scrollbar-clean max-h-[50vh] overflow-y-auto font-mono text-sm leading-relaxed text-emerald-400 bg-black/40 p-4 rounded-xl border border-gray-800 shadow-inner">
                  {logsModal.lines.map((line, idx) => (
                    <div key={idx} className="whitespace-pre-wrap break-words">{line}</div>
                  ))}
                </div>
             )}
          </div>
        </ModalFrame>
      ) : null}

      {/* CONFIRMAÇÃO DE AÇÃO (Restart / Stop) */}
      {pendingAction ? (
        <ConfirmDialog
          title={pendingAction.type === 'restart' ? 'Reiniciar instância?' : 'Parar instância?'}
          description={`Deseja realmente ${pendingAction.type === 'restart' ? 'reiniciar' : 'parar'} a instância "${pendingAction.instance.nome}"?`}
          confirmText={pendingAction.type === 'restart' ? 'Reiniciar' : 'Parar'}
          tone={pendingAction.type === 'restart' ? 'primary' : 'danger'}
          loading={actionLoadingName === pendingAction.instance.nome}
          onClose={() => { if (actionLoadingName !== pendingAction.instance.nome) setPendingAction(null); }}
          onConfirm={() => void handleConfirmAction()}
        />
      ) : null}
    </div>
  );
}
