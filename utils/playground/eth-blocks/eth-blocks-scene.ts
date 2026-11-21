import * as THREE from "three";
import { Canvas3Options } from "~/constants/canvas3-options";
import { gsap } from "gsap";
import {
  BLOCKS_ON_SCREEN_AMOUNT,
  DEFAULT_IMAGE_CHANGE_DURATION,
  DEFAULT_MAX_TRANSACTIONS_AMOUNT,
  DEFAULT_TRANSACTIONS_AMOUNT,
  IMAGE_FILE_AMOUNT,
  INITIAL_BLOCK_AMOUNT,
  LOADING_BLOCK_SIZE,
  MAX_PIXEL_RATIO,
  MOBILE_IMAGE_FILE_AMOUNT,
  MOBILE_MAX_TEXTURE_SIZE,
  NEXT_IMAGE_BATCH_LOAD_AMOUNT,
  U_TRANSACTIONS_AMOUNT_NORMALISED,
} from "~/constants/playground/eth-blocks";
import type { EthBlocksAnimation } from "#shared/types/playground/eth-blocks";
import { ETH_ANI_CALLBACK_NAME } from "~/utils/playground/eth-blocks/web3-helpers";

const isLowMemoryDevice = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(pointer: coarse)").matches;

// The glass blur makes a half-resolution scene copy look the same, at a
// quarter of the pixels to render and sample
const SCENE_RT_SCALE = 0.5;
const getSceneRTSize = (renderer: THREE.WebGLRenderer | null) => {
  const ratio = (renderer?.getPixelRatio() ?? 1) * SCENE_RT_SCALE;
  const width = renderer?.domElement.clientWidth ?? window.innerWidth;
  const height = renderer?.domElement.clientHeight ?? window.innerHeight;
  return [
    Math.max(1, Math.round(width * ratio)),
    Math.max(1, Math.round(height * ratio)),
  ] as const;
};

// Mouse position for the glass cursor circle, in CSS px from the canvas
// centre with y up - the same space getVec4PositionFromClientRect() uses for
// the block rects, so the circle lines up with the blocks
const handleGlassMouseMove = (event: MouseEvent) => {
  const material = ethBlocksAnimation.glassMesh?.material as
    THREE.ShaderMaterial | undefined;
  const uMousePx = material?.uniforms.uMousePx;
  if (!uMousePx) return;
  const bounds = ethBlocksAnimation._cachedCanvasBounds;
  const centerX = bounds
    ? bounds.left + bounds.width * 0.5
    : window.innerWidth * 0.5;
  const centerY = bounds
    ? bounds.top + bounds.height * 0.5
    : window.innerHeight * 0.5;
  uMousePx.value.set(event.clientX - centerX, centerY - event.clientY);
};

let glassGeometryDense: THREE.PlaneGeometry | null = null;
let glassGeometryFlat: THREE.PlaneGeometry | null = null;

const disposeMesh = (mesh: THREE.Mesh) => {
  mesh.geometry?.dispose();
  const material = mesh.material as THREE.ShaderMaterial;
  material.uniforms?.uTexture?.value?.dispose?.();
  material.dispose();
};

export const ethBlocksAnimation: EthBlocksAnimation = {
  _loadGeneration: 0,
  getImageFileAmount() {
    return isLowMemoryDevice() ? MOBILE_IMAGE_FILE_AMOUNT : IMAGE_FILE_AMOUNT;
  },
  // Canvas3.setSize() resets the renderer to the full devicePixelRatio (3 on
  // iPhones), which makes the screen buffer, composer and sceneRT ~4x larger.
  applyPixelRatioCap() {
    const renderer = Canvas3.getRenderer();
    if (!renderer) return;
    const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
    if (renderer.getPixelRatio() !== ratio) {
      renderer.setPixelRatio(ratio);
      Canvas3.composer?.setPixelRatio(ratio);
    }
    const glassMaterial = this.glassMesh?.material as
      THREE.ShaderMaterial | undefined;
    if (glassMaterial?.uniforms.uDevicePixelRatio)
      glassMaterial.uniforms.uDevicePixelRatio.value = ratio;
  },
  async loadBgTexture(url) {
    const texture = await new THREE.TextureLoader().loadAsync(url);
    if (!isLowMemoryDevice()) return texture;

    const image = texture.image as HTMLImageElement;
    const longest = Math.max(image.width, image.height);
    if (!longest) return texture;

    const scale = Math.min(1, MOBILE_MAX_TEXTURE_SIZE / longest);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return texture;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const scaled = new THREE.CanvasTexture(canvas);
    scaled.colorSpace = texture.colorSpace;
    // Shown at roughly screen size, so mipmaps only cost memory here
    scaled.generateMipmaps = false;
    scaled.minFilter = THREE.LinearFilter;
    texture.dispose();
    return scaled;
  },

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
  _uBlockHoveredIndex: {
    value: -1,
  },
  hoveredBlockId: -1,
  _lastScrollY: -1,
  _intersectionObserver: null as IntersectionObserver | null,
  _visibleBlockIds: new Set<number>(),

  _setupIntersectionObserver() {
    if (!this.ethBlockEls) return;

    // Clean up any previous observer
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
      this._intersectionObserver = null;
    }

    // Create a new observer
    this._intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const blockIdAttr = target.dataset.blockId;
          if (!blockIdAttr) continue;

          const blockId = Number(blockIdAttr);
          if (Number.isNaN(blockId)) continue;

          if (entry.isIntersecting) {
            this._visibleBlockIds.add(blockId);
          } else {
            this._visibleBlockIds.delete(blockId);
          }
        }
      },
      {
        root: null, // viewport
        rootMargin: "0px",
        threshold: 0, // consider visible as soon as any intersection
      },
    );

    // Start observing all current block elements
    for (let i = 0; i < this.ethBlockEls.length; i++) {
      const el = this.ethBlockEls[i] as HTMLElement | undefined;
      if (!el) continue;
      this._intersectionObserver.observe(el);
    }
  },

  setBlockBasePosition() {
    this.blocksBasePosition = window.innerHeight * this.blocksTopPadding;
  },
  destroy() {
    // Invalidates any loadTextures() still running for this page
    this._loadGeneration++;
    if (this.glassMesh) {
      if (this._scene) this._scene.remove(this.glassMesh);
      disposeMesh(this.glassMesh);
    }
    glassGeometryDense?.dispose();
    glassGeometryFlat?.dispose();
    glassGeometryDense = null;
    glassGeometryFlat = null;
    for (let i = 0; i < this.imageBgMeshes.length; i++) {
      const meshToRemove = this.imageBgMeshes[i];
      if (!meshToRemove) continue;
      if (this._scene) this._scene.remove(meshToRemove);
      disposeMesh(meshToRemove);
    }
    this.sceneRT?.dispose();
    this.textureMaskNoise?.dispose();
    this.textureMaskNoise = null;

    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
      this._intersectionObserver = null;
    }
    this._visibleBlockIds.clear();

    window.removeEventListener("mousemove", handleGlassMouseMove);
    Canvas3.removeAnimationFromRender("ethBlocksAnimation");
    this.imageBgMeshes = [];
    this.glassMesh = null;
    this.sceneRT = null;
    this.ethBlockEls = null;
    this.loadingBlockId = 0;
    this.activeBlockId = 0;
    this.activeImageId = 0;
    this.blocksTopPadding = 0.25;
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

    this._setupIntersectionObserver();

    await this.loadTextures(
      INITIAL_BLOCK_AMOUNT + NEXT_IMAGE_BATCH_LOAD_AMOUNT,
    );
  },
  async revealFirstTexture() {
    return new Promise((resolve) => {
      const initMesh = this.imageBgMeshes[0];
      if (!initMesh) {
        resolve();
        return;
      }
      const initMaterial = initMesh.material as THREE.ShaderMaterial;
      initMaterial.uniforms.uTransactionsAmount = {
        value: U_TRANSACTIONS_AMOUNT_NORMALISED,
      };
      if (!initMaterial.uniforms.uTransitionProgress) {
        resolve();
        return;
      }

      gsap.to(initMaterial.uniforms.uTransitionProgress, {
        value: 1,
        duration: DEFAULT_IMAGE_CHANGE_DURATION,
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

    this._renderer = Canvas3.getRenderer();
    this._scene = Canvas3.getScene();
    this._camera = Canvas3.getCamera();

    this.glassMesh = await this.createGlassBlockMesh();
    this.applyPixelRatioCap();

    this._cachedCanvasBounds =
      this._renderer?.domElement.getBoundingClientRect() ?? null;
    const [rtWidth, rtHeight] = getSceneRTSize(this._renderer);

    this.sceneRT = new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
      depthBuffer: false,
      stencilBuffer: false,
    });

    const glassMaterial = this.glassMesh.material as THREE.ShaderMaterial;
    if (glassMaterial.uniforms.uSceneTexture)
      glassMaterial.uniforms.uSceneTexture.value = this.sceneRT.texture;
    window.addEventListener("mousemove", handleGlassMouseMove, {
      passive: true,
    });
    Canvas3.addAnimationToRender("ethBlocksAnimation", {
      onAnimationsRender: true,
      onResize: true,
      onMouseMove: false,
      onScroll: true,
      render: false,
      animationCallback: this.render.bind(this),
    });
  },
  async loadTextureMaskNoise() {
    const loader = new THREE.TextureLoader();
    const texture = await loader.loadAsync(`images/textureMaskNoise3.png`);
    if (texture) {
      this.textureMaskNoise = texture;
    }
  },
  async loadTextures(
    amountOfTextures = NEXT_IMAGE_BATCH_LOAD_AMOUNT,
    delay = 0,
  ) {
    const generation = this._loadGeneration;
    if (!this.textureMaskNoise) {
      await this.loadTextureMaskNoise();
    }
    const imageFileAmount = this.getImageFileAmount();
    const alreadyLoadedTextures = this.imageBgMeshes.length;
    if (alreadyLoadedTextures >= imageFileAmount) return;
    const amountToLoad = amountOfTextures ? amountOfTextures : imageFileAmount;

    const endIndex = amountToLoad + alreadyLoadedTextures;
    const endIndexCapped = Math.min(endIndex, imageFileAmount);
    for (let i = alreadyLoadedTextures; i < endIndexCapped; i++) {
      const imageName = i < 10 ? "0" + i : i;
      try {
        const texture = await this.loadBgTexture(`images/${imageName}.webp`);
        if (generation !== this._loadGeneration) {
          // Page was left while this texture was loading
          texture.dispose();
          return;
        }
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

  animateBlockSizeOnScroll(elNode, index, blockClientRect, isHovered) {
    const currentScrollY = window.scrollY;
    if (
      this._lastScrollY !== currentScrollY ||
      this.firstEnterAniInProgress ||
      this.isAnimating
    ) {
      if (!blockClientRect) blockClientRect = elNode.getBoundingClientRect();
      const blockPositionTop = blockClientRect.top;
      const aniCoef = Math.abs(
        (blockPositionTop - this.blocksBasePosition - LOADING_BLOCK_SIZE) /
          window.innerHeight,
      );

      elNode.style.transform = `scale(${Math.max(1 - aniCoef / 3, 0.8)})`;
      gsap.to(elNode, {
        opacity: isHovered ? 1 : Math.max(0.85 - aniCoef * 3, 0.35),
        duration: 0.3,
      });

      //***************************
      //Set Active Block and trigger imageBG chagne
      //***************************
      if (this.firstEnterAniInProgress) return;
      if (!this.ethBlockEls) return;
      const el = this.ethBlockEls[index] as HTMLElement;
      if (!el) return;
      const blockId = Number(el.dataset.blockId);
      if (Number.isNaN(blockId)) return;
      if (this.loadingBlockId === blockId) return;
      if (this.activeBlockId === blockId) return;
      const blockActivateCoef = Math.abs(
        (blockPositionTop - this.blocksBasePosition) / window.innerHeight,
      );
      if (blockActivateCoef > 0.03) return;
      this.activeBlockId = blockId;
      if (!el.dataset.bgImageId) return;
      const imageId = Number(el.dataset.bgImageId);
      const prevImageId = this.activeImageId;
      this.activeImageId = imageId;
      const transactionsAmount = Number(el.dataset.transactionsAmount);
      this.imageBgChange(prevImageId, imageId, transactionsAmount);
    }
  },

  async createGlassBlockMesh() {
    const vertexShader = Canvas3Options.shaders.playEthBlockGlass.vertexShader;
    const fragmentShader =
      Canvas3Options.shaders.playEthBlockGlass.fragmentShader;

    glassGeometryDense = new THREE.PlaneGeometry(1, 1, 128, 128);
    glassGeometryFlat = new THREE.PlaneGeometry(1, 1, 1, 1);
    const geometry = glassGeometryFlat;

    this.calculateUBlockPositions();
    if (!this._uBlocksPositions) return;

    const meshId = "ethGlassMesh";
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMeshSize: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uViewport: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uBlockCount: {
          value: Math.min(
            this._uBlocksPositions.length,
            BLOCKS_ON_SCREEN_AMOUNT,
          ),
        },
        uBlocks: {
          value: this._uBlocksPositions,
        },
        uSceneTexture: { value: null },
        // Far off-screen until the first mousemove
        uMousePx: { value: new THREE.Vector2(1e5, 1e5) },
        uDevicePixelRatio: { value: window.devicePixelRatio },
        uHoverProgress: { value: 0.0 },
        uUnHoverProgress: { value: 0.0 },
        uHoverBlockIndex: this._uBlockHoveredIndex,
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
    Canvas3.addMaterialForGlobalUniformUpdates(material);
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
        uTextureMaskNoise: { value: this.textureMaskNoise },
        uTransactionsAmount: { value: U_TRANSACTIONS_AMOUNT_NORMALISED },
        uVector: { value: 1 },
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
    const isVisibleVal = id === 0 ? 1 : 0;
    mesh.position.z = isVisibleVal;
    mesh.visible = !!isVisibleVal;

    Canvas3.addMeshToScene(mesh);
    if (!mesh) return null;
    return mesh;
  },

  async imageBgChange(
    prevImageId,
    newImageId,
    transactionsAmount = DEFAULT_TRANSACTIONS_AMOUNT,
  ) {
    const vector = prevImageId < newImageId ? -1 : 1;

    for (let i = 0; i < this.imageBgMeshes.length; i++) {
      const meshToUpdate = this.imageBgMeshes[i];
      if (!meshToUpdate) continue;
      const isVisibleVal = newImageId === i ? 1 : 0;
      meshToUpdate.position.z = isVisibleVal;
      meshToUpdate.visible = !!isVisibleVal;
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
    if (!material.uniforms.uTransactionsAmount) return;
    material.uniforms.uTransactionsAmount.value = Math.min(
      Math.max(transactionsAmount / DEFAULT_MAX_TRANSACTIONS_AMOUNT, 0),
      1,
    );

    if (!material.uniforms.uVector) return;
    material.uniforms.uVector.value = vector;

    if (!material.uniforms.uTransitionProgress) return;

    const coef = Canvas3.getScrollSpeed() ?? 0;
    const imageChangeDuration = (
      1.25 - Math.max(coef, DEFAULT_IMAGE_CHANGE_DURATION)
    ).toFixed(2);

    const aniId = `imageChange_${newImageId}`;
    gsap.fromTo(
      material.uniforms.uTransitionProgress,
      { value: 0 },
      {
        value: 1,
        duration: imageChangeDuration,
        onStart: () => {
          Canvas3.setAnimationToRender(ETH_ANI_CALLBACK_NAME, true, aniId);
        },
        onComplete: () => {
          setTimeout(
            () => {
              Canvas3.setAnimationToRender(ETH_ANI_CALLBACK_NAME, false, aniId);
            },
            Number(imageChangeDuration) * 1000,
          );
        },
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

    const canvasBounds = this._cachedCanvasBounds;
    if (!canvasBounds) return this._uBlocksPositions;

    this._uBlockHoveredIndex.value = -1;

    let activeIndex = 0;
    for (let i = 0; i < this.ethBlockEls.length; i++) {
      const el = this.ethBlockEls[i] as HTMLElement;

      const blockIdAttr = el.dataset.blockId;
      const blockId = blockIdAttr ? Number(blockIdAttr) : NaN;

      const inViewport =
        !Number.isNaN(blockId) && this._visibleBlockIds.has(blockId);
      const isAnimating = el.classList.contains("animating");
      const isLoadingBlock = el.classList.contains("block-loading");

      if ((inViewport || isAnimating) && !isLoadingBlock) {
        const clientBounds = el.getBoundingClientRect();
        let isHovered = false;
        if (activeIndex < BLOCKS_ON_SCREEN_AMOUNT) {
          const uBlockPosition = this._uBlocksPositions[activeIndex];
          if (uBlockPosition) {
            this.updateVec4FromClientRect(
              uBlockPosition,
              clientBounds,
              canvasBounds,
            );
            if (blockId === this.hoveredBlockId) {
              isHovered = true;
              this._uBlockHoveredIndex.value = activeIndex;
            }
            activeIndex++;
          }
        }
        this.animateBlockSizeOnScroll(el, i, clientBounds, isHovered);
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
    this.applyPixelRatioCap();
    if (this.glassMesh) {
      this.glassMesh.scale.set(window.innerWidth, window.innerHeight, 1);
      this.glassMesh.position.x = 0;
      this.glassMesh.position.y = 0;

      const mat = this.glassMesh.material as THREE.ShaderMaterial;
      mat.uniforms.uMeshSize?.value.set(window.innerWidth, window.innerHeight);
      mat.uniforms.uViewport?.value.set(window.innerWidth, window.innerHeight);
    }

    if (this.sceneRT) {
      const [w, h] = getSceneRTSize(this._renderer);
      this._cachedCanvasBounds =
        this._renderer?.domElement.getBoundingClientRect() ?? null;
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
    this.calculateUBlockPositions();
    if (this._renderer && this._scene && this._camera) {
      // Render the scene WITHOUT the glass mesh into the (half-res) render
      // target the glass shader samples. The on-screen frame, glass included,
      // is drawn right after this callback by Canvas3's own composer.render().
      this.glassMesh.visible = false;
      this._renderer.setRenderTarget(this.sceneRT);
      this._renderer.clear();
      this._renderer.render(this._scene, this._camera);
      this._renderer.setRenderTarget(null);
      this.glassMesh.visible = true;
    }
  },
  // The hover wave displaces vertices, so it needs a dense plane - but only
  // while the 0.3s hover sweep runs. The rest of the time a single quad does.
  setGlassGeometryDense(dense) {
    if (!this.glassMesh || !glassGeometryDense || !glassGeometryFlat) return;
    this.glassMesh.geometry = dense ? glassGeometryDense : glassGeometryFlat;
  },
};
