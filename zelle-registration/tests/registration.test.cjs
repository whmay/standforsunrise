const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const code = readFileSync(__dirname + '/../apps-script/Code.gs','utf8');
const terms = readFileSync(__dirname + '/../apps-script/Terms.html','utf8');
const rows = [];
let failOpen = false;
const sheet = {
  getRange(r,c,n,width) { return {getValues:()=>[rows[0]],createTextFinder:needle=>({matchEntireCell:()=>({findNext:()=>rows.slice(1).find(row=>row[0]===needle)||null})})}; },
  getLastRow:()=>rows.length, appendRow:row=>rows.push(row)
};
const props = {SHEET_ID:'private-test-ledger',TOKEN_SECRET:'test-secret'};
const context = {
  console, Date, Number, Error,
  PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]})},
  Utilities:{base64EncodeWebSafe:b=>Buffer.from(b).toString('base64url'),computeHmacSha256Signature:(s,k)=>crypto.createHmac('sha256',k).update(s).digest(),DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(_,s)=>[...crypto.createHash('sha256').update(s).digest()]},
  HtmlService:{createHtmlOutputFromFile:()=>({getContent:()=>terms})},
  LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})},
  SpreadsheetApp:{openById:()=>{if(failOpen)throw Error('private sheet unavailable');return {getSheetByName:()=>sheet}},flush:()=>{}}
};
vm.createContext(context);vm.runInContext(code,context);
rows.push(vm.runInContext('HEADERS',context));
function payload(method='zelle'){const nonce=crypto.randomUUID(),expires=Date.now()+600000;return {name:'Example Contributor',email:'example@example.org',phone:'+1 (202) 555-0100',amount:'25.50',accepted:true,nonce,expires,method,signature:context.sign_(nonce+':'+expires+':'+method),termsHash:context.termsHash_()};}
const data=payload();
const result=context.registerContribution(data);
assert.equal(result.saved,true);assert.match(result.reference,/^SFS-[A-F0-9]{32}$/);
assert.equal(rows.length,2);assert.equal(rows[1][4],25.5);assert.equal(rows[1][5],'');assert.equal(rows[1][17],"'+1 (202) 555-0100");assert.equal(rows[1][7],'Pending — not verified received');assert.equal(rows[1][8],true);assert.equal(rows[1][10],context.termsHash_());
context.registerContribution(data);assert.equal(rows.length,2,'same-session retry must be idempotent');
for(const update of [{accepted:false},{amount:'0'},{amount:'1.234'},{amount:'-10'},{email:'bad'},{phone:''},{phone:'not a phone'},{phone:'123'},{phone:'+1234567890123456'},{termsHash:'wrong'},{signature:'wrong'},{expires:0}])assert.throws(()=>context.registerContribution({...payload(),...update}));
const zeffy=payload('zeffy'); context.registerContribution(zeffy); assert.equal(rows[2][6],'Zeffy'); assert.throws(()=>context.registerContribution({...payload(),method:'zeffy'})); assert.throws(()=>context.registerContribution({...payload(),method:'other'}));
const injection=payload();injection.name='=IMPORTXML("test")';context.registerContribution(injection);assert.equal(rows[3][2],"'=IMPORTXML(\"test\")");
failOpen=true;assert.throws(()=>context.registerContribution(payload()),/could not confirm/);assert.equal(rows.length,4);failOpen=false;
const html=readFileSync(__dirname+'/../apps-script/Index.html','utf8');
assert.ok(html.includes('id="result" class="panel" hidden'));
assert.ok(html.includes('withSuccessHandler(saved).withFailureHandler(failed)'));
assert.ok(!html.includes('localStorage'));
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace('<?!= config ?>','{}');new vm.Script(js);
assert.ok(terms.includes('</html>'));
console.log('PASS: validation, saved pending record, acceptance snapshot, idempotence, formula escaping, failure handling, hidden QR, frontend syntax.');
