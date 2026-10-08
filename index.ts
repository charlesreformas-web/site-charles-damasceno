import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=300'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await supabase.from('photos').select('id,title,alt_text,storage_path,sort_order').eq('published', true).order('sort_order', { ascending: true });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
  const output = [];
  for (const photo of data ?? []) {
    const { data: signed, error: signError } = await supabase.storage.from('site-photos').createSignedUrl(photo.storage_path, 3600);
    if (!signError && signed?.signedUrl) output.push({ ...photo, signed_url: signed.signedUrl });
  }
  return new Response(JSON.stringify(output), { headers: cors });
});
