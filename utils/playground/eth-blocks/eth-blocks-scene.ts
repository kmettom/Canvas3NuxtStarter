import * as THREE from "three";
import { Canvas3Options } from "~/constants/canvas3-options";
import { gsap } from "gsap";

type EthBlocksAnimationSetup = {
  mesh: THREE.Object3D | null;
  ethBlocks: HTMLCollection;
  activeBlockIndex: number;
  textures: THREE.Texture[];
  imageAniTimeline: gsap.core.Timeline;
};

type EthBlocksAnimation = {
  meshId: string;
  setup: EthBlocksAnimationSetup | null;
  blocksBasePosition: number;
  blocksTopPadding: number;
  init: (ethBlocksWrapper: HTMLElement) => Promise<void>;
  createMesh: () => Promise<THREE.Mesh>;
  getVec4PositionFromClientRect: (clientRect: DOMRect) => THREE.Vector4;
  calculateUBlockPositions: () => THREE.Vector4[];
  render: () => void;
  imageTextureChange: (index: number) => void;
  animateBlockSizeOnScroll: (elNode: HTMLElement, index: number) => void;
  firstEnterAnimation: () => void;
};

export const BLOCKS_ON_SCREEN_AMOUNT = 6;

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: null,
  meshId: "ethBlockBg",
  blocksTopPadding: 0.25,
  blocksBasePosition: 0,
  async init(ethBlocksWrapper: HTMLElement) {
    this.blocksBasePosition = window.innerHeight * this.blocksTopPadding;
    const mesh = await this.createMesh();

    Canvas3.addAnimationToRender("ethBlocksAnimation", this.render.bind(this));

    const loader = new THREE.TextureLoader();
    // const imagesAmount = 10;

    const textures = await Promise.all([
      // loader.loadAsync("images/00.png"),
      loader.loadAsync("images/01.jpg"),
      loader.loadAsync("images/02.jpg"),
      loader.loadAsync("images/03.jpg"),
      loader.loadAsync("images/04.jpg"),
      loader.loadAsync("images/05.jpg"),
      loader.loadAsync("images/06.jpg"),
      loader.loadAsync("images/07.jpg"),
      loader.loadAsync("images/08.jpg"),
    ]);

    this.setup = {
      mesh: mesh,
      ethBlocks: ethBlocksWrapper.children,
      textures: textures,
      activeBlockIndex: 0,
      imageAniTimeline: gsap.timeline(),
    };
    this.firstEnterAnimation();
  },
  firstEnterAnimation() {},
  animateBlockSizeOnScroll(elNode, index) {
    if (!this.setup) return;
    const blockClientRect = elNode.getBoundingClientRect();
    const blockPositionTop = blockClientRect.top;
    const aniCoef = Math.abs(
      (blockPositionTop - this.blocksBasePosition) / window.innerHeight,
    );

    gsap.to(elNode, {
      duration: 0,
      ease: "linear",
      scale: Math.max(1 - aniCoef / 3, 0.75),
      opacity: Math.max(1 - aniCoef * 3, 0.35),
    });

    if (aniCoef < 0.03 && this.setup.activeBlockIndex !== index) {
      this.setup.activeBlockIndex = index;
      const imageId = Number(this.setup.ethBlocks[index]?.dataset.bgImageId);
      // console.log("imageTextureChange", imageId);
      this.imageTextureChange(imageId);
    }
  },

  async createMesh() {
    const vertexShader = Canvas3Options.shaders.playEthBlockGlass.vertexShader;
    const fragmentShader =
      Canvas3Options.shaders.playEthBlockGlass.fragmentShader;

    const geometry = new THREE.PlaneGeometry(1, 1);

    const loader = new THREE.TextureLoader();

    const textureCurrent = await loader.loadAsync("images/01.jpg");
    textureCurrent.colorSpace = THREE.SRGBColorSpace;
    textureCurrent.needsUpdate = true;

    const textureNext = await loader.loadAsync("images/02.jpg");
    textureNext.colorSpace = THREE.SRGBColorSpace;
    textureNext.needsUpdate = true;

    const uBlocksPositions = this.calculateUBlockPositions();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uDevicePixelRatio: { value: window.devicePixelRatio },
        uTime: { value: 0 },
        uTextureCurrent: { value: textureCurrent },
        uTextureNext: { value: textureNext },
        uTransitionProgress: { value: 0 },
        uAniInImage: { value: 1 },
        uHover: { value: 1 },
        vectorVNoise: { value: new THREE.Vector2(1.5, 1.5) }, // 1.5
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseMovement: { value: new THREE.Vector2(0, 0) },
        uMeshSize: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTextureSize: {
          value: new THREE.Vector2(textureCurrent.width, textureCurrent.height),
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

  async imageTextureChange(imageId) {
    if (!this.setup) return;

    const mesh = this.setup?.mesh as THREE.Mesh | undefined;
    if (!mesh) return;

    const material = mesh.material as THREE.ShaderMaterial;

    console.log(
      "this.setup.imageAniTimeline.progress",
      this.setup.imageAniTimeline.progress(),
    );
    if (this.setup.imageAniTimeline.progress() !== 1) {
      //TODO do somethink to make th transition nice
    }
    // this.setup.imageAniTimeline.progress(1)
    if (!material.uniforms.uTransitionProgress) return;

    this.setup.imageAniTimeline.to(material.uniforms.uTransitionProgress, {
      value: 1,
      duration: 0.35,
      //TODO -> add scroll speed, so fast scroll vill cause faster transition
      ease: "linear",
      onComplete: () => {
        if (!this.setup) return;
        if (!material?.uniforms?.uTextureNext) return;
        if (!material?.uniforms?.uTextureCurrent) return;

        const newTexture = this.setup.textures[imageId];
        // const  = this.setup.textures[index];
        if (!newTexture) return;

        newTexture.colorSpace = THREE.SRGBColorSpace;
        newTexture.needsUpdate = true;
        material.uniforms.uTextureCurrent.value =
          material.uniforms.uTextureNext.value;
        material.uniforms.uTextureNext.value = newTexture;
        if (!material.uniforms.uTransitionProgress) return;
        material.uniforms.uTransitionProgress.value = 0;
      },
    });
  },

  getVec4PositionFromClientRect: (clientRect) => {
    const centerX = clientRect.left + clientRect.width * 0.5;
    const centerY = clientRect.top + clientRect.height * 0.5;
    const blockPadding = 0;

    const x = centerX - window.innerWidth * 0.5;
    const y = window.innerHeight * 0.5 - centerY - blockPadding;

    const halfW = Number((clientRect.width * 0.5).toFixed(1));
    const halfH = Number((clientRect.height * 0.5).toFixed(1));
    return new THREE.Vector4(x, y, halfW, halfH);
  },

  calculateUBlockPositions() {
    if (!this.setup?.ethBlocks) {
      return Array.from(
        { length: BLOCKS_ON_SCREEN_AMOUNT },
        () => new THREE.Vector4(0, 0, 0, 0),
      );
    }

    const positions: THREE.Vector4[] = [];

    for (let i = 0; i < this.setup.ethBlocks.length; i++) {
      if (
        this.setup.ethBlocks[i] &&
        this.setup.ethBlocks[i]?.classList.contains("active")
      ) {
        const bounds = this.setup.ethBlocks[i]?.getBoundingClientRect();
        if (bounds) positions.push(this.getVec4PositionFromClientRect(bounds));
        this.animateBlockSizeOnScroll(
          this.setup.ethBlocks[i] as HTMLElement,
          i,
        );
      }
    }

    while (positions.length < BLOCKS_ON_SCREEN_AMOUNT) {
      positions.push(new THREE.Vector4(0, 0, 0, 0));
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

//TODO:
// - appear animation with loader, or transition
//       - first image load as priority
//       - other textures lazy async
//       - Load 20 images - async
// - data animate in in the blocks
// - update glass size to fit design
// - Shader -
//           - uTransitionProgress - with better shader effect - from top to bottom first
// - Images export - 20 images - J
// ----------
// - maxAmount of blocks 25, remove the oldest once
//
// -
