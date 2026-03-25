import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  HardDriveDownload,
  ServerCog,
  ShieldCheck
} from 'lucide-react';

import { useRequireAuth } from '../../hooks/useAuthRedirect';

interface ApplicationModuleCardProps {
  title: string;
  description: string;
  badge: string;
  icon: typeof HardDriveDownload;
  path: string;
  points: string[];
}

function ApplicationModuleCard({
  title,
  description,
  badge,
  icon: Icon,
  path,
  points,
}: ApplicationModuleCardProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(path)}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-background p-8 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <span className="rounded-lg bg-gray-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          {badge}
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-foreground/70">
          {description}
        </p>
      </div>

      <div className="mt-6 space-y-2">
        {points.map((point) => (
          <div
            key={point}
            className="flex items-center gap-2 text-sm text-foreground/80"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>{point}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
          Acessar módulo
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}

export default function ApplicationsHub() {
  useRequireAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans text-foreground">
      <header className="sticky top-0 z-10 flex flex-col justify-between gap-4 border-b border-border bg-background px-8 py-6 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Boxes className="h-7 w-7 text-primary" /> Serviços
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-foreground/60">
            Centralize a geração de pacotes e o provisionamento de APIs para as IAs.
          </p>
        </div>
      </header>

      <main className="scrollbar-clean flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            <ApplicationModuleCard
              title="Pkg Generator"
              description="Mantém o fluxo existente de compilação do executável Alpha 7, com os mesmos campos de banco e chave de acesso."
              badge="Legado"
              icon={HardDriveDownload}
              path="/main/aplications/pkg-generator"
              points={[
                'Fluxo atual preservado',
                'Geração de pacote ZIP',
                'Mesmo comportamento',
              ]}
            />

            <ApplicationModuleCard
              title="IA Alpha7 API"
              description="Gerencie as APIs que alimentam as IAs, com criação de instâncias, status operacional, logs e reinício."
              badge="Novo Módulo"
              icon={ServerCog}
              path="/main/aplications/ia-services"
              points={[
                'Criação de instâncias',
                'Listagem e status online',
                'Logs em tempo real',
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}