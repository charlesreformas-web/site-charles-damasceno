(function () {
  'use strict';

  const cfg = window.SITE_CONFIG || {};
  const gallery = document.getElementById('photo-gallery');
  if (!gallery || !cfg.SUPABASE_URL || cfg.SUPABASE_URL.startsWith('COLE_') || !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.startsWith('COLE_')) return;

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = load;
  script.onerror = () => {};
  document.head.appendChild(script);

  async function load() {
    if (!window.supabase?.createClient) return;
    const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    let photos = [];
    try {
      if (cfg.GALLERY_FUNCTION_URL && !cfg.GALLERY_FUNCTION_URL.startsWith('COLE_')) {
        const res = await fetch(cfg.GALLERY_FUNCTION_URL, { headers: { Accept: 'application/json' } });
        if (res.ok) photos = await res.json();
      } else {
        const { data } = await client.from('photos').select('id,title,alt_text,storage_path,sort_order').eq('published', true).order('sort_order', { ascending: true });
        photos = data || [];
      }
    } catch (_) { return; }

    if (!Array.isArray(photos) || !photos.length) return;
    photos.forEach((photo, index) => gallery.appendChild(card(photo, index, photos.length)));
  }

  function card(photo, index, total) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'group text-left relative rounded-xl overflow-hidden bg-zinc-100 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.4)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2';
    button.setAttribute('aria-label', `Ampliar foto ${index + 1}`);

    const wrap = document.createElement('div');
    wrap.className = 'h-[300px] w-full relative overflow-hidden';
    const img = document.createElement('img');
    img.src = photo.signed_url || photo.url || '';
    img.alt = photo.alt_text || photo.title || 'Foto de obra da Charles Damasceno Reformas';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.className = 'absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition duration-700';
    wrap.appendChild(img);

    const shade = document.createElement('div');
    shade.className = 'absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-80 group-hover:opacity-90 transition';
    wrap.appendChild(shade);

    const badge = document.createElement('div');
    badge.className = 'absolute top-3 left-3 bg-[#F97316] text-white text-[9px] font-black tracking-[0.14em] px-2.5 py-1 rounded-full';
    badge.textContent = `OBRA REAL • ${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
    wrap.appendChild(badge);

    const icon = document.createElement('div');
    icon.className = 'absolute top-3 right-3 w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[12px]';
    icon.textContent = '⤢';
    wrap.appendChild(icon);
    button.appendChild(wrap);

    const body = document.createElement('div');
    body.className = 'p-4 bg-white';
    const title = document.createElement('div');
    title.className = 'text-[13px] font-semibold leading-[1.35] text-[#111827] min-h-[36px]';
    title.textContent = photo.title || 'Obra realizada';
    body.appendChild(title);
    const hint = document.createElement('div');
    hint.className = 'mt-2 text-[10px] font-bold tracking-widest text-zinc-400';
    hint.textContent = 'CLIQUE PARA AMPLIAR';
    body.appendChild(hint);
    button.appendChild(body);

    button.addEventListener('click', () => openViewer(img.src, img.alt, photo.title || 'Obra realizada'));
    return button;
  }

  function openViewer(src, alt, title) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] bg-black/90 p-4 md:p-8 flex items-center justify-center';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 text-white text-2xl border border-white/20';
    close.setAttribute('aria-label', 'Fechar');
    close.textContent = '×';
    const img = document.createElement('img');
    img.src = src; img.alt = alt; img.className = 'max-h-[88vh] max-w-full object-contain rounded-lg';
    overlay.append(close, img);
    const cap = document.createElement('div');
    cap.className = 'absolute bottom-4 left-4 right-4 text-center text-white/80 text-sm';
    cap.textContent = title;
    overlay.appendChild(cap);
    const cleanup = () => { overlay.remove(); document.body.style.overflow = ''; };
    close.addEventListener('click', cleanup);
    overlay.addEventListener('click', e => { if (e.target === overlay) cleanup(); });
    document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){cleanup();document.removeEventListener('keydown',esc);} });
    document.body.appendChild(overlay); document.body.style.overflow = 'hidden'; close.focus();
  }
})();
