import * as THREE from "three";

export type Vec4Position = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type MeshMaterialUniform = Record<
  string,
  { duration: number; ease: string | null | undefined; value: number }
>;

type EthBlocksAnimationSetup = {
  meshId: string;
  mesh: THREE.Object3D | null;
  material: THREE.Material;
  uniforms: MeshMaterialUniform;
  blocksVec4Positions: Map<string, Vec4Position>;
  // imgHtmlEl: HTMLImageElement;
};

type EthBlocksAnimation = {
  setup: EthBlocksAnimationSetup | null;
  init: (imgHtmlEl: HTMLImageElement) => void;
  render: () => void;
  imageChange: (imgHtmlEl) => void;
  glassBlockPositionsUpdate: (id: string, clientRect: DOMRect) => void;
};

const defaultUniforms = {
  uAniInImage: { value: 1, duration: 0.5, ease: "linear" },
  uBlockColor: { value: 1, duration: 0.5, ease: "linear" },
  uBlocks: { value: 1, duration: 0.5, ease: "linear" },
  uHover: { value: 1, duration: 0.5, ease: "linear" },
};

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: null,
  init: async (imgHtmlEl: HTMLImageElement): Promise<void> => {
    if (!ethBlocksAnimation) return;
    await Canvas3.addImageAsMesh(
      imgHtmlEl, //imgHtmlEl
      "playEthBlockGlass", //meshId
      "ethBlockBg", //shaderName
      defaultUniforms, //meshUniforms
      {}, //activateMeshUniforms
    );
    ethBlocksAnimation.setup = {
      meshId: "ethBlockBg",
      mesh: Canvas3.getMeshFromSceneByName("ethBlockBg") ?? null,
      material: new THREE.MeshBasicMaterial(),
      blocksVec4Positions: new Map(),
      uniforms: defaultUniforms,
      // imgHtmlEl: imgHtmlEl,
    };
    Canvas3.addAnimationToRender(
      "ethBlocksAnimation",
      ethBlocksAnimation.render,
    );
    // ethBlocksAnimation.reset();
  },

  async imageChange(imgHtmlEl: HTMLImageElement): Promise<void> {
    const mesh = ethBlocksAnimation.setup?.mesh as THREE.Mesh | undefined
    if (!mesh) return

    const material = mesh.material as THREE.ShaderMaterial
    if (!material?.uniforms?.uImage) return

    const bounds = imgHtmlEl.getBoundingClientRect()

    const bitmap = await createImageBitmap(imgHtmlEl, { imageOrientation: 'flipY' })
    const newTexture = new THREE.Texture(bitmap)
    newTexture.needsUpdate = true

    const oldTexture = material.uniforms.uImage.value as THREE.Texture | undefined
    const oldBitmap = oldTexture?.image as ImageBitmap | undefined

    material.uniforms.uImage.value = newTexture

    if (material.uniforms.uTextureSize) {
      material.uniforms.uTextureSize.value.set(bitmap.width, bitmap.height)
    }

    if (material.uniforms.uMeshSize) {
      material.uniforms.uMeshSize.value.set(bounds.width, bounds.height)
    }

    mesh.scale.set(bounds.width, bounds.height, mesh.scale.z)

    oldTexture?.dispose()
    oldBitmap?.close?.()
  },

  glassBlockPositionsUpdate: (id, clientRect) => {
    const vec4Position: Vec4Position = {
      x: clientRect.left,
      y: 10,
      w: 100,
      h: 200,
    };
    ethBlocksAnimation.setup?.blocksVec4Positions.set(id, vec4Position);
  },

  render: (): void => {
    if (ethBlocksAnimation.setup) {
      const { mesh, material, uniforms, blocksVec4Positions } =
        ethBlocksAnimation.setup;
      if (!mesh || !material) return;
      // for (let i = 0; i < blockEls.size; i++) {
      //
      // }
      // uniforms.uBlocks = blocksVec4Positions;
    }
  },

  // reset: (): void => {
  //   ethBlocksAnimation.setup.positionX.value = -window.innerWidth / 2;
  //   ethBlocksAnimation.setup.scaleX.value = 0;
  // },
};
