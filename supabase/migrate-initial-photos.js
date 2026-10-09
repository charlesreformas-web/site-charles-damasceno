```javascript
// Migra as 8 fotos existentes para o Supabase.
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY.');
}

const sb = createClient(url, key);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const captions = [
  'Remoção de telhas antigas - preparação da estrutura',
  'Materiais organizados para instalação',
  'Estrutura metálica para reforço e alinhamento',
  'Vista geral da obra em andamento',
  'Instalação de telhas novas',
  'Telhado antes da reforma',
  'Telha instalada com acabamento e vedação',
  'Área externa durante a execução da obra'
];

async function main() {
  const email = await ask('E-mail do administrador: ');
  const password = await ask('Senha do administrador: ');

  const { error: authError } = await sb.auth.signInWithPassword({
    email,
    password
  });

  if (authError) throw authError;

  const dir = path.join(__dirname, '..', 'assets', 'images');

  for (let i = 1; i <= 8; i++) {
    const file = `image-${String(i).padStart(2, '0')}.jpg`;
    const filePath = path.join(dir, file);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Foto não encontrada: ${filePath}`);
    }

    const storagePath = `initial/${file}`;
    const buffer = fs.readFileSync(filePath);

    const { error: uploadError } = await sb.storage
      .from('site-photos')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const caption = captions[i - 1];

    const { error: dbError } = await sb
      .from('photos')
      .upsert({
        storage_path: storagePath,
        title: caption,
        alt_text: caption,
        sort_order: i,
        published: true
      }, { onConflict: 'storage_path' });

    if (dbError) throw dbError;

    console.log(`Foto ${i}/8 migrada: ${file}`);
  }

  console.log('Migração concluída.');
}

main()
  .catch((error) => {
    console.error('A migração falhou:', error.message);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
```
