// src/pages/PoliticaCookies.jsx
import { useEffect } from 'react'
import useTenant from '@/store/tenant'
import { formatEndereco, hojeISO } from '@/lib/format'

export default function PoliticaCookies() {
  const empresa = useTenant(s => s.empresa)
  const nomeFantasia = empresa?.nomeFantasia || 'Nossa Empresa'
  const email = empresa?.contato?.email || 'contato@empresa.com'
  const telefone = empresa?.contato?.telefone || '(00) 0000-0000'
  const endereco = formatEndereco(empresa)

  useEffect(() => {
    document.title = `Política de Cookies - ${nomeFantasia}`
  }, [nomeFantasia])

  if (!empresa) {
    return (
      <div className="container-max py-10">
        <h1 className="text-2xl font-semibold">Política de Cookies</h1>
        <p className="mt-3 text-muted-foreground">Carregando informações da unidade…</p>
      </div>
    )
  }

  return (
    <div className="container-max py-10 prose max-w-none">
      <h1>Política de Cookies – {nomeFantasia}</h1>
      <p><strong>Última atualização:</strong> {hojeISO()}</p>

      <p>Este site utiliza cookies e tecnologias semelhantes para melhorar sua experiência, entender como você usa nossos serviços e personalizar conteúdo.</p>

      <h2>O que são cookies?</h2>
      <p>Cookies são pequenos arquivos de texto armazenados no seu navegador. Eles permitem reconhecer suas preferências e visitas anteriores.</p>

      <h2>Tipos de cookies que utilizamos</h2>
      <ul>
        <li><strong>Essenciais:</strong> necessários para o funcionamento do site.</li>
        <li><strong>Desempenho/Analytics:</strong> coletam dados anônimos sobre uso e desempenho.</li>
        <li><strong>Funcionalidade:</strong> lembram suas preferências (por exemplo, idioma).</li>
        <li><strong>Marketing:</strong> auxiliam na entrega de anúncios mais relevantes (quando aplicável).</li>
      </ul>

      <h2>Gerenciamento de cookies</h2>
      <p>Você pode gerenciar ou desativar cookies nas configurações do seu navegador. Ao continuar navegando, você concorda com o uso conforme esta Política.</p>

      <h2>Contato</h2>
      <p>Dúvidas sobre esta Política? Fale com a equipe da <strong>{nomeFantasia}</strong>:</p>
      <ul>
        <li>📞 {telefone}</li>
        <li>✉️ {email}</li>
        <li>📍 {endereco}</li>
      </ul>
    </div>
  )
}
