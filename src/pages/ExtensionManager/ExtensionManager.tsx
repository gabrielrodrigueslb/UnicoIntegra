/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';

// Serviços
import {
  listLicenses, listInstances, listConfigs, toggleLicense, deleteLicense, unbindLicense,
  type LicenseData, type InstanceData, type ConfigData
} from '../../services/extension.service';
import { getDatabases } from '../../services/database.service';

// Componentes Refatorados
import { LicenseList } from './components/LicenseList';
import { CreateInstanceForm } from './components/CreateInstanceForm';
import { CreateConfigForm } from './components/CreateConfigForm';
import { CreateLicenseForm } from './components/CreateLicenseForm';
import { Toast } from './components/SharedUI';

// Modal State Interface
interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function ExtensionManager() {
  const navigate = useNavigate();

  // Navegação (Abas)
  const [activeTab, setActiveTab] = useState<'licenses' | 'new-instance' | 'new-config' | 'new-license'>('licenses');

  // Estados Globais de Dados
  const [loading, setLoading] = useState(false);
  const [licenses, setLicenses] = useState<LicenseData[]>([]);
  const [instancesList, setInstancesList] = useState<InstanceData[]>([]);
  const [configsList, setConfigsList] = useState<ConfigData[]>([]);
  const [databaseOptions, setDatabaseOptions] = useState<string[]>([]);

  // Feedbacks
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Init e Auth
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) navigate('/');
    
    if (activeTab === 'licenses') fetchLicenses();
    if (activeTab === 'new-config' || activeTab === 'new-license') loadAuxiliaryData();
  }, [navigate, activeTab]);

  // Buscas de Dados
  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const data = await listLicenses();
      setLicenses(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const loadAuxiliaryData = async () => {
    try {
      const [inst, conf] = await Promise.all([listInstances(), listConfigs()]);
      setInstancesList(inst || []);
      setConfigsList(conf || []);
      const dbResponse = await getDatabases(1, 100);
      if (dbResponse?.data) setDatabaseOptions(dbResponse.data.map((db) => db.name));
    } catch (error) { console.error('Erro ao carregar listas auxiliares', error); }
  };

  // --- Ações da Lista ---
  const handleToggleLicense = (license: LicenseData) => {
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
        } catch { setToastMsg('Erro ao alterar status.'); } 
        finally { setLoading(false); }
      },
    });
  };

  const handleDeleteLicense = (key: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Permanentemente?',
      message: 'Esta ação é irreversível.',
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setLoading(true);
          await deleteLicense(key);
          await fetchLicenses();
          setToastMsg('Licença deletada.');
        } catch { setToastMsg('Erro ao deletar licença.'); } 
        finally { setLoading(false); }
      },
    });
  };

  const handleUnbindMachine = (license: LicenseData) => {
    setConfirmModal({
      isOpen: true,
      title: 'Desvincular Máquina?',
      message: `Isso removerá o vínculo com a máquina ID: "${license.activated_machine_id}".`,
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setLoading(true);
          await unbindLicense(license.license_key);
          await fetchLicenses();
          setToastMsg('Máquina desvinculada!');
        } catch { setToastMsg('Erro ao desvincular.'); } 
        finally { setLoading(false); }
      },
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      {/* HEADER */}
      <header className="px-8 py-6 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-violet-600" /> Gestão de Extensões
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie instâncias, configurações e licenças.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
           {[
                { id: 'licenses', label: 'Licenças' },
                { id: 'new-instance', label: '+ Cliente' },
                { id: 'new-config', label: '+ Config' },
                { id: 'new-license', label: '+ Licença' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeTab === 'licenses' && (
            <LicenseList 
                licenses={licenses} 
                loading={loading}
                onToggle={handleToggleLicense}
                onDelete={handleDeleteLicense}
                onUnbind={handleUnbindMachine}
                onCopy={(text) => { navigator.clipboard.writeText(text); setToastMsg('Copiado!'); }}
            />
        )}

        {activeTab === 'new-instance' && (
            <CreateInstanceForm 
                onSuccess={() => { setToastMsg('Instância criada!'); setActiveTab('new-config'); }}
                onError={(msg) => alert(msg)}
            />
        )}

        {activeTab === 'new-config' && (
            <CreateConfigForm 
                instancesList={instancesList}
                databaseOptions={databaseOptions}
                onSuccess={() => { setToastMsg('Configuração criada!'); setActiveTab('new-license'); }}
                onError={(msg) => alert(msg)}
            />
        )}

        {activeTab === 'new-license' && (
            <CreateLicenseForm
                instancesList={instancesList}
                configsList={configsList}
                onSuccess={() => { setToastMsg('Licença criada!'); setActiveTab('licenses'); fetchLicenses(); }}
                onError={(msg) => alert(msg)}
            />
        )}
      </main>

      {/* FEEDBACK GLOBAL */}
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      
      {/* MODAL DE CONFIRMAÇÃO (Renderizado Globalmente) */}
      {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))}>
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 relative p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600"><AlertTriangle className="w-6 h-6" /></div>
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