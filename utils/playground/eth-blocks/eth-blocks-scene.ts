import * as THREE from "three";
import { Canvas3Options } from "~/constants/canvas3-options";
import { gsap } from "gsap";

type EthBlocksAnimationSetup = {
  mesh: THREE.Object3D | null;
  ethBlocks: HTMLCollection;
  imageAniTimeline: gsap.core.Timeline;
  aniTimelineArray: gsap.core.TimelineChild[];
};

type EthBlocksAnimation = {
  meshId: string;
  textures: THREE.Texture[];
  loadingBlockId: string;
  activeBlockId: string;
  blockLoadingTime: number;
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
export const BLOCKS_HEIGHT = 236;

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: null,
  textures: [],
  meshId: "ethBlockBg",
  loadingBlockId: "loadingBlockInit",
  activeBlockId: "activeBlockId",
  blockLoadingTime: 12,
  blocksTopPadding: 0.25,
  blocksBasePosition: 0,
  async init(ethBlocksWrapper: HTMLElement) {
    this.blocksBasePosition = window.innerHeight * this.blocksTopPadding;

    Canvas3.addAnimationToRender("ethBlocksAnimation", this.render.bind(this));

    const loader = new THREE.TextureLoader();

    this.textures = await Promise.all([
      loader.loadAsync("images/01.png"),
      loader.loadAsync("images/02.jpg"),
    ]);

    const mesh = await this.createMesh();

    this.setup = {
      mesh: mesh,
      ethBlocks: ethBlocksWrapper.children,
      imageAniTimeline: gsap.timeline(),
      aniTimelineArray: [],
    };
    this.firstEnterAnimation();

    const nextTextures = await Promise.all([
      // loader.loadAsync("images/01.png"),
      // loader.loadAsync("images/02.png"),
      loader.loadAsync("images/03.png"),
      loader.loadAsync("images/04.jpg"),
      loader.loadAsync("images/05.png"),
      loader.loadAsync("images/06.jpg"),
      loader.loadAsync("images/07.png"),
      loader.loadAsync("images/08.jpg"),
    ]);

    for (let i = 0; i < nextTextures.length; i++) {
      if (nextTextures[i]) this.textures.push(nextTextures[i]);
    }
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

    const el = this.setup.ethBlocks[index] as HTMLElement;
    if (!el) return;
    const blockId = el.dataset.blockId;
    if (!blockId) return;
    if (this.loadingBlockId === blockId) return;
    if (this.activeBlockId === blockId) return;
    if (aniCoef > 0.05) return;
    // console.log("aniCoef", blockId);
    this.activeBlockId = blockId;
    const imageId = Number(el.dataset.bgImageId);
    this.imageTextureChange(imageId);
  },

  async createMesh() {
    const vertexShader = Canvas3Options.shaders.playEthBlockGlass.vertexShader;
    const fragmentShader =
      Canvas3Options.shaders.playEthBlockGlass.fragmentShader;

    const geometry = new THREE.PlaneGeometry(1, 1);

    if (!this.textures[0]) return;
    const textureCurrent = this.textures[0];
    textureCurrent.colorSpace = THREE.SRGBColorSpace;
    textureCurrent.needsUpdate = true;

    if (!this.textures[1]) return;
    const textureNext = this.textures[1];
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

    // if()
    // TODO do something to make the transition nice
    if (this.setup.imageAniTimeline.progress() !== 1) {
      this.setup.imageAniTimeline.clear();
      console.log("CLEAR", imageId);
    }

    if (!material.uniforms.uTransitionProgress) return;
    const imageChangeDuration = Math.max(
      0.5,
      0.9 - (Canvas3.getScrollSpeed() ?? 1),
    );

    console.log("imageTextureChange", imageId, imageChangeDuration);

    this.setup.imageAniTimeline.to(material.uniforms.uTransitionProgress, {
      value: 1,
      duration: imageChangeDuration,
      ease: "linear",
      // label: 'texturesChange_' + imageId,
      onComplete: () => {
        if (!this.setup) return;
        if (!material?.uniforms?.uTextureNext) return;
        if (!material?.uniforms?.uTextureCurrent) return;

        const newTexture = this.textures[imageId];
        if (!newTexture) return;

        newTexture.colorSpace = THREE.SRGBColorSpace;
        newTexture.needsUpdate = true;
        material.uniforms.uTextureCurrent.value =
          material.uniforms.uTextureNext.value;
        material.uniforms.uTextureNext.value = newTexture;
        if (!material.uniforms.uTransitionProgress) return;
        material.uniforms.uTransitionProgress.value = 0;
        // this.setup.aniTimelineArray.length = 0;
      },
    });
    // this.setup.aniTimelineArray.push(ani);
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
// - data animate in in the blocks
// - update glass size to fit design
// - Shader -
//           - uTransitionProgress - with better shader effect - from top to bottom first
// - Images export/import - 20 images - J
// ----------
// - maxAmount of blocks 25, remove the oldest once
// -
