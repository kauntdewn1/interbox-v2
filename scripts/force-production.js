#!/usr/bin/env node

/**
 * Script para verificar modo production do Clerk
 * Executa: node scripts/force-production.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Verificando configuração do Clerk...\n');

// Verifica arquivo .env
const envPath = path.join(process.cwd(), '.env');
const envLocalPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  process.exit(1);
}

// Lê arquivo .env
const envContent = fs.readFileSync(envPath, 'utf8');

// Verifica se está em produção
const isProduction = envContent.includes('pk_live_') && envContent.includes('sk_live_');
const isTest = envContent.includes('pk_test_') && envContent.includes('sk_test_');

// Verifica se existe .env.local (desenvolvimento)
const hasLocalEnv = fs.existsSync(envLocalPath);

console.log('📋 Status da Configuração:');

if (isProduction) {
  console.log('   ✅ PRODUÇÃO: Chaves pk_live_ e sk_live_ encontradas');
} else if (isTest) {
  console.log('   🧪 TESTE: Chaves pk_test_ e sk_test_ encontradas');
} else {
  console.log('   ❌ DESCONHECIDO: Tipo de chave não identificado');
}

if (hasLocalEnv) {
  console.log('   📁 .env.local encontrado (desenvolvimento local)');
} else {
  console.log('   📁 .env.local não encontrado');
}

// Verifica variáveis de ambiente
const requiredVars = [
  'VITE_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CLERK_FRONTEND_API'
];

console.log('\n🔑 Variáveis de Ambiente:');
requiredVars.forEach(varName => {
  const hasVar = envContent.includes(varName);
  const value = envContent.match(new RegExp(`${varName}=(.+)`));
  if (hasVar && value) {
    const keyType = value[1].includes('pk_live_') ? 'PRODUÇÃO' : 
                   value[1].includes('pk_test_') ? 'TESTE' : 'DESCONHECIDO';
    console.log(`   ${hasVar ? '✅' : '❌'} ${varName} (${keyType})`);
  } else {
    console.log(`   ❌ ${varName}`);
  }
});

// Recomendações baseadas no ambiente
console.log('\n🚀 Recomendações:');

if (isProduction && !hasLocalEnv) {
  console.log('   ✅ Tudo configurado para PRODUÇÃO');
  console.log('   📝 Para desenvolvimento local:');
  console.log('      1. Copie env.local.example para .env.local');
  console.log('      2. Use chaves de TESTE do Clerk');
  console.log('      3. Execute: npm run dev');
} else if (isProduction && hasLocalEnv) {
  console.log('   ⚠️  Configuração mista detectada');
  console.log('   📝 Para desenvolvimento local:');
  console.log('      1. Use .env.local com chaves de TESTE');
  console.log('      2. Execute: npm run dev');
  console.log('   📝 Para produção:');
  console.log('      1. Use .env com chaves LIVE');
  console.log('      2. Execute: npm run build && npm run preview');
} else if (isTest) {
  console.log('   🧪 Modo TESTE ativo');
  console.log('   📝 Para produção:');
  console.log('      1. Use .env com chaves LIVE');
  console.log('      2. Execute: npm run build && npm run preview');
} else {
  console.log('   ❌ Configuração inválida');
  console.log('   📝 Configure as chaves corretas primeiro');
}

console.log('\n🌐 URLs de Teste:');
console.log('   - Desenvolvimento: http://localhost:3002 (npm run dev)');
console.log('   - Produção Local: http://localhost:4173 (npm run preview)');
console.log('   - Produção Real: https://cerradointerbox.com.br');

if (isProduction) {
  console.log('\n🎉 Clerk configurado para PRODUÇÃO!');
} else {
  console.log('\n⚠️  Configure as chaves apropriadas para o ambiente desejado');
}
