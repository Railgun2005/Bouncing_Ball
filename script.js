const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const hexagonRadius = 200;
const hexagonRotationSpeed = 0.01;
const ballRadius = 20;
const gravity = 0.0;
const friction = 0;
let hexagonAngle = 0;

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2 - hexagonRadius + ballRadius,
    vx: 10,
    vy: 0
};
function drawHexagon(angle) {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const x = hexagonRadius * Math.cos(i * 2 * Math.PI / 6);
        const y = hexagonRadius * Math.sin(i * 2 * Math.PI / 6);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}
function updateBall() {
    ball.vy += gravity;
    ball.x += ball.vx;
    ball.y += ball.vy;

    const vertices = [];
    for (let i = 0; i < 6; i++) {
        const angle = i * (Math.PI / 3) + hexagonAngle;
        const x = canvas.width / 2 + hexagonRadius * Math.cos(angle);
        const y = canvas.height / 2 + hexagonRadius * Math.sin(angle);
        vertices.push({ x, y });
    }

    let collision = false;
    for (let i = 0; i < 6; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % 6];

        const closest = closestPointOnLine(p1, p2, ball);
        const dx = ball.x - closest.x;
        const dy = ball.y - closest.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ballRadius) {
            collision = true;
            
            const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
            const normal = normalize({ x: -edge.y, y: edge.x });

            const dot = ball.vx * normal.x + ball.vy * normal.y;
            ball.vx = (ball.vx - 2 * dot * normal.x) * (1 - friction);
            ball.vy = (ball.vy - 2 * dot * normal.y) * (1 - friction);

            const overlap = ballRadius - distance;
            ball.x += normal.x * overlap;
            ball.y += normal.y * overlap;
        }
    }

    if (!collision) {
        const dx = ball.x - canvas.width / 2;
        const dy = ball.y - canvas.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance + ballRadius > hexagonRadius) {
            const angle = Math.atan2(dy, dx);
            ball.x = canvas.width / 2 + (hexagonRadius - ballRadius) * Math.cos(angle);
            ball.y = canvas.height / 2 + (hexagonRadius - ballRadius) * Math.sin(angle);
        }
    }
}

function closestPointOnLine(p1, p2, point) {
    const a = point.x - p1.x;
    const b = point.y - p1.y;
    const c = p2.x - p1.x;
    const d = p2.y - p1.y;

    const dot = a * c + b * d;
    const lenSq = c * c + d * d;
    let param = (lenSq !== 0) ? dot / lenSq : -1;

    if (param < 0) return p1;
    if (param > 1) return p2;
    return { x: p1.x + param * c, y: p1.y + param * d };
}

function normalize(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    return { x: v.x / len, y: v.y / len };
}
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
    ctx.closePath();
}
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHexagon(hexagonAngle);
    updateBall();
    drawBall();
    hexagonAngle += hexagonRotationSpeed;
    requestAnimationFrame(animate);
}
animate();