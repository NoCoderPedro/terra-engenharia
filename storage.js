// ═══════════════════════════════════════════════════════
//  Terra Engenharia — Camada de Persistência
//  Supabase (cloud) com localStorage como cache local
// ═══════════════════════════════════════════════════════

const SUPABASE_URL     = 'https://llkxhjwgwiatyyqxrse.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsa3hoandnd2lhdHl5eXF4cnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzcxMjksImV4cCI6MjA5MDUxMzEyOX0.S1QVsQSut-yPClfm8ovxbFEQZUWGAwYWLJdEBZGVrq0';

// Inicializa o cliente Supabase (disponível via CDN em cada página)
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DB_KEYS = {
  propostas:           'terra_propostas',
  projetos:            'terra_projetos',
  lancamentos:         'terra_lancamentos',
  clientes:            'terra_clientes',
  alertas_dispensados: 'terra_alertas_dispensados',
};

/**
 * Salva no localStorage imediatamente (UI não trava)
 * e sincroniza com Supabase em background.
 */
function salvarDados(chave, dados) {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
  } catch(e) {
    console.warn('[Terra] Erro ao salvar localmente:', e);
  }

  // Sync para a cloud em background — não bloqueia a UI
  _sb.from('dados')
    .upsert({ chave, valor: dados, atualizado_em: new Date().toISOString() })
    .then(({ error }) => {
      if (error) console.warn('[Terra] Erro ao salvar na cloud:', error);
    });
}

/**
 * Lê do localStorage (mantido atualizado pela sincronização no carregamento).
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
 * Busca todos os dados do Supabase e atualiza o localStorage.
 * Deve ser chamada uma vez no carregamento de cada página.
 * Retorna uma Promise — aguarde antes de renderizar.
 */
async function sincronizarDaCloud() {
  try {
    const { data, error } = await _sb.from('dados').select('chave, valor');
    if (error) {
      console.warn('[Terra] Erro ao sincronizar da cloud:', error);
      return;
    }
    if (data) {
      data.forEach(row => {
        try {
          localStorage.setItem(row.chave, JSON.stringify(row.valor));
        } catch(e) {}
      });
    }
  } catch(e) {
    console.warn('[Terra] Falha na sincronização — usando dados locais:', e);
  }
}

/**
 * Apaga todos os dados locais e na cloud (para reset em desenvolvimento).
 */
async function limparTodosDados() {
  Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
  await _sb.from('dados').delete().in('chave', Object.values(DB_KEYS));
  alert('Todos os dados foram apagados. Recarregue a página.');
}
