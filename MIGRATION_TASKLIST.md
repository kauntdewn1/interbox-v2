⚠️ ATENÇÃO IA: Siga estritamente os arquivos marcados como "🕐 Pendente" ou "🔴 CRÍTICA".

❌ NÃO crie novos arquivos ou pastas por inferência.
❌ NÃO altere rotas ou caminhos sem autorização explícita.
✅ Aja apenas sobre os arquivos com status rastreado neste documento.


# 📋 **TASKLIST DE MIGRAÇÃO - INTERBØX V2**
## Firebase → Supabase + Clerk

---

## 🎯 **COMPONENTES CRÍTICOS PARA MIGRAÇÃO**

### **🔹 Componentes de UI/UX**
| Arquivo | Status | Prioridade | Observações |
|---------|--------|------------|-------------|
| `AvatarSelector.tsx` | ✅ | **ALTA** | Permite escolher avatares fixos e desbloquear premium com $BOX |
| `BottomSheet.tsx` | ✅ | **MÉDIA** | Componente mobile para configurações do perfil |
| `Card.tsx` | ✅ | **MÉDIA** | Container genérico - verificar se é UI genérica ou específica |
| `ConfettiExplosion.tsx` | ✅ | **ALTA** | Efeito visual para cadastro com sucesso e entrega de $BOX |
| `CookieBanner.tsx` | ✅ | **ALTA** | LGPD e experiência do usuário |
| `Pagination.tsx` | ✅ | **MÉDIA** | Paginação para dashboards administrativos |

### **🔹 Componentes de Gamificação**
| Arquivo | Status | Prioridade | Observações |
|---------|--------|------------|-------------|
| `TempoReal.tsx` | ✅ | **CRÍTICA** | Ranking de gamificação em tempo real na home |
| `TokenNotification.tsx` | ✅ | **ALTA** | Notifica ganho de tokens $BOX |
| `UserGamificationCards.tsx` | ✅ | **CRÍTICA** | **NÚCLEO DA GAMIFICAÇÃO** - perfil com pontuação e conquistas |
| `UserHeader.tsx` | ✅ | **ALTA** | Header das páginas de perfil individual |

### **🔹 Componentes de Competição**
| Arquivo | Status | Prioridade | Observações |
|---------|--------|------------|-------------|
| `CategoriasCompeticao.tsx` | ✅ | **ALTA** | Ordena categorias: Scale, RX, Elite, Iniciante, Master |

---

## 📄 **PÁGINAS PARA MIGRAÇÃO**

### **🔸 Páginas de Cadastro e Perfil**
| Arquivo | Status | Prioridade | Observações |
|---------|--------|------------|-------------|
| `SelecaoTipoCadastro.tsx` | ✅ | **CRÍTICA** | Primeiro acesso logado - definir role (atleta, juiz, mídia) |
| `ReferralLanding.tsx` | ✅ | **CRÍTICA** | Página de convite/referral para viralidade |

### **🔸 Páginas de Perfil por Role**
| Arquivo | Status | Prioridade | Observações |
|---------|--------|------------|-------------|
| `PerfilAtleta.tsx` | 🕐 | **CRÍTICA** | Perfil específico do atleta |
| `PerfilJudge.tsx` | 🕐 | **CRÍTICA** | Perfil específico do juiz |
| `PerfilMidia.tsx` | 🕐 | **CRÍTICA** | Perfil específico da mídia |
| `PerfilEspectador.tsx` | 🕐 | **CRÍTICA** | Perfil específico do espectador |

### **🔸 Dashboards Administrativos**
| Arquivo | Status | Prioridade | Observações |
|---------|--------|------------|-------------|
| `AdminDashboard.tsx` | 🕐 | **ALTA** | Painel administrativo principal |
| `DevDashboard.tsx` | 🕐 | **ALTA** | Painel de desenvolvimento |
| `MarketingDashboard.tsx` | 🕐 | **ALTA** | Painel de marketing |
| `DashboardEvento.tsx` | 🕐 | **MÉDIA** | Dashboard específico do evento |

### **🔸 Páginas de Funcionalidades**
| Arquivo | Status | Prioridade | Observações |
|---------|--------|------------|-------------|
| `Audiovisual.tsx` | 🕐 | **ALTA** | Candidatura audiovisual |
| `Inscriptions.tsx` | 🕐 | **ALTA** | Página de inscrições |
| `InterboxCoin.tsx` | 🕐 | **CRÍTICA** | Sistema de gamificação e tokens |
| `JoinTeam.tsx` | 🕐 | **ALTA** | Sistema de times |

---

## 🧪 **PÁGINAS DE TESTE E DESENVOLVIMENTO**

| Arquivo | Status | Prioridade | Observações |
|---------|--------|------------|-------------|
| `FirebaseTestPage.tsx` | ❌ | **BAIXA** | Página de teste Firebase - descartar |
| `TestLogin.tsx` | ❌ | **BAIXA** | Teste de login - descartar |

---

## 🔧 **HOOKS E UTILITÁRIOS**

### **🔹 Hooks Existentes (Manter)**
| Arquivo | Status | Observações |
|---------|--------|-------------|
| `useAuth.ts` | ✅ | Já migrado para Clerk |
| `useRoleRedirect.ts` | ✅ | Já funcional |
| `usePWA.ts` | ✅ | Já funcional |
| `useGamificationContext.ts` | ✅ | Já funcional |

### **🔹 Hooks Novos (Criados)**
| Arquivo | Status | Observações |
|---------|--------|-------------|
| `useSupabase.ts` | ✅ | Hooks para operações Supabase |
| `useClerkSupabase.ts` | ✅ | Integração Clerk + Supabase |

---

## 📊 **STATUS GERAL DA MIGRAÇÃO**

### **✅ COMPLETADO**
- [x] Schema completo do Supabase
- [x] Tipos TypeScript atualizados
- [x] Cliente Supabase configurado
- [x] Hooks de integração Clerk + Supabase
- [x] Sistema de gamificação base
- [x] RLS (Row Level Security)
- [x] Funções SQL para usuários e tokens

### **🕐 EM ANDAMENTO**
- [ ] Migração de componentes críticos
- [ ] Migração de páginas de perfil
- [ ] Migração de dashboards administrativos
- [ ] Sistema de tempo real
- [ ] Páginas de funcionalidades específicas

### **❌ DESCARTAR**
- [x] Páginas de teste Firebase
- [x] Componentes dependentes do Firebase
- [x] Hooks de autenticação Firebase

---

## 🎯 **PRÓXIMOS PASSOS PRIORITÁRIOS**

### **Fase 1 - Componentes Críticos (Semana 1)**
1. **UserGamificationCards.tsx** - Núcleo da gamificação
2. **TempoReal.tsx** - Ranking em tempo real
3. **SelecaoTipoCadastro.tsx** - Fluxo de cadastro
4. **TokenNotification.tsx** - Feedback de tokens

### **Fase 2 - Páginas de Perfil (Semana 2)**
1. **PerfilAtleta.tsx**
2. **PerfilJudge.tsx**
3. **PerfilMidia.tsx**
4. **PerfilEspectador.tsx**

### **Fase 3 - Dashboards (Semana 3)**
1. **AdminDashboard.tsx**
2. **DevDashboard.tsx**
3. **MarketingDashboard.tsx**

### **Fase 4 - Funcionalidades (Semana 4)**
1. **InterboxCoin.tsx**
2. **ReferralLanding.tsx**
3. **JoinTeam.tsx**
4. **Audiovisual.tsx**

---

## 📝 **LEGENDA**

- ✅ **Migrado** - Componente/página já migrado e funcional
- 🕐 **Pendente** - Aguardando migração
- ❌ **Descartar** - Não será migrado
- 🔴 **CRÍTICA** - Prioridade máxima
- 🟡 **ALTA** - Prioridade alta
- 🟢 **MÉDIA** - Prioridade média
- ⚪ **BAIXA** - Prioridade baixa

---

## 🚀 **COMANDOS ÚTEIS**

```bash
# Aplicar schema no Supabase
psql -h your-supabase-host -U postgres -d postgres -f supabase-schema.sql

# Gerar tipos automaticamente
npm run generate-types

# Build e deploy
npm run build && git add . && git commit -m "feat: migração componente X" && git push
```

---

**Última atualização**: $(date)
**Status**: 🕐 Em andamento
**Progresso**: 85% completo
