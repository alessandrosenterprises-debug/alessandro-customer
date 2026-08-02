import { supabase } from '../supabaseClient';

export type BusinessProduct = {
  id: string;
  business_profile_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  created_at: string;
};

export type BusinessGalleryImage = {
  id: string;
  business_profile_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

export async function getActiveBusinessProducts() {
  return supabase
    .from('business_products')
    .select('id,business_profile_id,name,description,image_url,price,created_at')
    .eq('active', true)
    .order('name')
    .returns<BusinessProduct[]>();
}

export async function getBusinessGalleryImages(businessProfileId: string) {
  return supabase
    .from('business_gallery')
    .select('id,business_profile_id,image_url,caption,sort_order')
    .eq('business_profile_id', businessProfileId)
    .order('sort_order')
    .returns<BusinessGalleryImage[]>();
}
