import * as THREE from "three";
import { Canvas3Options } from "~/constants/canvas3-options";

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
  uHover: { value: 1, duration: 0.5, ease: "linear" },
};

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: null,
  init: async (imgHtmlEl: HTMLImageElement): Promise<void> => {
    if (!ethBlocksAnimation) return;
    await Canvas3.addImageAsMesh(
      imgHtmlEl, //imgHtmlEl
      "playEthBlockGlass", //shaderName
      "ethBlockBg", //meshId
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

  async imageChange(
    imgHtmlEl: HTMLImageElement | null,
    // shaderName?: string | null,
    // meshUniforms?: Record<string, THREE.IUniform>,
    // activateMeshUniforms?: Record<string, THREE.IUniform>,
  ): Promise<void> {
    console.log(imgHtmlEl);
    if (!imgHtmlEl) return;

    const mesh = ethBlocksAnimation.setup?.mesh as THREE.Mesh | undefined;
    if (!mesh) return;

    const material = mesh.material as THREE.ShaderMaterial;
    if (!material?.uniforms?.uImage) return;

    const nextVertexShader =
      Canvas3Options.shaders.playEthBlockGlass.vertexShader;
    const nextFragmentShader =
      Canvas3Options.shaders.playEthBlockGlass.fragmentShader;

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

    if (material.uniforms.uTextureSize?.value?.set) {
      material.uniforms.uTextureSize.value.set(bitmap.width, bitmap.height);
    }

    if (material.uniforms.uMeshSize?.value?.set) {
      material.uniforms.uMeshSize.value.set(bounds.width, bounds.height);
    }

    if (material.uniforms.uViewport?.value?.set) {
      material.uniforms.uViewport.value.set(
        window.innerWidth,
        window.innerHeight,
      );
    }

    const shaderChanged =
      material.vertexShader !== nextVertexShader ||
      material.fragmentShader !== nextFragmentShader;

    if (shaderChanged) {
      material.vertexShader = nextVertexShader;
      material.fragmentShader = nextFragmentShader;
      material.needsUpdate = true;
    }

    mesh.scale.set(bounds.width, bounds.height, mesh.scale.z);

    oldTexture?.dispose();
    oldBitmap?.close?.();
  },

  glassBlockPositionsUpdate: (id, clientRect) => {
    const centerX = clientRect.left + clientRect.width * 0.5;
    const centerY = clientRect.top + clientRect.height * 0.5;
    const blockPadding = 35;

    const x = centerX - window.innerWidth * 0.5;
    const y = window.innerHeight * 0.5 - centerY - blockPadding;

    const halfW = Number((clientRect.width * 0.5).toFixed(1));
    const halfH = Number((clientRect.height * 0.5).toFixed(1));
    const vec4Position: Vec4Position = new THREE.Vector4(x, y, halfW, halfH);

    ethBlocksAnimation.setup?.blocksVec4Positions.set(id, vec4Position);
  },

  render: (): void => {
    if (!ethBlocksAnimation.setup) return;
    const { mesh, blocksVec4Positions } = ethBlocksAnimation.setup;
    if (!mesh) return;
    const meshToUpdate = ethBlocksAnimation.setup?.mesh as
      | THREE.Mesh
      | undefined;
    if (!meshToUpdate) return;
    const material = meshToUpdate.material as THREE.ShaderMaterial;

    const blocks = Array.from(blocksVec4Positions.values() ?? [])
      .slice(0, 10)
      .map((b) => new THREE.Vector4(b.x, b.y, b.z, b.w))
      .filter(Boolean);

    while (blocks.length < 10) {
      blocks.push(new THREE.Vector4(0, 0, 0, 0));
    }

    material.uniforms.uBlocks = { value: blocks };
    material.uniforms.uBlockCount = {
      value: Math.min(ethBlocksAnimation.setup?.blocksVec4Positions.size, 10),
    };
  },
};
