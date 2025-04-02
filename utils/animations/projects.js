import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import projectsData from '~/content/projects.json';

gsap.registerPlugin(SplitText);

export function openGalleryTransition(
  galleryRef,
  refs,
  sizeOrigins,
  slideHeight,
  projectMargin,
) {
  const aniDuration = 0.35;
  return new Promise((resolve) => {
    const galleryWidthHalfPx =
      galleryRef.getBoundingClientRect().width / 2 + 'px';
    const timeline = gsap.timeline({
      ease: 'linear',
      onComplete: () => {
        resolve();
      },
    });

    timeline.to('.project-name', { opacity: 0, duration: 0 });

    timeline.to(
      '.gallery-controls-margin',
      {
        duration: aniDuration,
        height: `${projectMargin * 100}vh`,
      },
      '<',
    );
    timeline.to(
      '.project-item',
      {
        paddingTop: `${(projectMargin * 100) / 2}vh`,
        duration: aniDuration,
      },
      '<',
    );

    timeline.to(
      '.project',
      {
        bottom: 0,
        duration: aniDuration,
      },
      '<',
    );
    for (const [index, ref] of refs.entries()) {
      timeline.fromTo(
        ref.querySelector('.project-image'),
        {
          height: sizeOrigins[index].height + 'px',
          width: sizeOrigins[index].width + 'px',
          immediateRender: true,
        },
        {
          height: `${slideHeight * 100}vh`,
          width: galleryWidthHalfPx,
          duration: aniDuration,
        },
        '<',
      );
    }
    timeline.to(
      '.project-info-wrapper',
      {
        duration: aniDuration,
        width: galleryWidthHalfPx,
        height: '65vh',
      },
      // '<+=0.15',
      '<',
    );
  });
}

export function closeGalleryTransition(refs, sizeOrigins, projectMargin) {
  const aniDuration = 0.35; // 0.5
  return new Promise((resolve) => {
    const timeline = gsap.timeline({
      ease: 'linear',
      onComplete: () => {
        resolve();
      },
    });

    timeline.to(
      '.project-info-wrapper',
      {
        duration: aniDuration,
        height: '0',
        width: '0',
      },
      '<',
    );

    for (const [index, ref] of refs.entries()) {
      if (sizeOrigins[index]) {
        if (projectsData[index]?.position?.bottom && window.innerWidth > 1050) {
          timeline.to(
            ref.querySelector('.project'),
            {
              bottom: projectsData[index].position.bottom + 'vh',
              duration: aniDuration,
            },
            '<',
          );
        }
      }
    }

    timeline.to(
      '.project-item',
      {
        paddingTop: `${projectMargin * 100 * 2}vh`,
        duration: aniDuration,
      },
      '<',
    );

    for (const [index, ref] of refs.entries()) {
      if (sizeOrigins[index]) {
        timeline.to(
          ref.querySelector('.project-image'),
          {
            height: sizeOrigins[index].height + 'px',
            width: sizeOrigins[index].width + 'px',
            duration: aniDuration,
          },
          '<',
        );
      }
    }

    timeline.to('.project-name', { opacity: 1, duration: aniDuration }, '>');
  });
}

export function showGalleryControls(show) {
  const timeline = gsap.timeline({
    ease: 'linear',
  });

  timeline.to('.gallery-controls', {
    duration: 0.5,
    zIndex: show ? 10 : -1,
    opacity: show ? 1 : 0,
  });
}

export function nonActiveProjectTransition(ref, duration = 0) {
  // return new Promise((resolve) => {
  gsap.to(ref.querySelector('.expand-description'), {
    y: 0,
    opacity: 0,
    duration: duration,
    // onComplete: () => {
    //   resolve();
    // },
  });
  // });
}

export function activeProjectTransition(ref) {
  return new Promise((resolve) => {
    const timeline = gsap.timeline({
      ease: 'linear',
      onComplete: () => {
        resolve();
      },
    });
    timeline.set(ref.querySelector('.expand-description'), {
      opacity: 1,
    });
    const linesStatistics = new SplitText(ref.querySelector('.statistics'), {
      type: 'lines',
    }).lines;

    timeline.fromTo(
      linesStatistics,
      { y: '10px', opacity: 0 },
      {
        duration: 0.2,
        opacity: 1,
        y: '0px',
        stagger: 0.1,
      },
    );

    const wordsDescription = new SplitText(
      ref.querySelector('.project-description'),
      {
        type: 'words',
      },
    ).words;

    timeline.fromTo(
      wordsDescription,
      { y: '15px', opacity: 0 },
      {
        duration: 0.1,
        opacity: 1,
        y: '0px',
        stagger: 0.01,
      },
      '<',
    );

    timeline.fromTo(
      ref.querySelector('.project-link'),
      { y: '15px', opacity: 0 },
      {
        duration: 0.25,
        opacity: 1,
        y: '0px',
      },
    );
  });
}
