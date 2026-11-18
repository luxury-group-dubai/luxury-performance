import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const root=path.resolve(import.meta.dirname,'..');
const req=createRequire(root+'/package.json');
const ts=req('typescript');
const cache=new Map();
function load(relative){
 const filename=path.resolve(root,relative);
 if(cache.has(filename))return cache.get(filename).exports;
 const loaded={exports:{}};cache.set(filename,loaded);
 const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 function local(name){if(name.endsWith('.json'))return JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename),name),'utf8'));if(name==='server-only')return {};if(name==='react')return {cache:f=>f};if(name.startsWith('@/'))return load(name.slice(2)+'.ts');if(name.startsWith('.'))return load(path.resolve(path.dirname(filename),name+'.ts'));return req(name);}
 new Function('require','module','exports',code)(local,loaded,loaded.exports);return loaded.exports;
}
if(!process.argv[2])throw Error('Usage: node scripts/audit-luper-catalog.mjs /path/to/catalog-products.json');
const products=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const {prepareBrandCatalogue}=load('app/preview/shop/brand-catalogue.ts');
const {buildVehicleChoices}=load('app/preview/shop/vehicle-data.ts');
const {label}=load('lib/shop/taxonomy.ts');
const {vehicleBrowseHref}=load('lib/shop/routes.ts');
const {rankLuperCatalog}=load('lib/luper-catalog.ts');
const {luperBrowseReply}=load('lib/luper-browse-reply.ts');
const choices=buildVehicleChoices(prepareBrandCatalogue(products));
const cases=[];
for(const [make,models] of Object.entries(choices))for(const model of models){
 for(const choice of [model,...(model.variants||[])]){
  const choiceName=choice.body&&choice.name===model.name?choice.name+' '+choice.body.replaceAll('_',' '):choice.name;
  cases.push({query:label(make)+' '+choiceName,expected:vehicleBrowseHref(make,choice.slug,choice.body),make,model:choice.slug,body:choice.body});
  for(const brand of choice.brands)cases.push({query:brand.name+' '+label(make)+' '+choiceName,expected:brand.href,make,model:choice.slug,body:choice.body,brand:brand.slug});
 }
}
const failures=[];
for(const test of cases){
 const messages=[{role:'user',content:test.query}];
 const context=rankLuperCatalog(products,messages,{make:'',model:'',year:'',interest:'',budget:''},'');
 const result=luperBrowseReply(messages,context);
 if(!result?.shopping.recommendations.some(c=>c.href===test.expected))failures.push({...test,actual:result?.shopping.recommendations.map(c=>c.href)||[],candidates:context.verifiedVehicleMatches.map(c=>c.href)});
}
console.log(JSON.stringify({makes:Object.keys(choices).length,models:Object.values(choices).flat().length,cases:cases.length,failures:failures.length,examples:failures.slice(0,16)},null,2));
if(failures.length)process.exitCode=1;
