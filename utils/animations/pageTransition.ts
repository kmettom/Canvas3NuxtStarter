import * as THREE from "three";
import { gsap } from "gsap";

// Replace with your real Canvas3 import/type
declare const Canvas3: {
  addMeshToScene: (mesh: THREE.Mesh) => void;
  getMeshFromSceneByName: (name: string) => THREE.Mesh | null;
  addAnimationToRender: (name: string, cb: () => void) => void;
  setMeshPositionsUpdate: (flag: boolean) => void;
};

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
      "rgb(0, 0, 245)",
    );
    Canvas3.addAnimationToRender("pageTransition", pageTransition.render);
    pageTransition.reset();
  },
  addMeshRectangle: (meshName: string, color: string): THREE.Mesh | null => {
    console.log("addMeshRectangle")
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color });
    const rectangle = new THREE.Mesh(geometry, material);

    rectangle.name = meshName;
    rectangle.position.set(0, 0, 0);
    rectangle.scale.set(0, window.innerHeight, 0);

    Canvas3.addMeshToScene(rectangle);
    return Canvas3.getMeshFromSceneByName(meshName);
  },

  curtainShow: (positionX: number = 0, scaleX: number = window.innerWidth): void => {
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
          Canvas3.setMeshPositionsUpdate(true);
        },
        onComplete: () => {
          Canvas3.setMeshPositionsUpdate(false);
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
        },
        onComplete: () => {
          pageTransition.reset();
          resolve();
        },
      });

      tl.to(
        pageTransition.setup.positionX,
        {
          value: window.innerWidth / 2,
          duration: pageTransition.setup.duration,
          delay: pageTransition.setup.duration / 2,
        },
        "<=",
      );

      tl.to(
        pageTransition.setup.scaleX,
        {
          value: 0,
          duration: pageTransition.setup.duration,
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
