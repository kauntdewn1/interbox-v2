// lib/helpers.ts

/**
 * Trata erros comuns retornados pelo Supabase e lança mensagens mais amigáveis.
 */
export function handleSupabaseError(error: any, context: string): never {
    console.error(`❌ Erro no Supabase (${context}):`, error);
  
    switch (error.code) {
      case 'PGRST116':
        throw new Error('Dados não encontrados');
      case 'PGRST301':
        throw new Error('Erro de validação dos dados');
      case 'PGRST302':
        throw new Error('Erro de permissão');
      default:
        throw new Error(error.message || 'Erro desconhecido no banco de dados');
    }
  }
  
  /**
   * Garante que os dados retornados do Supabase não são nulos antes de usar.
   */
  export function validateData<T>(data: T | null, context: string): T {
    if (data === null) {
      throw new Error(`${context} não encontrado`);
    }
    return data;
  }
  