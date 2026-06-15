import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let rafTick: ((time: number) => void) | null = null;

function reduced() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// reveals orgánicos: cada sección entra con fade + subida al aparecer en viewport
function setupReveals() {
  const sections = document.querySelectorAll<HTMLElement>('#main section.wrap');
  sections.forEach((el) => {
    gsap.set(el, { opacity: 0, y: 30 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

export function initMotion() {
  // prefers-reduced-motion: sin scroll suave ni reveals; contenido visible y scroll nativo
  if (reduced()) return;

  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  rafTick = (time: number) => {
    if (lenis) lenis.raf(time * 1000);
  };
  gsap.ticker.add(rafTick);
  gsap.ticker.lagSmoothing(0);

  setupReveals();
  ScrollTrigger.refresh();
}

export function destroyMotion() {
  if (rafTick) {
    gsap.ticker.remove(rafTick);
    rafTick = null;
  }
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}
