/* Todfeed Confetti & Micro-animations Engine */

let canvas = null;
let ctx = null;
let particles = [];
let animationId = null;

function initCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

class ConfettiParticle {
  constructor(x, y, color, type) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 6;
    this.color = color;
    this.type = type; // 'square', 'circle', 'triangle', 'emoji'
    this.emoji = ['🦕', '🦖', '🍼', '🍌', '🥦', '🥕', '🍎', '🍓', '🥑'][Math.floor(Math.random() * 9)];
    
    // Movement vectors
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 4;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 3; // offset upward
    
    // Rotation
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
    
    // Physics
    this.gravity = 0.25;
    this.friction = 0.98;
    this.alpha = 1;
    this.decay = Math.random() * 0.012 + 0.008;
  }

  update() {
    this.vx *= this.friction;
    this.vy = (this.vy + this.gravity) * this.friction;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.alpha -= this.decay;
    return this.alpha > 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);

    if (this.type === 'emoji') {
      ctx.font = `${this.size * 2}px sans-serif`;
      ctx.fillText(this.emoji, -this.size, this.size);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      if (this.type === 'circle') {
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      } else if (this.type === 'triangle') {
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(this.size / 2, this.size / 2);
        ctx.lineTo(-this.size / 2, this.size / 2);
      } else {
        // square
        ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
      }
      ctx.fill();
    }
    ctx.restore();
  }
}

function updateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles = particles.filter(p => {
    const keep = p.update();
    if (keep) p.draw();
    return keep;
  });

  if (particles.length > 0) {
    animationId = requestAnimationFrame(updateConfetti);
  } else {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

export function triggerConfetti(x, y, options = {}) {
  initCanvas();
  
  const colors = [
    '#FF7E67', // Peach primary
    '#FFA494', // Light peach
    '#A8DADC', // Soft blue
    '#A0D2EB', // Pastel blue
    '#8DE4A1', // Sage green primary
    '#C4F0C5', // Light green
    '#FFD166', // Sunny yellow
    '#F4A261'  // Warm orange
  ];

  const { particleCount = 60 } = options;
  const startX = x || window.innerWidth / 2;
  const startY = y || window.innerHeight / 2;

  // Add standard shapes
  for (let i = 0; i < particleCount; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const r = Math.random();
    // 15% emojis, 25% triangles, 30% circles, 30% squares
    const type = r < 0.15 ? 'emoji' : (r < 0.4 ? 'triangle' : (r < 0.7 ? 'circle' : 'square'));
    
    particles.push(new ConfettiParticle(startX, startY, color, type));
  }

  if (!animationId) {
    updateConfetti();
  }
}
