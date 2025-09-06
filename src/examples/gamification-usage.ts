// ============================================================================
// EXEMPLOS DE USO DA CONFIGURAÇÃO CENTRALIZADA DE GAMIFICAÇÃO
// ============================================================================
// Este arquivo demonstra como usar a nova configuração centralizada
// ============================================================================

import { 
  GAMIFICATION_CONFIG,
  getTokensForAction,
  calculateLevel,
  calculateLevelProgress,
  canExecuteAction,
  validateTokenAmount,
  validateAction,
  getAllActions,
  getAllLevels,
  getRateLimitConfig,
  type GamificationAction,
  type GamificationLevel
} from '../config/gamification';

// ============================================================================
// EXEMPLO 1: OBTENDO TOKENS PARA AÇÕES
// ============================================================================

export function exemploObterTokens() {
  console.log('=== EXEMPLO 1: Obtendo Tokens ===');
  
  // Obter tokens para diferentes ações
  const tokensCadastro = getTokensForAction('cadastro');
  const tokensCompraIngresso = getTokensForAction('compra_ingresso');
  const tokensLoginDiario = getTokensForAction('login_diario');
  
  console.log(`Cadastro: ${tokensCadastro} $BOX`);
  console.log(`Compra de Ingresso: ${tokensCompraIngresso} $BOX`);
  console.log(`Login Diário: ${tokensLoginDiario} $BOX`);
  
  // Usar configuração diretamente
  console.log(`Todos os tokens:`, GAMIFICATION_CONFIG.TOKENS);
}

// ============================================================================
// EXEMPLO 2: CALCULANDO NÍVEIS
// ============================================================================

export function exemploCalcularNiveis() {
  console.log('=== EXEMPLO 2: Calculando Níveis ===');
  
  const tokensExemplos = [0, 50, 150, 350, 750, 1200, 2500];
  
  tokensExemplos.forEach(tokens => {
    const level = calculateLevel(tokens);
    const progress = calculateLevelProgress(tokens);
    
    console.log(`${tokens} tokens -> Nível: ${level}`);
    console.log(`  Progresso: ${progress.progress.toFixed(1)}%`);
    console.log(`  Tokens para próximo: ${progress.tokensToNextLevel}`);
  });
}

// ============================================================================
// EXEMPLO 3: VALIDAÇÕES DE SEGURANÇA
// ============================================================================

export function exemploValidacoes() {
  console.log('=== EXEMPLO 3: Validações de Segurança ===');
  
  // Validar quantidade de tokens
  const quantidades = [0, 10, 50, 100, 10000, 15000];
  quantidades.forEach(qtd => {
    const isValid = validateTokenAmount(qtd);
    console.log(`${qtd} tokens: ${isValid ? '✅ Válido' : '❌ Inválido'}`);
  });
  
  // Validar ações
  const acoes = ['cadastro', 'login_diario', 'acao_inexistente', 'compra_ingresso'];
  acoes.forEach(acao => {
    const isValid = validateAction(acao);
    console.log(`Ação "${acao}": ${isValid ? '✅ Válida' : '❌ Inválida'}`);
  });
}

// ============================================================================
// EXEMPLO 4: RATE LIMITING
// ============================================================================

export function exemploRateLimiting() {
  console.log('=== EXEMPLO 4: Rate Limiting ===');
  
  const agora = new Date();
  const umaHoraAtras = new Date(agora.getTime() - 60 * 60 * 1000);
  const duasHorasAtras = new Date(agora.getTime() - 2 * 60 * 60 * 1000);
  
  // Testar rate limiting para diferentes ações
  const acoes: GamificationAction[] = ['login_diario', 'checkin_evento', 'compartilhamento'];
  
  acoes.forEach(acao => {
    const podeExecutarAgora = canExecuteAction(agora.toISOString(), acao);
    const podeExecutarUmaHora = canExecuteAction(umaHoraAtras.toISOString(), acao);
    const podeExecutarDuasHoras = canExecuteAction(duasHorasAtras.toISOString(), acao);
    
    console.log(`Ação: ${acao}`);
    console.log(`  Agora: ${podeExecutarAgora ? '✅ Pode' : '❌ Não pode'}`);
    console.log(`  Uma hora atrás: ${podeExecutarUmaHora ? '✅ Pode' : '❌ Não pode'}`);
    console.log(`  Duas horas atrás: ${podeExecutarDuasHoras ? '✅ Pode' : '❌ Não pode'}`);
  });
}

// ============================================================================
// EXEMPLO 5: CONFIGURAÇÕES DE NÍVEIS
// ============================================================================

export function exemploConfiguracoesNiveis() {
  console.log('=== EXEMPLO 5: Configurações de Níveis ===');
  
  // Obter todos os níveis
  const todosNiveis = getAllLevels();
  
  todosNiveis.forEach(nivel => {
    console.log(`${nivel.icon} ${nivel.name} (${nivel.description})`);
    console.log(`  Tokens: ${nivel.minTokens}-${nivel.maxTokens === Infinity ? '∞' : nivel.maxTokens}`);
    console.log(`  Cor: ${nivel.color}`);
    console.log(`  Benefícios: ${nivel.benefits.join(', ')}`);
    console.log('');
  });
}

// ============================================================================
// EXEMPLO 6: SISTEMA DE CONVITES
// ============================================================================

export function exemploSistemaConvites() {
  console.log('=== EXEMPLO 6: Sistema de Convites ===');
  
  // Simular processo de convite
  const convidadoId = 'user_123';
  const convidanteId = 'user_456';
  
  // 1. Convidante envia convite
  const tokensConvite = getTokensForAction('convidou_amigo');
  console.log(`Convidante ganha ${tokensConvite} $BOX por enviar convite`);
  
  // 2. Convidado se cadastra
  const tokensCadastro = getTokensForAction('cadastro');
  console.log(`Convidado ganha ${tokensCadastro} $BOX por se cadastrar`);
  
  // 3. Convidante ganha bônus por indicação confirmada
  const tokensIndicacao = getTokensForAction('indicacao_confirmada');
  console.log(`Convidante ganha ${tokensIndicacao} $BOX por indicação confirmada`);
  
  // 4. Calcular total
  const totalConvidante = tokensConvite + tokensIndicacao;
  const totalConvidado = tokensCadastro;
  
  console.log(`Total convidante: ${totalConvidante} $BOX`);
  console.log(`Total convidado: ${totalConvidado} $BOX`);
}

// ============================================================================
// EXEMPLO 7: SISTEMA DE MISSÕES DIÁRIAS
// ============================================================================

export function exemploMissoesDiarias() {
  console.log('=== EXEMPLO 7: Missões Diárias ===');
  
  const missoes = [
    { acao: 'login_diario' as GamificationAction, completada: true },
    { acao: 'compartilhamento' as GamificationAction, completada: true },
    { acao: 'participacao_enquete' as GamificationAction, completada: false },
    { acao: 'completou_missao_diaria' as GamificationAction, completada: false }
  ];
  
  let totalTokens = 0;
  
  missoes.forEach(missao => {
    if (missao.completada) {
      const tokens = getTokensForAction(missao.acao);
      totalTokens += tokens;
      console.log(`✅ ${missao.acao}: +${tokens} $BOX`);
    } else {
      console.log(`❌ ${missao.acao}: Não completada`);
    }
  });
  
  console.log(`Total de tokens ganhos: ${totalTokens} $BOX`);
  
  // Verificar se completou missão diária
  const missoesCompletadas = missoes.filter(m => m.completada).length;
  if (missoesCompletadas >= 3) {
    const bonus = getTokensForAction('completou_missao_diaria');
    console.log(`🎉 Bônus por completar missão diária: +${bonus} $BOX`);
    totalTokens += bonus;
  }
  
  console.log(`Total final: ${totalTokens} $BOX`);
}

// ============================================================================
// EXEMPLO 8: SISTEMA DE ACHIEVEMENTS
// ============================================================================

export function exemploAchievements() {
  console.log('=== EXEMPLO 8: Sistema de Achievements ===');
  
  const achievements = [
    { nome: 'Primeiro Login', acao: 'login_diario', tokens: 5 },
    { nome: 'Perfil Completo', acao: 'completar_perfil', tokens: 25 },
    { nome: 'Primeira Compra', acao: 'compra_ingresso', tokens: 100 },
    { nome: 'Convidou Amigo', acao: 'convidou_amigo', tokens: 10 },
    { nome: 'Indicação Confirmada', acao: 'indicacao_confirmada', tokens: 50 }
  ];
  
  console.log('Achievements disponíveis:');
  achievements.forEach(achievement => {
    const tokensConfig = getTokensForAction(achievement.acao as GamificationAction);
    console.log(`🏆 ${achievement.nome}: ${tokensConfig} $BOX`);
  });
}

// ============================================================================
// EXEMPLO 9: SISTEMA DE NÍVEIS COM PROGRESSO
// ============================================================================

export function exemploProgressoNiveis() {
  console.log('=== EXEMPLO 9: Progresso de Níveis ===');
  
  const tokensExemplos = [0, 50, 150, 350, 750, 1200, 2500];
  
  tokensExemplos.forEach(tokens => {
    const progresso = calculateLevelProgress(tokens);
    
    console.log(`\n--- ${tokens} tokens ---`);
    console.log(`Nível atual: ${progresso.currentLevelConfig.icon} ${progresso.currentLevelConfig.name}`);
    console.log(`Descrição: ${progresso.currentLevelConfig.description}`);
    console.log(`Cor: ${progresso.currentLevelConfig.color}`);
    
    if (progresso.nextLevel) {
      console.log(`Próximo nível: ${progresso.nextLevelConfig?.icon} ${progresso.nextLevelConfig?.name}`);
      console.log(`Progresso: ${progresso.progress.toFixed(1)}%`);
      console.log(`Tokens necessários: ${progresso.tokensToNextLevel}`);
    } else {
      console.log(`🎉 Nível máximo alcançado!`);
    }
  });
}

// ============================================================================
// EXEMPLO 10: SISTEMA DE VALIDAÇÃO COMPLETA
// ============================================================================

export function exemploValidacaoCompleta() {
  console.log('=== EXEMPLO 10: Validação Completa ===');
  
  interface AcaoGamificacao {
    acao: GamificationAction;
    tokens: number;
    ultimaExecucao?: string;
  }
  
  const acoes: AcaoGamificacao[] = [
    { acao: 'cadastro', tokens: 10 },
    { acao: 'login_diario', tokens: 5, ultimaExecucao: new Date().toISOString() },
    { acao: 'compartilhamento', tokens: 10, ultimaExecucao: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { acao: 'checkin_evento', tokens: 30, ultimaExecucao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
  ];
  
  acoes.forEach(({ acao, tokens, ultimaExecucao }) => {
    console.log(`\n--- Validando ação: ${acao} ---`);
    
    // Validar ação
    const acaoValida = validateAction(acao);
    console.log(`Ação válida: ${acaoValida ? '✅' : '❌'}`);
    
    // Validar quantidade de tokens
    const quantidadeValida = validateTokenAmount(tokens);
    console.log(`Quantidade válida: ${quantidadeValida ? '✅' : '❌'}`);
    
    // Validar rate limiting
    const podeExecutar = ultimaExecucao ? canExecuteAction(ultimaExecucao, acao) : true;
    console.log(`Pode executar: ${podeExecutar ? '✅' : '❌'}`);
    
    // Obter configuração de rate limiting
    const rateLimit = getRateLimitConfig(acao);
    if (rateLimit) {
      console.log(`Rate limit: ${rateLimit.description}`);
    }
    
    // Resultado final
    const podeExecutarAcao = acaoValida && quantidadeValida && podeExecutar;
    console.log(`Resultado: ${podeExecutarAcao ? '✅ Pode executar' : '❌ Não pode executar'}`);
  });
}

// ============================================================================
// EXECUTAR TODOS OS EXEMPLOS
// ============================================================================

export function executarTodosExemplos() {
  console.log('🚀 EXECUTANDO TODOS OS EXEMPLOS DE GAMIFICAÇÃO\n');
  
  exemploObterTokens();
  console.log('\n');
  
  exemploCalcularNiveis();
  console.log('\n');
  
  exemploValidacoes();
  console.log('\n');
  
  exemploRateLimiting();
  console.log('\n');
  
  exemploConfiguracoesNiveis();
  console.log('\n');
  
  exemploSistemaConvites();
  console.log('\n');
  
  exemploMissoesDiarias();
  console.log('\n');
  
  exemploAchievements();
  console.log('\n');
  
  exemploProgressoNiveis();
  console.log('\n');
  
  exemploValidacaoCompleta();
  
  console.log('\n✅ Todos os exemplos executados com sucesso!');
}
