import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bhxhrvtekkqaautdapvl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoeGhydnRla2txYWF1dGRhcHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTY2NDUsImV4cCI6MjA3NTQzMjY0NX0.rV7mUMvndM-dqsVcAU3itJD_eK9xl2fdhl42J5m-d5Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
