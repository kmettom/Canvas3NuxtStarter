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
  uniforms: MeshMaterialUniform;
  blocksVec4Positions: Map<string, Vec4Position>;
};

type EthBlocksAnimation = {
  setup: EthBlocksAnimationSetup | null;
  init: (imgHtmlEl: HTMLImageElement) => void;
  render: () => void;
  imageChange: (imgHtmlEl: HTMLImageElement | null) => void;
  glassBlockPositionsUpdate: (id: string, clientRect: DOMRect) => void;
};

const defaultUniforms = {
  uAniInImage: { value: 1, duration: 0.5, ease: "linear" },
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
      blocksVec4Positions: new Map(),
      uniforms: defaultUniforms,
    };
    Canvas3.addAnimationToRender(
      "ethBlocksAnimation",
      ethBlocksAnimation.render,
    );
  },

  async imageChange(imgHtmlEl: HTMLImageElement | null): Promise<void> {
    if (!imgHtmlEl) return;
    const mesh = ethBlocksAnimation.setup?.mesh as THREE.Mesh | undefined;
    if (!mesh) return;

    const material = mesh.material as THREE.ShaderMaterial;
    if (!material?.uniforms?.uImage) return;

    console.log("imageChange", ethBlocksAnimation.setup?.mesh);

    const bounds = imgHtmlEl.getBoundingClientRect();

    const bitmap = await createImageBitmap(imgHtmlEl, {
      imageOrientation: "flipY",
    });
    const newTexture = new THREE.Texture(bitmap);
    newTexture.needsUpdate = true;

    const oldTexture = material.uniforms.uImage.value as
      | THREE.Texture
      | undefined;
    const oldBitmap = oldTexture?.image as ImageBitmap | undefined;

    material.uniforms.uImage.value = newTexture;

    if (material.uniforms.uTextureSize) {
      material.uniforms.uTextureSize.value.set(bitmap.width, bitmap.height);
    }

    if (material.uniforms.uMeshSize) {
      material.uniforms.uMeshSize.value.set(bounds.width, bounds.height);
    }

    mesh.scale.set(bounds.width, bounds.height, mesh.scale.z);

    oldTexture?.dispose();
    oldBitmap?.close?.();
  },

  glassBlockPositionsUpdate: (id, clientRect) => {
    const vec4Position: Vec4Position = {
      x: clientRect.left,
      y: clientRect.top,
      w: clientRect.width,
      h: clientRect.height,
    };
    ethBlocksAnimation.setup?.blocksVec4Positions.set(id, vec4Position);
  },

  render: (): void => {
    if (!ethBlocksAnimation.setup) return;
    const { mesh, blocksVec4Positions } = ethBlocksAnimation.setup;
    console.log("blocksVec4Positions", blocksVec4Positions);
    if (!mesh) return;
    const meshToUpdate = ethBlocksAnimation.setup?.mesh as
      | THREE.Mesh
      | undefined;
    if (!meshToUpdate) return;
    const material = meshToUpdate.material as THREE.ShaderMaterial;
    material.uniforms.uBlock = { value: blocksVec4Positions };
  },
};
