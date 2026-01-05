import { useState, useEffect } from 'react';
import {
  Shield, Loader2, Globe, Database, Monitor, MonitorX,
  Copy, Trash2, Unplug, Search, Filter, LayoutGrid, List as ListIcon
} from 'lucide-react';
import { type LicenseData } from '../../../services/extension.service';
import { ToggleSwitch } from './SharedUI';

interface LicenseListProps {
  licenses: LicenseData[];
  loading: boolean;
  onToggle: (license: LicenseData) => void;
  onDelete: (key: string) => void;
  onUnbind: (license: LicenseData) => void;
  onCopy: (text: string) => void;
}

export function LicenseList({
  licenses,
  loading,
  onToggle,
  onDelete,
  onUnbind,
  onCopy
}: LicenseListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [filteredLicenses, setFilteredLicenses] = useState<LicenseData[]>([]);

  useEffect(() => {
    let result = licenses;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (l) =>
          l.configs?.instancias?.client_name.toLowerCase().includes(lowerTerm) ||
          l.configs?.instancias?.instance_url.toLowerCase().includes(lowerTerm) ||
          l.configs?.config_data?.dbName.toLowerCase().includes(lowerTerm),
      );
    }
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      result = result.filter((l) => !!l.is_active === isActive);
    }
    setFilteredLicenses(result);
  }, [licenses, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Filtros e Controles */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, url ou banco..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Apenas Ativos</option>
              <option value="inactive">Apenas Inativos</option>
            </select>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200 h-fit">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-violet-600' : 'text-gray-400'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-violet-600' : 'text-gray-400'}`}
          >
            <ListIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading && licenses.length === 0 ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-violet-500" /></div>
      ) : filteredLicenses.length > 0 ? (
        <>
          {/* MODO GRID */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLicenses.map((license) => (
                <div key={license.license_key} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all group relative">
                  <div className="absolute top-4 right-4">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${license.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${license.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {license.is_active ? 'ATIVO' : 'INATIVO'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4 pr-20">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-900 truncate" title={license.configs?.instancias?.client_name}>
                        {license.configs?.instancias?.client_name || 'Cliente Desconhecido'}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{license.configs?.config_name}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Chave</span>
                      <div className="flex items-center gap-2">
                        <code className="text-slate-600 font-mono text-xs tracking-widest">••••••••</code>
                        <button onClick={() => onCopy(license.license_key)} className="text-violet-600 hover:bg-violet-100 p-1 rounded transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2 truncate" title={license.configs?.instancias?.instance_url}>
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{license.configs?.instancias?.instance_url}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate" title={license.configs?.config_data?.dbName}>
                        <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{license.configs?.config_data?.dbName}</span>
                      </div>
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
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <ToggleSwitch checked={!!license.is_active} onClick={() => onToggle(license)} />
                      <span className="text-xs font-medium text-slate-400">{license.is_active ? 'Ativado' : 'Desativado'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {license.activated_machine_id && (
                        <button onClick={() => onUnbind(license)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Desvincular Máquina">
                          <Unplug className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => onDelete(license.license_key)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Deletar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODO LISTA */}
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
                      <td className="px-6 py-4"><ToggleSwitch checked={!!license.is_active} onClick={() => onToggle(license)} /></td>
                      <td className="px-6 py-4">
                        {license.activated_machine_id ? (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap"><Monitor className="w-3 h-3 text-violet-500" /> Em Uso</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 whitespace-nowrap"><MonitorX className="w-3 h-3" /> Livre</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm">{license.configs?.instancias?.client_name}</div>
                        <div className="text-xs text-slate-500">{license.configs?.config_name}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 truncate"><Globe className="w-3 h-3 text-slate-400" /> {license.configs?.instancias?.instance_url}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5"><Database className="w-3 h-3 text-slate-400" /> {license.configs?.config_data?.dbName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2"><code className="text-slate-500 font-mono text-xs">• • • • • • • •</code><button onClick={() => onCopy(license.license_key)} className="text-violet-600 hover:bg-violet-100 p-1 rounded"><Copy className="w-3 h-3" /></button></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          {license.activated_machine_id && (
                            <button onClick={() => onUnbind(license)} className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded-md transition-colors"><Unplug className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => onDelete(license.license_key)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
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
  );
}