// ═══════════════════════════════════════
//  Terra Engenharia — Camada de Persistência
//  Compartilhada entre todas as páginas via localStorage
// ═══════════════════════════════════════

const DB_KEYS = {
  propostas:            'terra_propostas',
  projetos:             'terra_projetos',
  lancamentos:          'terra_lancamentos',
  clientes:             'terra_clientes',
  alertas_dispensados:  'terra_alertas_dispensados',
};

/**
 * Salva um array/objeto no localStorage sob a chave dada.
 */
function salvarDados(chave, dados) {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
  } catch(e) {
    console.warn('[Terra] Erro ao salvar ' + chave + ':', e);
  }
}

/**
 * Lê e faz parse de uma chave do localStorage.
 * Retorna uma cópia profunda de `padrao` se a chave não existir.
 */
function carregarDados(chave, padrao) {
  try {
    const raw = localStorage.getItem(chave);
    if (raw === null) return JSON.parse(JSON.stringify(padrao));
    return JSON.parse(raw);
  } catch(e) {
    console.warn('[Terra] Erro ao carregar ' + chave + ':', e);
    return JSON.parse(JSON.stringify(padrao));
  }
}

/**
 * Apaga todos os dados salvos (útil para reset em desenvolvimento).
 * Para usar: abra o console e chame limparTodosDados().
 */
function limparTodosDados() {
  Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
  alert('Todos os dados foram apagados. Recarregue a página.');
}
