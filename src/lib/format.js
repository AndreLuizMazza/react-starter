// src/lib/format.js
export function formatEndereco(empresa) {
  const e = empresa?.endereco || {};
  const partes = [
    e.logradouro && e.numero ? `${e.logradouro}, ${e.numero}` : (e.logradouro || ''),
    e.bairro,
    (e.cidade && e.uf) ? `${e.cidade}/${e.uf}` : (e.cidade || e.uf || ''),
    e.cep ? `CEP ${e.cep}` : '',
  ].filter(Boolean);
  return partes.join(' - ');
}

export function hojeISO() {
  try {
    const d = new Date();
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch {
    return '';
  }
}
