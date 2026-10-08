// Rode com Node.js depois de instalar: npm i @supabase/supabase-js
// Este script publica as 8 fotos atuais no bucket privado e cadastra-as no banco.
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs'), path = require('path'), readline = require('readline');
const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
if(!url||!key) throw new Error('Defina SUPABASE_URL e SUPABASE_ANON_KEY');
const sb=createClient(url,key);
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
const ask=q=>new Promise(r=>rl.question(q,r));
(async()=>{
 const email=await ask('E-mail do administrador: '), password=await ask('Senha: '); rl.close();
 const {error:authError}=await sb.auth.signInWithPassword({email,password}); if(authError) throw authError;
 const dir=path.join(__dirname,'..','assets','images'); const files=fs.readdirSync(dir).filter(x=>/^image-\d+\.jpg$/.test(x));
 const captions=['Remoção de telhas antigas de fibrocimento - preparação da estrutura','Material novo separado e organizado para instalação','Estrutura metálica exposta para reforço e alinhamento','Vista geral da obra em andamento - cobertura','Instalação de telhas novas - fase de fixação','Detalhe do telhado antigo com desgaste - antes','Telha nova instalada com acabamento e vedação','Registro da área externa durante execução da obra'];
 for(let i=0;i<files.length;i++){
   const file=files[i], buf=fs.readFileSync(path.join(dir,file)), storagePath=`initial/${file}`;
   await sb.storage.from('site-photos').upload(storagePath,buf,{contentType:'image/jpeg',upsert:true});
   await sb.from('photos').upsert({storage_path:storagePath,title:captions[i]||file,alt_text:captions[i]||file,sort_order:i+1,published:true},{onConflict:'storage_path'});
 }
 console.log('Fotos iniciais migradas.');
})().catch(e=>{console.error(e);process.exit(1)});
