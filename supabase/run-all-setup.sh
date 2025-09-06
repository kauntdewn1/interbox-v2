#!/bin/bash

# ============================================================================
# SCRIPT DE SETUP COMPLETO - INTERBØX V2
# ============================================================================
# Executa todos os SQLs na ordem correta via CLI
# ============================================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações do Supabase
SUPABASE_URL="vlwuwutoulfbbieznios.supabase.co"
SUPABASE_DB="postgres"
SUPABASE_USER="postgres"

echo -e "${BLUE}🚀 Iniciando setup completo do INTERBØX V2...${NC}"

# Função para executar SQL
run_sql() {
    local file=$1
    local description=$2
    
    echo -e "${YELLOW}📄 Executando: $description${NC}"
    echo -e "${BLUE}   Arquivo: $file${NC}"
    
    if [ -f "$file" ]; then
        psql "postgresql://$SUPABASE_USER@$SUPABASE_URL:5432/$SUPABASE_DB" -f "$file"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Sucesso: $description${NC}"
        else
            echo -e "${RED}❌ Erro: $description${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Arquivo não encontrado: $file${NC}"
        exit 1
    fi
    echo ""
}

# 1. Limpeza completa
echo -e "${YELLOW}🧹 Etapa 1: Limpeza completa${NC}"
run_sql "supabase/cleanup-and-recreate.sql" "Limpeza completa do banco"

# 2. Schema principal
echo -e "${YELLOW}🏗️  Etapa 2: Schema principal${NC}"
run_sql "supabase-schema.sql" "Schema principal do banco"

# 3. Tabelas core
echo -e "${YELLOW}📊 Etapa 3: Tabelas core${NC}"
run_sql "supabase/create-core-tables.sql" "Criação das tabelas principais"

# 4. Setup completo
echo -e "${YELLOW}⚙️  Etapa 4: Setup completo${NC}"
run_sql "supabase/complete-setup-fixed.sql" "Setup completo corrigido"

# 5. Segurança e auditoria
echo -e "${YELLOW}🔒 Etapa 5: Segurança e auditoria${NC}"
run_sql "supabase/security-audit-setup.sql" "Sistema de segurança e auditoria"

# 6. Funções de autenticação
echo -e "${YELLOW}🔐 Etapa 6: Funções de autenticação${NC}"
run_sql "supabase/fix-auth-functions.sql" "Funções de autenticação"

# 7. Funções dependentes
echo -e "${YELLOW}🔗 Etapa 7: Funções dependentes${NC}"
run_sql "supabase/fix-user-dependent-functions.sql" "Funções dependentes de users"

# 8. Correção de views
echo -e "${YELLOW}👁️  Etapa 8: Correção de views${NC}"
run_sql "supabase/force-fix-views.sql" "Correção das views de segurança"

# 9. Correção de search path
echo -e "${YELLOW}🛡️  Etapa 9: Correção de search path${NC}"
run_sql "supabase/fix-search-path.sql" "Correção do search path das funções"

echo -e "${GREEN}🎉 Setup completo finalizado com sucesso!${NC}"
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo -e "   1. Verificar se o erro 404 foi resolvido"
echo -e "   2. Testar o sistema de gamificação"
echo -e "   3. Verificar as políticas RLS"
echo -e "   4. Testar o sistema de convites"
