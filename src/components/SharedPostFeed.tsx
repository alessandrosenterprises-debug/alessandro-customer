import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../pages/pages.css';

type Post = { id:string; title:string; description:string; image_url:string|null; created_at:string };

export function SharedPostFeed(){
  const [posts,setPosts]=useState<Post[]>([]);
  useEffect(()=>{async function load(){const{data}=await supabase.from('content_posts').select('*').eq('published',true).order('created_at',{ascending:false}).limit(3);setPosts((data??[])as Post[])}void load();const channel=supabase.channel('home-content-posts').on('postgres_changes',{event:'*',schema:'public',table:'content_posts'},()=>void load()).subscribe();return()=>{void supabase.removeChannel(channel)}},[]);
  if(!posts.length)return null;
  return <section><div className="section-title-row"><h2>Latest Updates</h2><Link to="/updates">View all</Link></div><div className="post-grid post-grid-compact">{posts.map(post=><article className="post-card" key={post.id}>{post.image_url&&<img src={post.image_url} alt=""/>}<div><h2>{post.title}</h2><p>{post.description}</p><small>{new Date(post.created_at).toLocaleDateString()}</small></div></article>)}</div></section>;
}
