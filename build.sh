#!/bin/bash
set -e

echo "📦 Instalando dependências do backend..."
cd backend
npm install

echo "📦 Instalando dependências do bancodedados..."
cd ../bancodedados
npm install

echo "✅ Build concluído!"
