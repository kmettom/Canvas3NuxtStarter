import * as THREE from 'three';
import { gsap } from 'gsap';

export function generateBindingLogic(newBindingData) {
  let binding = newBindingData;
  binding.elNode.dataset.activeScroll =
    newBindingData?.elNode?.dataset?.activeScroll ?? 'false';
  binding.containedMeshIds = [];
  if (!binding.options.trackOnly) {
    binding.containedMeshIds = findMeshIDs(binding.elNode);
    binding.elNode.classList.add('show-on-scroll');
  }

  if (binding.options.fixToParentId) {
    binding.containerId = binding.options.fixToParentId;
    binding.options.scrollSpeed = { value: 1 };
    binding.bounds = binding.elNode.getBoundingClientRect();
    binding.containerEl = document.getElementById(binding.containerId);
    binding.childEl = binding.elNode.children[0];
    binding.containerBottom =
      binding.containerEl.getBoundingClientRect().bottom;
    binding.margin = 0;
  }
  if (newBindingData.options.scrollSpeedSetTo?.value) {
    const dataSetScrollSpeed = Number(binding.elNode.dataset.scrollSpeed);
    binding.options.scrollSpeed = {
      value: dataSetScrollSpeed,
    };
    gsap.to(binding.options.scrollSpeed, {
      duration: newBindingData.options.scrollSpeedSetTo.duration,
      value: newBindingData.options.scrollSpeedSetTo.value,
      onComplete: () => {
        binding.elNode.dataset.scrollSpeed =
          newBindingData.options.scrollSpeedSetTo.value;
      },
    });
  }

  // }
  return binding;
}

export function findMeshIDs(elParent) {
  let meshIds = [];

  if (elParent.dataset.meshId) {
    meshIds.push(elParent.dataset.meshId);
    return meshIds;
  }

  let elementsWithMesh = elParent.querySelectorAll('[data-mesh-id]');
  if (!elementsWithMesh || elementsWithMesh.length === 0) return false;
  for (const el of elementsWithMesh) {
    meshIds.push(el.dataset.meshId);
  }
  return meshIds;
}

export function loadTexture(src) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      src,
      (texture) => resolve(texture), // On success
      undefined, // On progress (optional)
      (err) => reject(err), // On error
    );
  });
}
const heightSizeCoef = 1;
export const heightPositionCoef = 1.38;

export function getMSDFFontMeshScales(boundsWidth, geometryWidth) {
  const scaleX = (boundsWidth / geometryWidth) * heightSizeCoef;
  const scaleY = -1 * scaleX * heightSizeCoef;

  return { scaleX, scaleY };
}

export function setScrollActiveElements(elNode, meshIds, state) {
  //TODO: carry the Html mesh elements in the item, make it as class Typescript
  if (!meshIds || meshIds.length === 0) return;
  for (const id of meshIds) {
    const el = elNode.querySelector(`[data-mesh-id="${id}"]`);
    el.dataset.activeScroll = state;
  }
}

export function elementNearViewport(bounds, margin = 200) {
  const windowHeight = window.innerHeight;
  return (
    (bounds.top >= -margin && bounds.top <= windowHeight) ||
    (bounds.bottom >= -margin && bounds.bottom <= windowHeight) ||
    (bounds.top <= -margin && bounds.bottom >= windowHeight)
  );
}
