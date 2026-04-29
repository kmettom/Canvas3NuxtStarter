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
  init: (ethBlocksWrapper: HTMLElement) => void;
  createMesh: (ethBlocksWrapper: HTMLElement) => THREE.Mesh;
  render: () => void;
  imageChange: (imgHtmlEl: HTMLImageElement | null) => void;
  // glassBlockPositionsUpdate: (id: string, clientRect: DOMRect) => void;
};

// const defaultUniforms = {
//   uAniInImage: { value: 1, duration: 0.5, ease: "linear" },
//   uHover: { value: 1, duration: 0.5, ease: "linear" },
// };

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: null,
  meshId: "ethBlockBg",
  init: async (ethBlocksWrapper: HTMLElement): Promise<void> => {
    console.log("ethBlocksWrapper", ethBlocksWrapper);
    const mesh = await ethBlocksAnimation.createMesh(ethBlocksWrapper);
    console.log("mesh", mesh);

    ethBlocksAnimation.setup = {
      mesh: mesh,
      ethBlocks: ethBlocksWrapper.children,
    };

    Canvas3.addAnimationToRender(
      "ethBlocksAnimation",
      ethBlocksAnimation.render,
    );
  },

  async createMesh(ethBlocksWrapper): Promise<THREE.Mesh> {
    const vertexShader = Canvas3Options.shaders.playEthBlockGlass.vertexShader;
    const fragmentShader =
      Canvas3Options.shaders.playEthBlockGlass.fragmentShader;

    console.log("ethBlocksWrapper", ethBlocksWrapper);

    // const bounds = ethBlocksWrapper.getBoundingClientRect();
    // const position = { top: bounds.top, left: bounds.left };

    const geometry = new THREE.PlaneGeometry(1, 1);

    //TODO: load all images bit by bit to use in shader with transition
    const imgHtmlEl = document.getElementsByClassName(
      "play-block-image",
    )[0] as HTMLImageElement;
    if (!imgHtmlEl) return;
    const bitmap = await createImageBitmap(imgHtmlEl, {
      imageOrientation: "flipY",
    });
    const texture = new THREE.Texture(bitmap);
    texture.needsUpdate = true;

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
          value: 1,
        },
        uBlockColor: {
          value: 1,
        },
        // uBlocks: {
        //   value: 1,
        // },
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

    // console.log("createMesh")
    // const geometry = new THREE.PlaneGeometry(1, 1);
    // const material = new THREE.MeshBasicMaterial({ color: "rgb(20, 20, 20)" });
    // const rectangle = new THREE.Mesh(geometry, material);
    //
    // rectangle.name = "ethBlockBg";
    // rectangle.position.set(0, 0, 0);
    // rectangle.scale.set(0, window.innerHeight, 0);
    //
    // console.log("rectangle", rectangle)
    //
    // await Canvas3.addMeshToScene(rectangle);
    // console.log("add rectangle")
    // const mesh = Canvas3.getMeshFromSceneByName("ethBlockBg");
    // console.log("mesh", mesh)
    // return mesh;
  },

  async imageChange(imgHtmlEl: HTMLImageElement | null): Promise<void> {
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

  // blocksPositionsUpdate: () => {
  // const centerX = clientRect.left + clientRect.width * 0.5;
  // const centerY = clientRect.top + clientRect.height * 0.5;
  // const blockPadding = 35;
  //
  // const x = centerX - window.innerWidth * 0.5;
  // const y = window.innerHeight * 0.5 - centerY - blockPadding;
  //
  // const halfW = Number((clientRect.width * 0.5).toFixed(1));
  // const halfH = Number((clientRect.height * 0.5).toFixed(1));
  // const vec4Position: Vec4Position = new THREE.Vector4(x, y, halfW, halfH);
  //
  // ethBlocksAnimation.setup?.blocksVec4Positions.set(id, vec4Position);
  // },

  render: (): void => {
    if (!ethBlocksAnimation.setup) return;
    // TODO: remove blocksVec4Positions and use directly the blocks HTML bounts as positions

    // const { mesh, blocksVec4Positions } = ethBlocksAnimation.setup;
    // if (!mesh) return;
    // const meshToUpdate = ethBlocksAnimation.setup?.mesh as
    //   | THREE.Mesh
    //   | undefined;
    // if (!meshToUpdate) return;
    // const material = meshToUpdate.material as THREE.ShaderMaterial;
    //
    // const blocks = Array.from(blocksVec4Positions.values() ?? [])
    //   .slice(0, 10)
    //   .map((b) => new THREE.Vector4(b.x, b.y, b.z, b.w))
    //   .filter(Boolean);
    //
    // while (blocks.length < 10) {
    //   blocks.push(new THREE.Vector4(0, 0, 0, 0));
    // }
    //
    // material.uniforms.uBlocks = { value: blocks };
    // material.uniforms.uBlockCount = {
    //   value: Math.min(ethBlocksAnimation.setup?.blocksVec4Positions.size, 10),
    // };
  },
};
