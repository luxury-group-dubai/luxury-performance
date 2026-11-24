import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
const {outputText}=ts.transpileModule(readFileSync(new URL('../lib/shop/product-options.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}});
const exports={};
new Function('exports',outputText)(exports);
const {productOptionFields,productOptionChoices,selectProductOption}=exports;
const variant=(id,vehicle,configuration,material,availableForSale=true)=>({id,availableForSale,selectedOptions:[{name:'Material',value:material},{name:'Application',value:vehicle},{name:'Configuration',value:configuration}]});
const variants=[variant('base-steel','Base / SV','Catback','Steel'),variant('base-ti','Base / SV','Catback','Titanium'),variant('s-steel','S','Catback','Steel'),variant('base-race','Base / SV','Race','Steel'),variant('s-race','S','Race','Steel',false)];
test('orders independent fields and hides fixed options',()=>{
 assert.deepEqual(productOptionFields(variants),['Application','Configuration','Material']);
 assert.deepEqual(productOptionFields(variants.filter(v=>v.id.startsWith('s-'))),['Configuration']);
});
test('vehicle change replaces incompatible titanium with an existing steel variant',()=>{
 const fields=productOptionFields(variants);
 const next=selectProductOption(variants,variants[1],fields,0,'S');
 assert.equal(next.id,'s-steel');
 assert.deepEqual(productOptionChoices(variants,next,fields,2),[{value:'Steel',available:true}]);
});
test('preserves configuration when changing vehicle and retains sold-out options',()=>{
 const fields=productOptionFields(variants);
 const next=selectProductOption(variants,variants[3],fields,0,'S');
 assert.equal(next.id,'s-race');
 assert.deepEqual(productOptionChoices(variants,next,fields,1),[{value:'Catback',available:true},{value:'Race',available:false}]);
 assert.equal(selectProductOption(variants,next,fields,2,'Titanium'),undefined);
});
