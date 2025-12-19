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
  KeySquare, // Seu ícone personalizado
  X,
  Info  
} from 'lucide-react';

// Importando serviços
import { getDatabases } from '../../services/database.service';
import { listLicenses } from '../../services/extension.service'; 
import { getLatestNews, type NewsItem } from '../../services/news.service'; // Service de novidades

// Helper para formatar data
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  if (isToday) return 'Hoje';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

// Helper para Estilos das Tags de Novidade
const getTypeStyle = (type: string) => {
  switch (type) {
    case 'feature': return { label: 'NOVO', className: 'bg-green-100 text-green-700' };
    case 'update': return { label: 'UPDATE', className: 'bg-blue-100 text-blue-700' };
    case 'maintenance': return { label: 'MANUTENÇÃO', className: 'bg-orange-100 text-orange-700' };
    case 'alert': return { label: 'AVISO', className: 'bg-red-100 text-red-700' };
    default: return { label: 'INFO', className: 'bg-gray-100 text-gray-700' };
  }
};

export default function Home() {
  const navigate = useNavigate();

  const username = localStorage.getItem('username')
  
  // Estados de Estatísticas
  const [stats, setStats] = useState({
    databases: 0,
    licenses: 0,
    activeLicenses: 0
  });
  const [loading, setLoading] = useState(true);

  // Estados de Novidades (Dinâmico)
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Saudação
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // Buscar dados reais
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Buscar Stats
        const dbData = await getDatabases(1, 1);
        const licData = await listLicenses();
        
        const totalDbs = dbData.meta?.totalItems || 0;
        const totalLic = licData.length;
        const activeLic = licData.filter((l: any) => l.is_active).length;

        setStats({
          databases: totalDbs,
          licenses: totalLic,
          activeLicenses: activeLic
        });

        // 2. Buscar Novidades do Backend
        const newsData = await getLatestNews();
        setNews(newsData);

      } catch (error) {
        console.error("Erro ao carregar dados da Home", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-y-auto custom-scrollbar font-sans text-slate-800 relative">
      
      {/* HEADER PERSONALIZADO */}
      <header className="px-8 py-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              {greeting}, {username}! 
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

          {/* Card IAs */}
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
          
          {/* SECTION 2: ACESSO RÁPIDO (SEUS BOTÕES PERSONALIZADOS) */}
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

              {/* Botão de Licença com KeySquare (Sua alteração) */}
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

          {/* SECTION 3: NOVIDADES (CONECTADO AO BACKEND) */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-500" /> Novidades & Updates
            </h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-h-[300px]">
              
              {news.length > 0 ? (
                <div className="space-y-6">
                  {news.map((item) => {
                    const style = getTypeStyle(item.type);
                    return (
                      <div 
                        key={item.id} 
                        className="relative pl-6 border-l-2 border-gray-100 last:border-0 pb-1 cursor-pointer group"
                        onClick={() => setSelectedNews(item)}
                      >
                        <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${style.className.replace('text', 'bg').replace('100', '500')}`}></div>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.className}`}>
                            {style.label}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-violet-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                  <Info className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma novidade recente.</p>
                </div>
              )}
              
            </div>
          </div>

        </div>
      </main>

      {/* --- MODAL DE DETALHES DA NOVIDADE --- */}
      {selectedNews && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 relative" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header com Cor Dinâmica */}
            <div className={`px-6 py-4 flex justify-between items-center border-b border-gray-100 ${getTypeStyle(selectedNews.type).className.replace('text', 'bg').replace('100', '50')}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${getTypeStyle(selectedNews.type).className}`}>
                  {getTypeStyle(selectedNews.type).label}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {new Date(selectedNews.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <button 
                onClick={() => setSelectedNews(null)} 
                className="p-1 rounded-full hover:bg-black/5 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight">
                {selectedNews.title}
              </h3>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line overflow-y-auto max-h-[60vh] custom-scrollbar">
                {selectedNews.description}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <button 
                onClick={() => setSelectedNews(null)}
                className="px-6 py-2 bg-white border border-gray-300 text-slate-700 font-medium rounded-lg text-sm hover:bg-gray-100 transition-colors shadow-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}