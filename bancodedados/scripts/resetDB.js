// ============================================================
// Reset Database - Limpa todas as collections
// ============================================================

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexuscrm';

const resetDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Listar todas as collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n🗑️  Deletando ${collections.length} collections...`);

    // Deletar cada collection
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`   ✓ ${collection.name}`);
    }

    console.log('\n✅ Banco de dados resetado com sucesso!');
    console.log('   Todas as collections foram removidas');
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

resetDB();
