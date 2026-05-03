import * as THREE from "three";
import { Canvas3Options } from "~/constants/canvas3-options";
import { gsap } from "gsap";

type EthBlocksAnimationSetup = {
  mesh: THREE.Object3D | null;
  ethBlocks: HTMLCollection;
  activeBlockIndex: number;
  textures: THREE.Texture[];
  imageAniTimeline: gsap.core.Timeline | null;
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
};

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
      loader.loadAsync("images/00.png"),
      loader.loadAsync("images/01.jpg"),
      loader.loadAsync("images/02.jpg"),
      loader.loadAsync("images/03.jpg"),
      loader.loadAsync("images/04.jpg"),
      loader.loadAsync("images/05.jpg"),
    ]);

    this.setup = {
      mesh: mesh,
      ethBlocks: ethBlocksWrapper.children,
      textures: textures,
      activeBlockIndex: 0,
      imageAniTimeline: gsap.timeline(),
    };
  },
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

    if (aniCoef < 0.05 && this.setup.activeBlockIndex !== index) {
      this.setup.activeBlockIndex = index;
      this.imageTextureChange(index);
    }
  },

  async createMesh() {
    const vertexShader = Canvas3Options.shaders.playEthBlockGlass.vertexShader;
    const fragmentShader =
      Canvas3Options.shaders.playEthBlockGlass.fragmentShader;

    const geometry = new THREE.PlaneGeometry(1, 1);

    const loader = new THREE.TextureLoader();

    const texture = await loader.loadAsync("images/00.png");
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const texture2 = await loader.loadAsync("images/01.jpg");
    texture2.colorSpace = THREE.SRGBColorSpace;
    texture2.needsUpdate = true;

    const uBlocksPositions = this.calculateUBlockPositions();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uDevicePixelRatio: { value: window.devicePixelRatio },
        uTime: { value: 0 },
        uTextureCurrent: { value: texture },
        uTextureNext: { value: texture2 },
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

  async imageTextureChange(index) {
    console.log("imageTextureChange", index);
    if (!this.setup) return;

    const mesh = this.setup?.mesh as THREE.Mesh | undefined;
    if (!mesh) return;

    const material = mesh.material as THREE.ShaderMaterial;
    if (!material?.uniforms?.uTextureCurrent) return;
    if (!material?.uniforms?.uTextureNext) return;

    const newTexture = this.setup.textures[index];
    if (!newTexture) return;
    material.uniforms.uTextureCurrent.value =
      material.uniforms.uTextureNext.value;

    newTexture.colorSpace = THREE.SRGBColorSpace;
    newTexture.needsUpdate = true;

    material.uniforms.uTextureNext.value = newTexture;

    if (material.uniforms.uTransitionProgress) {
      if (this.setup.imageAniTimeline) {
        this.setup.imageAniTimeline.clear();
      }

      material.uniforms.uTransitionProgress.value = 0;

      this.setup.imageAniTimeline?.to(material.uniforms.uTransitionProgress, {
        value: 1,
        duration: 0.2,
        //TODO -> add scroll speed, so fast scroll vill cause faster transition
        ease: "linear",
      });
    }
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
      return Array.from({ length: 10 }, () => new THREE.Vector4(0, 0, 0, 0));
    }

    const blocks = Array.from(this.setup.ethBlocks).slice(0, 10);
    const positions: THREE.Vector4[] = blocks.map((el) => {
      const bounds = (el as HTMLElement).getBoundingClientRect();
      return this.getVec4PositionFromClientRect(bounds);
    });

    while (positions.length < 10) {
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

    for (let i = 0; i < this.setup.ethBlocks.length; i++) {
      if (this.setup.ethBlocks[i]?.classList.contains("active")) {
        this.animateBlockSizeOnScroll(
          this.setup.ethBlocks[i] as HTMLElement,
          i,
        );
      }
    }

    material.uniforms.uBlocks.value = uBlocksPositions;
    material.uniforms.uBlockCount.value = Math.min(uBlocksPositions.length, 10);
  },
};

//TODO:
// - 6 glass blocks - show only the active once in the screen -> Attach function to check blocks on scroll - pick the blocks which are in view?
//     - mark the active(on screen blocks, then pick the most present one - Image change trigger)
// - dynamic change of images
// ----------
// - maxAmount of blocks 25, remove the oldest once
// - data animate in in the blocks
// - update glass size to fit design
// -
