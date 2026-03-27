import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PageHeader,
  ParamsTable,
  Callout,
} from '../../components/DocsComponents'
import { commonIaRequestFields, iaDocOrder, iaDocs } from './iaDocs'

const IAsOverview: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        badge="IAs"
        title="Agentes de IA"
        description="Fluxos de implantação, campos de instalação e checkpoints operacionais dos modelos de IA do painel interno."
      />

      <Callout type="info" title="Como esta seção foi organizada">
        Cada página de IA descreve o processo operacional do zero, com foco em implantação,
        validação da fila e homologação. O objetivo aqui não é detalhar o back-end, e sim o fluxo de operação.
      </Callout>

      <h2>Fluxo operacional comum</h2>
      <ol>
        <li>Solicite ou valide com o cliente as credenciais, tokens e liberações necessárias.</li>
        <li>Confirme internamente se o processo está liberado para seguir.</li>
        <li>Acesse o card da IA correspondente e preencha os campos da instalação.</li>
        <li>Valide a API key global e confira se a fila possui a chave correta.</li>
        <li>Faça a homologação antes de liberar o fluxo em produção.</li>
      </ol>

      <h2>Campos comuns da tela de instalação</h2>
      <ParamsTable params={commonIaRequestFields} />

      <Callout type="warning" title="Checkpoint obrigatório">
        <ul style={{ margin: 0, paddingLeft: '18px' }}>
          <li>A URL da instância deve ser enviada com <code>https://</code> e sem barra final.</li>
          <li>O código 2FA é obrigatório em todos os modelos documentados aqui.</li>
          <li>Se a fila não tiver API key, ou se a chave estiver diferente da API key global, a IA não funciona corretamente.</li>
        </ul>
      </Callout>

      <h2>Modelos disponíveis</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          margin: '0 0 24px',
        }}
      >
        {iaDocOrder.map((key) => {
          const doc = iaDocs[key]
          return (
            <button
              key={doc.slug}
              onClick={() => navigate(doc.docsPath)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '18px',
                background: 'var(--docs-surface-soft)',
                border: '1px solid var(--docs-border)',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--docs-surface-muted)'
                e.currentTarget.style.borderColor = 'var(--docs-accent-border)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--docs-surface-soft)'
                e.currentTarget.style.borderColor = 'var(--docs-border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--docs-accent)',
                }}
              >
                {doc.badge}
              </span>
              <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--docs-text)', lineHeight: 1.1 }}>
                {doc.title}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--docs-text-secondary)', lineHeight: 1.65 }}>
                {doc.summary}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default IAsOverview
