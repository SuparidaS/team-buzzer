const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const ADMIN_PIN = process.env.ADMIN_PIN || "2468";
app.use(express.static(path.join(__dirname, "public")));

const teams = [
  { id: "slytherin", name: "Slytherin", nick: "งูเขียว", emoji: "🐍", color: "#16834a" },
  { id: "gryffindor", name: "Gryffindor", nick: "แมวเป้า", emoji: "🦁", color: "#c43d35" },
  { id: "hufflepuff", name: "Hufflepuff", nick: "หนูท่อ", emoji: "🦡", color: "#d6a62e" },
  { id: "ravenclaw", name: "Ravenclaw", nick: "นกกะปูด", emoji: "🦅", color: "#2867b2" }
];
let state = { round: 1, open: true, winner: null, scores: Object.fromEntries(teams.map(t => [t.id, 0])), lastPresses: [] };
const clients = new Map();

function snapshot() { return { ...state, teams }; }
function broadcast() { io.emit("state", snapshot()); }
io.on("connection", socket => {
  socket.emit("state", snapshot());

  socket.on("register", data => {
    if (!data || typeof data.name !== "string" || !data.name.trim() || !teams.some(t => t.id === data.team)) return;
    clients.set(socket.id, { name: data.name.trim().slice(0, 40), team: data.team, role: "player" });
    socket.emit("registered", { ok: true, ...clients.get(socket.id) });
    io.emit("activity", { type: "joined", name: clients.get(socket.id).name, team: data.team, time: new Date().toISOString() });
  });

  socket.on("admin-login", pin => {
    if (String(pin) === ADMIN_PIN) {
      clients.set(socket.id, { role: "admin" });
      socket.emit("admin-auth", { ok: true });
      socket.emit("state", snapshot());
    } else socket.emit("admin-auth", { ok: false, message: "รหัส Admin ไม่ถูกต้อง" });
  });

  socket.on("buzz", () => {
    const client = clients.get(socket.id);
    if (!client || client.role !== "player" || !state.open || state.winner) return;
    const team = teams.find(t => t.id === client.team);
    state.winner = { team: client.team, name: client.name, at: new Date().toISOString() };
    state.open = false;
    state.lastPresses.unshift({ round: state.round, team: client.team, teamName: team.name, nick: team.nick, emoji: team.emoji, player: client.name, at: state.winner.at });
    state.lastPresses = state.lastPresses.slice(0, 100);
    broadcast();
    io.emit("activity", { type: "buzz", ...state.winner, teamName: team.name, nick: team.nick, emoji: team.emoji, round: state.round });
  });

  socket.on("admin-action", data => {
    const client = clients.get(socket.id);
    if (!client || client.role !== "admin" || !data) return;
    if (data.action === "correct" && state.winner) state.scores[state.winner.team] += Number.isFinite(+data.points) ? +data.points : 10;
    if (data.action === "wrong" && state.winner) state.scores[state.winner.team] -= Number.isFinite(+data.points) ? +data.points : 5;
    if (data.action === "next" || data.action === "correct" || data.action === "wrong") {
      state.round += 1; state.winner = null; state.open = true;
    } else if (data.action === "reopen") {
      state.winner = null; state.open = true;
    } else if (data.action === "reset") {
      state = { round: 1, open: true, winner: null, scores: Object.fromEntries(teams.map(t => [t.id, 0])), lastPresses: [] };
    }
    broadcast();
  });
  socket.on("disconnect", () => clients.delete(socket.id));
});
server.listen(PORT, () => console.log(`Buzzer server listening on ${PORT}`));