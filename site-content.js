(function(){
  'use strict';
  const cfg=window.SITE_CONFIG||{};
  if(!cfg.SUPABASE_URL||cfg.SUPABASE_URL.startsWith('COLE_')||!cfg.SUPABASE_ANON_KEY||cfg.SUPABASE_ANON_KEY.startsWith('COLE_'))return;
  const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=async()=>{try{const sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});const {data}=await sb.from('site_content').select('key,value');const m=Object.fromEntries((data||[]).map(x=>[x.key,x.value]));document.querySelectorAll('[data-content-key]').forEach(el=>{const v=m[el.dataset.contentKey];if(v!=null)el.textContent=v})}catch(_){}};document.head.appendChild(s);
})();
