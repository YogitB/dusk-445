const TILE = 32;
const colors = ["#c9b79c", "#4a4040", "#c0562f", "#a9d3e0", "#7a8b3f", "#e0a458", "#8a4b3a"];
const grip   = [1.0, 0.9, 0.25, 0.05, 0.8, 1.0, 1.0];
const SOLID = [6];   // tiles you can't walk into

const MAP_W = 60;
const MAP_H = 40;

// start with grass
const map = [];
for (let y = 0; y < MAP_H; y++) {
  map.push(new Array(MAP_W).fill(4));
}

// paint a rectangle of one tile type
function paint(type, x, y, w, h) {
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) {
      if (map[j] && i >= 0 && i < MAP_W) map[j][i] = type;
    }
  }
}

// roads
paint(1, 0, 8, MAP_W, 2);
paint(1, 0, 24, MAP_W, 2);
paint(1, 28, 0, 2, MAP_H);

// sidwalks
paint(0, 0, 7, MAP_W, 1);
paint(0, 0, 10, MAP_W, 1);
paint(0, 0, 23, MAP_W, 1);
paint(0, 0, 26, MAP_W, 1);

//  houses 
paint(6, 3, 2, 5, 4);
paint(6, 12, 2, 6, 4);
paint(6, 34, 13, 5, 5);
paint(6, 5, 29, 6, 5);

//  hazards 
paint(2, 8, 7, 4, 1);    // wet leaves
paint(3, 40, 10, 3, 1);  // black ice
paint(2, 18, 26, 5, 1);

//  Harvest Center 
paint(5, 50, 30, 8, 8);