
interface Field {
  label: string;
  key: string;
}
interface Props {
  template: { name: string; file: string; fields: Field[] };
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
}

export function TemplateForm({ template, formData, setFormData }: Props) {
  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <form className="space-y-4 mb-6">
      {/* 1. Add the "Instância" input field before the map */}
      <div>
        <label className="block font-medium">Instância</label>
        <input
          type="text"
          className="border p-2 w-full"
          // 2. Use a unique key like 'instanceURL'
          value={formData['instanceURL'] || ''}
          // 3. Pass the unique key to the handleChange function
          onChange={(e) => handleChange('instanceURL', e.target.value)}
        />
      </div>

      {template.fields.map((field) => (
        <div key={field.key}>
          <label className="block font-medium">{field.label}</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={formData[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
          />
        </div>
      ))}
    </form>
  );
}