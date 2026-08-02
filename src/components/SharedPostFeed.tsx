import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getPublishedContentPosts, type ContentPost } from '../services/content';
import '../pages/pages.css';

export function SharedPostFeed(){
  const [posts,setPosts]=useState<ContentPost[]>([]);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{async function load(){const{data,error:loadError}=await getPublishedContentPosts(3);setPosts(data??[]);setError(loadError?.message??null)}void load();const channel=supabase.channel('home-content-posts').on('postgres_changes',{event:'*',schema:'public',table:'content_posts'},()=>void load()).subscribe();return()=>{void supabase.removeChannel(channel)}},[]);
  if(error)return <section><p className="page-error">Unable to load latest updates. Please refresh.</p></section>;
  if(!posts.length)return null;
  return <section><div className="section-title-row"><h2>Latest Updates</h2><Link to="/updates">View all</Link></div><div className="post-grid post-grid-compact">{posts.map(post=><article className="post-card" key={post.id}>{post.image_url&&<img src={post.image_url} alt=""/>}<div><h2>{post.title}</h2><p>{post.description}</p><small>{new Date(post.created_at).toLocaleDateString()}</small></div></article>)}</div></section>;
}
