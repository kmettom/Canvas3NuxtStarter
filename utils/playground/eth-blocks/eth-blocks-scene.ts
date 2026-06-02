import * as THREE from "three";
import { Canvas3Options } from "~/constants/canvas3-options";
import { gsap } from "gsap";
import {
  BLOCKS_ON_SCREEN_AMOUNT,
  IMAGE_FILE_AMOUNT,
  INITIAL_BLOCK_AMOUNT,
} from "~/constants/playground/eth-blocks";
import type { EthBlocksAnimation } from "#shared/types/playground/eth-blocks";

export const ethBlocksAnimation: EthBlocksAnimation = {
  imageBgMeshes: [],
  glassMesh: null,
  sceneRT: null,
  ethBlockEls: null,
  loadingBlockId: 0,
  activeBlockId: 0,
  activeImageId: 0,
  blocksTopPadding: 0.25,
  blocksBasePosition: 0,
  pendingImageId: 0,
  currentImageId: 0,
  imageAniTimeline: null,
  firstEnterAniInProgress: true,
  setBlockBasePosition() {
    this.blocksBasePosition = window.innerHeight * this.blocksTopPadding;
  },
  async init(ethBlockEls) {
    if (!ethBlockEls) return;

    this.ethBlockEls = ethBlockEls;

    await this.loadTextures(1);
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

  async loadTextures(amountOfTextures = IMAGE_FILE_AMOUNT, delay = 0) {
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

  animateBlockSizeOnScroll(elNode, index) {
    const blockClientRect = elNode.getBoundingClientRect();
    const blockPositionTop = blockClientRect.top;
    const aniCoef = Math.abs(
      (blockPositionTop - this.blocksBasePosition) / window.innerHeight,
    );

    elNode.style.transform = `scale(${Math.max(1 - aniCoef / 3, 0.75)})`;
    elNode.style.opacity = `${Math.max(1 - aniCoef * 3, 0.35)}`;

    //***************************
    //Set Active Block and trigger inageBG chagne
    //***************************

    // console.log("firstEnterAniInProgress", this.firstEnterAniInProgress);
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
    this.imageBgChange(prevImageId, imageId);
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
        uDevicePixelRatio: { value: window.devicePixelRatio },
        uTime: { value: 0 },
        uAniInImage: { value: 1 },
        uHover: { value: 1 },
        vectorVNoise: { value: new THREE.Vector2(1.5, 1.5) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseMovement: { value: new THREE.Vector2(0, 0) },
        uMeshSize: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTextureSize: {
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
        uBlockColor: {
          value: 0,
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
    const neutralZScale = 1;
    mesh.scale.set(window.innerWidth, window.innerHeight, neutralZScale);
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
        uDevicePixelRatio: { value: window.devicePixelRatio },
        uTime: { value: 0 },
        uTexture: { value: texture },
        uTexturePrevious: { value: null },
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
    const neutralZScale = 1;
    mesh.scale.set(window.innerWidth, window.innerHeight, neutralZScale);
    mesh.position.z = id === 0 ? 1 : 0;

    Canvas3.addMeshToScene(mesh);
    if (!mesh) return null;
    return mesh;
  },

  async imageBgChange(prevImageId, newImageId) {
    const baseAniDuration = 1;
    const imageChangeDuration = (
      baseAniDuration -
      (Canvas3.getScrollSpeed() ?? 1) +
      0.2
    ).toFixed(2);

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

    if (!material.uniforms.uTransitionProgress) return;
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

  calculateUBlockPositions() {
    if (!this.ethBlockEls) {
      return Array.from(
        { length: BLOCKS_ON_SCREEN_AMOUNT },
        () => new THREE.Vector4(0, 0, 0, 0),
      );
    }

    const positions: THREE.Vector4[] = [];

    for (let i = 0; i < this.ethBlockEls.length; i++) {
      if (
        this.ethBlockEls[i] &&
        this.ethBlockEls[i]?.classList.contains("active")
      ) {
        const clientBounds = this.ethBlockEls[i]?.getBoundingClientRect();
        const renderer = Canvas3.getRenderer();
        const canvasBounds = renderer?.domElement.getBoundingClientRect();
        if (clientBounds && canvasBounds)
          positions.push(
            this.getVec4PositionFromClientRect(clientBounds, canvasBounds),
          );
        this.animateBlockSizeOnScroll(this.ethBlockEls[i] as HTMLElement, i);
      }
    }

    while (positions.length < BLOCKS_ON_SCREEN_AMOUNT) {
      positions.push(new THREE.Vector4(0, 0, 0, 0));
    }

    return positions;
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
// - appear animation with loader, or transition
//            - first load - make lazy with textures / meshes - remove unnesesery dependencies - textures and meshes array
// - update glass size to fit design
// - QA - Shader - uTransitionProgress
// - ? QA - Scroll magnet to closest block top ?
// ----------
// - ? maxAmount of blocks 25, remove the oldest once
//---------
