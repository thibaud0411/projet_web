import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://YOUR_PROJECT_REF.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY'; // clé publique (anon)
export const supabase = createClient(supabaseUrl, supabaseKey);