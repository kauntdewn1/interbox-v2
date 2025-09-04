# 🔧 Fix de Redirects para Instagram e Redes Sociais

## 🚨 Problema Identificado

O Instagram e outras plataformas sociais não aceitam:
- **Content-Type: text/plain** em redirects
- **Código 308** (Permanent Redirect) - preferem 301
- **Redirects desnecessários** - se `/links` só redireciona para `/`, melhor usar o link final

## ✅ Soluções Implementadas

### 1. **Arquivo de Redirects para Vercel** (`vercel.json`)
```json
{
  "redirects": [
    {
      "source": "/links",
      "destination": "/",
      "permanent": true,
      "statusCode": 301
    }
  ]
}
```

### 2. **Arquivo de Redirects para Netlify** (`public/_redirects`)
```
/links / 301!
```

### 3. **Remoção da Rota `/links` do React Router**
- Removido import do componente `Links`
- Removida rota `/links` do `App.tsx`
- Simplificada lógica do `BottomTabBar`

### 4. **Headers de Segurança Adicionados**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 🎯 Resultado

- ✅ **Redirect 301** em vez de 308
- ✅ **Sem Content-Type: text/plain**
- ✅ **Menos passos** - link direto para destino final
- ✅ **Compatível com Instagram** e outras redes sociais
- ✅ **Headers de segurança** adequados

## 📱 Para Instagram

Agora use diretamente:
- `https://interbox.com.br/` (em vez de `/links`)
- O redirect será limpo e compatível com todas as plataformas

## 🚀 Deploy

Após o deploy, teste com:
```bash
curl -I https://interbox.com.br/links
```

Deve retornar:
```
HTTP/1.1 301 Moved Permanently
Location: /
Content-Type: text/html
```
