-- Charles Damasceno Reformas — segurança do backend
-- Execute no SQL Editor do seu projeto Supabase.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  title text not null default '',
  alt_text text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.photos enable row level security;
alter table public.site_content enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Público: só o que foi publicado.
drop policy if exists "public read published photos" on public.photos;
create policy "public read published photos" on public.photos
for select to anon, authenticated
using (published = true);

-- Administrador: CRUD completo.
drop policy if exists "admin manage photos" on public.photos;
create policy "admin manage photos" on public.photos
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Conteúdo público: leitura; edição só pelo administrador.
drop policy if exists "public read content" on public.site_content;
create policy "public read content" on public.site_content
for select to anon, authenticated
using (true);

drop policy if exists "admin manage content" on public.site_content;
create policy "admin manage content" on public.site_content
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Não permita que usuários normais consultem a lista de administradores.
drop policy if exists "admin read admin_users" on public.admin_users;
create policy "admin read admin_users" on public.admin_users
for select to authenticated
using (public.is_admin());

-- Storage PRIVADO: não use bucket público.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('site-photos','site-photos',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "admin upload site photos" on storage.objects;
create policy "admin upload site photos" on storage.objects
for insert to authenticated
with check (bucket_id='site-photos' and public.is_admin());

drop policy if exists "admin update site photos" on storage.objects;
create policy "admin update site photos" on storage.objects
for update to authenticated
using (bucket_id='site-photos' and public.is_admin())
with check (bucket_id='site-photos' and public.is_admin());

drop policy if exists "admin delete site photos" on storage.objects;
create policy "admin delete site photos" on storage.objects
for delete to authenticated
using (bucket_id='site-photos' and public.is_admin());

drop policy if exists "admin read site photos" on storage.objects;
create policy "admin read site photos" on storage.objects
for select to authenticated
using (bucket_id='site-photos' and public.is_admin());

-- Conteúdo inicial editável.
insert into public.site_content(key,value) values
('hero.eyebrow','+200 OBRAS ENTREGUES • 100% REAIS'),
('hero.title1','Reformas sem dor'),
('hero.title2','de cabeça,'),
('hero.title3','feitas do jeito certo.'),
('hero.description','Especialista em troca de telhados e reformas completas. Equipe própria, obra limpa e garantia de 1 ano. Orçamento em 24h no WhatsApp.'),
('hero.cta','Quero meu orçamento agora'),
('gallery.title','OBRAS REAIS - Troca Completa de Telhado'),
('gallery.description','Fotos de obras reais. Clique para ampliar.')
on conflict (key) do nothing;
