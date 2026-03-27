/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  Shield, 
  Zap, 
  Bell, 
  Plus,
  Cpu,
  Calendar,
  KeySquare,
  X,
  Layout,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

// Services
import { getDatabases } from '../../services/database.service';
import { listLicenses } from '../../services/extension.service'; 
import { getLatestNews, type NewsItem } from '../../services/news.service';
import { getAuthSession } from '../../utils/authSession';
import { templates } from '../../data/templates_ia'; // Importação dos templates

// --- HELPERS ---

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return 'Hoje';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const getTimelineDotColor = (type: string): string => {
  switch (type) {
    case 'feature':
      return 'bg-emerald-500 ring-emerald-100'; // Verde para novidades
    case 'update':
      return 'bg-blue-500 ring-blue-100';       // Azul para atualizações
    case 'maintenance':
      return 'bg-amber-500 ring-amber-100';     // Laranja para manutenção
    case 'alert':
      return 'bg-red-500 ring-red-100';         // Vermelho para alertas
    default:
      return 'bg-slate-300 ring-slate-100';      // Cinza padrão
  }
};

// --- COMPONENTES VISUAIS ---

const StatCard = ({ title, value, subValue, icon: Icon, colorClass, onClick }: any) => (
  <div 
    onClick={onClick}
    className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden"
  >
    {/* Background Icon Decorativo */}
    <div className={`absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-transform group-hover:scale-110`}>
      <Icon className={`w-24 h-24 ${colorClass}`} />
    </div>
    
    <div className="flex justify-between items-start z-10">
      <div className={`p-2.5 rounded-xl ${colorClass.replace('text-', 'bg-').replace('600', '50')} ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      {subValue && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
          {subValue}
        </span>
      )}
    </div>

    <div className="z-10">
      <h4 className="text-slate-500 font-medium text-xs uppercase tracking-wide mb-0.5">{title}</h4>
      <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
    </div>
  </div>
);

const NewsTag = ({ type }: { type: string }) => {
  const styles: any = {
    feature: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    update: 'bg-blue-50 text-blue-700 border-blue-200',
    maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
    alert: 'bg-red-50 text-red-700 border-red-200',
    default: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${styles[type] || styles.default}`}>
      {type === 'feature' ? 'Novo' : type}
    </span>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const username = getAuthSession()?.authUsername ?? null;
  const formattedUsername = username?.split('--')[1]
  const appVersion = __APP_VERSION__;
  
  const [stats, setStats] = useState({ databases: 0, licenses: 0, activeLicenses: 0 });
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const hasLoadedRef = useRef(false);

  // Contagem dinâmica de IAs baseada nos templates importados
  const iaCount = Object.keys(templates).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;
    let isMounted = true;

    async function fetchData() {
      try {
        const [dbResult, licResult, newsResult] = await Promise.allSettled([
          getDatabases(1, 1),
          listLicenses(),
          getLatestNews()
        ]);

        if (!isMounted) {
          return;
        }

        const totalDbs =
          dbResult.status === 'fulfilled' ? dbResult.value.meta?.totalItems || 0 : 0;
        const licenses = licResult.status === 'fulfilled' ? licResult.value : [];
        const totalLic = licenses.length;
        const activeLic = licenses.filter((l: any) => l.is_active).length;
        const latestNews = newsResult.status === 'fulfilled' ? newsResult.value : [];

        setStats({ databases: totalDbs, licenses: totalLic, activeLicenses: activeLic });
        setNews(latestNews);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStats({ databases: 0, licenses: 0, activeLicenses: 0 });
        setNews([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatMessage = (text: string) => {
    if (!text) return null;
    return text.split('**').map((part, index) => 
      index % 2 === 1 ? <strong key={index} className="font-bold text-slate-900">{part}</strong> : part
    );
  };

  const newsItems = Array.isArray(news) ? news : [];

  return (
    // CONTAINER PRINCIPAL: h-screen e overflow-hidden para travar o scroll da janela
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden font-sans text-slate-800">
      
      {/* HEADER FIXO */}
      <header className="px-8 pt-6 pb-6 bg-white border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-1100 mx-auto w-full flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Painel de Controle</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight capitalize">
              {greeting}, {formattedUsername || 'Usuário'}
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-xs text-slate-400">Sistema v{appVersion}</p>
             </div>
             <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <Calendar className="w-5 h-5" />
             </div>
          </div>
        </div>
      </header>

      {/* CORPO (GRID SEM SCROLL GERAL) */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-12 gap-6 h-full">
          
          {/* COLUNA ESQUERDA (8 COLUNAS) - Flexível mas contida na altura */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col gap-6 h-full">
            
            {/* 1. STATS ROW (Altura Fixa) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
               {/* Card Banco */}
                <StatCard 
                title="Databases" 
                value={loading ? '-' : stats.databases} 
                icon={Database} 
                colorClass="text-blue-600"
                onClick={() => navigate('/main/databases')}
              />
                

                {/* Card Licenças */}
               <StatCard 
                title="Licenças" 
                value={loading ? '-' : `${stats.licenses}`} 
                subValue={`${stats.activeLicenses}/${stats.licenses} ativas`}
                icon={Shield} 
                colorClass="text-violet-600"
                onClick={() => navigate('/main/extensions')}
              />
              {/* Card de IA Atualizado */}
              <StatCard 
                title="Modelos de IA" 
                value={iaCount} 
                subValue="Disponíveis"
                icon={Cpu} 
                colorClass="text-emerald-600"
                onClick={() => navigate('/main/iaPage')}
              />
            </div>

            {/* 2. ACTIONS AREA (Preenche o resto da altura) */}
            
            <section className="flex-1">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Ferramentas
              </h2>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {[
                  { label: 'Aplicacoes', desc: 'Executaveis e servicos de IA', icon: Layout, path: '/main/aplications', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Novo Banco de Dados', desc: 'Criar estrutura SQL', icon: Plus, path: '/main/databases', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Gerar Licença', desc: 'Vincular cliente/instância', icon: KeySquare, path: '/main/extensions', color: 'text-violet-600', bg: 'bg-violet-50' },
                  { label: 'Configurar IA', desc: 'Treinar novo agente', icon: Cpu, path: '/main/iaPage', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((action, idx) => (
                  <div 
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bg} ${action.color}`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{action.label}</h4>
                        <p className="text-xs text-slate-500">{action.desc}</p>
                      </div>
                    </div>
                    <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-200">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA (4 COLUNAS) - NEWS FEED (Scroll Interno) */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 h-full">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-500" /> Atualizações
                </h3>
                <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">
                  Recente
                </span>
              </div>

              {/* Lista com Scroll Interno Independente */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
  {newsItems.length > 0 ? (
    newsItems.map((item, index) => (
      // 1. Wrapper com relative e padding na esquerda para a linha
      <div key={item.id} className="relative pl-6 pb-2">
        
        {/* 2. LINHA VERTICAL */}
        {/* Só renderiza a linha se não for o último item (opcional, remova a condição se quiser linha infinita) */}
        {index !== newsItems.length - 1 && (
           <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-200"></div>
        )}

        {/* 3. BOLINHA DA TIMELINE */}
        <div className={`absolute left-[7px] top-6 w-2.5 h-2.5 rounded-full ring-4 ring-white z-10 ${getTimelineDotColor(item.type)}`}></div>

        {/* SEU CARD ORIGINAL (com pequenas melhorias de layout) */}
        <div 
          onClick={() => setSelectedNews(item)}
          className="p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all cursor-pointer group bg-white shadow-sm"
        >
          <div className="flex justify-between items-start mb-1.5">
            <NewsTag type={item.type} />
            <span className="text-[10px] text-slate-400">{formatDate(item.created_at)}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors">
            {item.title}
          </h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>
    ))
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
      {/* <Info className="w-8 h-8 mb-2" /> Certifique-se de importar o ícone se for usar */}
      <p className="text-xs">Nenhuma novidade.</p>
    </div>
  )}
</div>
              
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center shrink-0">
                <button className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider flex items-center justify-center gap-1 w-full py-1">
                  Ver Todas <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- MODAL (Mantida igual) --- */}
      {selectedNews && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 relative flex flex-col max-h-[85vh]" 
            onClick={e => e.stopPropagation()}
          >
            {/* Banner Área */}
            <div className="relative h-40 bg-gradient-to-r from-slate-900 to-slate-800 shrink-0">
               <img 
                  src='/unico.png' 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  alt="cover"
               />
               <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10">
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                   <div className="flex gap-2 mb-2"><NewsTag type={selectedNews.type} /></div>
                   <h2 className="text-xl font-bold text-white leading-tight shadow-sm">{selectedNews.title}</h2>
                </div>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="prose prose-sm prose-slate text-slate-600 leading-relaxed whitespace-pre-line">
                {formatMessage(selectedNews.description)}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedNews(null)} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm text-sm">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
