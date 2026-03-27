import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader, Callout } from './components/DocsComponents'

const DocsIntro: React.FC = () => {
  const navigate = useNavigate()

  const cards = [
    {
      icon: '⚡',
      title: 'Primeiros Passos',
      description: 'Configure sua primeira integracao em minutos.',
      path: '/main/docs/getting-started/primeiros-passos',
    },
    {
      icon: '🔐',
      title: 'Autenticacao',
      description: 'Aprenda a autenticar suas requisicoes com Bearer Token.',
      path: '/main/docs/getting-started/autenticacao',
    },
    {
      icon: '📋',
      title: 'Referencia da API',
      description: 'Documentacao completa de todos os endpoints.',
      path: '/main/docs/referencia/contatos/listar',
    },
    {
      icon: '📡',
      title: 'Webhooks',
      description: 'Receba notificacoes em tempo real de eventos.',
      path: '/main/docs/conceitos/webhooks',
    },
  ]

  return (
    <div>
      <PageHeader
        badge="Documentacao"
        title="API Unico Contato"
        description="Bem-vindo a documentacao oficial da API Unico Contato. Aqui voce encontra guias, referencias e exemplos para integrar com nossa plataforma."
      />

      <Callout type="info" title="Versao atual: v1">
        Esta documentacao cobre a versao estavel v1 da API. Para mudancas recentes, consulte o{' '}
        <Link to="/main/docs/changelog">Changelog</Link>.
      </Callout>

      <h2>Por onde comecar?</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '0 0 32px' }}>
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.path)}
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
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
            }}
          >
            <span style={{ fontSize: '20px' }}>{card.icon}</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{card.title}</span>
            <span style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{card.description}</span>
          </button>
        ))}
      </div>

      <h2>Visao geral</h2>
      <p>
        A API Unico Contato e uma API REST que permite gerenciar contatos, conversas e automacoes
        da sua plataforma. Todas as requisicoes usam JSON e autenticacao via Bearer Token.
      </p>

      <h3>URLs Base</h3>
      <table>
        <thead>
          <tr>
            <th>Ambiente</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Producao</td>
            <td><code>https://api.unicocontato.com.br/v1</code></td>
          </tr>
          <tr>
            <td>Sandbox</td>
            <td><code>https://sandbox-api.unicocontato.com.br/v1</code></td>
          </tr>
        </tbody>
      </table>

      <h3>Formato das respostas</h3>
      <p>
        Todas as respostas sao retornadas em JSON. Datas seguem o formato <code>ISO 8601</code>.
        Erros retornam sempre um objeto com <code>code</code> e <code>message</code>.
      </p>
    </div>
  )
}

export default DocsIntro
