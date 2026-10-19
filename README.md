# Team Buzzer Live (real-time web app)

## Features
- Each player enters a name and selects one of the four teams before playing.
- A shared Socket.IO server accepts the first buzz only; all phones update live and lock.
- Admin dashboard shows the winning player's name, team, timestamp, round history and scores.
- Admin can mark correct (+10), wrong (-5), open next round, or reset the game.
- Team names are preconfigured: Slytherin งูเขียว 🐍, Gryffindor แมวเป้า 🦁, Hufflepuff หนูท่อ 🦡, Ravenclaw นกกะปูด 🦅.

## Run locally
Requires Node.js 18+.
1. Unzip the project.
2. In this folder run `npm install`
3. Run `ADMIN_PIN=your-private-pin npm start`
4. Open `http://localhost:3000` for player page and `http://localhost:3000/admin.html` for host page.
   For phones to connect locally, they must be on the same Wi-Fi and use the computer's LAN IP, e.g. `http://192.168.1.10:3000`.

## Publish online (Render example)
1. Upload this project folder to a private/public GitHub repository.
2. Create a new **Web Service** at Render and connect that repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Set environment variable `ADMIN_PIN` to a private PIN. Do not leave the default PIN for a public site.
6. Deploy; use the resulting `https://...onrender.com` URL for players and add `/admin.html` for admin.

## Important
This is a ready-to-deploy project, not a deployed public website yet. A shared realtime server is required; opening the HTML file directly will not connect devices. The default admin PIN in server.js is `2468`, so set `ADMIN_PIN` in the hosting environment before sharing the site. Scores and history are held in server memory and reset if the server restarts; this starter is intended for a single live event, not permanent record storage.
