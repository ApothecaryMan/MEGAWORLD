/**
 * MEGAWORLD Supabase Client
 * المسئول عن الاتصال بقاعدة البيانات والأوثنتيكيشن
 */

import { CONFIG } from './config.js';

const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;

// استيراد Supabase من الـ CDN ليعمل مع Vanilla JS
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * دالة مساعدة للتأكد من حالة تسجيل الدخول
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

/**
 * دالة لجلب بيانات البروفايل كاملة
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('mw_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}
