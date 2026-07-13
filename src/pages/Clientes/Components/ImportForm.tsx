import { useState } from 'react';
import { Loader2, Play, Settings2 } from 'lucide-react';
import {
  createBancoUnicoImport,
  type CreateBancoUnicoImportPayload,
} from '../../../services/bancoUnicoImports.service';
import type { Client } from '../../../services/clients.service';
import { extractErrorMessage } from '../../../utils/error';

type ImportFormProps = {
  client: Client;
  onCreated: () => void;
  onError: (message: string) => void;
};

const INITIAL_FORM = {
  sourcePageSize: '999',
  bancoUnicoAuthorization: '',
  batchSize: '50',
  classifyConcurrency: '5',
  publishConcurrency: '1',
  existingCheckBatchSize: '100',
  existingCheckConcurrency: '2',
  mode: 'publish' as 'publish' | 'classify-only',
  disableNormalizeAi: false,
  disableAi: false,
  forceTaxonomyAi: false,
  ignoreExistingCheck: false,
  useAiNormalization: false,
  limit: '',
  limitNew: '',
  offset: '0',
};

export default function ImportForm({ client, onCreated, onError }: ImportFormProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleChange<K extends keyof typeof INITIAL_FORM>(
    key: K,
    value: (typeof INITIAL_FORM)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload: CreateBancoUnicoImportPayload = {
        clientId: client.id,
        sourcePageSize: Number(form.sourcePageSize),
        batchSize: Number(form.batchSize),
        classifyConcurrency: Number(form.classifyConcurrency),
        publishConcurrency: Number(form.publishConcurrency),
        existingCheckBatchSize: Number(form.existingCheckBatchSize),
        existingCheckConcurrency: Number(form.existingCheckConcurrency),
        mode: form.mode,
        disableNormalizeAi: form.disableNormalizeAi,
        disableAi: form.disableAi,
        forceTaxonomyAi: form.forceTaxonomyAi,
        ignoreExistingCheck: form.ignoreExistingCheck,
        useAiNormalization: form.useAiNormalization,
        limit: form.limit ? Number(form.limit) : undefined,
        limitNew: form.limitNew ? Number(form.limitNew) : undefined,
        offset: Number(form.offset),
      };

      if (form.bancoUnicoAuthorization) {
        payload.bancoUnicoAuthorization = form.bancoUnicoAuthorization;
      }

      await createBancoUnicoImport(payload);
      setForm(INITIAL_FORM);
      onCreated();
    } catch (error) {
      onError(extractErrorMessage(error, 'Erro ao iniciar importacao.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="rounded-lg border border-border bg-background p-5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Nova importacao</h3>
        <p className="mt-1 text-xs text-foreground/50">
          Origem: <span className="font-medium text-foreground/70">{client.provider}</span>
          {client.cnpj ? <> &middot; CNPJ: <span className="font-medium text-foreground/70">{client.cnpj}</span></> : null}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground/55">
            Authorization Banco Unico (opcional)
          </label>
          <input
            type="password"
            value={form.bancoUnicoAuthorization}
            onChange={(event) => handleChange('bancoUnicoAuthorization', event.target.value)}
            className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
            placeholder="Deixe em branco se a API nao exigir"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/55">
              Lote de publicacao
            </label>
            <input
              value={form.batchSize}
              onChange={(event) => handleChange('batchSize', event.target.value)}
              className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/55">
              Concorrencia classificacao
            </label>
            <input
              value={form.classifyConcurrency}
              onChange={(event) => handleChange('classifyConcurrency', event.target.value)}
              className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground/65">
            <input
              type="checkbox"
              className="accent-primary"
              checked={form.mode === 'classify-only'}
              onChange={(event) =>
                handleChange('mode', event.target.checked ? 'classify-only' : 'publish')
              }
            />
            Apenas classificar
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground/65">
            <input
              type="checkbox"
              className="accent-primary"
              checked={form.forceTaxonomyAi}
              onChange={(event) => handleChange('forceTaxonomyAi', event.target.checked)}
            />
            Forcar IA na arvore
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground/65">
            <input
              type="checkbox"
              className="accent-primary"
              checked={form.useAiNormalization}
              onChange={(event) => handleChange('useAiNormalization', event.target.checked)}
            />
            IA na normalizacao
          </label>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-medium text-foreground/45 transition-colors hover:text-foreground/70"
        >
          <Settings2 size={13} />
          {showAdvanced ? 'Ocultar' : 'Avancado'}
        </button>

        {showAdvanced ? (
          <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/55">
                Pagina origem
              </label>
              <input
                value={form.sourcePageSize}
                onChange={(event) => handleChange('sourcePageSize', event.target.value)}
                className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/55">
                Limite
              </label>
              <input
                value={form.limit}
                onChange={(event) => handleChange('limit', event.target.value)}
                placeholder="Todos"
                className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/55">
                Limite de novos
              </label>
              <input
                value={form.limitNew}
                onChange={(event) => handleChange('limitNew', event.target.value)}
                placeholder="Todos os faltantes"
                className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
              />
            </div>
            <label className="flex items-center gap-2 self-end pb-3 text-xs font-medium text-rose-700">
              <input
                type="checkbox"
                className="accent-rose-600"
                checked={form.ignoreExistingCheck}
                onChange={(event) => handleChange('ignoreExistingCheck', event.target.checked)}
              />
              Forçar reenvio de itens existentes
            </label>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/55">
                Offset
              </label>
              <input
                value={form.offset}
                onChange={(event) => handleChange('offset', event.target.value)}
                className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/55">
                Concorrencia publicacao
              </label>
              <input
                value={form.publishConcurrency}
                onChange={(event) => handleChange('publishConcurrency', event.target.value)}
                className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/55">
                Batch existentes
              </label>
              <input
                value={form.existingCheckBatchSize}
                onChange={(event) =>
                  handleChange('existingCheckBatchSize', event.target.value)
                }
                className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/55">
                Concorrencia existentes
              </label>
              <input
                value={form.existingCheckConcurrency}
                onChange={(event) =>
                  handleChange('existingCheckConcurrency', event.target.value)
                }
                className="w-full rounded-lg border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground/65">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={form.disableNormalizeAi}
                  onChange={(event) => handleChange('disableNormalizeAi', event.target.checked)}
                />
                Desabilitar IA normalizacao
              </label>
            </div>
            <div className="sm:col-span-3">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground/65">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={form.disableAi}
                  onChange={(event) => handleChange('disableAi', event.target.checked)}
                />
                Desabilitar toda IA
              </label>
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Iniciando...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Iniciar subida
            </>
          )}
        </button>
      </div>
    </form>
  );
}
