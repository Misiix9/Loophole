import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from project root (one level up from src/utils)
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if credentials exist and are not empty strings
const isValid = supabaseUrl && supabaseKey && supabaseUrl.trim().length > 0 && supabaseKey.trim().length > 0;

export const supabase = isValid
    ? createClient(supabaseUrl, supabaseKey)
    : null;
