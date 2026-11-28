const canvas = document.getElementById("game");
//get ctx - pen to draw with
const ctx = canvas.getContext("2d");
const darkCanvas = document.createElement("canvas");
darkCanvas.width = canvas.width;
darkCanvas.height = canvas.height;
const dctx = darkCanvas.getContext("2d");
// change difficulty in the numbers
const WALK_SPEED = 150;        // pixels per second
const WARMTH_DRAIN = 0.6;      // warmth lost per second
const SECONDS_PER_MINUTE = 0.5;  // real seconds per game minute

const player = { x: 40, y: 40, vx: 0, vy: 0 };
const cam = { x: 0, y: 0 };
const state = {
  minutes: 0,
  warmth: 100,
  visibility: 100,
  helped: 0,
  facts: 0
};

//remember keys held down
const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function update(dt) {
  state.minutes += dt / SECONDS_PER_MINUTE;
  state.warmth = Math.max(0, state.warmth - WARMTH_DRAIN * dt);
  state.visibility = Math.max(0, 100 - state.minutes * 1.2);

  const tx = Math.floor(player.x / TILE);
  const ty = Math.floor(player.y / TILE);
  const tile = map[ty] ? map[ty][tx] : 0;
  const g = grip[tile] ?? 1;

  const ix = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
  const iy = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);

  player.vx += (ix * WALK_SPEED - player.vx) * g;
  player.vy += (iy * WALK_SPEED - player.vy) * g;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.x = Math.max(8, Math.min(MAP_W * TILE - 8, player.x));
  player.y = Math.max(8, Math.min(MAP_H * TILE - 8, player.y));

  cam.x = Math.max(0, Math.min(MAP_W * TILE - canvas.width, player.x - canvas.width / 2));
  cam.y = Math.max(0, Math.min(MAP_H * TILE - canvas.height, player.y - canvas.height / 2));
}

function draw() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      ctx.fillStyle = colors[map[y][x]];
      ctx.fillRect(x * TILE - cam.x, y * TILE - cam.y, TILE, TILE);
    }
  }
  //draw the player
  ctx.fillStyle = "#f4e1c1";
  ctx.fillRect(player.x - 8 - cam.x, player.y - 8 - cam.y, 16, 16);
}

function drawBar(x, label, value, color) {
  ctx.fillStyle = "#f4e1c1";
  ctx.fillText(label, x, 17);
  ctx.fillStyle = "#4a4040";
  ctx.fillRect(x + 40, 8, 80, 10);
  ctx.fillStyle = color;
  ctx.fillRect(x + 40, 8, 80 * (value / 100), 10);
}

function drawHUD() {
  ctx.fillStyle = "rgba(43, 29, 36, 0.85)";
  ctx.fillRect(0, 0, canvas.width, 24);

  const total = 15 + Math.floor(state.minutes);
  const hour = 4 + Math.floor(total / 60);
  const min = total % 60;
  const clock = hour + ":" + String(min).padStart(2, "0") + " PM";

  ctx.fillStyle = "#f4e1c1";
  ctx.font = "14px monospace";
  ctx.fillText(clock, 8, 17);
  drawBar(90, "Warm", state.warmth, "#e0703a");
  drawBar(250, "Vis", state.visibility, "#e8d27a");
  ctx.fillText("Helped " + state.helped + "/6", 420, 17);
  ctx.fillText("Facts " + state.facts + "/8", 530, 17);
}
function drawLighting() {
  const dark = Math.min(0.8, 1 - state.visibility / 100);
  if (dark <= 0) return;

  // fill  dark layer
  dctx.globalCompositeOperation = "source-over";
  dctx.clearRect(0, 0, darkCanvas.width, darkCanvas.height);
  dctx.fillStyle = `rgba(10, 10, 30, ${dark})`;
  dctx.fillRect(0, 0, darkCanvas.width, darkCanvas.height);

  // cut holes 
  dctx.globalCompositeOperation = "destination-out";
  function hole(x, y, r) {
    const g = dctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    dctx.fillStyle = g;
    dctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (const L of lights) {
    hole(L.x * TILE + TILE / 2 - cam.x, L.y * TILE + TILE / 2 - cam.y, L.r);
  }
  hole(player.x - cam.x, player.y - cam.y, 60);

  ctx.drawImage(darkCanvas, 0, 0);

  // warm glow  top
  ctx.globalCompositeOperation = "lighter";
  for (const L of lights) {
    const x = L.x * TILE + TILE / 2 - cam.x;
    const y = L.y * TILE + TILE / 2 - cam.y;
    const g = ctx.createRadialGradient(x, y, 0, x, y, L.r);
    g.addColorStop(0, `rgba(255, 170, 80, ${dark * 0.35})`);
    g.addColorStop(1, "rgba(255, 170, 80, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - L.r, y - L.r, L.r * 2, L.r * 2);
  }
  ctx.globalCompositeOperation = "source-over";
}

let last = performance.now();

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  update(dt);
  draw();
  drawLighting();
  drawHUD();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);