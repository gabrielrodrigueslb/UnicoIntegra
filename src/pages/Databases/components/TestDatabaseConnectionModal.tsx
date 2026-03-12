import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Loader2,
  LockKeyhole,
  Server,
  ShieldCheck,
  TimerReset,
  UserRound,
} from 'lucide-react';

import { ModalFrame } from '../../../components/ModalFrame';
import {
  testDatabaseConnection,
  type DatabaseConnectionResult,
} from '../../../services/database.service';
import { extractErrorMessage } from '../../../utils/error';

type ConnectionStatus = 'idle' | 'loading' | 'success' | 'error';

const INITIAL_FORM = {
  host: '',
  port: '5432',
  database: '',
  user: '',
  password: '',
  ssl: false,
};

interface TestDatabaseConnectionModalProps {
  onClose: () => void;
}

export function TestDatabaseConnectionModal({
  onClose,
}: TestDatabaseConnectionModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [result, setResult] = useState<DatabaseConnectionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const canSubmit = useMemo(() => {
    return Boolean(
      formData.host &&
        formData.port &&
        formData.database &&
        formData.user &&
        formData.password,
    );
  }, [formData]);

  function resetState() {
    setFormData(INITIAL_FORM);
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function updateField<K extends keyof typeof INITIAL_FORM>(
    field: K,
    value: (typeof INITIAL_FORM)[K],
  ) {
    setFormData((previous) => ({ ...previous, [field]: value }));

    if (status !== 'idle') {
      setStatus('idle');
      setResult(null);
      setErrorMessage('');
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setStatus('loading');
    setResult(null);
    setErrorMessage('');

    try {
      const response = await testDatabaseConnection({
        host: formData.host.trim(),
        port: Number(formData.port),
        database: formData.database.trim(),
        user: formData.user.trim(),
        password: formData.password,
        ssl: formData.ssl,
      });

      setResult(response);
      setStatus('success');
    } catch (error) {
      setErrorMessage(
        extractErrorMessage(error, 'Não foi possível testar a conexão.'),
      );
      setStatus('error');
    }
  }

  return (
    <ModalFrame
      title={
        <span className="flex items-center gap-2">
          <Server className="h-5 w-5 text-emerald-600" />
          Testar Conexão PostgreSQL
        </span>
      }
      onClose={handleClose}
      maxWidthClassName="max-w-3xl"
      bodyClassName="custom-scrollbar overflow-y-auto p-6"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
          As credenciais são usadas apenas nesta verificação e não são persistidas
          pela interface.
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_1fr_0.8fr]">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Host
              </label>
              <input
                type="text"
                placeholder="Ex: 127.0.0.1 ou db.cliente.com"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                value={formData.host}
                onChange={(event) => updateField('host', event.target.value)}
                disabled={status === 'loading'}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Banco
              </label>
              <input
                type="text"
                placeholder="Ex: cliente_loja"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                value={formData.database}
                onChange={(event) => updateField('database', event.target.value)}
                disabled={status === 'loading'}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Porta
              </label>
              <input
                type="number"
                min={1}
                max={65535}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                value={formData.port}
                onChange={(event) => updateField('port', event.target.value)}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Usuário
              </label>
              <input
                type="text"
                autoComplete="username"
                placeholder="Ex: postgres"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                value={formData.user}
                onChange={(event) => updateField('user', event.target.value)}
                disabled={status === 'loading'}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Senha do banco"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                value={formData.password}
                onChange={(event) => updateField('password', event.target.value)}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={formData.ssl}
              onChange={(event) => updateField('ssl', event.target.checked)}
              disabled={status === 'loading'}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            Usar SSL/TLS na conexão
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={status === 'loading'}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || status === 'loading'}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : status === 'success' ? (
                'Testar novamente'
              ) : (
                'Testar conexão'
              )}
            </button>
          </div>
        </form>

        {status === 'loading' ? (
          <div className="animate-in fade-in rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Validando acesso ao servidor...
                </p>
                <p className="text-sm text-slate-500">
                  Estamos abrindo uma conexão segura e executando uma verificação
                  simples no PostgreSQL.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {status === 'success' && result ? (
          <div className="animate-in fade-in rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-900">
                  Conexão confirmada
                </h3>
                <p className="mt-1 text-sm text-emerald-800">
                  {result.message}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-xl border border-emerald-100 bg-white p-3 text-sm text-slate-700">
                    <div className="mb-1 flex items-center gap-2 text-slate-500">
                      <Server className="h-4 w-4" />
                      Servidor
                    </div>
                    <div className="font-semibold">
                      {result.details.host}:{result.details.port}
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-white p-3 text-sm text-slate-700">
                    <div className="mb-1 flex items-center gap-2 text-slate-500">
                      <Database className="h-4 w-4" />
                      Database
                    </div>
                    <div className="font-semibold">{result.details.database}</div>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-white p-3 text-sm text-slate-700">
                    <div className="mb-1 flex items-center gap-2 text-slate-500">
                      <UserRound className="h-4 w-4" />
                      Usuário
                    </div>
                    <div className="font-semibold">{result.details.user}</div>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-white p-3 text-sm text-slate-700">
                    <div className="mb-1 flex items-center gap-2 text-slate-500">
                      <ShieldCheck className="h-4 w-4" />
                      SSL/TLS
                    </div>
                    <div className="font-semibold">
                      {result.details.ssl ? 'Ativado' : 'Desativado'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-white p-3 text-sm text-slate-700">
                    <div className="mb-1 flex items-center gap-2 text-slate-500">
                      <TimerReset className="h-4 w-4" />
                      Latência
                    </div>
                    <div className="font-semibold">{result.latencyMs} ms</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="animate-in fade-in rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-600 shadow-sm">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900">
                  Não foi possível conectar
                </h3>
                <p className="mt-1 text-sm text-red-800">{errorMessage}</p>
                <div className="mt-4 rounded-xl border border-red-100 bg-white p-3 text-sm text-slate-600">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                    <LockKeyhole className="h-4 w-4 text-red-500" />
                    Antes de tentar novamente
                  </div>
                  <ul className="space-y-1">
                    <li>Confirme host, porta, usuário e senha.</li>
                    <li>Verifique se o servidor aceita conexões remotas.</li>
                    <li>Se o ambiente exigir TLS, ative o SSL/TLS acima.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ModalFrame>
  );
}
