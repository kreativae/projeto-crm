#!/bin/bash
set -e

echo "📦 Instalando dependências do backend..."
npm --prefix backend install

echo "📦 Instalando dependências do bancodedados..."
npm --prefix bancodedados install

echo "✅ Build concluído!"
