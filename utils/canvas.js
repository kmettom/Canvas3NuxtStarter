import { gsap } from 'gsap';
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

import * as pkg from 'three-msdf-text-utils/build/bundle';

import Scroll from './scroll.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import scrollFragment from './shaders/scrollFragment.glsl';
import scrollVertex from './shaders/scrollVertex.glsl';

import projectBlurFragment from './shaders/projectBlurFragment.glsl';
import projectBlurVertex from './shaders/projectBlurVertex.glsl';

import heroBlurFragment from './shaders/heroBlurFragment.glsl';
import heroBlurVertex from './shaders/heroBlurVertex.glsl';

import TextBlurFragment from './shaders/TextBlurFragment.glsl';
import TextBlurVertex from './shaders/TextBlurVertex.glsl';

import play1Fragment from './shaders/play1Fragment.glsl';
import play1Vertex from './shaders/play1Vertex.glsl';

import {
  generateBindingLogic,
  loadTexture,
  getMSDFFontMeshScales,
  heightPositionCoef,
} from '~/utils/canvasHelpers';

const { MSDFTextGeometry } = pkg;

const CanvasOptions = {
  fonts: {
    PPFormula: {
      fnt: '/font/PPFormula-CondensedBlack.fnt',
      atlas: '/font/PPFormula-CondensedBlack.png',
    },
  },
  scroll: {
    fragmentShader: scrollFragment,
    vertexShader: scrollVertex,
  },
  default: {
    fragmentShader: projectBlurFragment,
    vertexShader: projectBlurVertex,
    textFragment: TextBlurFragment,
    textVertex: TextBlurVertex,
  },
  hero: {
    fragmentShader: heroBlurFragment,
    vertexShader: heroBlurVertex,
  },
  play1: {
    fragmentShader: play1Fragment,
    vertexShader: play1Vertex,
  },
};

const Canvas = {
  scrollInProgress: false,
  animateImageMesh: false,
  canvasContainer: null,
  scrollableContent: null,
  time: 0,
  scene: new THREE.Scene(),
  MSDFTextGeometryAtlas: null,
  MSDFTextGeometryFont: null,
  materials: [],
  imageStore: [],
  textStore: [],
  scroll: null,
  currentScroll: 0,
  options: CanvasOptions,
  animations: {
    cursorCallback: () => {},
  },
  footerGameBall: { x: 0, y: 0 },
  mouse: { x: 0, y: 0, movementX: 0, movementY: 0, xPrev: 0, yPrev: 0 },
  triggerSectionPositions: {},

  initScroll() {
    this.scroll = new Scroll({
      dom: this.scrollableContent,
    });
  },
  setCanvasAndCamera() {
    this.width = this.canvasContainer.offsetWidth;
    this.height = this.canvasContainer.offsetHeight;

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      100,
      2000,
    );
    this.camera.position.z = 600; // 600
    this.camera.fov = 2 * Math.atan(this.height / 2 / 600) * (180 / Math.PI);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.canvasContainer.appendChild(this.renderer.domElement);
  },
  async init(canvasElement, scrollableContent) {
    this.canvasContainer = canvasElement;
    this.scrollableContent = scrollableContent;

    await this.loadFontMSDF();

    this.initScroll();

    this.setCanvasAndCamera();

    this.setSize();
    this.composerPass();

    this.setResizeListener();

    this.render();

    window.addEventListener('mousemove', (event) => {
      this.mouse.x = event.clientX / this.width;
      this.mouse.y = event.clientY / this.height;
      setTimeout(() => {
        this.mouse.movementX = event.clientX / this.width;
        this.mouse.movementY = event.clientY / this.height;
      }, 70);
      if (this.mouse.movementX === 0 && this.mouse.movementY === 0) {
        this.mouse.movementX = this.mouse.x;
        this.mouse.movementY = this.mouse.y;
      }
    });
  },
  async loadFontMSDF() {
    const loadFontAtlas = (path) => {
      return new Promise((resolve) => {
        const loader = new THREE.TextureLoader();
        loader.load(path, resolve);
      });
    };
    const loadFont = (path) => {
      return new Promise((resolve) => {
        const loader = new FontLoader();
        loader.load(path, resolve);
      });
    };
    await Promise.all([
      loadFontAtlas(CanvasOptions.fonts.PPFormula.atlas),
      loadFont(CanvasOptions.fonts.PPFormula.fnt),
    ]).then(([atlas, font]) => {
      this.MSDFTextGeometryAtlas = atlas;
      this.MSDFTextGeometryFont = font;
    });
  },
  setResizeListener() {
    window.addEventListener('resize', () => {
      this.resizeOnChange();
    });
  },
  resizeOnChange() {
    this.setSize();
    this.resizeImageStore();
    this.resizeTextStore();
  },
  resizeImageStore() {
    for (var i = 0; i < this.imageStore.length; i++) {
      let bounds = this.imageStore[i].htmlEl.getBoundingClientRect();
      this.imageStore[i].mesh.scale.set(bounds.width, bounds.height);
      this.imageStore[i].mesh.material.uniforms.uMeshSize.value.set(
        bounds.width,
        bounds.height,
      );
      this.imageStore[i].width = bounds.width;
      this.imageStore[i].height = bounds.height;
    }
    this.setImageMeshPositions();
  },
  resizeTextStore() {
    for (var i = 0; i < this.textStore.length; i++) {
      let bounds = this.textStore[i].htmlEl.getBoundingClientRect();
      const { scaleX, scaleY } = getMSDFFontMeshScales(
        bounds.width,
        this.textStore[i].mesh.geometry._layout._width,
      );
      this.textStore[i].mesh.scale.set(scaleX, scaleY, 1);
      this.textStore[i].width = bounds.width;
      this.textStore[i].height = bounds.height * heightPositionCoef;
    }
    this.setTextMeshPositions();
  },
  setImageMeshPositions() {
    if (this.imageStore.length === 0) return;
    for (var i = 0; i < this.imageStore.length; i++) {
      this.imageStore[i].mesh.position.x =
        this.imageStore[i].htmlEl.getBoundingClientRect().left -
        this.width / 2 +
        this.imageStore[i].width / 2;
      this.imageStore[i].mesh.position.y =
        -this.imageStore[i].htmlEl.getBoundingClientRect().top +
        this.height / 2 -
        this.imageStore[i].height / 2;
    }
  },
  setTextMeshPositions() {
    if (this.textStore.length === 0) return;
    for (var i = 0; i < this.textStore.length; i++) {
      this.textStore[i].mesh.position.x =
        this.textStore[i].htmlEl.getBoundingClientRect().left - this.width / 2;
      this.textStore[i].mesh.position.y =
        -this.textStore[i].htmlEl.getBoundingClientRect().top +
        this.height / 2 -
        this.textStore[i].height / 2;
    }
  },

  meshUniformsUpdate(id, uniforms) {
    const mesh = this.scene.getObjectByName(id);
    if (!mesh) return;
    for (const uniKey in uniforms) {
      if (!mesh.material.uniforms[uniKey])
        mesh.material.uniforms[uniKey] = {
          value: uniforms[uniKey].active ? 1 : 0,
          duration: 0,
        };
      gsap.to(mesh.material.uniforms[uniKey], {
        duration: uniforms[uniKey].duration,
        value: uniforms[uniKey].active ? 1 : 0,
      });
    }
  },
  activateMesh(id, isActive) {
    const mesh = this.scene.getObjectByName(id);
    if (!mesh) {
      console.error('no Mesh found with ID: ' + id);
      return;
    }
    if (mesh.material.uniforms.uAniInImage) {
      gsap.to(mesh.material.uniforms.uAniInImage, {
        duration: 1.0,
        value: isActive ? 1 : 0,
        ease: 'power1.inOut',
      });
    }
    if (mesh.material.uniforms.uAniInText) {
      gsap.to(mesh.material.uniforms.uAniInText, {
        duration: 1.5,
        value: isActive ? 1 : 0,
        ease: 'power2.out',
      });
    }
  },

  onActiveElCallback(item) {
    if (item.options.activateCallback) {
      item.options.activateCallback(item);
    }
  },

  setFixedScrollToElement(elNode, margin = 0) {
    this.scroll.fixScrollTo = { htmlRef: elNode ?? null, margin: margin };
  },

  addOnScrollActivateElement(binding) {
    const newBinding = generateBindingLogic(binding);
    this.scroll.DOM.onScrollActivateElements.push(newBinding);
  },

  updateOnScrollActiveElement(updatedBinding) {
    if (!this.scroll) return;
    for (let [
      index,
      item,
    ] of this.scroll.DOM.onScrollActivateElements.entries()) {
      if (
        item.elNode.dataset.scrollActivateId ===
        updatedBinding.elNode.dataset.scrollActivateId
      ) {
        this.scroll.DOM.onScrollActivateElements[index] =
          generateBindingLogic(updatedBinding);
      }
    }
  },

  removeScrollActiveElement(elNode) {
    if (!elNode || this.scroll.DOM.onScrollActivateElements.length === 0)
      return;
    for (var i = 0; i < this.scroll.DOM.onScrollActivateElements.length; i++) {
      if (
        this.scroll.DOM.onScrollActivateElements[i].elNode.isEqualNode(elNode)
      ) {
        this.scroll.DOM.onScrollActivateElements.splice(i, 1);
        break;
      }
    }
  },

  removeMesh(id) {
    let toRemove = this.scene.getObjectByName(id);
    if (!toRemove) return;
    this.scene.remove(toRemove);
    toRemove.geometry.dispose();
    toRemove.material.dispose();
    toRemove = undefined;

    for (var i = 0; i < this.imageStore.length; i++) {
      if (this.imageStore[i].name === id) {
        this.imageStore.splice(i, 1);
        this.materials.splice(i, 1);
        break;
      }
    }
  },

  addTextAsMSDF(
    shader,
    meshId,
    htmlEl,
    text,
    theme,
    mouseListeners,
    meshUniforms,
  ) {
    let vertexShader = this.options.default.textVertex;
    let fragmentShader = this.options.default.textFragment;

    if (shader) {
      vertexShader = this.options[shader].vertexShader;
      fragmentShader = this.options[shader].fragmentShader;
    }

    let bounds = htmlEl.getBoundingClientRect();
    let position = { top: bounds.top, left: bounds.left };
    position.top += this.currentScroll;

    //*****************************
    // MSDF
    //*****************************

    const geometry = new MSDFTextGeometry({
      text: text.trim(),
      font: this.MSDFTextGeometryFont.data,
    });

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      defines: {
        IS_SMALL: false, //false,
      },
      extensions: {
        derivatives: false, //true,
      },
      uniforms: {
        uDevicePixelRatio: { value: window.devicePixelRatio },
        uColor: {
          value: new THREE.Vector4(
            theme === 'dark' ? 27 / 255 : 191 / 255, // R
            theme === 'dark' ? 24 / 255 : 192 / 255, // G
            theme === 'dark' ? 24 / 255 : 178 / 255, // B
          ),
        },
        uViewport: {
          type: 'v2',
          value: new THREE.Vector2(this.width, this.height),
        },
        // Common
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseMovement: { value: new THREE.Vector2(0, 0) },
        uFooterGameBall: { value: new THREE.Vector2(0, 0) },
        uMap: { value: null },
        // Rendering
        uThreshold: { value: 0.05 },
        uAlphaTest: { value: 0.01 },
        uStrokeOutsetWidth: { value: 0.0 },
        uStrokeInsetWidth: { value: 0.3 }, //0.3
        // new generic
        uTime: { value: 0 },
        uMeshSize: { value: new THREE.Vector2(bounds.width, bounds.height) },
        uAniInText: { value: meshUniforms.uAniInText?.value ?? 0 },
        ...meshUniforms,
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    material.uniforms.uMap.value = this.MSDFTextGeometryAtlas;

    this.materials.push(material);

    let mesh = new THREE.Mesh(geometry, material);
    mesh.name = meshId;
    mesh.renderOrder = 1;

    const { scaleX, scaleY } = getMSDFFontMeshScales(
      bounds.width,
      mesh.geometry._layout._width,
    );

    mesh.scale.set(scaleX, scaleY, 1);

    this.scene.add(mesh);

    const newMesh = {
      name: meshId,
      htmlEl: htmlEl,
      mesh: mesh,
      top: position.top,
      left: position.left,
      width: bounds.width,
      height: bounds.height * heightPositionCoef,
    };

    this.textStore.push(newMesh);

    this.setTextMeshPositions();

    if (htmlEl.dataset.activeScroll === 'true') {
      this.activateMesh(meshId, true);
    }

    if (mouseListeners) this.meshMouseListeners(newMesh, material);
  },
  async addImageAsMesh(
    imgHtmlEl,
    shader,
    meshId,
    mouseListeners,
    meshUniforms,
  ) {
    let vertexShader = this.options.default.vertexShader;
    let fragmentShader = this.options.default.fragmentShader;

    if (shader) {
      vertexShader = this.options[shader].vertexShader;
      fragmentShader = this.options[shader].fragmentShader;
    }

    let bounds = imgHtmlEl.getBoundingClientRect();
    let position = { top: bounds.top, left: bounds.left };
    position.top += this.currentScroll;

    let geometry = new THREE.PlaneGeometry(1, 1);

    const texture = await loadTexture(imgHtmlEl.src);
    texture.needsUpdate = true;

    let material = new THREE.ShaderMaterial({
      uniforms: {
        uDevicePixelRatio: { value: window.devicePixelRatio },
        uTime: { value: 0 },
        uImage: { value: texture },
        vectorVNoise: { value: new THREE.Vector2(1.5, 1.5) }, // 1.5
        uAniInImage: { value: meshUniforms.uAniInImage?.value ?? 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseMovement: { value: new THREE.Vector2(0, 0) },
        uMeshSize: { value: new THREE.Vector2(bounds.width, bounds.height) },
        uTextureSize: {
          value: new THREE.Vector2(
            texture.image.naturalWidth,
            texture.image.naturalHeight,
          ),
        },
        uViewport: {
          type: 'v2',
          value: new THREE.Vector2(this.width, this.height),
        },
        ...meshUniforms,
      },
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      transparent: true,
      name: meshId,
    });

    this.materials.push(material);

    let mesh = new THREE.Mesh(geometry, material);
    mesh.name = meshId;

    mesh.scale.set(bounds.width, bounds.height);

    this.scene.add(mesh);

    const newMesh = {
      name: meshId,
      htmlEl: imgHtmlEl,
      mesh: mesh,
      top: position.top,
      left: position.left,
      width: bounds.width,
      height: bounds.height,
      thumbOutAction: { value: 0 },
    };

    this.imageStore.push(newMesh);

    if (meshUniforms.uAniInImage || imgHtmlEl.dataset.activeScroll === 'true') {
      this.activateMesh(meshId, true);
    }

    this.setImageMeshPositions();
    if (mouseListeners) this.meshMouseListeners(newMesh, material);
  },

  meshMouseListeners(mesh, material) {
    mesh.htmlEl.addEventListener('mouseenter', () => {
      mesh.mesh.renderOrder = 1;
      gsap.to(material.uniforms.hoverState, {
        duration: 0.5,
        value: 1,
      });
    });

    mesh.htmlEl.addEventListener('mouseout', () => {
      mesh.mesh.renderOrder = 0;
      gsap.to(material.uniforms.hoverState, {
        duration: 0.5,
        value: 0,
      });
    });
  },
  composerPass() {
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.myEffect = {
      uniforms: {
        tDiffuse: { value: null },
        scrollSpeed: { value: null },
      },
      vertexShader: this.options.scroll.vertexShader,
      fragmentShader: this.options.scroll.fragmentShader,
    };

    this.customPass = new ShaderPass(this.myEffect);
    this.customPass.renderToScreen = true;

    this.composer.addPass(this.customPass);
  },
  setSize() {
    this.width = this.canvasContainer.offsetWidth;
    this.height = this.canvasContainer.offsetHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.render(this.scene, this.camera); // -> Also needed
  },

  scrollToTop(delay) {
    setTimeout(() => {
      this.scroll.render(0, false);
    }, delay);
  },

  scrollTo(position, delay = 0) {
    setTimeout(() => {
      this.scroll.render(position, true);
    }, delay);
  },

  scrollToElBySelector(elQuerySelector, delay) {
    const element = document.querySelector(elQuerySelector);
    if (!element) return;
    const position = element.offsetTop;
    setTimeout(() => {
      this.scroll.render(position, true);
    }, delay);
  },

  render() {
    // this.animations.footerBallGame();
    // this.animations.cursorCallback();
    this.time += 0.05;

    this.scroll.render();
    this.scrollInProgress =
      this.currentScroll !== this.scroll.scrollToRender ||
      this.animateImageMesh;
    this.currentScroll = this.scroll.scrollToRender;

    //animate on scroll
    if (this.scrollInProgress) {
      this.customPass.uniforms.scrollSpeed.value = this.scroll.speedTarget;
      this.setImageMeshPositions();
      this.setTextMeshPositions();
    }

    if (this.animateImageMesh) {
      this.resizeImageStore();
      this.resizeTextStore();
    }

    //animate on hover
    for (var i = 0; i < this.materials.length; i++) {
      this.materials[i].uniforms.uTime.value = this.time;
      this.materials[i].uniforms.uMouse.value = new THREE.Vector2(
        this.mouse.x,
        this.mouse.y,
      );
      this.materials[i].uniforms.uMouseMovement.value = new THREE.Vector2(
        this.mouse.movementX,
        this.mouse.movementY,
      );
      if (this.materials[i].uniforms.uFooterGameBall) {
        this.materials[i].uniforms.uFooterGameBall.value = new THREE.Vector2(
          this.footerGameBall.x,
          this.footerGameBall.y,
        );
      }
    }

    this.composer.render();

    for (const argumentsKey in this.animations) {
      if (this.animations[argumentsKey]) this.animations[argumentsKey]();
    }

    try {
      requestAnimationFrame(this.render.bind(this));
    } catch (e) {
      console.error(e);
      setImmediate(this.render.bind(this));
    }
  },
};

export { Canvas };
