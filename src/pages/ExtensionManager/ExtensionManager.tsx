/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  Settings,
  Plus,
  Trash2,
  Copy,
  Shield,
  Loader2,
  Globe,
  Database,
  LayoutGrid,
  List as ListIcon,
  Search,
  Filter,
  AlertTriangle,
  X,
  ChevronDown,
  Check,
  Monitor,      
  MonitorX,     
  Unplug,       
} from 'lucide-react';
import {
  createInstance,
  createConfig,
  createLicense,
  listLicenses,
  listInstances,
  listConfigs,
  toggleLicense,
  deleteLicense,
  unbindLicense,
  type LicenseData,
  type InstanceData,
  type ConfigData
} from '../../services/extension.service';

// --- COMPONENTE TOGGLE (IPHONE STYLE) ---
function ToggleSwitch({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// --- COMPONENTE TOAST (FEEDBACK RÁPIDO) ---
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-top-2 fade-in">
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
    </div>
  );
}

// --- COMPONENTE SELECT PESQUISÁVEL ---
interface Option {
  value: string | number;
  label: string;
  subLabel?: string;
}

function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Selecione..." 
}: { 
  options: Option[]; 
  value: string | number; 
  onChange: (val: string | number) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) || 
    (opt.subLabel && opt.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl flex items-center justify-between cursor-pointer hover:border-violet-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate text-sm ${selectedOption ? 'text-slate-800' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text"
                autoFocus
                className="w-full p-2 text-sm outline-none"
                placeholder="Pesquisar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.value}
                  className={`p-3 text-sm cursor-pointer hover:bg-violet-50 transition-colors flex items-center justify-between ${
                    opt.value === value ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-700'
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    {opt.subLabel && <span className="text-xs text-gray-400">{opt.subLabel}</span>}
                  </div>
                  {opt.value === value && <Check className="w-4 h-4 text-violet-600" />}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-gray-400">Nenhum resultado encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- TIPO PARA O MODAL DE CONFIRMAÇÃO ---
interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function ExtensionManager() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'licenses' | 'new-instance' | 'new-config' | 'new-license'>('licenses');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [licenses, setLicenses] = useState<LicenseData[]>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<LicenseData[]>([]);
  
  const [instancesList, setInstancesList] = useState<InstanceData[]>([]);
  const [configsList, setConfigsList] = useState<ConfigData[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [formDataInstance, setFormDataInstance] = useState({ client_name: '', instance_Url: '' });
  const [formDataConfig, setFormDataConfig] = useState({ config_name: '', instance_url: '', dbName: '', clientToken: '' });
  const [formDataLicense, setFormDataLicense] = useState({ instance_url: '', config_id: '' });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) navigate('/');
    
    if (activeTab === 'licenses') fetchLicenses();
    if (activeTab === 'new-config' || activeTab === 'new-license') loadAuxiliaryData();

  }, [navigate, activeTab]);

  useEffect(() => {
    let result = licenses;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.configs?.instancias?.client_name.toLowerCase().includes(lowerTerm) ||
        l.configs?.instancias?.instance_url.toLowerCase().includes(lowerTerm) ||
        l.configs?.config_data?.dbName.toLowerCase().includes(lowerTerm)
      );
    }
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      result = result.filter(l => !!l.is_active === isActive);
    }
    setFilteredLicenses(result);
  }, [licenses, searchTerm, statusFilter]);

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const data = await listLicenses();
      setLicenses(data);
    } catch (error) {
      console.error('Erro ao buscar licenças', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuxiliaryData = async () => {
    try {
      const [inst, conf] = await Promise.all([listInstances(), listConfigs()]);
      setInstancesList(inst || []);
      setConfigsList(conf || []);
    } catch (error) {
      console.error("Erro ao carregar listas auxiliares", error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMsg('Copiado para a área de transferência!');
  };

  const handleToggleLicenseClick = (license: LicenseData) => {
    setConfirmModal({
      isOpen: true,
      title: license.is_active ? 'Desativar Licença?' : 'Reativar Licença?',
      message: `Isso ${license.is_active ? 'bloqueará' : 'liberará'} o acesso para ${license.configs?.instancias?.client_name}.`,
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setLoading(true);
          await toggleLicense(license.license_key, !!license.is_active);
          await fetchLicenses();
        } catch (error) {
          setToastMsg('Erro ao alterar status da licença.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleDeleteClick = (key: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Permanentemente?',
      message: 'Esta ação é irreversível. A licença será apagada.',
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setLoading(true);
          await deleteLicense(key);
          await fetchLicenses();
          setToastMsg('Licença deletada.');
        } catch (error) {
          setToastMsg('Erro ao deletar licença.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleUnbindClick = (license: LicenseData) => {
    if (!license.activated_machine_id) return;

    setConfirmModal({
      isOpen: true,
      title: 'Desvincular Máquina?',
      message: `Isso removerá o vínculo com a máquina ID: "${license.activated_machine_id}". O usuário precisará ativar novamente no computador.`,
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setLoading(true);
          await unbindLicense(license.license_key);
          await fetchLicenses();
          setToastMsg('Máquina desvinculada com sucesso!');
        } catch (error) {
          setToastMsg('Erro ao desvincular máquina.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createInstance(formDataInstance.client_name, formDataInstance.instance_Url);
      setFormDataInstance({ client_name: '', instance_Url: '' });
      setToastMsg('Instância criada!');
      setActiveTab('new-config');
    } catch (error: any) {
      alert(error.response?.data?.message || error.message);
    } finally { setLoading(false); }
  };

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createConfig(formDataConfig.config_name, formDataConfig.instance_url, formDataConfig.dbName, formDataConfig.clientToken);
      setFormDataConfig({ config_name: '', instance_url: '', dbName: '', clientToken: '' });
      setToastMsg('Configuração salva!');
      setActiveTab('new-license');
    } catch (error: any) {
      alert(error.response?.data?.message || error.message);
    } finally { setLoading(false); }
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createLicense(formDataLicense.instance_url, Number(formDataLicense.config_id));
      setFormDataLicense({ instance_url: '', config_id: '' });
      setToastMsg('Licença gerada com sucesso!');
      setActiveTab('licenses');
      fetchLicenses();
    } catch (error: any) {
      alert(error.response?.data?.message || error.message);
    } finally { setLoading(false); }
  };

  const instanceOptions = instancesList.map(inst => ({
    value: inst.instance_url,
    label: inst.client_name,
    subLabel: inst.instance_url
  }));

  const configOptions = configsList.map(conf => ({
    value: conf.id,
    label: `${conf.id} - ${conf.config_name}`,
    subLabel: conf.instancias?.client_name || 'Sem Instância'
  }));

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      
      {/* HEADER */}
      <header className="px-8 py-6 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-violet-600" />
            Gestão de Extensões
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie instâncias, configurações e licenças de uso.
          </p>
        </div>

        <div className="flex gap-4 items-center">
          {activeTab === 'licenses' && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-violet-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Cards"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-violet-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Lista"
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex bg-gray-100 p-1 rounded-xl">
            {[
              { id: 'licenses', label: 'Licenças' },
              { id: 'new-instance', label: '+ Instância' },
              { id: 'new-config', label: '+ Config' },
              { id: 'new-license', label: '+ Licença' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-violet-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        
        {activeTab === 'licenses' && (
          <div className="space-y-6">
            
            {/* FILTROS */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por cliente, url ou banco..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none appearance-none cursor-pointer"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Apenas Ativos</option>
                  <option value="inactive">Apenas Inativos</option>
                </select>
              </div>
            </div>

            {loading && licenses.length === 0 ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-violet-500" /></div>
            ) : filteredLicenses.length > 0 ? (
              <>
                {/* --- MODO GRID --- */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredLicenses.map((license) => (
                      <div key={license.license_key} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all group relative">
                        
                        {/* Status ATIVO/INATIVO (Topo Direito) */}
                        <div className="absolute top-4 right-4">
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${license.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${license.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {license.is_active ? 'ATIVO' : 'INATIVO'}
                          </div>
                        </div>

                        {/* Cabeçalho */}
                        <div className="flex items-center gap-3 mb-4 pr-20">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-bold text-slate-900 truncate" title={license.configs?.instancias?.client_name}>{license.configs?.instancias?.client_name || 'Cliente Desconhecido'}</h3>
                            <p className="text-xs text-slate-500 truncate">{license.configs?.config_name}</p>
                          </div>
                        </div>

                        {/* Informações */}
                        <div className="space-y-3 mb-6">
                          {/* Chave */}
                          <div className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Chave</span>
                            <div className="flex items-center gap-2">
                              <code className="text-slate-600 font-mono text-xs tracking-widest">••••••••</code>
                              <button 
                                onClick={() => handleCopy(license.license_key)}
                                className="text-violet-600 hover:bg-violet-100 p-1 rounded transition-colors"
                                title="Copiar Chave"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Infos Técnicas + STATUS DE USO (Abaixo do Banco) */}
                          <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2 truncate" title={license.configs?.instancias?.instance_url}>
                              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{license.configs?.instancias?.instance_url}</span>
                            </div>
                            <div className="flex items-center gap-2 truncate" title={license.configs?.config_data?.dbName}>
                              <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{license.configs?.config_data?.dbName}</span>
                            </div>
                            
                            {/* --- AJUSTE: STATUS DE USO SUTIL AQUI --- */}
                            <div className="flex items-center gap-2 mt-1">
                              {license.activated_machine_id ? (
                                <div className="flex items-center gap-2 text-slate-500" title={`ID Máquina: ${license.activated_machine_id}`}>
                                  <Monitor className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                                  <span className="truncate">Em uso</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-slate-400">
                                  <MonitorX className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">Disponível</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer Ações */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <ToggleSwitch 
                              checked={!!license.is_active} 
                              onClick={() => handleToggleLicenseClick(license)} 
                            />
                            <span className="text-xs font-medium text-slate-400">
                              {license.is_active ? 'Ativado' : 'Desativado'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {license.activated_machine_id && (
                              <button 
                                onClick={() => handleUnbindClick(license)} 
                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Desvincular Máquina"
                              >
                                <Unplug className="w-4 h-4" />
                              </button>
                            )}

                            <button 
                              onClick={() => handleDeleteClick(license.license_key)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deletar permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* --- MODO LISTA --- */}
                {viewMode === 'list' && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Uso</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cliente / Config</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Instância / Banco</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Chave</th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredLicenses.map((license) => (
                          <tr key={license.license_key} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                              <ToggleSwitch 
                                checked={!!license.is_active} 
                                onClick={() => handleToggleLicenseClick(license)} 
                              />
                            </td>
                            <td className="px-6 py-4">
                              {license.activated_machine_id ? (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
                                  <Monitor className="w-3 h-3 text-violet-500" /> Em Uso
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 whitespace-nowrap">
                                  <MonitorX className="w-3 h-3" /> Livre
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 text-sm">{license.configs?.instancias?.client_name}</div>
                              <div className="text-xs text-slate-500">{license.configs?.config_name}</div>
                            </td>
                            <td className="px-6 py-4 max-w-xs">
                              <div className="flex items-center gap-1.5 text-sm text-slate-600 truncate">
                                <Globe className="w-3 h-3 text-slate-400" /> {license.configs?.instancias?.instance_url}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                <Database className="w-3 h-3 text-slate-400" /> {license.configs?.config_data?.dbName}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <code className="text-slate-500 font-mono text-xs">• • • • • • • •</code>
                                <button 
                                  onClick={() => handleCopy(license.license_key)}
                                  className="text-violet-600 hover:bg-violet-100 p-1 rounded"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                {license.activated_machine_id && (
                                  <button 
                                    onClick={() => handleUnbindClick(license)} 
                                    className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded-md transition-colors"
                                    title="Desvincular Máquina"
                                  >
                                    <Unplug className="w-4 h-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteClick(license.license_key)}
                                  className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 opacity-50">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium">Nenhum resultado</h3>
                <p>Tente ajustar os filtros de busca.</p>
              </div>
            )}
          </div>
        )}

        {/* --- ABAS DE CRIAÇÃO --- */}
        {activeTab === 'new-instance' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <Server className="w-6 h-6 text-violet-600" />
              1. Criar Instância
            </h2>
            <form onSubmit={handleCreateInstance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Farmácia Central"
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                  value={formDataInstance.client_name}
                  onChange={e => setFormDataInstance({...formDataInstance, client_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Instância</label>
                <input 
                  type="text" 
                  required
                  placeholder="https://instancia.z-api.io/..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                  value={formDataInstance.instance_Url}
                  onChange={e => setFormDataInstance({...formDataInstance, instance_Url: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 mt-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Criar Instância'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'new-config' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <Settings className="w-6 h-6 text-violet-600" />
              2. Criar Configuração
            </h2>
            <form onSubmit={handleCreateConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Configuração</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Config Padrão V1"
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                  value={formDataConfig.config_name}
                  onChange={e => setFormDataConfig({...formDataConfig, config_name: e.target.value})}
                />
              </div>
              
              {/* SELECT DE INSTÂNCIA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vincular Instância</label>
                <SearchableSelect 
                  options={instanceOptions}
                  value={formDataConfig.instance_url}
                  onChange={(val) => setFormDataConfig({...formDataConfig, instance_url: String(val)})}
                  placeholder="Pesquise e selecione a instância..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Banco</label>
                  <input 
                    type="text" 
                    required
                    placeholder="db_cliente"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                    value={formDataConfig.dbName}
                    onChange={e => setFormDataConfig({...formDataConfig, dbName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Token</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Token Z-API"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                    value={formDataConfig.clientToken}
                    onChange={e => setFormDataConfig({...formDataConfig, clientToken: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 mt-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Salvar Configuração'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'new-license' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <Plus className="w-6 h-6 text-violet-600" />
              3. Gerar Licença
            </h2>
            <form onSubmit={handleCreateLicense} className="space-y-4">
              
              {/* SELECT DE INSTÂNCIA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selecione a Instância</label>
                <SearchableSelect 
                  options={instanceOptions}
                  value={formDataLicense.instance_url}
                  onChange={(val) => setFormDataLicense({...formDataLicense, instance_url: String(val)})}
                  placeholder="Buscar instância..."
                />
              </div>

              {/* SELECT DE CONFIGURAÇÃO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selecione a Configuração</label>
                <SearchableSelect 
                  options={configOptions}
                  value={Number(formDataLicense.config_id)}
                  onChange={(val) => setFormDataLicense({...formDataLicense, config_id: String(val)})}
                  placeholder="Buscar configuração por ID ou Nome..."
                />
                <p className="text-xs text-gray-400 mt-1">Exibe: ID - Nome Config | Cliente vinculado</p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 mt-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Gerar Chave de Licença'}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* --- TOAST --- */}
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* --- MODAL CONFIRM --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 relative p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{confirmModal.title}</h3>
            <p className="text-slate-600 mb-6 text-sm">{confirmModal.message}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))} className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancelar</button>
              <button onClick={confirmModal.onConfirm} className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}