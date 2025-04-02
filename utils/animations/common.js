import { gsap } from 'gsap';

export function aniInExample(_el, _active) {
  const elToAni = _el.elNode.querySelectorAll('.ani-section-title');
  if (!elToAni) return;
  if (_active) {
    gsap.to([...elToAni], {
      duration: 0.5,
      y: 0,
      opacity: 1,
      ease: 'ease',
      stagger: 0.3,
    });
  } else {
    gsap.to([...elToAni], {
      duration: 0.35,
      y: 125,
      opacity: 1,
      ease: 'linear',
    });
  }
}
