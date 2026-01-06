import { useState } from 'react';
import { HardDriveDownload, Zap, Server, Key, Database, User, Lock } from 'lucide-react';

import {
  useGeneration,
  type PkgFormData,
} from '../../context/GenerationContext';

export function PkgGenerator() {
  const { generateApp, status } = useGeneration();

  const [formData, setFormData] = useState<PkgFormData>({
    nome_cliente: '',
    db_host: '',
    db_user: '',
    db_password: '',
    db_database: '',
    access_key: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateApp(formData);
  };

  const labelClass = "block text-xs font-semibold text-muted-foreground mb-1.5 ml-1 uppercase tracking-wide";

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans text-foreground">
      
      {/* HEADER COMPACTO */}
      <header className="px-8 py-6 bg-card border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 bg-background">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HardDriveDownload className="w-6 h-6 text-primary" />
            Gerador de Executável
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Geração de pacotes de instalação (.exe)
          </p>
        </div>
      </header>

      {/* CONTENT - Centralizado verticalmente e horizontalmente */}
      <main className="flex-1 flex items-center justify-center p-6 bg-muted/30 overflow-y-auto">
        <div className="w-full max-w-5xl">
          
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Bloco Informativo Compacto */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-100  rounded-xl flex items-center gap-3">
               <div className="p-2 bg-blue-100 rounded-lg text-blue-600  shrink-0">
                 <Zap className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-xs text-blue-800 font-medium">
                   O sistema irá compilar e gerar um instalador Windows automaticamente baseado nas credenciais abaixo.
                 </p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* GRID DE INPUTS (3 Colunas para economizar altura) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* 1. Nome do Cliente */}
                <div className="group">
                  <label className={labelClass}>Nome do Cliente</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type="text"
                      name="nome_cliente"
                      className="w-full p-2.5 pl-10 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground focus:bg-card"
                      value={formData.nome_cliente}
                      onChange={handleChange}
                      placeholder="Ex: Farmácia Central"
                      required
                    />
                  </div>
                </div>

                {/* 2. Host */}
                <div className="group">
                  <label className={labelClass}>Host (IP)</label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type="text"
                      name="db_host"
                      className="w-full p-2.5 pl-10 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground focus:bg-card"
                      value={formData.db_host}
                      onChange={handleChange}
                      placeholder="192.168.x.x"
                      required
                    />
                  </div>
                </div>

                {/* 3. Database Name */}
                <div className="group">
                  <label className={labelClass}>Database Name</label>
                  <div className="relative">
                    <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type="text"
                      name="db_database"
                      className="w-full p-2.5 pl-10 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground focus:bg-card"
                      value={formData.db_database}
                      onChange={handleChange}
                      placeholder="db_cliente"
                      required
                    />
                  </div>
                </div>

                {/* 4. DB User */}
                <div className="group">
                  <label className={labelClass}>Usuário do Banco</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type="text"
                      name="db_user"
                      className="w-full p-2.5 pl-10 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground focus:bg-card"
                      value={formData.db_user}
                      onChange={handleChange}
                      placeholder="postgres"
                      required
                    />
                  </div>
                </div>

                {/* 5. DB Password */}
                <div className="group">
                  <label className={labelClass}>Senha do Banco</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type="text"
                      name="db_password"
                      className="w-full p-2.5 pl-10 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground focus:bg-card"
                      value={formData.db_password}
                      placeholder="********"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 6. Access Key */}
                <div className="group">
                  <label className={labelClass}>Chave de Acesso</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type="text"
                      name="access_key"
                      className="w-full p-2.5 pl-10 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground focus:bg-card font-mono"
                      value={formData.access_key}
                      onChange={handleChange}
                      placeholder="Auth Key"
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Botão de Ação */}
              <div className="mt-2">
                <button
                  type="submit"
                  disabled={status === 'generating'}
                  className={`
                    w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 text-base
                    ${
                      status === 'generating'
                        ? 'bg-muted cursor-wait text-muted-foreground shadow-none'
                        : 'bg-primary hover:opacity-90 hover:-translate-y-0.5 hover:shadow-primary/30'
                    }
                  `}
                >
                  {status === 'generating' ? (
                    'Gerando em 2º plano...'
                  ) : (
                    <>
                      Iniciar Geração <HardDriveDownload className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}