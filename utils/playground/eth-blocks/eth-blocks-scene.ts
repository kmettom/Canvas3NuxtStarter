import * as THREE from "three";
import { Canvas3Options } from "~/constants/canvas3-options";

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
};

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: null,
  meshId: "ethBlockBg",
  async init(ethBlocksWrapper: HTMLElement) {
    const mesh = await this.createMesh();
    console.log("mesh", mesh);
    this.setup = {
      mesh: mesh,
      ethBlocks: ethBlocksWrapper.children,
    };

    Canvas3.addAnimationToRender("ethBlocksAnimation", this.render);
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

    const bitmap = await createImageBitmap(imgHtmlEl, {
      imageOrientation: "flipY",
    });
    const texture = new THREE.Texture(bitmap);
    texture.needsUpdate = true;

    const uBlocksPositions = this.calculateUBlockPositions();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uDevicePixelRatio: { value: window.devicePixelRatio },
        uTime: { value: 0 },
        uImage: { value: texture },
        uAniInImage: { value: 1 },
        uHover: { value: 1 },
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

    return mesh as THREE.Mesh;
  },

  async imageChange(imgHtmlEl) {
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
    return new THREE.Vector4(x, y, halfW, halfH);
  },

  calculateUBlockPositions() {
    console.log("calculateUBlockPositions", this.setup?.ethBlocks);
    if (!this.setup?.ethBlocks) {
      return Array.from(
        { length: 10 },
        () => new THREE.Vector4(100, 100, 100, 100),
      );
    }

    const blocks = Array.from(this.setup.ethBlocks).slice(0, 10);
    const positions: THREE.Vector4[] = blocks.map((el) => {
      const bounds = (el as HTMLElement).getBoundingClientRect();
      return this.vec4PositionFromClientRect(bounds);
    });

    while (positions.length < 10) {
      positions.push(new THREE.Vector4(100, 100, 100, 100));
    }

    return positions;
  },

  render() {
    //TODO: check why THIS is not binding -> because this is moved to VANVAS3 - so bind this to this object
    console.log("render", ethBlocksAnimation)
    if (!ethBlocksAnimation?.setup) return;
    console.log("render 2")

    const { mesh } = ethBlocksAnimation.setup;
    console.log("render 3")

    if (!mesh) return;
    console.log("render 4")

    const meshToUpdate = ethBlocksAnimation.setup?.mesh as THREE.Mesh | undefined;
    if (!meshToUpdate) return;
    console.log("render 5")


    const material = meshToUpdate.material as THREE.ShaderMaterial;

    const uBlocksPositions = ethBlocksAnimation.calculateUBlockPositions();
    console.log("uBlocksPositions", uBlocksPositions)

    material.uniforms.uBlocks.value = uBlocksPositions;
    material.uniforms.uBlockCount.value = Math.min(uBlocksPositions.length, 10);
  },
};
