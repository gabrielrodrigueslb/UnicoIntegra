import React from 'react'
import { PageHeader } from './components/DocsComponents'

interface ChangelogEntry {
  version: string
  date: string
  type: 'feature' | 'fix' | 'breaking' | 'improvement'
  items: string[]
}

const changelog: ChangelogEntry[] = [
  {
    version: 'v1.2.0',
    date: '27 Mar 2026',
    type: 'feature',
    items: [
      'Adicionado suporte a metadata nos contatos',
      'Novo endpoint GET /v1/contatos/:id/historico',
      'Filtro por tags na listagem de contatos',
    ],
  },
  {
    version: 'v1.1.1',
    date: '10 Mar 2026',
    type: 'fix',
    items: [
      'Corrigido bug no campo telefone para números internacionais',
      'Melhorada mensagem de erro no 409 Conflict',
    ],
  },
  {
    version: 'v1.1.0',
    date: '01 Mar 2026',
    type: 'improvement',
    items: [
      'Rate limit aumentado para 1000 req/min no plano Pro',
      'Respostas de listagem agora incluem paginação via cursor',
      'Header X-Request-Id adicionado em todas as respostas',
    ],
  },
  {
    version: 'v1.0.0',
    date: '01 Jan 2026',
    type: 'feature',
    items: [
      'Lançamento da API v1',
      'Endpoints de Contatos, Mensagens e Webhooks',
      'Autenticação via Bearer Token',
    ],
  },
]

const typeConfig = {
  feature:     { label: 'Feature',     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  fix:         { label: 'Bug Fix',     color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  breaking:    { label: 'Breaking',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  improvement: { label: 'Melhoria',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
}

const Changelog: React.FC = () => {
  return (
    <div>
      <PageHeader
        badge="Changelog"
        title="Novidades"
        description="Histórico de versões e mudanças da API Unico Contato."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {changelog.map((entry) => {
          const config = typeConfig[entry.type]
          return (
            <div key={entry.version} style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: config.color, flexShrink: 0, marginTop: '4px',
                }} />
                <div style={{ width: '1px', flex: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>
              <div style={{ flex: 1, paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>{entry.version}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                    padding: '2px 8px', borderRadius: '4px',
                    color: config.color, background: config.bg,
                  }}>{config.label}</span>
                  <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 'auto' }}>{entry.date}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {entry.items.map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.7 }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Changelog
