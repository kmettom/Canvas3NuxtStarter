import * as THREE from "three";
import { gsap } from "gsap";

// Replace with your real Canvas3 import/type
declare const Canvas3: {
  addMeshToScene: (mesh: THREE.Mesh) => void;
  getMeshFromSceneByName: (name: string) => THREE.Mesh | null;
  addAnimationToRender: (name: string, cb: () => void) => void;
  setMeshPositionsUpdate: (flag: boolean) => void;
};

type EthBlocksAnimationSetup = {
  positionX: { value: number };
  scaleX: { value: number };
  meshId: string;
  mesh: THREE.Mesh | null;
  duration: number;
};

type EthBlocksAnimation = {
  setup: EthBlocksAnimationSetup;
  addMeshRectangle: (meshName: string, color: string) => THREE.Mesh | null;
  init: () => void;
  curtainShow: (positionX?: number, scaleX?: number) => void;
  render: () => void;
  start: () => Promise<void>;
  end: () => Promise<void>;
  reset: () => void;
};

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: {
    positionX: { value: 0 },
    scaleX: { value: 0 },
    meshId: "curtain",
    mesh: null,
    duration: 0.5,
  },
  init: (): void => {
    ethBlocksAnimation.setup.mesh = ethBlocksAnimation.addMeshRectangle(
      "curtain",
      "rgb(20, 20, 20)",
    );
    Canvas3.addAnimationToRender("ethBlocksAnimation", ethBlocksAnimation.render);
    ethBlocksAnimation.reset();
  },
  addMeshRectangle: (meshName: string, color: string): THREE.Mesh | null => {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color });
    const rectangle = new THREE.Mesh(geometry, material);

    rectangle.name = meshName;
    rectangle.position.set(0, 0, 0);
    rectangle.scale.set(0, window.innerHeight, 0);

    Canvas3.addMeshToScene(rectangle);
    return Canvas3.getMeshFromSceneByName(meshName);
  },

  curtainShow: (
    positionX: number = 0,
    scaleX: number = window.innerWidth,
  ): void => {
    ethBlocksAnimation.setup.positionX.value = positionX;
    ethBlocksAnimation.setup.scaleX.value = scaleX;
  },

  render: (): void => {
    const { mesh, positionX, scaleX } = ethBlocksAnimation.setup;
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
        ethBlocksAnimation.setup.scaleX,
        {
          value: window.innerWidth,
          duration: ethBlocksAnimation.setup.duration,
        },
        "<=",
      );

      tl.to(
        ethBlocksAnimation.setup.positionX,
        {
          value: 0,
          duration: ethBlocksAnimation.setup.duration,
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
          ethBlocksAnimation.reset();
          resolve();
        },
      });

      tl.to(
        ethBlocksAnimation.setup.positionX,
        {
          value: window.innerWidth / 2,
          duration: ethBlocksAnimation.setup.duration,
          delay: ethBlocksAnimation.setup.duration / 2,
        },
        "<=",
      );

      tl.to(
        ethBlocksAnimation.setup.scaleX,
        {
          value: 0,
          duration: ethBlocksAnimation.setup.duration,
        },
        "<=",
      );
    });
  },

  reset: (): void => {
    ethBlocksAnimation.setup.positionX.value = -window.innerWidth / 2;
    ethBlocksAnimation.setup.scaleX.value = 0;
  },
};
