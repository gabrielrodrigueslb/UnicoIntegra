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
  [key: string]: any;
}

interface Props {
  template?: TemplateData;
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
  // MODO 1: CONFIGURAÇÃO DE IA (Data-Driven UI)
  // -----------------------------------------------------------------------
  if (isIaSetup) {
    return (
      <form className="mb-2 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          
          {/* COLUNA ESQUERDA: Configurações Técnicas */}
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[60vh] lg:max-h-none">
            
            {/* 1. Bloco Básico (Sempre existe) */}
            <div className="px-1 ">
              <label className="block font-semibold text-xs text-slate-500 uppercase tracking-wider mb-2">
                Básico
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                  placeholder="Nome da IA"
                  value={formData['name'] || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                  placeholder="URL da Instância"
                  value={formData['instance'] || ''}
                  onChange={(e) => handleChange('instance', e.target.value)}
                />
              </div>
            </div>

            {/* 2. Bloco Dinâmico (Renderizado baseado no JSON do template) */}
            {template?.fields && template.fields.length > 0 && (
              <div className="px-1 ">
                <label className="block font-semibold text-xs text-slate-500 uppercase tracking-wider mb-2">
                  Configurações Específicas
                </label>
                
                <div className="flex flex-wrap gap-3">
                  {template.fields.map((field) => (
                    <div 
                      key={field.key} 
                      className={`${field.width === 'half' ? 'w-[calc(50%-6px)]' : 'w-full'}`}
                    >
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase">
                        {field.label}
                      </label>
                      <input
                        type={field.type || 'text'}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                        placeholder={field.placeholder}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Bloco Segurança (Sempre existe) */}
            <div className="px-1 pb-1">
              <label className="block font-semibold text-xs text-slate-500 uppercase tracking-wider mb-2">
                Segurança
              </label>
              <input
                type="text"
                className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                placeholder="Código 2FA / Validação"
                value={formData['code'] || ''}
                onChange={(e) => handleChange('code', e.target.value)}
              />
            </div>
          </div>

          {/* COLUNA DIREITA: Contexto (Sempre existe) */}
          <div className="flex flex-col h-full min-h-[300px]">
             <label className="block font-semibold text-xs text-slate-500 uppercase tracking-wider mb-2">
                Prompt do Sistema (Contexto)
             </label>
             <textarea
              className="flex-1 w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none resize-none text-sm leading-relaxed custom-scrollbar shadow-inner"
              placeholder="Digite o prompt do sistema..."
              value={formData['context'] || ''}
              onChange={(e) => handleChange('context', e.target.value)}
            />
          </div>

        </div>
      </form>
    );
  }

  // -----------------------------------------------------------------------
  // MODO 2: PADRÃO (Integrações Legado - Mantido igual)
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