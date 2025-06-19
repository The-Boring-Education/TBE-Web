import { createClient } from '@supabase/supabase-js';

import { envConfig } from '@/constant';

const supabaseUrl = envConfig.SUPABASE_URL!;
const supabaseAnonKey = envConfig.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);