import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Database,
  RefreshCcw,
  RefreshCw,
  Search,
  Server,
  Wrench,
} from 'lucide-react';
import { ModalFrame } from '../../components/ModalFrame';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import {
  fetchAiInstallations,
  type AiInstallationItem,
  updateAiInstallation,
  updateAllAiInstallations,
} from '../../services/aiInstallations.service';
import { useRequireAuth } from '../../hooks/useAuthRedirect';
import { requireAuthSession } from '../../utils/authSession';
import { extractErrorMessage } from '../../utils/error';

type InstanceSummary = {
  instance: string;
  count: number;
  outdatedCount: number;
  latestUpdatedAt: string;
};

type UpdateModalState =
  | { mode: 'single'; item: AiInstallationItem }
  | { mode: 'bulk'; instance: string | null }
  | null;

function buildInstancesSummary(rows: AiInstallationItem[]) {
  const map = new Map<string, InstanceSummary>();

  for (const item of rows) {
    const current = map.get(item.instance);
    if (!current) {
      map.set(item.instance, {
        instance: item.instance,
        count: 1,
        outdatedCount: item.updateAvailable ? 1 : 0,
        latestUpdatedAt: item.updatedAt,
      });
      continue;
    }

    current.count += 1;
    if (item.updateAvailable) {
      current.outdatedCount += 1;
    }

    if (new Date(item.updatedAt).getTime() > new Date(current.latestUpdatedAt).getTime()) {
      current.latestUpdatedAt = item.updatedAt;
    }
  }

  return Array.from(map.values()).sort((a, b) => a.instance.localeCompare(b.instance));
}

function providerLabel(provider: string) {
  const normalized = provider.trim().toLowerCase();

  if (normalized === 'alpha7') return 'Alpha 7';
  if (normalized === 'trier') return 'Trier';
  if (normalized === 'vannon') return 'Vannon';
  if (normalized === 'vetor') return 'Vetor';
  if (normalized === 'atendimento') return 'Atendimento';
  if (normalized === 'legacy') return 'Legado';
  return provider || 'Sem provider';
}

function isProviderUpdateBlocked(provider: string) {
  return provider.trim().toLowerCase() === 'atendimento';
}

function formatVersion(version: number | null) {
  return version === null ? '-' : `v${version}`;
}

export default function AiVersionsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AiInstallationItem[]>([]);
  const [instances, setInstances] = useState<InstanceSummary[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flashMessage, setFlashMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AiInstallationItem | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [updateModal, setUpdateModal] = useState<UpdateModalState>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  useRequireAuth();
  useBodyScrollLock(Boolean(updateModal));

  const loadInstances = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelected(null);

    try {
      const data = await fetchAiInstallations({ limit: 5000 });
      setItems([]);
      setInstances(buildInstancesSummary(data));
      setSelectedInstance('');
    } catch (requestError) {
      console.error(requestError);
      setError(
        extractErrorMessage(requestError, 'Falha ao carregar as instalacoes de IA.'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInstanceInstallations = useCallback(async (instance: string) => {
    setLoading(true);
    setError('');
    setSelected(null);

    try {
      const data = await fetchAiInstallations({
        limit: 5000,
        instance,
      });
      setItems(data);
      setSelectedInstance(instance);
    } catch (requestError) {
      console.error(requestError);
      setError(
        extractErrorMessage(
          requestError,
          'Falha ao carregar as instalacoes da instancia selecionada.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInstances();
  }, [loadInstances]);

  useEffect(() => {
    if (!flashMessage) return undefined;

    const timeout = window.setTimeout(() => setFlashMessage(''), 5000);
    return () => window.clearTimeout(timeout);
  }, [flashMessage]);

  const filteredInstances = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return instances;

    return instances.filter((item) => item.instance.toLowerCase().includes(term));
  }, [instances, search]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      const haystack = [
        item.instance,
        item.assistantName || '',
        item.assistantId || '',
        item.provider,
        item.source,
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

  async function executeSingleUpdate(item: AiInstallationItem, code: string) {
    const session = requireAuthSession();
    setUpdatingId(item.id);
    setError('');

    try {
      const result = await updateAiInstallation({
        id: item.id,
        username: session.authUsername,
        password: session.authPassword,
        code,
      });

      setFlashMessage(result.message || 'Atualizacao concluida.');

      if (selectedInstance) {
        await loadInstanceInstallations(selectedInstance);
      } else {
        await loadInstances();
      }
    } catch (requestError) {
      console.error(requestError);
      setError(
        extractErrorMessage(requestError, 'Falha ao atualizar a instalacao.'),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function executeBulkUpdate(code: string) {
    const session = requireAuthSession();
    setBulkUpdating(true);
    setError('');

    try {
      const result = await updateAllAiInstallations({
        username: session.authUsername,
        password: session.authPassword,
        code,
        instance: selectedInstance || undefined,
      });

      setFlashMessage(
        result.failed > 0
          ? `Atualizacao concluida com ${result.failed} falha(s).`
          : result.updated > 0
            ? `${result.updated} instalacao(oes) atualizada(s) com sucesso.`
            : 'Nenhuma instalacao precisava de atualizacao.',
      );

      if (selectedInstance) {
        await loadInstanceInstallations(selectedInstance);
      } else {
        await loadInstances();
      }
    } catch (requestError) {
      console.error(requestError);
      setError(
        extractErrorMessage(
          requestError,
          'Falha ao atualizar as instalacoes em lote.',
        ),
      );
    } finally {
      setBulkUpdating(false);
    }
  }

  function handleSingleUpdate(item: AiInstallationItem) {
    if (!item.canUpdate || updatingId !== null || bulkUpdating) {
      return;
    }

    setTwoFactorCode('');
    setUpdateModal({ mode: 'single', item });
  }

  function handleUpdateAll() {
    if (bulkUpdating) return;

    setTwoFactorCode('');
    setUpdateModal({ mode: 'bulk', instance: selectedInstance || null });
  }

  async function handleConfirmUpdateModal() {
    const code = twoFactorCode.trim();
    if (!code || !updateModal) {
      return;
    }

    const currentModal = updateModal;
    setUpdateModal(null);

    if (currentModal.mode === 'single') {
      await executeSingleUpdate(currentModal.item, code);
      return;
    }

    await executeBulkUpdate(code);
  }

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
                Voltar para criacao de IAs
              </button>

              <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                <Brain className="h-7 w-7 text-violet-600" />
                IAs Instaladas por Cliente
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Visualize versao instalada, versao atual do provider, IDs salvos e execute atualizacao por instalacao ou em lote.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedInstance ? (
                <button
                  onClick={() => loadInstances()}
                  disabled={loading || bulkUpdating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para clientes
                </button>
              ) : null}

              <button
                onClick={handleUpdateAll}
                disabled={loading || bulkUpdating}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Wrench className={`h-4 w-4 ${bulkUpdating ? 'animate-spin' : ''}`} />
                {selectedInstance ? 'Atualizar instancia' : 'Atualizar todas'}
              </button>

              <button
                onClick={() => (selectedInstance ? loadInstanceInstallations(selectedInstance) : loadInstances())}
                disabled={loading || bulkUpdating}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                selectedInstance
                  ? 'Buscar por IA, provider ou ID...'
                  : 'Buscar cliente por instancia...'
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-200"
            />
          </div>
        </header>

        {flashMessage ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {flashMessage}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!selectedInstance ? (
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
              Clientes encontrados: {filteredInstances.length}
            </div>

            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Instancia</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Desatualizadas</th>
                    <th className="px-4 py-3 font-semibold">Ultima sincronizacao</th>
                    <th className="px-4 py-3 font-semibold text-right">Acao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!loading && filteredInstances.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        Nenhum cliente encontrado.
                      </td>
                    </tr>
                  ) : null}

                  {filteredInstances.map((item) => (
                    <tr key={item.instance} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 align-top">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                          <Server className="h-3.5 w-3.5" />
                          <span className="max-w-[480px] truncate">{item.instance}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="inline-flex rounded-md bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">
                          {item.count} IA(s)
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                            item.outdatedCount > 0
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {item.outdatedCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(item.latestUpdatedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <button
                          onClick={() => loadInstanceInstallations(item.instance)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                        >
                          Entrar
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
                Instancia selecionada: {selectedInstance} | Instalacoes encontradas: {filteredItems.length}
              </div>

              <div className="max-h-[68vh] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">IA</th>
                      <th className="px-4 py-3 font-semibold">Provider</th>
                      <th className="px-4 py-3 font-semibold">Versoes</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!loading && filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          Nenhuma instalacao encontrada nesta instancia.
                        </td>
                      </tr>
                    ) : null}

                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors hover:bg-slate-50 ${
                          selected?.id === item.id ? 'bg-violet-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-slate-800">
                            {item.assistantName || 'Sem nome'}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            ID IA: {item.assistantId || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                            {providerLabel(item.provider)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-xs text-slate-600">
                          <div>Instalada: {formatVersion(item.installedVersion)}</div>
                          <div>Atual: {formatVersion(item.currentVersion)}</div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                                item.updateAvailable
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {item.updateAvailable ? (
                                <AlertTriangle className="h-3.5 w-3.5" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              {item.updateAvailable ? 'Desatualizada' : 'Atualizada'}
                            </span>
                            <span
                              className={`inline-flex w-fit rounded-md px-2 py-1 text-xs font-semibold ${
                                item.canUpdate
                                  ? 'bg-blue-50 text-blue-700'
                                  : isProviderUpdateBlocked(item.provider)
                                    ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.canUpdate
                                ? 'Pronta para update'
                                : isProviderUpdateBlocked(item.provider)
                                  ? 'Update bloqueado'
                                  : 'Cadastro incompleto'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelected(item)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                            >
                              <Database className="h-3.5 w-3.5" />
                              Detalhes
                            </button>
                            <button
                              onClick={() => void handleSingleUpdate(item)}
                              disabled={!item.canUpdate || updatingId === item.id || bulkUpdating}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <RefreshCw
                                className={`h-3.5 w-3.5 ${
                                  updatingId === item.id ? 'animate-spin' : ''
                                }`}
                              />
                              Atualizar
                            </button>
                          </div>
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
                  <Database className="h-4 w-4 text-violet-600" />
                  <h2 className="text-sm font-semibold text-slate-800">Detalhes da instalacao</h2>
                </div>
              </div>

              {selected ? (
                <div className="space-y-4 p-5">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700">
                    <div>
                      <strong>IA:</strong> {selected.assistantName || 'Sem nome'}
                    </div>
                    <div>
                      <strong>Provider:</strong> {providerLabel(selected.provider)}
                    </div>
                    <div>
                      <strong>Instancia:</strong> {selected.instance}
                    </div>
                    <div>
                      <strong>Versao instalada:</strong> {formatVersion(selected.installedVersion)}
                    </div>
                    <div>
                      <strong>Versao atual:</strong> {formatVersion(selected.currentVersion)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
                    <div><strong>Assistant ID:</strong> {selected.assistantId || '-'}</div>
                    <div><strong>Pre processamento:</strong> {selected.preProcessId || '-'}</div>
                    <div><strong>Busca produtos:</strong> {selected.buscaProdutosId || '-'}</div>
                    <div><strong>Download imagem:</strong> {selected.downloadImagemId || '-'}</div>
                    <div><strong>URA IA:</strong> {selected.uraIaId || '-'}</div>
                    <div><strong>URA AB:</strong> {selected.uraAbId || '-'}</div>
                    <div><strong>Status:</strong> {selected.lastSyncStatus || '-'}</div>
                    <div><strong>Origem:</strong> {selected.source || '-'}</div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Configuracao salva
                    </h3>
                    <pre
                      className="w-full max-w-full min-w-0 max-h-[28vh] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                      style={{ tabSize: 2 }}
                    >
                      {JSON.stringify(selected.configSnapshot ?? {}, null, 2)}
                    </pre>
                  </div>

                  {selected.lastSyncError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      <strong>Ultimo erro:</strong> {selected.lastSyncError}
                    </div>
                  ) : null}

                  {isProviderUpdateBlocked(selected.provider) ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      <strong>Observacao:</strong> IAs de atendimento personalizadas nao entram no fluxo de atualizacao automatica.
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="p-6 text-sm text-slate-500">
                  Selecione um registro para visualizar os IDs e a configuracao armazenada.
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      {updateModal ? (
        <ModalFrame
          onClose={() => {
            if (updatingId === null && !bulkUpdating) {
              setUpdateModal(null);
              setTwoFactorCode('');
            }
          }}
          maxWidthClassName="max-w-md"
          bodyClassName="bg-white p-0"
          header={
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {updateModal.mode === 'single'
                    ? 'Atualizar instalacao'
                    : 'Atualizar instalacoes'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Informe o codigo 2FA para continuar.
                </p>
              </div>
              <button
                onClick={() => {
                  if (updatingId === null && !bulkUpdating) {
                    setUpdateModal(null);
                    setTwoFactorCode('');
                  }
                }}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                X
              </button>
            </div>
          }
        >
          <div className="space-y-5 p-6">
            <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-900">
              {updateModal.mode === 'single' ? (
                <>
                  Atualizar <strong>{updateModal.item.assistantName || updateModal.item.assistantId}</strong> na instancia{' '}
                  <strong>{updateModal.item.instance}</strong>.
                </>
              ) : updateModal.instance ? (
                <>
                  Atualizar todas as instalacoes da instancia <strong>{updateModal.instance}</strong>.
                </>
              ) : (
                <>Atualizar todas as instalacoes gerenciadas.</>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Codigo 2FA
              </label>
              <input
                type="text"
                autoFocus
                value={twoFactorCode}
                onChange={(event) => setTwoFactorCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && twoFactorCode.trim()) {
                    event.preventDefault();
                    void handleConfirmUpdateModal();
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-200"
                placeholder="Digite o 2FA"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (updatingId === null && !bulkUpdating) {
                    setUpdateModal(null);
                    setTwoFactorCode('');
                  }
                }}
                disabled={updatingId !== null || bulkUpdating}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmUpdateModal()}
                disabled={!twoFactorCode.trim() || updatingId !== null || bulkUpdating}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    updatingId !== null || bulkUpdating ? 'animate-spin' : ''
                  }`}
                />
                Confirmar
              </button>
            </div>
          </div>
        </ModalFrame>
      ) : null}
    </div>
  );
}
