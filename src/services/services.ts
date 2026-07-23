import { supabase } from '../supabaseClient';
import type { Service } from '../types';

export async function getActiveServices() {
  return supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name')
    .returns<Service[]>();
}
