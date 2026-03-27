import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DocsLayout from './components/DocsLayout'
import DocsIntro from './index'
import Autenticacao from './content/getting-started/Autenticacao'
import CriarContato from './content/referencia/contatos/CriarContato'
import Erros from './Erros'
import Changelog from './Changelog'

/**
 * DocsRouter
 * 
 * Adicione novas páginas aqui conforme criar os arquivos em /content.
 * O padrão é: criar o arquivo .tsx em content/ e adicionar a rota aqui.
 */
const DocsRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<DocsLayout />}>
        {/* Intro */}
        <Route index element={<DocsIntro />} />

        {/* Getting Started */}
        <Route path="getting-started/autenticacao" element={<Autenticacao />} />
        <Route path="getting-started/ambientes" element={<ComingSoon title="Ambientes" />} />
        <Route path="getting-started/primeiros-passos" element={<ComingSoon title="Primeiros Passos" />} />

        {/* Conceitos */}
        <Route path="conceitos/contatos" element={<ComingSoon title="Conceito: Contatos" />} />
        <Route path="conceitos/conversas" element={<ComingSoon title="Conceito: Conversas" />} />
        <Route path="conceitos/webhooks" element={<ComingSoon title="Conceito: Webhooks" />} />

        {/* Guias */}
        <Route path="guias/criar-contato" element={<ComingSoon title="Guia: Criar um Contato" />} />
        <Route path="guias/enviar-mensagem" element={<ComingSoon title="Guia: Enviar Mensagem" />} />
        <Route path="guias/configurar-webhook" element={<ComingSoon title="Guia: Configurar Webhook" />} />

        {/* Referência - Contatos */}
        <Route path="referencia/contatos/criar" element={<CriarContato />} />
        <Route path="referencia/contatos/listar" element={<ComingSoon title="Listar Contatos" />} />
        <Route path="referencia/contatos/atualizar" element={<ComingSoon title="Atualizar Contato" />} />
        <Route path="referencia/contatos/deletar" element={<ComingSoon title="Deletar Contato" />} />

        {/* Referência - Mensagens */}
        <Route path="referencia/mensagens/enviar" element={<ComingSoon title="Enviar Mensagem" />} />
        <Route path="referencia/mensagens/listar" element={<ComingSoon title="Listar Mensagens" />} />

        {/* Referência - Webhooks */}
        <Route path="referencia/webhooks/criar" element={<ComingSoon title="Criar Webhook" />} />
        <Route path="referencia/webhooks/listar" element={<ComingSoon title="Listar Webhooks" />} />

        {/* Misc */}
        <Route path="erros" element={<Erros />} />
        <Route path="changelog" element={<Changelog />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/main/docs" replace />} />
      </Route>
    </Routes>
  )
}

/** Placeholder para páginas ainda não documentadas */
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div>
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '80px 0', gap: '12px', textAlign: 'center',
    }}>
      <span style={{ fontSize: '32px' }}>📝</span>
      <h1 style={{ margin: 0, fontSize: '20px', color: '#f1f5f9' }}>{title}</h1>
      <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
        Esta página ainda está sendo documentada.
      </p>
    </div>
  </div>
)

export default DocsRouter
