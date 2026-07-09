/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Shield,
  Cpu,
  Plus,
  KeySquare,
  Layout,
  ArrowRight,
  X,
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

type NewsTone = 'neutral' | 'active' | 'success' | 'warning' | 'danger';

const NEWS_TONE: Record<string, NewsTone> = {
  feature: 'success',
  update: 'active',
  maintenance: 'warning',
  alert: 'danger',
};

const NEWS_DOT: Record<NewsTone, string> = {
  neutral: 'bg-foreground/30',
  active: 'bg-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
};

const NEWS_TEXT: Record<NewsTone, string> = {
  neutral: 'text-foreground/55',
  active: 'text-primary',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-rose-600',
};

const NEWS_LABEL: Record<string, string> = {
  feature: 'Novo',
  update: 'Atualização',
  maintenance: 'Manutenção',
  alert: 'Alerta',
};

// --- COMPONENTES VISUAIS ---

const STATS_COLUMNS = 'sm:grid-cols-3';

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(target);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || target === 0) {
      setValue(target);
      return;
    }

    const duration = 500;
    const start = performance.now();

    let frameId: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4); // ease-out-quart
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }
    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [target, active]);

  return value;
}

function StatCell({
  title,
  value,
  countUpActive,
  subValue,
  progress,
  icon: Icon,
  onClick,
}: {
  title: string;
  value: number;
  countUpActive: boolean;
  subValue?: string;
  progress?: number;
  icon: any;
  onClick: () => void;
}) {
  const displayValue = useCountUp(value, countUpActive);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-3 p-5 text-left transition-colors hover:bg-foreground/[0.02]"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-4 w-4" />
        </div>
        {subValue ? (
          <span className="text-[11px] font-medium text-foreground/40">{subValue}</span>
        ) : null}
      </div>
      <div>
        <span className="block text-2xl font-semibold tabular-nums text-foreground">{displayValue}</span>
        <span className="text-xs text-foreground/50">{title}</span>
      </div>
      {progress !== undefined ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      ) : null}
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const username = getAuthSession()?.authUsername ?? null;
  const formattedUsername = username?.split('--')[1];
  const appVersion = __APP_VERSION__;

  const [stats, setStats] = useState({ databases: 0, licenses: 0, activeLicenses: 0 });
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const hasLoadedRef = useRef(false);

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
          getLatestNews(),
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
      } catch {
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
    return text
      .split('**')
      .map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          part
        ),
      );
  };

  const newsItems = Array.isArray(news) ? news : [];

  const actions = [
    { label: 'Aplicações', desc: 'Executáveis e serviços de IA', icon: Layout, path: '/main/aplications' },
    { label: 'Novo banco de dados', desc: 'Criar estrutura SQL', icon: Plus, path: '/main/databases' },
    { label: 'Gerar licença', desc: 'Vincular cliente/instância', icon: KeySquare, path: '/main/extensions' },
    { label: 'Configurar IA', desc: 'Treinar novo agente', icon: Cpu, path: '/main/iaPage' },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-foreground/[0.015] font-sans text-foreground">
      <header className="sticky top-0 z-10 flex w-full shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border bg-background px-6 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {(formattedUsername || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold capitalize text-foreground">
              {greeting}, {formattedUsername || 'usuário'}
            </h1>
            <p className="text-xs text-foreground/50">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <span className="text-xs text-foreground/40">v{appVersion}</span>
      </header>

      <main className="custom-scrollbar mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col gap-6 overflow-y-auto p-5 lg:flex-row lg:items-start lg:gap-8 lg:p-8">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className={`rise-in rise-in-1 grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-background sm:divide-x sm:divide-y-0 ${STATS_COLUMNS}`}>
            <StatCell
              title="Bancos de dados"
              value={stats.databases}
              countUpActive={!loading}
              icon={Database}
              onClick={() => navigate('/main/databases')}
            />
            <StatCell
              title="Licenças"
              value={stats.licenses}
              countUpActive={!loading}
              subValue={`${stats.activeLicenses}/${stats.licenses} ativas`}
              progress={stats.licenses > 0 ? stats.activeLicenses / stats.licenses : 0}
              icon={Shield}
              onClick={() => navigate('/main/extensions')}
            />
            <StatCell
              title="Modelos de IA"
              value={iaCount}
              countUpActive
              subValue="disponíveis"
              icon={Cpu}
              onClick={() => navigate('/main/iaPage')}
            />
          </div>

          <div className="rise-in rise-in-2 rounded-xl border border-border bg-background">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">Ferramentas</h2>
            </div>
            <div className="divide-y divide-border">
              {actions.map((action) => (
                <button
                  type="button"
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="group flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-foreground/[0.02]"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <action.icon className="h-4 w-4 shrink-0 text-foreground/40 transition-colors group-hover:text-primary" />
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-medium text-foreground">{action.label}</h4>
                      <p className="truncate text-xs text-foreground/50">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-foreground/25 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rise-in rise-in-3 w-full shrink-0 lg:w-[340px]">
          <div className="rounded-xl border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h3 className="text-sm font-semibold text-foreground">Atualizações</h3>
            </div>

            {newsItems.length > 0 ? (
              <ul className="divide-y divide-border">
                {newsItems.map((item) => {
                  const tone = NEWS_TONE[item.type] || 'neutral';
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedNews(item)}
                        className="flex w-full flex-col gap-1 px-5 py-3.5 text-left transition-colors hover:bg-foreground/[0.02]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${NEWS_TEXT[tone]}`}>
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${NEWS_DOT[tone]}`} />
                            {NEWS_LABEL[item.type] || item.type}
                          </span>
                          <span className="text-[11px] text-foreground/40">{formatDate(item.created_at)}</span>
                        </div>
                        <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
                        <p className="line-clamp-2 text-xs text-foreground/50">{item.description}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex h-32 items-center justify-center text-xs text-foreground/40">
                Nenhuma novidade.
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedNews ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-[2px]"
          onClick={() => setSelectedNews(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-background shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${NEWS_TEXT[NEWS_TONE[selectedNews.type] || 'neutral']}`}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${NEWS_DOT[NEWS_TONE[selectedNews.type] || 'neutral']}`} />
                  {NEWS_LABEL[selectedNews.type] || selectedNews.type}
                </span>
                <h2 className="mt-1 text-base font-semibold leading-tight text-foreground">{selectedNews.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground/45 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="custom-scrollbar overflow-y-auto px-5 py-4 text-sm leading-relaxed text-foreground/70 whitespace-pre-line">
              {formatMessage(selectedNews.description)}
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/[0.03]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
