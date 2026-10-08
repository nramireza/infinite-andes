// Contexto 2D falso para smoke-tests de render en Node (sin canvas).

export function makeFakeCtx() {
  const calls = { clearRect: [], fillRect: [], ellipse: [] };
  const ops = [];
  const ctx = {
    calls,
    ops,
    fillStyle: "#000000",
    globalAlpha: 1,
    imageSmoothingEnabled: true,
    createLinearGradient() {
      return { addColorStop() {} };
    },
    clearRect(x, y, w, h) {
      calls.clearRect.push([x, y, w, h]);
      ops.push({ op: "clearRect", x, y, w, h });
    },
    fillRect(x, y, w, h) {
      calls.fillRect.push([x, y, w, h, this.fillStyle, this.globalAlpha]);
      ops.push({ op: "fillRect", x, y, w, h, color: this.fillStyle });
    },
    beginPath() {},
    ellipse(...args) {
      calls.ellipse.push(args);
      ops.push({ op: "ellipse", args });
    },
    fill() {},
    save() {},
    restore() {},
  };
  return ctx;
}

// Comprueba que todo lo dibujado esté dentro del lienzo (con margen sensible).
export function collectOutOfBounds(ctx, W, H, margin = 24) {
  const bad = [];
  for (const [x, y, w, h] of ctx.calls.fillRect) {
    if (![x, y, w, h].every(Number.isFinite)) {
      bad.push({ reason: "no-finito", x, y, w, h });
      continue;
    }
    if (w < 0 || h < 0 || x < -margin || x > W + margin || y < -margin || y > H + margin) {
      bad.push({ reason: "fuera", x, y, w, h });
    }
  }
  return bad;
}
