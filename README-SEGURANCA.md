# Site seguro + painel de edição

## Arquitetura
- `index.html`: site público.
- `admin/`: painel privado com login Supabase Auth.
- `assets/images/`: fotos iniciais do site.
- `supabase/schema.sql`: banco, RLS e bucket privado.
- `supabase/functions/public-gallery/index.ts`: gera URLs temporárias para as fotos publicadas.

## Configuração
1. Crie um projeto no Supabase.
2. No SQL Editor, execute `supabase/schema.sql`.
3. Crie um usuário em Authentication > Users com o seu e-mail e uma senha forte.
4. Copie o UUID desse usuário e execute:
   `insert into public.admin_users(user_id) values ('SEU-UUID-AQUI');`
5. Em Project Settings > API, copie a Project URL e a chave `anon`.
6. Edite `assets/site-config.js` e preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
7. Faça deploy da Edge Function `public-gallery` e coloque a URL dela em `GALLERY_FUNCTION_URL`.
8. Abra `/admin/` no seu domínio para administrar o site.

## Importante
- Nunca coloque `service_role`, senha, token pessoal ou chave secreta no HTML/JavaScript do site.
- O bucket de fotos é privado. A Edge Function usa a `service_role` apenas no servidor para criar URLs temporárias.
- Isso não torna uma imagem impossível de copiar: qualquer conteúdo que o navegador consegue exibir pode ser capturado. A arquitetura reduz exposição direta e permite URLs temporárias; para proteção comercial adicional, use marca d'água.
- As fotos novas entram como `RASCUNHO`; você precisa clicar em `Publicar`.
- O painel permite editar título/descrição, publicar/despublicar, reordenar e excluir fotos.
