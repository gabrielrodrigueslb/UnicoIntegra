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
        description="Fluxos de implantação, checklists operacionais e detalhes técnicos dos modelos de IA do painel interno."
      />

      <Callout type="info" title="Escopo desta seção">
        Esta área prioriza o processo operacional de implantação de cada IA.
        A parte de endpoint, payload e resposta fica como apoio técnico para as etapas finais de instalação.
      </Callout>

      <h2>Fluxo de criação</h2>
      <ol>
        <li>Valide os pré-requisitos operacionais do cliente, como acesso, dados técnicos e liberações externas.</li>
        <li>Crie ou valide os serviços auxiliares necessários para o modelo.</li>
        <li>Preencha a tela de instalação da IA com nome, instância, 2FA e campos específicos.</li>
        <li>O backend cria o assistente, instala automações auxiliares e atualiza o template final.</li>
        <li>Homologue a IA antes de liberar o fluxo para uso definitivo do cliente.</li>
      </ol>

      <h2>Campos comuns</h2>
      <ParamsTable params={commonIaRequestFields} />

      <Callout type="warning" title="Observações importantes">
        <ul style={{ margin: 0, paddingLeft: '18px' }}>
          <li>A URL da instância deve ser enviada com <code>https://</code> e sem barra final.</li>
          <li>O código 2FA é obrigatório em todos os modelos documentados aqui.</li>
          <li>Modelos com ERP ou e-commerce instalam automações auxiliares antes do template final.</li>
        </ul>
      </Callout>

      <h2>Modelos disponíveis</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
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
                gap: '8px',
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#3b82f6',
                }}
              >
                {doc.badge}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>
                {doc.title}
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
                {doc.summary}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Endpoint: <code>{doc.endpoint}</code>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default IAsOverview
