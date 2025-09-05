// Utilidades de planos (normalização + helpers)

export function pick(obj = {}, ...keys) {
  for (const k of keys) if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k]
  return undefined
}

export function money(n = 0) {
  return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Retorna o valor anual normalizado do plano */
export function getAnual(plano = {}) {
  // Nos dados do Progem, "valorUnitario" representa o valor ANUAL do plano
  return Number(pick(plano, 'valorUnitario', 'valor_anual', 'valorAnual')) || 0
}

/** Retorna o valor mensal normalizado do plano (anual / 12) */
export function getMensal(plano = {}) {
  return getAnual(plano) / 12
}

/** Encontra a faixa por idade (array pode vir em camelCase ou snake_case) */
export function encontrarFaixaPorIdade(faixas = [], idade = 0) {
  const i = Number(idade || 0)
  return (faixas || []).find(f => {
    const min = Number(f.idadeMinima ?? f.idade_minima ?? 0)
    const max = Number(f.idadeMaxima ?? f.idade_maxima ?? 999)
    return i >= min && i <= max
  })
}

/** Verifica se é isento por idade/parentesco (conforme regra enviada) */
export function isIsento(isencoes = [], idade = 0, parentesco = '') {
  const i = Number(idade || 0)
  const p = String(parentesco || '').toUpperCase()
  return (isencoes || []).some(item => {
    const min = Number(item.idadeMinima ?? item.idade_minima ?? 0)
    const max = Number(item.idadeMaxima ?? item.idade_maxima ?? 999)
    const par = String(item.parentesco || '').toUpperCase()
    const okIdade = i >= min && i <= max
    const okPar = !par || par === p
    return okIdade && okPar
  })
}
