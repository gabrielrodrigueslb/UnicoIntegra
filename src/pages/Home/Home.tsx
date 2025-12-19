/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  Shield, 
  Zap, 
  LayoutGrid, 
  Bell, 
  ArrowRight,
  Plus,
  Cpu,
  Calendar,
  KeySquare
} from 'lucide-react';

// Importando serviços para buscar dados reais
import { getDatabases } from '../../services/database.service';
// Assumindo que o service de extensão existe conforme criado anteriormente
import { listLicenses } from '../../services/extension.service'; 

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    databases: 0,
    licenses: 0,
    activeLicenses: 0
  });
  const [loading, setLoading] = useState(true);

  // Saudação baseada na hora
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // Buscar dados reais para o Dashboard
  useEffect(() => {
    async function fetchStats() {
      try {
        // Buscamos os bancos (limit 1 apenas para pegar o meta.totalItems se disponível, ou length)
        // O seu getDatabases retorna { data: [], meta: {...} }
        const dbData = await getDatabases(1, 1);
        const totalDbs = dbData.meta?.totalItems || 0;

        // Buscamos licenças
        const licData = await listLicenses();
        const totalLic = licData.length;
        const activeLic = licData.filter((l: any) => l.is_active).length;

        setStats({
          databases: totalDbs,
          licenses: totalLic,
          activeLicenses: activeLic
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Dados Mockados de Novidades (Futuramente pode vir do banco)
  const updates = [
    {
      id: 1,
      tag: 'NOVO',
      color: 'bg-green-100 text-green-700',
      title: 'Integração Alpha 7 V2',
      desc: 'Nova versão da integração com suporte a filas múltiplas disponível.',
      date: 'Hoje'
    },
    {
      id: 2,
      tag: 'UPDATE',
      color: 'bg-blue-100 text-blue-700',
      title: 'Melhoria no Gerenciador',
      desc: 'Agora é possível desvincular máquinas diretamente pelo painel de extensões.',
      date: 'Ontem'
    },
    {
      id: 3,
      tag: 'MANUTENÇÃO',
      color: 'bg-orange-100 text-orange-700',
      title: 'Otimização de Banco',
      desc: 'Rotina de limpeza automática implementada nos bancos de teste.',
      date: '12 Dez'
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-y-auto custom-scrollbar font-sans text-slate-800">
      
      {/* HEADER SIMPLIFICADO */}
      <header className="px-8 py-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              {greeting}, Administrador! 
            </h1>
            <p className="text-slate-500 mt-2">
              Sucesso pra nós! 🚀
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-900 flex items-center justify-end gap-2">
              <Calendar className="w-4 h-4 text-violet-600" />
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Versão do Sistema: <strong>1.2.0</strong></p>
          </div>
        </div>
      </header>

      <main className="px-8 pb-12 flex-1">
        
        {/* SECTION 1: ESTATÍSTICAS (CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card Bancos */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
              <Database className="w-24 h-24 text-blue-600" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                <Database className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Bancos de Dados</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                {loading ? '...' : stats.databases}
              </h3>
              <button onClick={() => navigate('/main/databases')} className="text-blue-600 text-sm font-semibold mt-4 flex items-center gap-1 hover:gap-2 transition-all">
                Gerenciar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Licenças */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
              <Shield className="w-24 h-24 text-violet-600" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Licenças Ativas</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-slate-900">
                  {loading ? '...' : stats.activeLicenses}
                </h3>
                <span className="text-sm text-slate-400 font-medium">/ {loading ? '...' : stats.licenses} total</span>
              </div>
              <button onClick={() => navigate('/main/extensions')} className="text-violet-600 text-sm font-semibold mt-4 flex items-center gap-1 hover:gap-2 transition-all">
                Ver Detalhes <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card IAs (Estático por enquanto ou placeholder) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
              <Cpu className="w-24 h-24 text-emerald-600" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Agentes de IA</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                Ativo
              </h3>
              <button onClick={() => navigate('/main/iaPage')} className="text-emerald-600 text-sm font-semibold mt-4 flex items-center gap-1 hover:gap-2 transition-all">
                Configurar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SECTION 2: ACESSO RÁPIDO */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Acesso Rápido
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/main/aplications')}
                className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:border-violet-500 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-violet-600 group-hover:text-white transition-colors mb-3">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-700">Gerar App</span>
              </button>

              <button 
                onClick={() => navigate('/main/databases')}
                className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-3">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-700">Novo Banco</span>
              </button>

              <button 
                onClick={() => navigate('/main/extensions')}
                className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:border-violet-500 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-violet-600 group-hover:text-white transition-colors mb-3">
                  <KeySquare className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-700">Criar licença</span>
              </button>

              <button 
                onClick={() => navigate('/main/iaPage')}
                className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-3">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-700">Nova IA</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: NOVIDADES */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-500" /> Novidades & Updates
            </h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="space-y-6">
                {updates.map((item) => (
                  <div key={item.id} className="relative pl-6 border-l-2 border-gray-100 last:border-0 pb-1">
                    <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${item.color.replace('text', 'bg').replace('100', '500')}`}></div>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>
                        {item.tag}
                      </span>
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 text-xs font-medium text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors border border-dashed border-gray-200">
                Ver histórico completo
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}