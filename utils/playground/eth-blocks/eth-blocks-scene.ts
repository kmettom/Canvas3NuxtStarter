import * as THREE from "three";
import { Canvas3Options } from "~/constants/canvas3-options";

type EthBlocksAnimationSetup = {
  mesh: THREE.Object3D | null;
  ethBlocks: HTMLCollection;
  textures: THREE.Texture[];
};

type EthBlocksAnimation = {
  meshId: string;
  setup: EthBlocksAnimationSetup | null;
  init: (ethBlocksWrapper: HTMLElement) => Promise<void>;
  createMesh: () => Promise<THREE.Mesh>;
  vec4PositionFromClientRect: (clientRect: DOMRect) => THREE.Vector4;
  calculateUBlockPositions: () => THREE.Vector4[];
  render: () => void;
  textureChange: (index: number) => void;
};

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: null,
  meshId: "ethBlockBg",
  async init(ethBlocksWrapper: HTMLElement) {
    const mesh = await this.createMesh();

    Canvas3.addAnimationToRender("ethBlocksAnimation", this.render.bind(this));

    //TODO: load all images to textures

    const loader = new THREE.TextureLoader();
    // const imagesAmount = 10;

    const textures = await Promise.all([
      loader.loadAsync("images/01.jpg"),
      loader.loadAsync("images/02.jpg"),
      loader.loadAsync("images/03.jpg"),
    ]);

    this.setup = {
      mesh: mesh,
      ethBlocks: ethBlocksWrapper.children,
      textures: textures,
    };
  },

  async createMesh() {
    const vertexShader = Canvas3Options.shaders.playEthBlockGlass.vertexShader;
    const fragmentShader =
      Canvas3Options.shaders.playEthBlockGlass.fragmentShader;

    const geometry = new THREE.PlaneGeometry(1, 1);

    const loader = new THREE.TextureLoader();

    const texture = await loader.loadAsync("images/01.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;
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
          value: new THREE.Vector2(texture.width, texture.height),
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

  async textureChange(index) {
    //TODO: load all images bit by bit to use in shader with transition

    if (!this.setup) return;

    const mesh = this.setup?.mesh as THREE.Mesh | undefined;
    if (!mesh) return;

    const material = mesh.material as THREE.ShaderMaterial;
    if (!material?.uniforms?.uImage) return;

    const newTexture = this.setup.textures[index];
    if (!newTexture) return;
    newTexture.colorSpace = THREE.SRGBColorSpace;
    newTexture.needsUpdate = true;
    material.uniforms.uImage.value = newTexture;
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
    if (!this.setup) return;
    const { mesh } = this.setup;
    if (!mesh) return;

    const meshToUpdate = this.setup?.mesh as THREE.Mesh | undefined;
    if (!meshToUpdate) return;

    const material = meshToUpdate.material as THREE.ShaderMaterial;

    const uBlocksPositions = this.calculateUBlockPositions();

    material.uniforms.uBlocks.value = uBlocksPositions;
    material.uniforms.uBlockCount.value = Math.min(uBlocksPositions.length, 10);
  },
};
