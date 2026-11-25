const canvas = document.getElementById("game");
//get ctx- pen to draw with
const ctx = canvas.getContext("2d");
//square of map
const TILE = 32;

// 0 sidewalk
// 1 road
//2 leaves slippery
//3 ice
//4 grass
//Declare constants
// 5 Harvest center
const map = [
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  [0,0,0,2,2,0,0,0,0,0,0,3,3,0,0,0,2,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,3,0,0,0,2,2,0,0,0,0,0,0,0,0],
  [4,4,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,4,4,4],
  [4,4,2,4,4,4,4,4,4,4,4,4,4,4,4,4,0,4,4,4],
  [0,0,0,0,0,2,0,0,0,3,3,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,2,2,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0],
  [4,4,4,4,4,4,4,0,4,4,4,4,4,4,4,4,4,5,5,5],
  [4,4,4,4,4,4,4,0,0,0,2,0,0,0,0,0,0,5,5,5],
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5],
];
//match tile numbers
const colors = ["#c9b79c", "#4a4040", "#c0562f", "#a9d3e0", "#7a8b3f", "#e0a458"];
const grip   = [1.0, 0.9, 0.25, 0.05, 0.8, 1.0];
const player = { x: 40, y: 40, vx: 0, vy: 0 };
const state = {
      minutes: 0,      // 
      warmth: 100,
      visibility: 100,
      helped: 0,
      facts: 0
};
//remember keys held down
const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function update() {
  state.warmth = Math.max(0, state.warmth - 0.01);
  state.visibility = Math.max(0, 100 - state.minutes * 1.2);
  state.minutes += 1 / 240;
  const tx = Math.floor(player.x / TILE);
  const ty = Math.floor(player.y / TILE);
  const tile = map[ty] ? map[ty][tx] : 0;
  const g = grip[tile] ?? 1;

  const ix = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
  const iy = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);

  player.vx += (ix * 2.5 - player.vx) * g;
  player.vy += (iy * 2.5 - player.vy) * g;

  player.x += player.vx;
  player.y += player.vy;
  player.x = Math.max(8, Math.min(canvas.width - 8, player.x));
  player.y = Math.max(8, Math.min(canvas.height - 8, player.y));
}
function draw() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      ctx.fillStyle = colors[map[y][x]];
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }
  //draw the player
    ctx.fillStyle = "#f4e1c1";
    ctx.fillRect(player.x - 8, player.y - 8, 16, 16);
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
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();
  const dark = Math.min(0.7, state.minutes / 75 * 0.7);
  ctx.fillStyle = "rgba(30, 20, 50, " + dark + ")";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawHUD();
  requestAnimationFrame(loop);
}
loop();