const socket = io();
const $ = id => document.getElementById(id);
let state = null, authenticated = false;
$("loginBtn").onclick = () => socket.emit("admin-login", $("pin").value);
$("pin").addEventListener("keydown", e => { if(e.key==="Enter") $("loginBtn").click(); });
socket.on("admin-auth", r => { if (r.ok) { authenticated=true; $("login").classList.add("hidden"); $("dashboard").classList.remove("hidden"); render(); } else $("loginError").textContent = r.message || "เข้าสู่ระบบไม่สำเร็จ"; });
$("correctBtn").onclick = () => socket.emit("admin-action", {action:"correct", points:10});
$("wrongBtn").onclick = () => socket.emit("admin-action", {action:"wrong", points:5});
$("nextBtn").onclick = () => socket.emit("admin-action", {action:"next"});
$("resetBtn").onclick = () => { if(confirm("เริ่มเกมใหม่และล้างคะแนนทั้งหมดหรือไม่?")) socket.emit("admin-action", {action:"reset"}); };
socket.on("state", s => { state=s; if(authenticated) render(); });
function render() {
 if(!state) return;
 $("roundLabel").textContent = `รอบที่ ${state.round}`;
 const w=state.winner, team=w && state.teams.find(t=>t.id===w.team);
 $("winnerBox").innerHTML = w ? `<div class="winner-emoji">${team.emoji}</div><div class="eyebrow">FIRST BUZZER · ทีมที่กดได้ก่อน</div><h2>${escapeHtml(w.name)}</h2><p>${team.name} · ${team.nick}</p><small>เวลาที่กด ${new Date(w.at).toLocaleTimeString("th-TH",{hour12:false})}.${String(new Date(w.at).getMilliseconds()).padStart(3,"0")}</small>` : `<h2>${state.open ? "🟢 เปิดรอบแล้ว" : "⏸️ รอเปิดรอบ"}</h2><p>รอทีมกดปุ่มจากโทรศัพท์</p>`;
 $("correctBtn").disabled=!w; $("wrongBtn").disabled=!w;
 $("scoreboard").innerHTML=state.teams.map(t=>`<div class="score-card" style="--team:${t.color}"><span>${t.emoji} ${t.name}</span><small>${t.nick}</small><strong>${state.scores[t.id]||0}</strong></div>`).join("");
 $("history").innerHTML=state.lastPresses.length ? state.lastPresses.map(h=>`<div class="history-row"><span class="history-round">รอบ ${h.round}</span><span>${h.emoji} <b>${escapeHtml(h.teamName)}</b><small>${escapeHtml(h.nick)}</small></span><span><b>${escapeHtml(h.player)}</b><small>${new Date(h.at).toLocaleTimeString("th-TH",{hour12:false})}</small></span></div>`).join("") : `<p class="muted">ยังไม่มีประวัติการกด</p>`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}