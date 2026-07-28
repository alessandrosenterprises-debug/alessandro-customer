import { supabase } from '../supabaseClient';
import type { Promotion } from '../types';

export async function getActivePromotions() {
  return supabase
    .from('promotions')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .returns<Promotion[]>();
}
