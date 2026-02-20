// ============================================================
// NexusCRM - Conexão com MongoDB
// ============================================================
// Gerenciamento de conexão com MongoDB usando Mongoose
// Suporte a reconnection automática e logging
// ============================================================

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexuscrm';

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

/**
 * Conectar ao MongoDB
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, options);

    console.log(`🗄️  MongoDB conectado: ${conn.connection.host}/${conn.connection.name}`);

    // Event listeners para monitoramento
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado. Tentando reconectar...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado com sucesso');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Conexão MongoDB fechada (SIGINT)');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('🔌 Conexão MongoDB fechada (SIGTERM)');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Falha ao conectar no MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Desconectar do MongoDB
 */
export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('🔌 Conexão MongoDB encerrada');
};

/**
 * Verificar status da conexão
 */
export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    status: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    readyState: mongoose.connection.readyState,
  };
};

export default { connectDB, disconnectDB, getDBStatus };
