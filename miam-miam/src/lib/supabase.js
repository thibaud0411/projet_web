// src/lib/supabase.js

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'; // 👈 Use static ES Module import for dotenv

// 1. Call config() to load the variables from .env.local
// Note: dotenv's config() is synchronous, so it can be called here safely.
// Adjust the path as necessary for your file structure:
dotenv.config({ path:'../.env.local' }); 

// 2. Access the variables from process.env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Check to prevent errors
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables. " + 
        "Ensure they are in your .env.local file and the path '../../.env.local' is correct."
    );
}

// 3. Create the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);