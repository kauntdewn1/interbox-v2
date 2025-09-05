// lib/helpers.ts

/**
 * Interface para erros do Supabase
 */
interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

/**
 * Trata erros comuns retornados pelo Supabase e lança mensagens mais amigáveis.
 */
export function handleSupabaseError(error: unknown, context: string): never {
  console.error(`❌ Erro no Supabase (${context}):`, error);
  
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as SupabaseError;
    switch (supabaseError.code) {
      case 'PGRST116':
        throw new Error('Dados não encontrados');
      case 'PGRST301':
        throw new Error('Erro de validação dos dados');
      case 'PGRST302':
        throw new Error('Erro de permissão');
      default:
        throw new Error(supabaseError.message || 'Erro desconhecido no banco de dados');
    }
  } else if (error instanceof Error) {
    throw new Error(`Erro no Supabase (${context}): ${error.message}`);
  } else {
    throw new Error(`Erro desconhecido no Supabase (${context})`);
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
  