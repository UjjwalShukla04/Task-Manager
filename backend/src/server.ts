import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import { initSocket } from './utils/socket';
import prisma from './config/prisma';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

const start = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
