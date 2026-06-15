import { useEffect, useRef } from 'react';

// mini preview generativo del cluster 03 (#cl-gen): una espiral azul de marca.
export default function ClusterPreview() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cg = ref.current;
    if (!cg) return;
    const dpr = window.devicePixelRatio || 1;

    function draw() {
      if (!cg || !cg.parentElement) return;
      const r = cg.parentElement.getBoundingClientRect();
      cg.width = r.width * dpr;
      cg.height = r.height * dpr;
      const c = cg.getContext('2d');
      if (!c) return;
      const W = cg.width;
      const H = cg.height;
      c.clearRect(0, 0, W, H);
      c.strokeStyle = 'rgba(31,61,240,.9)';
      c.lineWidth = dpr;
      c.beginPath();
      for (let i = 0; i <= 160; i++) {
        const t = i / 160;
        const ang = t * Math.PI * 8;
        const rr = t * Math.min(W, H) * 0.42;
        const x = W / 2 + Math.cos(ang) * rr;
        const y = H * 0.62 + Math.sin(ang) * rr - t * H * 0.4;
        i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.stroke();
    }

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  return <canvas ref={ref} aria-hidden="true" />;
}
