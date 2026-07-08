import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import {
  createClient,
  type Client,
  type ClientProvider,
} from '../../services/clients.service';
import { extractErrorMessage } from '../../utils/error';

const INITIAL_FORM = {
  name: '',
  businessUnit: '',
  cnpj: '',
  provider: 'api' as ClientProvider,
  instance: '',
  credential: '',
  alpha7Port: '5432',
  alpha7Database: '',
  alpha7User: '',
  alpha7Schema: 'public',
};

const DEFAULT_TRIER_API_URL =
  'https://api-sgf-gateway.triersistemas.com.br/sgfpod1/rest/integracao/produto/obter-todos-v1';

const INSTANCE_LABEL: Record<ClientProvider, string> = {
  api: 'URL da API',
  file: 'Caminho do arquivo no servidor',
  alpha7: 'Host Alpha 7',
};

const INSTANCE_PLACEHOLDER: Record<ClientProvider, string> = {
  api: 'https://api-sgf-gateway.triersistemas.com.br/...',
  file: 'C:\\dados\\catalogo.json',
  alpha7: '145.223.x.x',
};

const CREDENTIAL_LABEL: Record<ClientProvider, string> = {
  api: 'Token da API',
  file: 'Nao se aplica',
  alpha7: 'Senha do banco',
};

export default function ClientFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (client: Client) => void;
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedTrierConfig, setShowAdvancedTrierConfig] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleChange<K extends keyof typeof INITIAL_FORM>(key: K, value: (typeof INITIAL_FORM)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const created = await createClient({
        name: form.name,
        businessUnit: form.businessUnit || undefined,
        cnpj: form.cnpj || undefined,
        provider: form.provider,
        instance:
          form.provider === 'api'
            ? form.instance.trim() || DEFAULT_TRIER_API_URL
            : form.instance,
        credential: form.credential || undefined,
        alpha7Port: form.provider === 'alpha7' ? Number(form.alpha7Port) : undefined,
        alpha7Database: form.provider === 'alpha7' ? form.alpha7Database : undefined,
        alpha7User: form.provider === 'alpha7' ? form.alpha7User : undefined,
        alpha7Schema: form.provider === 'alpha7' ? form.alpha7Schema : undefined,
      });
      onCreated(created);
    } catch (caught) {
      setError(extractErrorMessage(caught, 'Erro ao criar cliente.'));
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
        className="custom-scrollbar max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-background p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Novo cliente</h2>
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
              name="client_name"
              autoComplete="organization"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className={inputClass}
              placeholder="Ex: Farmacia Centro"
              required
              autoFocus
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Unidade de negocio</label>
              <input
                type="text"
                name="business_unit"
                autoComplete="off"
                value={form.businessUnit}
                onChange={(event) => handleChange('businessUnit', event.target.value)}
                className={inputClass}
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className={labelClass}>CNPJ</label>
              <input
                type="text"
                name="client_cnpj"
                autoComplete="off"
                value={form.cnpj}
                onChange={(event) => handleChange('cnpj', event.target.value)}
                className={inputClass}
                placeholder="Opcional"
              />
            </div>
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
                  onClick={() => handleChange('provider', value)}
                  className={`rounded-md px-2 py-2 text-xs font-semibold transition-colors ${
                    form.provider === value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-foreground/55 hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.provider === 'api' ? (
            <div className="space-y-3 rounded-lg border border-border bg-foreground/[0.015] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-foreground/75">
                    URL Trier padrao automatica
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-foreground/50">
                    O sistema usa a URL padrao da Trier. Abra a configuracao avancada
                    apenas se esse cliente usar outro `sgfpod`.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setShowAdvancedTrierConfig((current) => !current)
                  }
                  className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold text-foreground/65 transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
                >
                  {showAdvancedTrierConfig ? 'Ocultar' : 'Configurar'}
                </button>
              </div>

              {showAdvancedTrierConfig ? (
                <div>
                  <label className={labelClass}>URL da API Trier</label>
                  <input
                    type="text"
                    name="source_instance"
                    autoComplete="off"
                    value={form.instance}
                    onChange={(event) => handleChange('instance', event.target.value)}
                    className={inputClass}
                    placeholder={DEFAULT_TRIER_API_URL}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {form.provider !== 'api' ? (
            <div>
              <label className={labelClass}>{INSTANCE_LABEL[form.provider]}</label>
              <input
                type="text"
                name={form.provider === 'alpha7' ? 'alpha7_host' : 'source_instance'}
                autoComplete="off"
                value={form.instance}
                onChange={(event) => handleChange('instance', event.target.value)}
                className={inputClass}
                placeholder={INSTANCE_PLACEHOLDER[form.provider]}
                required
              />
            </div>
          ) : null}

          {form.provider !== 'file' ? (
            <div>
              <label className={labelClass}>{CREDENTIAL_LABEL[form.provider]}</label>
              <input
                type="password"
                name={form.provider === 'api' ? 'api_token' : 'alpha7_password'}
                autoComplete="new-password"
                value={form.credential}
                onChange={(event) => handleChange('credential', event.target.value)}
                className={inputClass}
              />
            </div>
          ) : null}

          {form.provider === 'alpha7' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Porta</label>
                <input
                  type="text"
                  name="alpha7_port"
                  autoComplete="off"
                  value={form.alpha7Port}
                  onChange={(event) => handleChange('alpha7Port', event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Database</label>
                <input
                  type="text"
                  name="alpha7_database"
                  autoComplete="off"
                  value={form.alpha7Database}
                  onChange={(event) => handleChange('alpha7Database', event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Usuario</label>
                <input
                  type="text"
                  name="alpha7_user"
                  autoComplete="username"
                  value={form.alpha7User}
                  onChange={(event) => handleChange('alpha7User', event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Schema</label>
                <input
                  type="text"
                  name="alpha7_schema"
                  autoComplete="off"
                  value={form.alpha7Schema}
                  onChange={(event) => handleChange('alpha7Schema', event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/[0.03]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Criar cliente
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
