/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/TemplateForm.tsx

interface Field {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  width?: 'full' | 'half';
}

interface TemplateData {
  name: string;
  file?: string;
  fields?: Field[];
  context?: string;
  contextMode?: 'editable' | 'hidden';
  contextLabel?: string;
  contextPlaceholder?: string;
  [key: string]: any;
}

interface Props {
  template?: TemplateData;
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  isIaSetup?: boolean;
  onPressEnter?: () => void;
  repeatInstallMode?: boolean;
  onRepeatInstallModeChange?: (enabled: boolean) => void;
  customIntegrationName?: string;
  onCustomIntegrationNameChange?: (value: string) => void;
}

export function TemplateForm({
  template,
  formData,
  setFormData,
  isIaSetup = false,
  onPressEnter,
  repeatInstallMode = false,
  onRepeatInstallModeChange,
  customIntegrationName = '',
  onCustomIntegrationNameChange,
}: Props) {
  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onPressEnter) {
      e.preventDefault();
      onPressEnter();
    }
  };

  const showIaContextField = isIaSetup && template?.contextMode !== 'hidden';
  const iaInputClassName =
    'w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500';

  if (isIaSetup) {
    return (
      <form className="mb-2 h-full">
        <div
          className={
            showIaContextField
              ? 'grid h-full grid-cols-1 gap-6 lg:grid-cols-2'
              : 'h-full'
          }
        >
          <div
            className={`custom-scrollbar max-h-[60vh] overflow-y-auto ${
              showIaContextField ? 'space-y-4 pr-2 lg:max-h-none' : 'space-y-6 pr-1'
            }`}
          >
            <div className="px-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Basico
              </label>
              <div
                className={
                  showIaContextField ? 'space-y-3' : 'grid gap-3 sm:grid-cols-2'
                }
              >
                <div>
                  <input
                    type="text"
                    className={iaInputClassName}
                    placeholder="Nome da IA"
                    value={formData['name'] || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className={iaInputClassName}
                    placeholder="URL da Instancia"
                    value={formData['instance'] || ''}
                    onChange={(e) => handleChange('instance', e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>

            {template?.fields && template.fields.length > 0 ? (
              <div className="px-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Configuracoes Especificas
                </label>

                <div
                  className={
                    showIaContextField
                      ? 'flex flex-wrap gap-3'
                      : 'grid gap-3 sm:grid-cols-2'
                  }
                >
                  {template.fields.map((field) => (
                    <div
                      key={field.key}
                      className={
                        showIaContextField
                          ? field.width === 'half'
                            ? 'w-[calc(50%-6px)]'
                            : 'w-full'
                          : field.width === 'half'
                            ? 'sm:col-span-1'
                            : 'sm:col-span-2'
                      }
                    >
                      <label className="ml-1 mb-1 block text-[10px] font-bold uppercase text-slate-400">
                        {field.label}
                      </label>
                      <input
                        type={field.type || 'text'}
                        className={iaInputClassName}
                        placeholder={field.placeholder}
                        value={formData[field.key] || ''}
                        onChange={(e) =>
                          handleChange(field.key, e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="px-1 pb-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Seguranca
              </label>
              <div className={showIaContextField ? '' : 'grid gap-3 sm:grid-cols-2'}>
                <input
                  type="text"
                  className={`${iaInputClassName} ${
                    showIaContextField ? '' : 'sm:col-span-2'
                  }`}
                  placeholder="Codigo 2FA / Validacao"
                  value={formData['code'] || ''}
                  onChange={(e) => handleChange('code', e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          </div>

          {showIaContextField ? (
            <div className="flex h-full min-h-[300px] flex-col">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {template?.contextLabel || 'Prompt do Sistema (Contexto)'}
              </label>
              <textarea
                className="custom-scrollbar flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed outline-none shadow-inner focus:ring-2 focus:ring-violet-500"
                placeholder={
                  template?.contextPlaceholder || 'Digite o prompt do sistema...'
                }
                value={formData['context'] || ''}
                onChange={(e) => handleChange('context', e.target.value)}
              />
            </div>
          ) : null}
        </div>
      </form>
    );
  }

  return (
    <form className="mb-6 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Instancia
        </label>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 outline-none transition-colors focus:ring-2 focus:ring-blue-500"
          placeholder="https://sua-instancia.com"
          value={formData['instanceURL'] || ''}
          onChange={(e) => handleChange('instanceURL', e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {template?.fields?.map((field) => (
        <div key={field.key}>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 outline-none transition-colors focus:ring-2 focus:ring-blue-500"
            value={formData[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      ))}

      <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
            checked={repeatInstallMode}
            onChange={(e) => onRepeatInstallModeChange?.(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold text-blue-900">
              Vou instalar mais de uma desta integracao
            </span>
            <span className="mt-1 block text-xs leading-5 text-blue-800">
              Ative para dar um nome unico a cada copia e continuar a
              instalacao sem fechar esta janela.
            </span>
          </span>
        </label>

        {repeatInstallMode ? (
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nome desta instalacao
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white p-2 outline-none transition-colors focus:ring-2 focus:ring-blue-500"
              placeholder="Ex.: Ifood - Loja Centro"
              value={customIntegrationName}
              onChange={(e) =>
                onCustomIntegrationNameChange?.(e.target.value)
              }
              onKeyDown={handleKeyDown}
            />
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Codigo de 2FA
        </label>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 outline-none transition-colors focus:ring-2 focus:ring-blue-500"
          placeholder="959752"
          value={formData['code'] || ''}
          onChange={(e) => handleChange('code', e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </form>
  );
}
