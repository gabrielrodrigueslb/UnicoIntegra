import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import {
  updateClient,
  type Client,
  type ClientProvider,
} from '../../../services/clients.service';
import { extractErrorMessage } from '../../../utils/error';

const INSTANCE_PLACEHOLDER: Record<ClientProvider, string> = {
  api: 'Ex: Drogaria Dom Bosco',
  file: 'C:\\dados\\catalogo.json',
  alpha7: '145.223.x.x',
};

const SOURCE_INSTANCE_LABEL: Record<ClientProvider, string> = {
  api: 'Instância do cliente',
  file: 'Caminho do arquivo no servidor',
  alpha7: 'Host Alpha 7',
};

const CREDENTIAL_LABEL: Record<ClientProvider, string> = {
  api: 'Token da API',
  file: 'Nao se aplica',
  alpha7: 'Senha do banco',
};

export default function EditClientModal({
  client,
  onClose,
  onUpdated,
}: {
  client: Client;
  onClose: () => void;
  onUpdated: (client: Client) => void;
}) {
  const [name, setName] = useState(client.name);
  const [businessUnit, setBusinessUnit] = useState(client.businessUnit || '');
  const [cnpj, setCnpj] = useState(client.cnpj || '');
  const [clientInstance, setClientInstance] = useState(client.clientInstance || '');
  const [provider, setProvider] = useState<ClientProvider>(client.provider);
  const [instance, setInstance] = useState(client.providerConfig || '');
  const [credential, setCredential] = useState('');
  const [alpha7Port, setAlpha7Port] = useState(String(client.alpha7Port || 5432));
  const [alpha7Database, setAlpha7Database] = useState(client.alpha7Database || '');
  const [alpha7User, setAlpha7User] = useState(client.alpha7User || '');
  const [alpha7Schema, setAlpha7Schema] = useState(client.alpha7Schema || 'public');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !submitting) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, submitting]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {};

      if (name !== client.name) payload.name = name;
      if (businessUnit !== (client.businessUnit || '')) payload.businessUnit = businessUnit || undefined;
      if (cnpj !== (client.cnpj || '')) payload.cnpj = cnpj || undefined;
      if (clientInstance !== (client.clientInstance || '')) payload.clientInstance = clientInstance;
      if (provider !== client.provider) payload.provider = provider;
      if (provider !== 'api' && instance !== client.providerConfig) {
        payload.instance = instance;
      }
      if (credential) payload.credential = credential;
      if (provider === 'alpha7') {
        if (Number(alpha7Port) !== (client.alpha7Port || 5432)) payload.alpha7Port = Number(alpha7Port);
        if (alpha7Database !== (client.alpha7Database || '')) payload.alpha7Database = alpha7Database;
        if (alpha7User !== (client.alpha7User || '')) payload.alpha7User = alpha7User;
        if (alpha7Schema !== (client.alpha7Schema || 'public')) payload.alpha7Schema = alpha7Schema;
      }

      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }

      const updated = await updateClient(client.id, payload);
      onUpdated(updated);
    } catch (caught) {
      setError(extractErrorMessage(caught, 'Erro ao atualizar cliente.'));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary';
  const labelClass = 'mb-1.5 block text-xs font-medium text-foreground/55';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="custom-scrollbar max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-background p-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Editar cliente</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/45 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="mt-4 space-y-4"
          autoComplete="off"
        >
          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-medium text-rose-800">
              {error}
            </div>
          ) : null}

          <div>
            <label className={labelClass}>Nome do cliente</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              required
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>CNPJ</label>
            <input
              type="text"
              value={cnpj}
              onChange={(event) => setCnpj(event.target.value)}
              className={inputClass}
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className={labelClass}>Unidade ou filial</label>
            <input
              type="text"
              value={businessUnit}
              onChange={(event) => setBusinessUnit(event.target.value)}
              className={inputClass}
              placeholder="Ex: Loja Centro"
            />
          </div>

          <div>
            <label className={labelClass}>Instância do cliente</label>
            <input
              type="text"
              value={clientInstance}
              onChange={(event) => setClientInstance(event.target.value)}
              className={inputClass}
              placeholder="Ex: Drogaria Dom Bosco"
              required
            />
            <p className="mt-1.5 text-[11px] leading-5 text-foreground/50">Identificação administrativa do cliente; não altera a integração selecionada.</p>
          </div>

          <div>
            <label className={labelClass}>Provedor</label>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-foreground/[0.04] p-1">
              {([
                ['api', 'API Trier'],
                ['file', 'Arquivo'],
                ['alpha7', 'Alpha 7'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setProvider(value);
                    if (value !== client.provider) setInstance('');
                  }}
                  className={`rounded-md px-2 py-2 text-xs font-semibold transition-colors ${
                    provider === value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-foreground/55 hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {provider !== 'api' ? (
            <div>
              <label className={labelClass}>{SOURCE_INSTANCE_LABEL[provider]}</label>
              <input
                type="text"
                value={instance}
                onChange={(event) => setInstance(event.target.value)}
                className={inputClass}
                placeholder={INSTANCE_PLACEHOLDER[provider]}
                required
              />
            </div>
          ) : null}

          {provider !== 'file' ? (
            <div>
              <label className={labelClass}>{CREDENTIAL_LABEL[provider]}</label>
              <input
                type="password"
                value={credential}
                onChange={(event) => setCredential(event.target.value)}
                className={inputClass}
                placeholder={client.hasCredential ? 'Deixe em branco para manter' : ''}
              />
            </div>
          ) : null}

          {provider === 'alpha7' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Porta</label>
                <input
                  type="text"
                  value={alpha7Port}
                  onChange={(event) => setAlpha7Port(event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Database</label>
                <input
                  type="text"
                  value={alpha7Database}
                  onChange={(event) => setAlpha7Database(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Usuario</label>
                <input
                  type="text"
                  value={alpha7User}
                  onChange={(event) => setAlpha7User(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Schema</label>
                <input
                  type="text"
                  value={alpha7Schema}
                  onChange={(event) => setAlpha7Schema(event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/[0.03] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
