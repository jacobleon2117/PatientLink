import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase, testSupabaseConnection } from './utils/db';
import { PostgrestError } from '@supabase/supabase-js';
import helmet from 'helmet';

dotenv.config();

const app: Application = express();
const port: number | string = process.env.PORT || 4000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/db-test', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      const postgrestError = error as PostgrestError;
      res.status(500).json({ 
        message: 'Database connection failed', 
        error: postgrestError 
      });
      return;
    }
    
    res.status(200).json({ 
      message: 'Database connection successful', 
      recordCount: data?.length || 0
    });
  } catch (error) {
    next(error);
  }
});

app.use((
  err: Error, 
  _req: Request, 
  res: Response, 
  _next: NextFunction
): void => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

const startServer = async (): Promise<void> => {
  try {
    const isConnected = await testSupabaseConnection();
    
    if (!isConnected) {
      console.error('Failed to establish Supabase connection. Server not started.');
      process.exit(1);
    }

    app.listen(port, (): void => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

export default app;