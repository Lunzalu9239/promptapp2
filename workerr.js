// Bulk M-Pesa prompt tool (Paystack, KES). Single-file Cloudflare Worker.
// Secrets needed: PAYSTACK_SECRET_KEY, ADMIN_PASSWORD. Optional variable: AMOUNT (default 100)

const HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Race Payments</title>
<style>
:root{--g:#00a650;--d:#007a3b;--bg:#f3f8f5;--c:#fff;--t:#16241c;--m:#6b7c72}
@media(prefers-color-scheme:dark){:root{--bg:#0f1a14;--c:#17251d;--t:#e8f3ec;--m:#93a79b}}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif;background:var(--bg);color:var(--t)}
header{background:var(--g);color:#fff;padding:18px 16px}header h1{margin:0;font-size:20px}header p{margin:4px 0 0;opacity:.9;font-size:13px}
main{max-width:760px;margin:0 auto;padding:14px}
.card{background:var(--c);border-radius:12px;padding:14px;margin-bottom:12px;box-shadow:0 1px 3px #0002}
input[type=password],input[type=file]{width:100%;padding:10px;border:1px solid #8886;border-radius:8px;background:transparent;color:inherit;font-size:15px}
button{background:var(--g);color:#fff;border:0;border-radius:8px;padding:10px 14px;font-size:14px;font-weight:600;cursor:pointer;margin:4px 4px 0 0}
button.s{background:transparent;color:var(--d);border:1px solid var(--g)}button:disabled{opacity:.5}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center}
.stats b{display:block;font-size:20px}.stats span{font-size:11px;color:var(--m)}
.tw{overflow-x:auto;max-height:55vh;overflow-y:auto}table{width:100%;border-collapse:collapse;font-size:14px}
td,th{padding:7px 6px;text-align:left;border-bottom:1px solid #8883}
.tag{padding:2px 8px;border-radius:99px;font-size:12px;color:#fff}
.new{background:#8a9a90}.sent{background:#e69b00}.paid{background:var(--g)}.failed{background:#d33}
#msg{font-size:13px;color:var(--m);margin-top:8px}
</style></head><body>
<header><h1>Race Payments</h1><p>Send KES <span id="amt">100</span> M-Pesa prompts to your contacts</p></header>
<main>
<div class="card"><label>Admin password</label><br><input type="password" id="pw" placeholder="Password"></div>
<div class="card"><label>Contacts file (.vcf)</label><br><br><input type="file" id="f" accept=".vcf,text/vcard,text/x-vcard">
<div id="msg"></div></div>
<div class="card stats"><div><b id="n0">0</b><span>Total</span></div><div><b id="n1">0</b><span>Waiting</span></div><div><b id="n2">0</b><span>Paid</span></div><div><b id="n3">0</b><span>Failed</span></div></div>
<div class="card">
<button id="send">Send prompts</button><button id="retry" class="s">Retry failed</button>
<button id="chk" class="s">Check payments</button><button id="csv" class="s">Export CSV</button><button id="clr" class="s">Clear</button>
</div>
<div class="card tw"><table><thead><tr><th>Name</th><th>Phone</th><th>Status</th></tr></thead><tbody id="tb"></tbody></table></div>
</main>
<script>
var L=[],busy=false,$=function(i){return document.getElementById(i)};
try{L=JSON.parse(localStorage.getItem("hr")||"[]")}catch(e){}
$("pw").value=sessionStorage.getItem("pw")||"";
function save(){try{localStorage.setItem("hr",JSON.stringify(L))}catch(e){}render()}
function say(t){$("msg").textContent=t}
function norm(p){var d=p.replace(/[^\\d+]/g,"");if(d[0]==="+")d=d.slice(1);
if(/^0[71]\\d{8}$/.test(d))d="254"+d.slice(1);else if(/^[71]\\d{8}$/.test(d))d="254"+d;
return /^254[71]\\d{8}$/.test(d)?"+"+d:null}
function render(){
var c={new:0,sent:0,paid:0,failed:0};
$("tb").innerHTML=L.map(function(x){c[x.s]++;return "<tr><td>"+esc(x.n||"-")+"</td><td>"+x.p+"</td><td><span class='tag "+x.s+"' title='"+esc(x.e||"")+"'>"+({new:"Not sent",sent:"Waiting",paid:"Paid",failed:"Failed"})[x.s]+"</span></td></tr>"}).join("");
$("n0").textContent=L.length;$("n1").textContent=c.sent;$("n2").textContent=c.paid;$("n3").textContent=c.failed}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return "&#"+c.charCodeAt(0)+";"})}
$("f").onchange=function(){var r=new FileReader();r.onload=function(){
var seen={},ok=0,bad=0,dup=0;L.forEach(function(x){seen[x.p]=1});
r.result.split(/BEGIN:VCARD/i).slice(1).forEach(function(card){
var nm=(card.match(/^FN[^:]*:(.*)$/im)||[])[1]||"";
var re=/^(?:item\\d+\\.)?TEL[^:]*:(.+)$/gim,m;
while((m=re.exec(card))){var p=norm(m[1].trim());
if(!p){bad++;continue}if(seen[p]){dup++;continue}seen[p]=1;ok++;L.push({n:nm.trim(),p:p,s:"new"})}});
say(ok+" added, "+dup+" duplicates skipped, "+bad+" invalid numbers skipped.");save()};r.readAsText(this.files[0])};
function api(path,body){return fetch(path,{method:"POST",headers:{"content-type":"application/json","x-admin":$("pw").value},body:JSON.stringify(body)}).then(function(r){return r.json().then(function(j){j._http=r.status;return j})})}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
async function run(list){
if(busy)return;if(!$("pw").value){say("Enter the admin password first.");return}
sessionStorage.setItem("pw",$("pw").value);
if(!list.length){say("Nobody to prompt.");return}
if(!confirm("Send a KES "+$("amt").textContent+" prompt to "+list.length+" people?"))return;
busy=true;var i=0;
for(var x of list){i++;say("Sending "+i+" of "+list.length+"...");
x.ref="hr-"+x.p.slice(1)+"-"+Date.now();
try{var j=await api("/api/charge",{phone:x.p,reference:x.ref});
if(j._http===401){say("Wrong password.");break}
if(j.status===false||(j.data&&j.data.status==="failed")){x.s="failed";x.e=j.message||(j.data&&j.data.message)||"Failed"}
else{x.s="sent";x.e=""}}catch(e){x.s="failed";x.e="Network error"}
save();await sleep(1500)}
busy=false;say("Done sending. Press Check payments to update statuses.")}
async function check(){
var w=L.filter(function(x){return x.s==="sent"&&x.ref});if(!w.length)return;
for(var x of w){try{var j=await api("/api/verify",{reference:x.ref});var st=j.data&&j.data.status;
if(st==="success")x.s="paid";else if(st==="failed"||st==="abandoned"){x.s="failed";x.e=(j.data&&j.data.gateway_response)||st}}catch(e){}
await sleep(300)}
save();say("Checked "+w.length+" pending payments.")}
$("send").onclick=function(){run(L.filter(function(x){return x.s==="new"}))};
$("retry").onclick=function(){run(L.filter(function(x){return x.s==="failed"}))};
$("chk").onclick=check;
$("clr").onclick=function(){if(confirm("Delete the whole list from this device?")){L=[];save();say("")}};
$("csv").onclick=function(){var t="Name,Phone,Status\\n"+L.map(function(x){return '"'+(x.n||"").replace(/"/g,'""')+'",'+x.p+","+x.s}).join("\\n");
var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"text/csv"}));a.download="payments.csv";a.click()};
setInterval(function(){if(!busy)check()},20000);
fetch("/api/info").then(function(r){return r.json()}).then(function(j){$("amt").textContent=j.amount}).catch(function(){});
render();
</script></body></html>`;

const J = { "content-type": "application/json" };

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const amount = Number(env.AMOUNT || 100);

    if (url.pathname === "/") {
      return new Response(HTML, { headers: { "content-type": "text/html;charset=utf-8" } });
    }
    if (url.pathname === "/api/info") {
      return new Response(JSON.stringify({ amount }), { headers: J });
    }
    if (req.method !== "POST" || !url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }
    if (!env.ADMIN_PASSWORD || req.headers.get("x-admin") !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401, headers: J });
    }

    const auth = { Authorization: "Bearer " + env.PAYSTACK_SECRET_KEY };
    const body = await req.json();

    if (url.pathname === "/api/charge") {
      const phone = String(body.phone || "");
      if (!/^\+254[71]\d{8}$/.test(phone)) {
        return new Response(JSON.stringify({ status: false, message: "Invalid phone" }), { status: 400, headers: J });
      }
      const r = await fetch("https://api.paystack.co/charge", {
        method: "POST",
        headers: { ...auth, "content-type": "application/json" },
        body: JSON.stringify({
          email: phone.slice(1) + "@racepay.app",
          amount: amount * 100,
          currency: "KES",
          reference: String(body.reference),
          mobile_money: { phone, provider: "mpesa" },
        }),
      });
      return new Response(await r.text(), { status: r.status, headers: J });
    }

    if (url.pathname === "/api/verify") {
      const r = await fetch(
        "https://api.paystack.co/transaction/verify/" + encodeURIComponent(String(body.reference)),
        { headers: auth }
      );
      return new Response(await r.text(), { status: r.status, headers: J });
    }

    return new Response("Not found", { status: 404 });
  },
};
