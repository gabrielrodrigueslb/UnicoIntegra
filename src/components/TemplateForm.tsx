interface Field {
  label: string;
  key: string;
}

interface Props {
  template?: { name: string; file: string; fields: Field[] };
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  isIaSetup?: boolean;
}

export function TemplateForm({
  template,
  formData,
  setFormData,
  isIaSetup = false,
}: Props) {
  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  // -----------------------------------------------------------------------
  // MODO 1: CONFIGURAÇÃO DE IA (Layout Duas Colunas Otimizado)
  // -----------------------------------------------------------------------
  if (isIaSetup) {
    return (
      <form className="mb-2 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          
          {/* COLUNA ESQUERDA: Configurações Técnicas */}
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[60vh] lg:max-h-none">
            
            {/* Bloco 1: Identidade */}
            <div className="mx-1">
              <label className="block font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">
                Nome
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-sm"
                placeholder="Nome da sua IA (Ex: Atendente Nível 1)"
                value={formData['name'] || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            {/* Bloco 2: Conexão */}
            <div className="mx-1">
              <label className="block font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">
                Conexão
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-sm mb-3"
                placeholder="URL da Instância"
                value={formData['instance'] || ''}
                onChange={(e) => handleChange('instance', e.target.value)}
              />
              <input
                type="password"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-sm"
                placeholder="API Key"
                value={formData['apiKey'] || ''}
                onChange={(e) => handleChange('apiKey', e.target.value)}
              />
            </div>

            {/* Bloco 3: Dados Específicos (Grid interno) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="mx-1">
                <label className="block font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Database
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                  placeholder="Nome do DB"
                  value={formData['dbName'] || ''}
                  onChange={(e) => handleChange('dbName', e.target.value)}
                />
              </div>

              <div className="mx-1">
                <label className="block font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Fila (ID)
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                  placeholder="Ex: 11"
                  value={formData['queueId'] || ''}
                  onChange={(e) => handleChange('queueId', e.target.value)}
                />
              </div>
            </div>

            {/* Bloco 4: Segurança */}
            <div className="mx-1 mb-1">
              <label className="block font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">
                Segurança
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                placeholder="Código 2FA / Validação"
                value={formData['code'] || ''}
                onChange={(e) => handleChange('code', e.target.value)}
              />
            </div>
          </div>

          {/* COLUNA DIREITA: Contexto (Full Height) */}
          <div className="flex flex-col h-full min-h-[300px] mr-1 ">
            <div className="flex justify-between items-end mb-2">
              <label className="block font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Prompt do Sistema (Contexto)
              </label>
            </div>
            
            <textarea
              className="flex-1 w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none text-sm leading-relaxed custom-scrollbar shadow-inner scrollbar-clean"
              placeholder="Digite aqui como a IA deve se comportar, o que ela pode ou não fazer..."
              value={formData['context'] || ''}
              onChange={(e) => handleChange('context', e.target.value)}
            />
          </div>

        </div>
      </form>
    );
  }

  // -----------------------------------------------------------------------
  // MODO 2: PADRÃO (Integrações Normais)
  // -----------------------------------------------------------------------
  return (
    <form className="space-y-4 mb-6">
      <div>
        <label className="block font-medium text-sm text-gray-700 mb-1">
          Instância
        </label>
        <input
          type="text"
          className="bg-gray-100 border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          placeholder="https://sua-instancia.com"
          value={formData['instanceURL'] || ''}
          onChange={(e) => handleChange('instanceURL', e.target.value)}
        />
      </div>

      {template?.fields?.map((field) => (
        <div key={field.key}>
          <label className="block font-medium text-sm text-gray-700 mb-1">
            {field.label}
          </label>
          <input
            type="text"
            className="bg-gray-100 border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            value={formData[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
          />
        </div>
      ))}

      <div>
        <label className="block font-medium text-sm text-gray-700 mb-1">
          Código de 2FA
        </label>
        <input
          type="text"
          className="bg-gray-100 border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          placeholder="959752"
          value={formData['code'] || ''}
          onChange={(e) => handleChange('code', e.target.value)}
        />
      </div>
    </form>
  );
}