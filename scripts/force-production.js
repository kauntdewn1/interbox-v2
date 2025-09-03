#!/usr/bin/env node

/**
 * Script para forçar modo production do Clerk
 * Executa: node scripts/force-production.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Forçando modo production do Clerk...\n');

// Verifica arquivo .env
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  process.exit(1);
}

// Lê arquivo .env
const envContent = fs.readFileSync(envPath, 'utf8');

// Verifica se já está em produção
const isProduction = envContent.includes('pk_live_') && envContent.includes('sk_live_');

if (isProduction) {
  console.log('✅ Clerk já está configurado para PRODUÇÃO');
  console.log('   - Chaves pk_live_ encontradas');
  console.log('   - Chaves sk_live_ encontradas');
} else {
  console.log('❌ Clerk não está em modo produção');
  console.log('   - Verifique se as chaves começam com pk_live_ e sk_live_');
}

// Verifica variáveis de ambiente
const requiredVars = [
  'VITE_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CLERK_FRONTEND_API'
];

console.log('\n📋 Verificando variáveis de ambiente:');
requiredVars.forEach(varName => {
  const hasVar = envContent.includes(varName);
  console.log(`   ${hasVar ? '✅' : '❌'} ${varName}`);
});

// Recomendações
console.log('\n🚀 Para garantir modo production:');
console.log('   1. Execute: npm run build');
console.log('   2. Execute: npm run preview');
console.log('   3. Limpe cache do navegador');
console.log('   4. Verifique dashboard.clerk.com');

if (isProduction) {
  console.log('\n🎉 Tudo configurado para produção!');
} else {
  console.log('\n⚠️  Configure as chaves de produção primeiro');
}
