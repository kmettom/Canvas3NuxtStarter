import * as THREE from "three";
import { gsap } from "gsap";

type TransitionSetup = {
  positionX: { value: number };
  scaleX: { value: number };
  meshId: string;
  mesh: THREE.Mesh | null;
  duration: number;
};

type PageTransition = {
  setup: TransitionSetup;
  addMeshRectangle: (meshName: string, color: string) => THREE.Mesh | null;
  init: () => void;
  curtainShow: (positionX?: number, scaleX?: number) => void;
  render: () => void;
  start: () => Promise<void>;
  end: () => Promise<void>;
  reset: () => void;
};

const PAGE_TRANSITION_ANI_NAME = "pageTransition";

export const pageTransition: PageTransition = {
  setup: {
    positionX: { value: 0 },
    scaleX: { value: 0 },
    meshId: "curtain",
    mesh: null,
    duration: 0.5,
  },
  init: (): void => {
    pageTransition.setup.mesh = pageTransition.addMeshRectangle(
      "curtain",
      "rgb(20, 20, 20)",
    );
    Canvas3.addAnimationToRender(PAGE_TRANSITION_ANI_NAME, {
      onScroll: false,
      onResize: false,
      onAnimationsRender: true,
      onMouseMove: false,
      render: false,
      animationCallback: pageTransition.render,
    });
    pageTransition.reset();
  },
  addMeshRectangle: (meshName: string, color: string): THREE.Mesh => {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color });
    const rectangle = new THREE.Mesh(geometry, material);

    rectangle.name = meshName;
    rectangle.position.set(0, 0, 3);
    rectangle.scale.set(0, window.innerHeight, 0);

    Canvas3.addMeshToScene(rectangle);
    return rectangle;
  },

  curtainShow: (
    positionX: number = 0,
    scaleX: number = window.innerWidth,
  ): void => {
    pageTransition.setup.positionX.value = positionX;
    pageTransition.setup.scaleX.value = scaleX;
  },

  render: (): void => {
    const { mesh, positionX, scaleX } = pageTransition.setup;
    if (!mesh) return;
    mesh.position.x = positionX.value;
    mesh.scale.x = scaleX.value;
  },

  start: (): Promise<void> => {
    return new Promise<void>((resolve) => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
        onStart: () => {
          Canvas3.setAnimationToRender(
            PAGE_TRANSITION_ANI_NAME,
            true,
            "curtainIn",
          );
        },
        onComplete: () => {
          Canvas3.setAnimationToRender(
            PAGE_TRANSITION_ANI_NAME,
            false,
            "curtainIn",
          );
          resolve();
        },
      });

      tl.to(
        pageTransition.setup.scaleX,
        {
          value: window.innerWidth,
          duration: pageTransition.setup.duration,
        },
        "<=",
      );

      tl.to(
        pageTransition.setup.positionX,
        {
          value: 0,
          duration: pageTransition.setup.duration,
        },
        "<=",
      );
    });
  },

  end: (): Promise<void> => {
    return new Promise<void>((resolve) => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power2.in",
          duration: pageTransition.setup.duration,
        },
        onStart: () => {
          Canvas3.setAnimationToRender(
            PAGE_TRANSITION_ANI_NAME,
            true,
            "curtainOut",
          );
        },
        onComplete: () => {
          pageTransition.reset();
          setTimeout(() => {
            Canvas3.setAnimationToRender(
              PAGE_TRANSITION_ANI_NAME,
              false,
              "curtainOut",
            );
          }, 200);
          resolve();
        },
      });

      tl.to(
        pageTransition.setup.positionX,
        {
          value: window.innerWidth / 2,
          delay: pageTransition.setup.duration / 2,
        },
        "<=",
      );

      tl.to(
        pageTransition.setup.scaleX,
        {
          value: 0,
        },
        "<=",
      );
    });
  },

  reset: (): void => {
    pageTransition.setup.positionX.value = -window.innerWidth / 2;
    pageTransition.setup.scaleX.value = 0;
  },
};

export function waitForPageTransitionDone(): Promise<void> {
  const navigationStore = useNavigationStore();

  if (!navigationStore.pageTransitionInProgress) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const stop = navigationStore.$subscribe((_, state) => {
      if (!state.pageTransitionInProgress) {
        stop();
        resolve();
      }
    });
  });
}
