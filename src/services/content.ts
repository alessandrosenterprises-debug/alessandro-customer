import { supabase } from '../supabaseClient';

export type ContentPost = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
};

export async function getPublishedContentPosts(limit?: number) {
  let query = supabase
    .from('content_posts')
    .select('id,title,description,image_url,created_at')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);
  return query.returns<ContentPost[]>();
}
