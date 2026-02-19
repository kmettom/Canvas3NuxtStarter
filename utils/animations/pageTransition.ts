import * as THREE from "three";
import { gsap } from "gsap";

export const pageTransition = {
  setup: {
    positionX: { value: 0 },
    scaleX: { value: 0 },
    meshId: "curtain",
    mesh: null,
    duration: 0.5,
  },
  addMeshRectangle: (meshName:string, color:string) => {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const rectangle = new THREE.Mesh(geometry, material);
    rectangle.name = meshName;
    rectangle.position.set(0, 0, 0);
    rectangle.scale.set(0, window.innerHeight, 0);
    Canvas3.addMeshToScene(rectangle);
    return Canvas3.getMeshFromSceneByName(meshName);
  },
  init: () => {
    pageTransition.setup.mesh = pageTransition.addMeshRectangle(
      "curtain",
      "rgb(0, 0, 245)",
    );
    Canvas3.addAnimationToRender("pageTransition", pageTransition.render);
    pageTransition.reset();
  },
  curtainShow: (positionX = 0, scaleX = window.innerWidth) => {
    pageTransition.setup.positionX.value = positionX;
    pageTransition.setup.scaleX.value = scaleX;
  },
  render: () => {
    pageTransition.setup.mesh.position.x = pageTransition.setup.positionX.value;
    pageTransition.setup.mesh.scale.x = pageTransition.setup.scaleX.value;
  },
  start: async () => {
    return new Promise((resolve) => {
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
  end: () => {
    return new Promise((resolve) => {
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
  reset: () => {
    pageTransition.setup.positionX.value = -window.innerWidth / 2;
    pageTransition.setup.scaleX.value = 0;
  },
};
