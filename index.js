const BACKGROUND = "#101010";
const FOREGROUND = "#50FF50";

console.log(game);
game.width = 800;
game.height = 800;
const ctx = game.getContext("2d");
console.log(ctx);

function clear() {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, game.width, game.height);
}

function point({ x, y }) {
  const s = 20;
  ctx.fillStyle = FOREGROUND;
  ctx.fillRect(x - s / 2, y - s / 2, s, s);
}

function line(p1, p2) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = FOREGROUND;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function map_canvus_size(p) {
  // -1..1 => 0..2 => 0..1 => 0..w/h
  return {
    x: (p.x + 1) / 2 * game.width,
    y: (1 - p.y) / 2 * game.height
  };
}

function project({ x, y, z }) {
  return {
    x: x / z,
    y: y / z
  };
}

function translate_z({ x, y, z }, dz) {
  return { x, y, z: z + dz };
}

// rotate vector
function rotate_xz({ x, y, z }, angle) {
  return {
    x: x * Math.cos(angle) - z * Math.sin(angle),
    y,
    z: x * Math.sin(angle) + z * Math.cos(angle)
  };
}

function rotate_xy({ x, y, z }, angle) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
    z
  };
}

function rotate_yz({ x, y, z }, angle) {
  return {
    x,
    y: y * Math.cos(angle) - z * Math.sin(angle),
    z: y * Math.sin(angle) + z * Math.cos(angle)
  };
}

// Rotate cube so its space diagonal aligns with Y axis
// This makes the cube "stand" on one corner with opposite corner directly above
//
// Geometry explanation:
// - Space diagonal goes from corner (-1,-1,-1) to (1,1,1)
// - Goal: align this diagonal with Y axis so top/bottom corners stay still when rotating around Y
//
// Step 1: rotate_xy by 45° (around Z axis)
//   - Eliminates X component of diagonal
//   - (1,1,1) → (0, √2, 1)
//
// Step 2: rotate_yz by arcsin(1/√3) ≈ 35.26° (around X axis)
//   - Eliminates Z component, aligns with Y axis
//   - (0, √2, 1) → (0, √3, 0)
//
// Why 35.26° instead of 45°?
//   After step 1, in YZ plane we have point (y=√2, z=1)
//
//       Y
//       |
//  √2 __|___*  (y=√2 ≈ 1.41)
//       |  /
//       | / 35.26°  ← angle = arctan(1/√2), NOT 45°
//     __|/______Z
//       |   1
//
function rotate_points(points) {
  const angle_xy = Math.PI / 4;
  const angle_yz = Math.atan(1 / Math.sqrt(2));

  for (let i = 0; i < points.length; i++) {
    points[i] = rotate_xy(points[i], angle_xy);
    points[i] = rotate_yz(points[i], angle_yz);
  }
}

const vs = [
  { x: 0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: -0.25, z: 0.25 },
  { x: 0.25, y: -0.25, z: 0.25 },
  { x: 0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: -0.25, z: -0.25 },
  { x: 0.25, y: -0.25, z: -0.25 },
];

rotate_points(vs);

const fs = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

const FPS = 60;
let dz = 1;
let angle = 0;

function frame() {
  const dt = 1 / FPS;
  // dz += 1 * dt;
  angle += Math.PI * dt;
  clear();
  // for (const v of vs) {
  //  point(map_canvus_size(project(translate_z(rotate_xz(v, angle), dz))));
  // }
  for (const f of fs) {
    for (let i = 0; i < f.length; i++) {
      const a = vs[f[i]];
      const b = vs[f[(i + 1) % f.length]];
      line(
        map_canvus_size(project(translate_z(rotate_xz(a, angle), dz))),
        map_canvus_size(project(translate_z(rotate_xz(b, angle), dz)))
      );
    }
  }
  setTimeout(frame, 1000 / FPS);
}

frame();
