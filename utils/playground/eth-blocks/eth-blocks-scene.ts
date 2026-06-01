import * as THREE from "three";
import { Canvas3Options } from "~/constants/canvas3-options";
import { gsap } from "gsap";
import { BLOCKS_ON_SCREEN_AMOUNT } from "~/constants/playground/eth-blocks";
import type { EthBlocksAnimation } from "#shared/types/playground/eth-blocks";

export const ethBlocksAnimation: EthBlocksAnimation = {
  imageBgMeshes: [],
  glassMesh: null,
  sceneRT: null,
  ethBlocks: null,
  // ethBlockEls: null,
  loadingBlockId: 0,
  activeBlockId: 0,
  activeImageId: 0,
  blockLoadingTime: 12,
  blocksTopPadding: 0.25,
  blocksBasePosition: 0,
  pendingImageId: 0,
  currentImageId: 0,
  imageAniTimeline: null,
  async init(ethBlocksWrapper: HTMLElement) {
    this.blocksBasePosition = window.innerHeight * this.blocksTopPadding;

    Canvas3.addAnimationToRender("ethBlocksAnimation", this.render.bind(this));

    const loader = new THREE.TextureLoader();

    this.ethBlocks = ethBlocksWrapper.children;

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

    const nextTextures = await Promise.all([
      loader.loadAsync("images/00.webp"),
      loader.loadAsync("images/01.webp"),
      loader.loadAsync("images/02.webp"),
      loader.loadAsync("images/03.webp"),
      loader.loadAsync("images/04.webp"),
      loader.loadAsync("images/05.webp"),
      loader.loadAsync("images/06.webp"),
      loader.loadAsync("images/07.webp"),
      loader.loadAsync("images/08.webp"),
      loader.loadAsync("images/09.webp"),
      loader.loadAsync("images/10.webp"),
      loader.loadAsync("images/11.webp"),
      loader.loadAsync("images/12.webp"),
      loader.loadAsync("images/13.webp"),
      loader.loadAsync("images/14.webp"),
      loader.loadAsync("images/15.webp"),
      loader.loadAsync("images/16.webp"),
      loader.loadAsync("images/17.webp"),
      loader.loadAsync("images/18.webp"),
      loader.loadAsync("images/19.webp"),
      loader.loadAsync("images/20.webp"),
    ]);

    for (let i = 0; i < nextTextures.length; i++) {
      const newTexture = nextTextures[i];
      if (!newTexture) continue;
      const prevTextureIndex = i === 0 ? nextTextures.length - 1 : i - 1;
      const prevTexture = nextTextures[prevTextureIndex];
      if (!prevTexture) continue;
      const mesh = await this.createImageBgMesh(prevTexture, newTexture, i);
      if (mesh) {
        this.imageBgMeshes.push(mesh);
      }
    }

    this.glassMesh = await this.createGlassBlockMesh();
  },
  animateBlockSizeOnScroll(elNode, index) {
    const blockClientRect = elNode.getBoundingClientRect();
    const blockPositionTop = blockClientRect.top;
    const aniCoef = Math.abs(
      (blockPositionTop - this.blocksBasePosition) / window.innerHeight,
    );

    elNode.style.transform = `scale(${Math.max(1 - aniCoef / 3, 0.75)})`;
    elNode.style.opacity = `${Math.max(1 - aniCoef * 3, 0.35)}`;

    if (!this.ethBlocks) return;
    const el = this.ethBlocks[index] as HTMLElement;
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

  async createImageBgMesh(prevTexture, texture, id) {
    if (!this.sceneRT) return null;
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
        uTexturePrevious: { value: prevTexture },
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
    if (!this.ethBlocks) {
      return Array.from(
        { length: BLOCKS_ON_SCREEN_AMOUNT },
        () => new THREE.Vector4(0, 0, 0, 0),
      );
    }

    const positions: THREE.Vector4[] = [];

    for (let i = 0; i < this.ethBlocks.length; i++) {
      if (
        this.ethBlocks[i] &&
        this.ethBlocks[i]?.classList.contains("active")
      ) {
        const clientBounds = this.ethBlocks[i]?.getBoundingClientRect();
        const renderer = Canvas3.getRenderer();
        const canvasBounds = renderer?.domElement.getBoundingClientRect();
        if (clientBounds && canvasBounds)
          positions.push(
            this.getVec4PositionFromClientRect(clientBounds, canvasBounds),
          );
        this.animateBlockSizeOnScroll(this.ethBlocks[i] as HTMLElement, i);
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
// - QA - Shader - uTransitionProgress - Adjust blocks to block amounts shader adjust with transaction amounts in block
// - appear animation with loader, or transition
//            - first load - make lazy with textures / meshes - remove unnesesery dependencies - textures and meshes array
// - update glass size to fit design
// ----------
// - maxAmount of blocks 25, remove the oldest once
//---------
// - QA - Shader - uTransitionProgress
// - ? QA - Scroll magnet to closest block top ?
