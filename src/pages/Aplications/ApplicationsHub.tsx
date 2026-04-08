import {
  Boxes,
  HardDriveDownload,
  Puzzle,
  ServerCog,
} from 'lucide-react';
import ApplicationModuleCard from '../../components/ApplicationModuleCard';
import { useRequireAuth } from '../../hooks/useAuthRedirect';

export default function ApplicationsHub() {
  useRequireAuth();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-50 font-sans text-foreground">
      <header className="sticky top-0 z-10 flex shrink-0 flex-col justify-between gap-4 border-b border-border bg-background px-8 py-6 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Boxes className="h-7 w-7 text-primary" /> Serviços
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-foreground/60">
            Centralize a geração de pacotes, extensões e o provisionamento de
            APIs para as IAs.
          </p>
        </div>
      </header>

      <main className="scrollbar-clean min-h-0 flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
              title="APIs para IAs"
              description="Gerencie as APIs que alimentam as IAs, com criação de instâncias, status operacional, logs e reinício."
              badge="Novo módulo"
              icon={ServerCog}
              path="/main/aplications/ia-services"
              points={[
                'Criação de instâncias',
                'Listagem e status online',
                'Logs em tempo real',
              ]}
            />

            <ApplicationModuleCard
              title="Extensão Trier"
              description="Gere o ZIP da extensão Trier direto pela área de Serviços, com acompanhamento pelo popup global até a finalização."
              badge="Novo módulo"
              icon={Puzzle}
              path="/main/aplications/trier-extension"
              points={[
                'Solicita apenas URL e token',
                'Download automático do ZIP',
                'Mesma lógica do popup do PKG',
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
