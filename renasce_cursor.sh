#!/bin/bash

echo "🔪 Limpando rastros do Cursor..."
killall Cursor 2>/dev/null
rm -rf ~/Library/Application\ Support/Cursor
rm -rf ~/Library/Preferences/com.cursor.*
rm -rf ~/Library/Caches/com.cursor.*

echo "🎭 Alterando MAC address (spoof no en0)..."
NEW_MAC=$(openssl rand -hex 6 | sed 's/\(..\)/\1:/g; s/:$//')
sudo ifconfig en0 ether $NEW_MAC
echo "Novo MAC: $NEW_MAC"

echo "🕳️ Zerando DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

echo "🧼 Limpando cookies e sessions do Chrome (se usar Safari, ignora)..."
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Cookies
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Session*

echo "🌐 Abrindo site do Cursor em aba anônima com navegador camuflado..."
open -na "Google Chrome" --args --incognito "https://cursor.com/"

echo "💀 PRONTO. TÁ NO MODO FANTASMA. CADASTRA EMAIL NOVO E VAI PRO ABATE."
