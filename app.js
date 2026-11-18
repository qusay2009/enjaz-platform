const BOOTHS=[["b1","م. وسام مرعي"],["b2","د. موسى صالح"],["b3","أ. خضر عباسي"],["b4","أ. أحمد غباري"],["b5","أ. وائل عياد"],["b6","أ. لجين سيوري"],["b7","ASEZA"]];
const T=["10:30–10:45","10:50–11:05","11:10–11:25","11:30–11:45","11:50–12:05","12:10–12:25","12:30–12:45","12:50–1:05","1:10–1:25","BREAK","1:40–1:55","2:00–2:15","2:20–2:35","2:40–2:55","3:00–3:15","3:20–3:35","3:40–3:55","4:00–4:15","4:20–4:35","4:40–4:55","5:00–5:15"];
let cur="b1",taken={},ready=false,pick=null;
const $=id=>document.getElementById(id);
const bname=id=>BOOTHS.find(b=>b[0]===id)[1];
const sid=(b,i)=>b+"_s"+i;
function tabs(){const t=$("tabs");t.textContent="";BOOTHS.forEach(([id,n])=>{const b=document.createElement("button");b.textContent=n;b.className=id===cur?"on":"";b.onclick=()=>{cur=id;tabs();grid()};t.appendChild(b)})}
function grid(){const g=$("grid");g.textContent="";T.forEach((x,i)=>{if(x==="BREAK"){const d=document.createElement("div");d.className="brk";d.textContent="استراحة للجميع من 1:25 إلى 1:40";g.appendChild(d);return}
const b=document.createElement("button");b.className="slot";const t=!!taken[sid(cur,i)];b.disabled=t||!ready;b.textContent=x+(t?" — محجوز":"");b.onclick=()=>open(i);g.appendChild(b)})}
async function load(){if(/PASTE/.test(API)){$("status").textContent="لم يُضبط رابط الخادم في ملف config.js بعد.";return}try{const r=await fetch(API+"?action=taken");const j=await r.json();taken={};(j.taken||[]).forEach(k=>taken[k]=1);ready=true;$("status").textContent="";grid()}catch(e){$("status").textContent="تعذّر الاتصال بالخادم ("+(e&&e.message||e)+"). تأكد من الرابط في config.js ومن أن النشر Anyone."}}
async function open(i){await load();if(taken[sid(cur,i)]){$("status").textContent="هذا الموعد حُجز للتو، اختر وقتًا آخر.";return}pick=i;$("dt").textContent=bname(cur)+" — "+T[i];$("de").textContent="";$("dlg").showModal()}
$("cx").onclick=()=>$("dlg").close();
$("ok").onclick=async()=>{
const n=$("nm").value.trim(),p=$("ph").value.trim(),e=$("de");
if(n.length<2){e.textContent="الرجاء إدخال الاسم.";return}
if(!/^[0-9+\s-]{7,16}$/.test(p)){e.textContent="الرجاء إدخال رقم هاتف صحيح.";return}
const b=cur,i=pick;e.textContent="";$("ok").disabled=true;
try{
const r=await fetch(API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({booth:b,slot:i,name:n,phone:p})});
const j=await r.json();
if(!j.ok){e.textContent=j.error==="taken"?"عذرًا، تم حجز هذا الموعد للتو. اختر وقتًا آخر.":"تعذّر إتمام الحجز، حاول مرة أخرى.";await load();return}
$("dlg").close();$("nm").value="";$("ph").value="";
const d=$("done");d.className="ok";d.textContent="تم تأكيد حجزك: "+bname(b)+" — "+T[i]+" (12/12/2026، بتوقيت عمّان).";await load();
}catch(x){e.textContent="تعذّر إتمام الحجز. تحقق من الاتصال وأعد المحاولة."}
finally{$("ok").disabled=false}};
tabs();grid();load();setInterval(()=>{if(!document.hidden&&!$("dlg").open)load()},5000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)load()});
