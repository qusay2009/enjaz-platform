const $=id=>document.getElementById(id);let pw="",data=[];
const call=(action,pw,key)=>fetch(API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,pw,key})}).then(r=>r.json());
function draw(){const r=$("rows");r.textContent="";let last=null;
data.forEach(k=>{
if(k.booth!==last){last=k.booth;const c=data.filter(x=>x.booth===k.booth).length;const h=document.createElement("tr"),th=document.createElement("td");th.colSpan=4;th.style.cssText="font-weight:700;background:var(--tk);padding:8px";th.textContent=k.booth+" — "+c+" حجز";h.appendChild(th);r.appendChild(h)}
const tr=document.createElement("tr");[k.slot,k.name,k.phone].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.appendChild(td)});
const td=document.createElement("td"),x=document.createElement("button");x.className="x";x.textContent="إلغاء";
x.onclick=async()=>{if(!confirm("إلغاء حجز "+k.name+"؟"))return;try{await call("adminCancel",pw,k.key);await load()}catch(e){$("msg").textContent="تعذّر الإلغاء."}};
td.appendChild(x);tr.appendChild(td);r.appendChild(tr)});
$("cnt").textContent="عدد الحجوزات: "+data.length}
async function load(){if(/PASTE/.test(API)){$("msg").textContent="لم يُضبط رابط الخادم في ملف config.js بعد.";return}try{const j=await call("adminList",pw);if(!j.ok){$("msg").textContent="كلمة السر غير صحيحة.";$("adm").hidden=true;$("login").hidden=false;pw="";return}
data=j.rows;$("msg").textContent="";$("login").hidden=true;$("adm").hidden=false;draw()}catch(e){$("msg").textContent="تعذّر الاتصال بالخادم ("+(e&&e.message||e)+"). تأكد من الرابط في config.js ومن أن النشر Anyone."}}
$("go").onclick=()=>{pw=$("pw").value;$("pw").value="";load()};
$("pw").onkeydown=e=>{if(e.key==="Enter")$("go").click()};
$("rf").onclick=load;
$("ex").onclick=()=>{const q=v=>'"'+String(v).replace(/"/g,'""')+'"';const c="\ufeff"+["البوث,الموعد,الاسم,الهاتف"].concat(data.map(k=>[k.booth,k.slot,k.name,k.phone].map(q).join(","))).join("\n");
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([c],{type:"text/csv;charset=utf-8"}));a.download="bookings.csv";a.click()};
setInterval(()=>{if(pw&&!document.hidden)load()},15000);
