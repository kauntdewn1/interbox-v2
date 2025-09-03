# Interbox V2 - Makefile
# Comandos para desenvolvimento, build e deploy (Clerk + Supabase)

.PHONY: help install dev build preview deploy clean lint format test clerk-setup supabase-setup workstation-setup code-standards version build-versioned deploy-versioned env-check

# Variáveis
PROJECT_NAME = interbox-landing
NODE_VERSION = 18
PORT = 3002

# Cores para output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
PURPLE = \033[0;35m
CYAN = \033[0;36m
WHITE = \033[1;37m
NC = \033[0m # No Color

.DEFAULT_GOAL := help

help: ## Mostra esta ajuda
	@echo "$(CYAN)Interbox Landing - Comandos Disponíveis$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Exemplos de uso:$(NC)"
	@echo "  make dev          # Inicia servidor de desenvolvimento"
	@echo "  make build        # Gera build de produção"
	@echo "  make deploy       # Faz deploy na Vercel/Netlify"
	@echo "  make clerk-setup  # Configura Clerk"
	@echo "  make supabase-setup # Configura Supabase"
	@echo "  make env-check    # Verifica variáveis de ambiente"
	@echo "  make code-standards # Mostra padrões de código"
	@echo "  make version      # Gera nova versão automaticamente"
	@echo "  make build-versioned # Build com versionamento automático"

use-node: ## Garante versão correta do Node
	@echo "$(BLUE)Usando Node $(NODE_VERSION)...$(NC)"
	@which volta >/dev/null 2>&1 && volta install node@$(NODE_VERSION) || true
	@which nvm >/dev/null 2>&1 && . ~/.nvm/nvm.sh && nvm use $(NODE_VERSION) || true

install: ## Instala dependências
	@echo "$(BLUE)Instalando dependências...$(NC)"
	npm install
	@echo "$(GREEN)✓ Dependências instaladas$(NC)"

dev: ## Inicia servidor de desenvolvimento
	@echo "$(BLUE)Iniciando servidor de desenvolvimento na porta $(PORT)...$(NC)"
	@echo "$(YELLOW)URL: http://localhost:$(PORT)$(NC)"
	npm run dev

build: ## Gera build de produção
	@echo "$(BLUE)Gerando build de produção...$(NC)"
	npm run build
	@echo "$(GREEN)✓ Build gerado em dist/$(NC)"

build-versioned: ## Gera build com versionamento automático
	@echo "$(BLUE)Gerando build com versionamento automático...$(NC)"
	npm run build:versioned
	@echo "$(GREEN)✓ Build versionado gerado em dist/$(NC)"

build-pwa: ## Gera apenas manifest e sw.js
	@echo "$(BLUE)Buildando Service Worker e manifest...$(NC)"
	npm run build
	@echo "$(GREEN)✓ PWA gerado$(NC)"

preview: ## Preview do build de produção
	@echo "$(BLUE)Iniciando preview do build...$(NC)"
	npm run preview

deploy: ## Deploy na Vercel/Netlify
	@echo "$(BLUE)Fazendo deploy na Vercel/Netlify...$(NC)"
	npm run deploy

deploy-versioned: ## Deploy com versionamento automático
	@echo "$(BLUE)Fazendo deploy com versionamento automático...$(NC)"
	npm run deploy:hosting
	@echo "$(GREEN)✓ Deploy versionado concluído$(NC)"

deploy-functions: ## Deploy das Edge Functions do Supabase
	@echo "$(BLUE)Deployando Edge Functions do Supabase...$(NC)"
	npm run deploy:supabase
	@echo "$(GREEN)✓ Edge Functions deployadas$(NC)"

version: ## Gera nova versão automaticamente
	@echo "$(BLUE)Gerando nova versão automaticamente...$(NC)"
	@echo "$(YELLOW)📝 Versão atual:$(NC)"
	@node -p "require('./package.json').version"
	@echo "$(YELLOW)🔗 Git Hash:$(NC)"
	@git rev-parse --short HEAD 2>/dev/null || echo "Git não disponível"
	@echo "$(YELLOW)🌿 Branch:$(NC)"
	@git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "Git não disponível"
	@echo ""
	@echo "$(BLUE)Executando script de versionamento...$(NC)"
	npm run version:build
	@echo "$(GREEN)✓ Versão gerada automaticamente$(NC)"
	@echo ""
	@echo "$(YELLOW)📋 Informações da nova versão:$(NC)"
	@echo "$(CYAN)Versão:$(NC) $(shell node -p "require('./package.json').version")"
	@echo "$(CYAN)Build ID:$(NC) $(shell node -p "require('./package.json').buildInfo?.buildId || 'N/A'")"
	@echo "$(CYAN)Data:$(NC) $(shell node -p "require('./package.json').buildInfo?.buildDate || 'N/A'")"

version-patch: ## Incrementa versão patch (1.0.0 -> 1.0.1)
	@echo "$(BLUE)Incrementando versão patch...$(NC)"
	npm run version:patch
	@echo "$(GREEN)✓ Versão patch incrementada$(NC)"

version-minor: ## Incrementa versão minor (1.0.0 -> 1.1.0)
	@echo "$(BLUE)Incrementando versão minor...$(NC)"
	npm run version:minor
	@echo "$(GREEN)✓ Versão minor incrementada$(NC)"

version-major: ## Incrementa versão major (1.0.0 -> 2.0.0)
	@echo "$(BLUE)Incrementando versão major...$(NC)"
	npm run version:major
	@echo "$(GREEN)✓ Versão major incrementada$(NC)"

clean: ## Limpa arquivos de build
	@echo "$(BLUE)Limpando arquivos de build...$(NC)"
	rm -rf dist
	rm -rf node_modules/.vite
	@echo "$(GREEN)✓ Arquivos de build removidos$(NC)"

lint: ## Executa linting do código
	@echo "$(BLUE)Executando linting...$(NC)"
	npm run lint
	@echo "$(GREEN)✓ Linting concluído$(NC)"

format: ## Formata código automaticamente
	@echo "$(BLUE)Formatando código...$(NC)"
	npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"
	@echo "$(GREEN)✓ Código formatado$(NC)"

test: ## Executa testes
	@echo "$(BLUE)Executando testes...$(NC)"
	npm test
	@echo "$(GREEN)✓ Testes concluídos$(NC)"

test-watch: ## Executa testes em modo watch
	@echo "$(BLUE)Executando testes em modo watch...$(NC)"
	npm run test:watch

test-coverage: ## Executa testes com cobertura
	@echo "$(BLUE)Executando testes com cobertura...$(NC)"
	npm run test:coverage
	@echo "$(GREEN)✓ Cobertura de testes gerada$(NC)"

clerk-setup: ## Configura Clerk
	@echo "$(BLUE)Configurando Clerk...$(NC)"
	@echo "$(YELLOW)1. Acesse: https://clerk.com$(NC)"
	@echo "$(YELLOW)2. Crie uma nova aplicação$(NC)"
	@echo "$(YELLOW)3. Copie a Publishable Key$(NC)"
	@echo "$(YELLOW)4. Adicione ao arquivo .env$(NC)"
	@echo "$(GREEN)✓ Clerk configurado$(NC)"

supabase-setup: ## Configura Supabase
	@echo "$(BLUE)Configurando Supabase...$(NC)"
	@echo "$(YELLOW)1. Acesse: https://supabase.com$(NC)"
	@echo "$(YELLOW)2. Crie um novo projeto$(NC)"
	@echo "$(YELLOW)3. Copie a URL e anon key$(NC)"
	@echo "$(YELLOW)4. Adicione ao arquivo .env$(NC)"
	@echo "$(GREEN)✓ Supabase configurado$(NC)"

workstation-setup: ## Configura workstation de desenvolvimento
	@echo "$(BLUE)Configurando workstation...$(NC)"
	@echo "$(YELLOW)Instalando dependências globais...$(NC)"
	npm install -g @vitejs/plugin-react
	npm install -g supabase
	@echo "$(GREEN)✓ Workstation configurada$(NC)"

code-standards: ## Mostra padrões de código
	@echo "$(CYAN)📋 Padrões de Código INTERBØX V2 2025$(NC)"
	@echo "$(YELLOW)====================================$(NC)"
	@echo ""
	@echo "$(WHITE)🎯 Estrutura de Arquivos:$(NC)"
	@echo "  src/components/     - Componentes React"
	@echo "  src/pages/          - Páginas da aplicação"
	@echo "  src/hooks/          - Hooks customizados (useAuth, usePermissions)"
	@echo "  src/types/          - Definições de tipos TypeScript"
	@echo "  src/utils/          - Utilitários e helpers"
	@echo "  src/lib/            - Configurações (clerk.ts, supabase.ts)"
	@echo ""
	@echo "$(WHITE)🔧 Convenções:$(NC)"
	@echo "  - Nomes de arquivos: PascalCase para componentes, camelCase para outros"
	@echo "  - Nomes de variáveis: camelCase"
	@echo "  - Nomes de componentes: PascalCase"
	@echo "  - Nomes de funções: camelCase"
	@echo "  - Nomes de constantes: UPPER_SNAKE_CASE"
	@echo ""
	@echo "$(WHITE)🔐 Autenticação (Clerk):$(NC)"
	@echo "  - USE: SignedIn, SignedOut, UserButton, SignInButton"
	@echo "  - USE: useAuth(), useRole()"
	@echo "  - NÃO USE: Firebase Auth"
	@echo "  - Implemente rotas protegidas com ProtectedRoute"
	@echo ""
	@echo "$(WHITE)🗄️ Banco de Dados (Supabase):$(NC)"
	@echo "  - USE: supabase client das funções em src/lib/supabase.ts"
	@echo "  - USE: Tipos gerados automaticamente em src/types/supabase.ts"
	@echo "  - NÃO USE: Firestore"
	@echo "  - Sincronize dados do usuário Clerk com Supabase"
	@echo ""
	@echo "$(WHITE)📝 Comentários:$(NC)"
	@echo "  - Use comentários para explicar lógica complexa"
	@echo "  - Documente funções públicas com JSDoc"
	@echo "  - Mantenha comentários atualizados"
	@echo ""
	@echo "$(WHITE)🚀 Performance:$(NC)"
	@echo "  - Use React.memo para componentes pesados"
	@echo "  - Implemente lazy loading para rotas"
	@echo "  - Otimize re-renders com useCallback e useMemo"
	@echo ""
	@echo "$(WHITE)🛡️ Segurança:$(NC)"
	@echo "  - Valide inputs do usuário"
	@echo "  - Use HTTPS em produção"
	@echo "  - Implemente autenticação com Clerk"
	@echo "  - Use RLS (Row Level Security) no Supabase"
	@echo ""
	@echo "$(WHITE)🧪 Testes:$(NC)"
	@echo "  - Escreva testes para lógica de negócio"
	@echo "  - Use Jest para testes unitários"
	@echo "  - Use Playwright para testes E2E"

# Comandos de desenvolvimento rápido
dev-fast: ## Desenvolvimento rápido sem otimizações
	@echo "$(BLUE)Iniciando desenvolvimento rápido...$(NC)"
	NODE_ENV=development npm run dev

build-fast: ## Build rápido para desenvolvimento
	@echo "$(BLUE)Build rápido para desenvolvimento...$(NC)"
	NODE_ENV=development npm run build

# Comandos de deploy específicos
deploy-staging: ## Deploy para ambiente de staging
	@echo "$(BLUE)Deploy para staging...$(NC)"
	@echo "$(YELLOW)Configurando ambiente de staging...$(NC)"
	make deploy-versioned

deploy-production: ## Deploy para produção
	@echo "$(BLUE)Deploy para produção...$(NC)"
	@echo "$(YELLOW)Configurando ambiente de produção...$(NC)"
	make deploy-versioned

# Comandos de monitoramento
logs: ## Mostra logs do Supabase
	@echo "$(BLUE)Mostrando logs do Supabase...$(NC)"
	@echo "$(YELLOW)Logs disponíveis no dashboard do Supabase$(NC)"
	@echo "$(CYAN)URL: https://app.supabase.com$(NC)"

# Comandos específicos para Clerk + Supabase
env-check: ## Verifica variáveis de ambiente
	@echo "$(BLUE)Verificando variáveis de ambiente...$(NC)"
	@if [ -f .env ]; then \
		echo "$(GREEN)✓ Arquivo .env encontrado$(NC)"; \
		echo "$(YELLOW)Variáveis configuradas:$(NC)"; \
		grep -E "^(VITE_CLERK_|VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY)" .env | sed 's/=.*/=***/' || echo "$(RED)✗ Nenhuma variável encontrada$(NC)"; \
	else \
		echo "$(RED)✗ Arquivo .env não encontrado$(NC)"; \
		echo "$(YELLOW)Execute: cp env.example .env$(NC)"; \
	fi

clerk-status: ## Status da aplicação Clerk
	@echo "$(BLUE)Verificando status do Clerk...$(NC)"
	@node scripts/force-production.js

clerk-force-production: ## Força modo production do Clerk
	@echo "$(BLUE)Forçando modo production do Clerk...$(NC)"
	@node scripts/force-production.js
	@echo "$(GREEN)✓ Modo production verificado$(NC)"

clerk-dev-setup: ## Configura Clerk para desenvolvimento local
	@echo "$(BLUE)Configurando Clerk para desenvolvimento...$(NC)"
	@if [ -f env.local.example ]; then \
		cp env.local.example .env.local; \
		echo "$(YELLOW)Arquivo .env.local criado. Configure as chaves de TESTE$(NC)"; \
	else \
		echo "$(RED)Arquivo env.local.example não encontrado$(NC)"; \
	fi
	@echo "$(GREEN)✓ Configuração de desenvolvimento criada$(NC)"

clerk-env-switch: ## Alterna entre ambiente de desenvolvimento e produção
	@echo "$(BLUE)Alternando ambiente do Clerk...$(NC)"
	@node scripts/force-production.js
	@echo "$(YELLOW)Para desenvolvimento: npm run dev$(NC)"
	@echo "$(YELLOW)Para produção: npm run build && npm run preview$(NC)"
	@echo "$(BLUE)Verificando status do Clerk...$(NC)"
	@if grep -q "VITE_CLERK_PUBLISHABLE_KEY" .env 2>/dev/null; then \
		echo "$(GREEN)✓ Clerk configurado$(NC)"; \
	else \
		echo "$(RED)✗ Clerk não configurado$(NC)"; \
		echo "$(YELLOW)Execute: make clerk-setup$(NC)"; \
	fi

supabase-status: ## Status da aplicação Supabase
	@echo "$(BLUE)Verificando status do Supabase...$(NC)"
	@if grep -q "VITE_SUPABASE_URL" .env 2>/dev/null && grep -q "VITE_SUPABASE_ANON_KEY" .env 2>/dev/null; then \
		echo "$(GREEN)✓ Supabase configurado$(NC)"; \
		echo "$(YELLOW)URL: $(shell grep VITE_SUPABASE_URL .env | cut -d'=' -f2)$(NC)"; \
	else \
		echo "$(RED)✗ Supabase não configurado$(NC)"; \
		echo "$(YELLOW)Execute: make supabase-setup$(NC)"; \
	fi

db-migrate: ## Executa migrações do banco
	@echo "$(BLUE)Executando migrações do banco...$(NC)"
	@if command -v supabase >/dev/null 2>&1; then \
		supabase db push; \
		echo "$(GREEN)✓ Migrações executadas$(NC)"; \
	else \
		echo "$(RED)✗ Supabase CLI não instalado$(NC)"; \
		echo "$(YELLOW)Execute: make workstation-setup$(NC)"; \
	fi

db-reset: ## Reseta o banco de dados
	@echo "$(BLUE)Resetando banco de dados...$(NC)"
	@if command -v supabase >/dev/null 2>&1; then \
		supabase db reset; \
		echo "$(GREEN)✓ Banco resetado$(NC)"; \
	else \
		echo "$(RED)✗ Supabase CLI não instalado$(NC)"; \
		echo "$(YELLOW)Execute: make workstation-setup$(NC)"; \
	fi

status: ## Status do projeto
	@echo "$(CYAN)📊 Status do Projeto INTERBØX V2 2025$(NC)"
	@echo "$(YELLOW)====================================$(NC)"
	@echo "$(WHITE)Versão:$(NC) $(shell node -p "require('./package.json').version")"
	@echo "$(WHITE)Build:$(NC) $(shell node -p "require('./package.json').buildInfo?.buildDate || 'N/A'")"
	@echo "$(WHITE)Git Hash:$(NC) $(shell git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
	@echo "$(WHITE)Branch:$(NC) $(shell git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')"
	@echo "$(WHITE)Último Commit:$(NC) $(shell git log -1 --pretty=format:%s 2>/dev/null || echo 'N/A')"
