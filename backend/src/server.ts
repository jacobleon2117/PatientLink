import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './utils/db';
import { PostgrestError } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/db-test', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      const postgrestError = error as PostgrestError;
      throw postgrestError;
    }
    
    res.status(200).json({ 
      message: 'Database connection successful', 
      data 
    });
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'An unknown error occurred';

    console.error('Database connection error:', error);
    res.status(500).json({ 
      message: 'Failed to connect to database', 
      error: errorMessage 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});