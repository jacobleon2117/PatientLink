import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ 
  path: path.resolve(__dirname, '../../.env.local') 
});

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Key is present' : 'Key is MISSING');

if (!process.env.SUPABASE_URL) {
  console.error('CRITICAL: Missing SUPABASE_URL environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_KEY) {
  console.error('CRITICAL: Missing SUPABASE_KEY environment variable');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase connection test FAILED:', error);
      return false;
    }

    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
    return false;
  }
}