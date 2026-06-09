import * as THREE from "three";
import { Canvas3Options } from "~/constants/canvas3-options";
import { gsap } from "gsap";
import {
  BLOCKS_ON_SCREEN_AMOUNT,
  DEFAULT_TRANSACTIONS_AMOUNT,
  IMAGE_FILE_AMOUNT,
  INITIAL_BLOCK_AMOUNT,
} from "~/constants/playground/eth-blocks";
import type { EthBlocksAnimation } from "#shared/types/playground/eth-blocks";

export const ethBlocksAnimation: EthBlocksAnimation = {
  imageBgMeshes: [],
  glassMesh: null,
  sceneRT: null,
  ethBlockEls: null,
  textureMaskNoise: null,
  loadingBlockId: 0,
  activeBlockId: 0,
  activeImageId: 0,
  blocksTopPadding: 0.25,
  blocksBasePosition: 0,
  pendingImageId: 0,
  currentImageId: 0,
  imageAniTimeline: null,
  firstEnterAniInProgress: true,
  isAnimating: false,
  _uBlocksPositions: [],
  _lastScrollY: -1,
  setBlockBasePosition() {
    this.blocksBasePosition = window.innerHeight * this.blocksTopPadding;
  },
  destroy() {
    const scene = Canvas3.getScene();
    if (this.glassMesh) {
      scene.remove(this.glassMesh);
    }
    for (let i = 0; i < this.imageBgMeshes.length; i++) {
      const meshToRemove = this.imageBgMeshes[i];
      if (meshToRemove) {
        scene.remove(meshToRemove);
      }
    }
    Canvas3.removeAnimationFromRender("ethBlocksAnimation");
    this.imageBgMeshes = [];
    this.glassMesh = null;
    this.sceneRT = null;
    this.ethBlockEls = null;
    this.loadingBlockId = 0;
    this.activeBlockId = 0;
    this.activeImageId = 0;
    this.blocksTopPadding = 0.25;
    this.blocksBasePosition = 0;
    this.pendingImageId = 0;
    this.currentImageId = 0;
    this.imageAniTimeline = null;
    this.firstEnterAniInProgress = true;
    this.isAnimating = false;
    this._uBlocksPositions = [];
    this._lastScrollY = -1;
  },
  async init(ethBlockEls) {
    if (!ethBlockEls) return;
    this.ethBlockEls = ethBlockEls;
    await this.loadTextures(2);
  },
  async revealFirstTexture() {
    return new Promise((resolve) => {
      const initMesh = this.imageBgMeshes[0];
      if (!initMesh) {
        resolve();
        return;
      }
      const initMaterial = initMesh.material as THREE.ShaderMaterial;
      initMaterial.uniforms.uColAmount = { value: 50 };
      if (!initMaterial.uniforms.uTransitionProgress) {
        resolve();
        return;
      }

      gsap.to(initMaterial.uniforms.uTransitionProgress, {
        value: 1,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          resolve();
        },
      });
    });
  },
  async startRender() {
    this._uBlocksPositions = Array.from(
      { length: BLOCKS_ON_SCREEN_AMOUNT },
      () => new THREE.Vector4(0, 0, 0, 0),
    );

    // We already loaded 1 texture in init, now load the rest for initial blocks
    await this.loadTextures(INITIAL_BLOCK_AMOUNT);
    this.glassMesh = await this.createGlassBlockMesh();

    const renderer = Canvas3.getRenderer();
    const rtWidth = renderer
      ? renderer.domElement.clientWidth * renderer.getPixelRatio()
      : window.innerWidth;
    const rtHeight = renderer
      ? renderer.domElement.clientHeight * renderer.getPixelRatio()
      : window.innerHeight;

    this.sceneRT = new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
      depthBuffer: false,
      stencilBuffer: false,
    });

    Canvas3.addAnimationToRender("ethBlocksAnimation", this.render.bind(this));
  },
  async loadTextureMaskNoise() {
    const loader = new THREE.TextureLoader();
    const texture = await loader.loadAsync(`images/textureMaskNoise3.png`);
    if (texture) {
      this.textureMaskNoise = texture;
    }
  },
  async loadTextures(amountOfTextures = IMAGE_FILE_AMOUNT, delay = 0) {
    if (!this.textureMaskNoise) {
      await this.loadTextureMaskNoise();
    }
    const alreadyLoadedTextures = this.imageBgMeshes.length;
    if (alreadyLoadedTextures >= IMAGE_FILE_AMOUNT) return;
    const amountToLoad = amountOfTextures
      ? amountOfTextures
      : IMAGE_FILE_AMOUNT;
    const loader = new THREE.TextureLoader();

    const endIndex = amountToLoad + alreadyLoadedTextures;
    const endIndexCapped =
      endIndex >= IMAGE_FILE_AMOUNT ? IMAGE_FILE_AMOUNT : endIndex;
    for (let i = alreadyLoadedTextures; i < endIndexCapped; i++) {
      const imageName = i < 10 ? "0" + i : i;
      try {
        const texture = await loader.loadAsync(`images/${imageName}.webp`);
        if (!texture) continue;
        const mesh = await this.createImageBgMesh(texture, i);
        if (mesh) {
          this.imageBgMeshes.push(mesh);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (e) {
        console.error(`Failed to load texture ${imageName}`, e);
      }
    }
  },

  animateBlockSizeOnScroll(elNode, index, blockClientRect) {
    if (!blockClientRect) blockClientRect = elNode.getBoundingClientRect();
    const blockPositionTop = blockClientRect.top;
    const aniCoef = Math.abs(
      (blockPositionTop - this.blocksBasePosition) / window.innerHeight,
    );

    const currentScrollY = window.scrollY;
    if (
      this._lastScrollY !== currentScrollY ||
      this.firstEnterAniInProgress ||
      this.isAnimating
    ) {
      elNode.style.transform = `scale(${Math.max(1 - aniCoef / 3, 0.75)})`;
      elNode.style.opacity = `${Math.max(1 - aniCoef * 3, 0.35)}`;
    }

    //***************************
    //Set Active Block and trigger inageBG chagne
    //***************************
    if (this.firstEnterAniInProgress) return;
    if (!this.ethBlockEls) return;
    const el = this.ethBlockEls[index] as HTMLElement;
    if (!el) return;
    const blockId = Number(el.dataset.blockId);
    if (Number.isNaN(blockId)) return;
    if (this.loadingBlockId === blockId) return;
    if (this.activeBlockId === blockId) return;
    if (aniCoef > 0.03) return;
    this.activeBlockId = blockId;
    if (!el.dataset.bgImageId) return;
    const imageId = Number(el.dataset.bgImageId);
    const prevImageId = this.activeImageId;
    this.activeImageId = imageId;
    const transactionsAmount = Number(el.dataset.transactionsAmount);
    this.imageBgChange(prevImageId, imageId, transactionsAmount);
  },

  async createGlassBlockMesh() {
    const vertexShader = Canvas3Options.shaders.playEthBlockGlass.vertexShader;
    const fragmentShader =
      Canvas3Options.shaders.playEthBlockGlass.fragmentShader;

    const geometry = new THREE.PlaneGeometry(1, 1);

    const uBlocksPositions = this.calculateUBlockPositions();

    const meshId = "ethBlockBg";
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMeshSize: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
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
        uSceneTexture: { value: null },
      },
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      transparent: true,
      name: meshId,
      // wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = meshId;
    mesh.scale.set(window.innerWidth, window.innerHeight, 1);
    mesh.position.z = 2;

    Canvas3.addMeshToScene(mesh);
    return mesh;
  },

  async createImageBgMesh(texture, id) {
    const vertexShader =
      Canvas3Options.shaders.playEthBlockImageBg.vertexShader;
    const fragmentShader =
      Canvas3Options.shaders.playEthBlockImageBg.fragmentShader;

    const geometry = new THREE.PlaneGeometry(1, 1);
    const meshId = "imageBgMesh_" + id;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTexturePrevious: { value: null },
        utextureMaskNoise: { value: this.textureMaskNoise },
        uColAmount: { value: DEFAULT_TRANSACTIONS_AMOUNT },
        uTransitionProgress: { value: 0 },
        uMeshSize: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTextureSize: {
          value: new THREE.Vector2(texture.width, texture.height),
        },
        uViewport: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      transparent: true,
      name: meshId,
      depthWrite: false,
      depthTest: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = meshId;
    mesh.scale.set(window.innerWidth, window.innerHeight, 1);
    mesh.position.z = id === 0 ? 1 : 0;

    Canvas3.addMeshToScene(mesh);
    if (!mesh) return null;
    return mesh;
  },

  async imageBgChange(
    prevImageId,
    newImageId,
    transactionsAmount = DEFAULT_TRANSACTIONS_AMOUNT,
  ) {
    for (let i = 0; i < this.imageBgMeshes.length; i++) {
      const meshToUpdate = this.imageBgMeshes[i];
      if (!meshToUpdate) continue;
      meshToUpdate.position.z = newImageId === i ? 1 : 0;
      const materialToUpdate = meshToUpdate.material as THREE.ShaderMaterial;
      if (!materialToUpdate.uniforms.uTransitionProgress) continue;
      materialToUpdate.uniforms.uTransitionProgress.value = 0;
    }

    const mesh = this.imageBgMeshes[newImageId];
    if (!mesh) return;
    const material = mesh.material as THREE.ShaderMaterial;

    const prevMaterial = this.imageBgMeshes[prevImageId]
      ?.material as THREE.ShaderMaterial;
    if (!prevMaterial) return;
    const uTexturePreviousValue = prevMaterial.uniforms.uTexture?.value;
    if (!material.uniforms.uTexturePrevious || !uTexturePreviousValue) return;
    material.uniforms.uTexturePrevious.value = uTexturePreviousValue;
    if (!material.uniforms.uColAmount) return;
    material.uniforms.uColAmount.value = Math.max(15, transactionsAmount / 10);

    if (!material.uniforms.uTransitionProgress) return;

    //   Canvas3.getScrollSpeed()
    const imageChangeDuration = 3;

    gsap.fromTo(
      material.uniforms.uTransitionProgress,
      { value: 0 },
      {
        value: 1,
        duration: imageChangeDuration,
      },
    );
  },

  getVec4PositionFromClientRect: (clientRect, canvasRect) => {
    const blockPadding = 0;
    const centerX = clientRect.left + clientRect.width * 0.5;
    const centerY = clientRect.top + clientRect.height * 0.5;
    const canvasCenterX = canvasRect.left + canvasRect.width * 0.5;
    const canvasCenterY = canvasRect.top + canvasRect.height * 0.5;
    const x = centerX - canvasCenterX;
    const y = canvasCenterY - centerY - blockPadding;

    const halfW = Number((clientRect.width * 0.5).toFixed(1));
    const halfH = Number((clientRect.height * 0.5).toFixed(1));
    return new THREE.Vector4(x, y, halfW, halfH);
  },

  updateVec4FromClientRect(vec4, clientRect, canvasRect) {
    const blockPadding = 0;
    const centerX = clientRect.left + clientRect.width * 0.5;
    const centerY = clientRect.top + clientRect.height * 0.5;
    const canvasCenterX = canvasRect.left + canvasRect.width * 0.5;
    const canvasCenterY = canvasRect.top + canvasRect.height * 0.5;
    const x = centerX - canvasCenterX;
    const y = canvasCenterY - centerY - blockPadding;

    const halfW = Number((clientRect.width * 0.5).toFixed(1));
    const halfH = Number((clientRect.height * 0.5).toFixed(1));
    vec4.set(x, y, halfW, halfH);
  },

  calculateUBlockPositions() {
    if (!this.ethBlockEls || !this._uBlocksPositions) {
      return (
        this._uBlocksPositions ||
        Array.from(
          { length: BLOCKS_ON_SCREEN_AMOUNT },
          () => new THREE.Vector4(0, 0, 0, 0),
        )
      );
    }

    const renderer = Canvas3.getRenderer();
    const canvasBounds = renderer?.domElement.getBoundingClientRect();
    if (!canvasBounds) return this._uBlocksPositions;

    let activeIndex = 0;
    for (let i = 0; i < this.ethBlockEls.length; i++) {
      const el = this.ethBlockEls[i] as HTMLElement;
      if (
        el &&
        (el.classList.contains("active") || el.classList.contains("animating"))
        // &&
        // !el.classList.contains("block-loading")
      ) {
        const clientBounds = el.getBoundingClientRect();
        if (activeIndex < BLOCKS_ON_SCREEN_AMOUNT) {
          const uBlockPosition = this._uBlocksPositions[activeIndex];
          if (uBlockPosition) {
            this.updateVec4FromClientRect(
              uBlockPosition,
              clientBounds,
              canvasBounds,
            );
            activeIndex++;
          }
        }
        this.animateBlockSizeOnScroll(el, i, clientBounds);
      }
    }

    while (activeIndex < BLOCKS_ON_SCREEN_AMOUNT) {
      this._uBlocksPositions[activeIndex]?.set(0, 0, 0, 0);
      activeIndex++;
    }

    this._lastScrollY = window.scrollY;
    this.isAnimating = false;
    return this._uBlocksPositions;
  },
  resizeImageBGMesh() {
    if (this.glassMesh) {
      this.glassMesh.scale.set(window.innerWidth, window.innerHeight, 1);
      this.glassMesh.position.x = 0;
      this.glassMesh.position.y = 0;

      const mat = this.glassMesh.material as THREE.ShaderMaterial;
      mat.uniforms.uMeshSize?.value.set(window.innerWidth, window.innerHeight);
      mat.uniforms.uViewport?.value.set(window.innerWidth, window.innerHeight);
    }

    if (this.sceneRT) {
      const renderer = Canvas3.getRenderer();
      const w =
        (renderer?.domElement.clientWidth ?? window.innerWidth) *
        (renderer?.getPixelRatio() ?? 1);
      const h =
        (renderer?.domElement.clientHeight ?? window.innerHeight) *
        (renderer?.getPixelRatio() ?? 1);
      this.sceneRT.setSize(w, h);
    }

    for (let i = 0; i < this.imageBgMeshes.length; i++) {
      const meshToUpdate = this.imageBgMeshes[i];
      if (!meshToUpdate) continue;

      meshToUpdate.scale.set(window.innerWidth, window.innerHeight, 1);
      meshToUpdate.position.x = 0;
      meshToUpdate.position.y = 0;

      const material = meshToUpdate.material as THREE.ShaderMaterial;
      material.uniforms.uMeshSize?.value.set(
        window.innerWidth,
        window.innerHeight,
      );
      material.uniforms.uViewport?.value.set(
        window.innerWidth,
        window.innerHeight,
      );
    }
  },
  render() {
    if (!this.glassMesh || !this.sceneRT) return;

    const meshToUpdate = this.glassMesh as THREE.Mesh;
    const material = meshToUpdate.material as THREE.ShaderMaterial;

    const uBlocksPositions = this.calculateUBlockPositions();

    if (material.uniforms.uBlocks)
      material.uniforms.uBlocks.value = uBlocksPositions;
    if (material.uniforms.uBlockCount)
      material.uniforms.uBlockCount.value = Math.min(
        uBlocksPositions.length,
        10,
      );

    this.glassMesh.visible = false;

    const renderer = Canvas3.getRenderer();
    const scene = Canvas3.getScene();
    const camera = Canvas3.getCamera();

    if (renderer && scene && camera) {
      renderer.setRenderTarget(this.sceneRT);
      renderer.setClearColor(0x000000, 0); // Ensure transparency
      renderer.clear();
      renderer.render(scene, camera);

      this.glassMesh.visible = true;

      if (!material.uniforms.uSceneTexture) return;
      material.uniforms.uSceneTexture.value = this.sceneRT.texture;

      renderer.setRenderTarget(null);
    }
  },
};

//TODO:
// - Q - First transition missing
// - Q- transition Shader -> https://www.shadertoy.com/view/WsB3Wy - finish timing, easing and possible mask image update

// - ? QA - Scroll magnet to closest block top ?
// ----------
// - ? maxAmount of blocks 25, remove the oldest once
