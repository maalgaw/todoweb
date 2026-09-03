import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cấu hình kết nối với Supabase để lưu trữ hình ảnh
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
