const socket = io();
let state = null, selectedTeam = null, player = null, hasBuzzed = false;
const $ = id => document.getElementById(id);
const teamChoices = $("teamChoices");
function renderTeams(teams) {
  teams.forEach(t => {
    if (!teamChoices.querySelector(`[data-team="${t.id}"]`)) {
      const b = document.createElement("button");
      b.className = "team-choice"; b.dataset.team = t.id; b.style.setProperty("--team", t.color);
      b.innerHTML = `<span class="emoji">${t.emoji}</span><strong>${t.name}</strong><span>${t.nick}</span>`;
      b.onclick = () => { selectedTeam = t.id; document.querySelectorAll(".team-choice").forEach(x => x.classList.toggle("selected", x === b)); validateJoin(); };
      teamChoices.appendChild(b);
    }
  });
}
function validateJoin() { $("joinBtn").disabled = !($("playerName").value.trim() && selectedTeam); }
$("playerName").addEventListener("input", validateJoin);
$("joinBtn").onclick = () => { if (!selectedTeam || !$("playerName").value.trim()) return; player = {name:$("playerName").value.trim(), team:selectedTeam}; socket.emit("register", player); };
socket.on("registered", result => { if (!result.ok) return; $("join").classList.add("hidden"); $("play").classList.remove("hidden"); update(); });
function scoreboard(target) {
  if (!state) return;
  $(target).innerHTML = state.teams.map(t => `<div class="score-card" style="--team:${t.color}"><span>${t.emoji} ${t.name}</span><small>${t.nick}</small><strong>${state.scores[t.id] || 0}</strong></div>`).join("");
}
function update() {
  if (!state) return;
  scoreboard("scoreboard");
  $("roundLabel").textContent = `รอบที่ ${state.round}`;
  if (!player) return;
  const team = state.teams.find(t=>t.id===player.team);
  $("myTeam").textContent = `${team.emoji} ${player.name} · ${team.name}`;
  const win = state.winner;
  const isWinner = win && win.team === player.team && win.name === player.name;
  $("buzzBtn").disabled = !state.open || !!win || hasBuzzed;
  if (win) $("playStatus").textContent = isWinner ? "🏆 คุณกดได้ก่อน! รอพิธีกรให้ตอบ" : `🔒 ${win.name} (${state.teams.find(t=>t.id===win.team).name}) กดได้ก่อน`;
  else $("playStatus").textContent = state.open ? "🟢 เปิดให้กดแล้ว! รีบกดเมื่อรู้คำตอบ" : "กำลังรอพิธีกรเปิดรอบถัดไป…";
  $("buzzBtn").querySelector("strong").textContent = isWinner ? "คุณกดได้ก่อน!" : (win ? "ล็อกแล้ว" : "กดชิงตอบ!");
}
$("buzzBtn").onclick = () => { if (!player || $("buzzBtn").disabled) return; hasBuzzed = true; socket.emit("buzz"); $("buzzBtn").disabled = true; };
socket.on("state", s => { state=s; renderTeams(s.teams); update(); });
socket.on("activity", a => { if (a.type === "buzz" && player && a.team === player.team && a.name === player.name) hasBuzzed = true; update(); });