import * as THREE from "three";
import { Canvas3Options } from "~/constants/canvas3-options";

export type Vec4Position = {
  x: number;
  y: number;
  w: number;
  h: number;
};

// type MeshMaterialUniform = Record<
//   string,
//   { duration: number; ease: string | null | undefined; value: number }
// >;

type EthBlocksAnimationSetup = {
  mesh: THREE.Object3D | null;
  ethBlocks: HTMLCollection;
};

type EthBlocksAnimation = {
  meshId: string;
  setup: EthBlocksAnimationSetup | null;
  init: (ethBlocksWrapper: HTMLElement) => Promise<void>;
  createMesh: () => Promise<THREE.Mesh>;
  vec4PositionFromClientRect: (clientRect: DOMRect) => THREE.Vector4;
  calculateUBlockPositions: () => THREE.Vector4[];
  render: () => void;
  imageChange: (imgHtmlEl: HTMLImageElement | null) => Promise<void>;
  // glassBlockPositionsUpdate: (id: string, clientRect: DOMRect) => void;
};

// const defaultUniforms = {
//   uAniInImage: { value: 1, duration: 0.5, ease: "linear" },
//   uHover: { value: 1, duration: 0.5, ease: "linear" },
// };

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: null,
  meshId: "ethBlockBg",
  init: async (ethBlocksWrapper: HTMLElement) => {
    const mesh = await ethBlocksAnimation.createMesh();

    ethBlocksAnimation.setup = {
      mesh: mesh,
      ethBlocks: ethBlocksWrapper.children,
    };

    Canvas3.addAnimationToRender(
      "ethBlocksAnimation",
      ethBlocksAnimation.render,
    );
  },

  async createMesh() {
    const vertexShader = Canvas3Options.shaders.playEthBlockGlass.vertexShader;
    const fragmentShader =
      Canvas3Options.shaders.playEthBlockGlass.fragmentShader;

    const geometry = new THREE.PlaneGeometry(1, 1);

    //TODO: load all images bit by bit to use in shader with transition
    const imgHtmlEl = document.getElementsByClassName(
      "play-block-image",
    )[0] as HTMLImageElement;
    // if (!imgHtmlEl) return;
    const bitmap = await createImageBitmap(imgHtmlEl, {
      imageOrientation: "flipY",
    });
    const texture = new THREE.Texture(bitmap);
    texture.needsUpdate = true;

    const uBlocksPositions = ethBlocksAnimation.calculateUBlockPositions();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uDevicePixelRatio: { value: window.devicePixelRatio },
        uTime: { value: 0 },
        uImage: { value: texture },
        vectorVNoise: { value: new THREE.Vector2(1.5, 1.5) }, // 1.5
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseMovement: { value: new THREE.Vector2(0, 0) },
        uMeshSize: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTextureSize: {
          value: new THREE.Vector2(bitmap.width, bitmap.height),
        },
        uViewport: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uBlockCount: {
          value: Math.min(uBlocksPositions.length, 10),
        },
        uBlocks: {
          value: uBlocksPositions,
        },
        uBlockColor: {
          value: 0,
        },
      },
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      transparent: true,
      name: this.meshId,
      // wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = this.meshId;
    const neutralZScale = 1;
    mesh.scale.set(window.innerWidth, window.innerHeight, neutralZScale);

    Canvas3.addMeshToScene(mesh);

    return mesh;
  },

  async imageChange(imgHtmlEl: HTMLImageElement | null) {
    console.log(imgHtmlEl);
    if (!imgHtmlEl) return;

    const mesh = this.setup?.mesh as THREE.Mesh | undefined;
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

  vec4PositionFromClientRect: (clientRect) => {
    const centerX = clientRect.left + clientRect.width * 0.5;
    const centerY = clientRect.top + clientRect.height * 0.5;
    const blockPadding = 35;

    const x = centerX - window.innerWidth * 0.5;
    const y = window.innerHeight * 0.5 - centerY - blockPadding;

    const halfW = Number((clientRect.width * 0.5).toFixed(1));
    const halfH = Number((clientRect.height * 0.5).toFixed(1));
    const vec4Position = new THREE.Vector4(x, y, halfW, halfH);
    return vec4Position;
    // ethBlocksAnimation.setup?.blocksVec4Positions.set(id, vec4Position);
  },

  calculateUBlockPositions: () => {
    if (!ethBlocksAnimation.setup) return [];
    const ethBlocks = ethBlocksAnimation.setup.ethBlocks;
    const blocksPositions = Array.from(ethBlocks ?? [])
      .slice(0, 10)
      .map((blockEl) => {
        const bounds = blockEl.getBoundingClientRect();
        return ethBlocksAnimation.vec4PositionFromClientRect(bounds);
      })
      .filter(Boolean);

    while (blocksPositions.length < 10) {
      blocksPositions.push(new THREE.Vector4(0, 0, 0, 0));
    }

    return blocksPositions;
  },

  //TODO: bind this
  render: () => {
    if (!ethBlocksAnimation.setup) return;
    // TODO: remove blocksVec4Positions and use directly the blocks HTML bounts as positions

    const { mesh } = ethBlocksAnimation.setup;
    if (!mesh) return;
    const meshToUpdate = ethBlocksAnimation.setup?.mesh as
      | THREE.Mesh
      | undefined;
    if (!meshToUpdate) return;

    const material = meshToUpdate.material as THREE.ShaderMaterial;

    const uBlocksPositions = ethBlocksAnimation.calculateUBlockPositions();

    console.log("uBlocksPositions", uBlocksPositions);

    material.uniforms.uBlocks = { value: uBlocksPositions };
    material.uniforms.uBlockCount = {
      value: Math.min(uBlocksPositions.length, 10),
    };
  },
};
