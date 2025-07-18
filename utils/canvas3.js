// TODO: stop request animation frame, when page not focused

import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

import { gsap } from "gsap";
import * as pkg from "three-msdf-text-utils/build/bundle";
import Canvas3Scroll from "~/utils/canvas3Scroll";
import {
    generateBindingLogic,
    getMSDFFontMeshScales,
    heightPositionCoef,
    loadTexture,
} from "~/utils/canvas3Helpers";

import { useDisplayStore } from "~/stores/display";
import { useNavigationStore } from "~/stores/navigation";

const { MSDFTextGeometry } = pkg;

const canvasInitiated = ref(false);

class Canvas3Class {
  canvasInitiated = canvasInitiated;
  navigationStore = null;
  displayStore = null;
  scrollInProgress = false;
  animateImageMesh = false;
  canvasContainer = null;
  scrollableContent = null;
  time = 0;
  scene = new THREE.Scene();
  MSDFTextGeometryAtlas = null;
  MSDFTextGeometryFont = null;
  materials = [];
  imageStore = [];
  textStore = [];
  activateMeshUniformMap = new Map();
  scroll = null;
  currentScroll = 0;
  // options = CanvasOptions;
  animations = {
    // cursorCallback: () => {},
  };
  footerGameBall = { x: 0, y: 0 };
  mouse = { x: 0, y: 0, movementX: 0, movementY: 0, xPrev: 0, yPrev: 0 };

  // triggerSectionPositions= {};
  // constructor({ canvasOptions }) {
  //   this.options = canvasOptions;
  // }

  async initialize(canvasElement, scrollableContent, canvas3Options) {
    this.options = canvas3Options;
    this.displayStore = useDisplayStore();
    this.navigationStore = useNavigationStore();

    this.scene = new THREE.Scene();

    this.canvasContainer = canvasElement;
    this.scrollableContent = scrollableContent;

    await this.loadFontMSDF();

    this.initScroll();

    this.setCanvasAndCamera();

    this.setSize();
    this.composerPass();

    this.render();

    window.addEventListener("mousemove", (event) => {
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

    this.displayStore.init();
    this.navigationStore.canvasInitiated = true;
    this.canvasInitiated.value = true;
  }

  initScroll() {
    this.scroll = new Canvas3Scroll({
      dom: this.scrollableContent,
      activateMeshCallback: this.activateMesh.bind(this),
    });
  }

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
      // alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.canvasContainer.appendChild(this.renderer.domElement);
  }

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
      loadFontAtlas(this.options.fonts.PPFormula.atlas),
      loadFont(this.options.fonts.PPFormula.fnt),
    ]).then(([atlas, font]) => {
      this.MSDFTextGeometryAtlas = atlas;
      this.MSDFTextGeometryFont = font;
    });
  }

  resizeOnChange() {
    this.setSize();
    this.resizeImageStore();
    this.resizeTextStore();
    this.scroll.resizeMobileBreakEvents();
    this.scroll.setSize();
  }

  resizeImageStore() {
    for (let i = 0; i < this.imageStore.length; i++) {
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
  }

  resizeTextStore() {
    for (let i = 0; i < this.textStore.length; i++) {
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
  }

  setImageMeshPositions() {
    if (this.imageStore.length === 0) return;
    for (let i = 0; i < this.imageStore.length; i++) {
      this.imageStore[i].mesh.position.x =
        this.imageStore[i].htmlEl.getBoundingClientRect().left -
        this.width / 2 +
        this.imageStore[i].width / 2;
      this.imageStore[i].mesh.position.y =
        -this.imageStore[i].htmlEl.getBoundingClientRect().top +
        this.height / 2 -
        this.imageStore[i].height / 2;
    }
  }

  setTextMeshPositions() {
    if (this.textStore.length === 0) return;
    for (let i = 0; i < this.textStore.length; i++) {
      this.textStore[i].mesh.position.x =
        this.textStore[i].htmlEl.getBoundingClientRect().left - this.width / 2;
      this.textStore[i].mesh.position.y =
        -this.textStore[i].htmlEl.getBoundingClientRect().top +
        this.height / 2 -
        this.textStore[i].height / 2;
    }
  }

  meshUniformsUpdate(id, uniforms) {
    const mesh = this.scene.getObjectByName(id);
    if (!mesh) return;
    for (const uniKey in uniforms) {
      if (!mesh.material.uniforms[uniKey])
        mesh.material.uniforms[uniKey] = {
          value: uniforms[uniKey].value,
          duration: 0,
        };
      gsap.to(mesh.material.uniforms[uniKey], {
        duration: uniforms[uniKey].duration,
        value: uniforms[uniKey].value,
        ease: uniforms[uniKey].ease ?? "power1.inOut",
      });
    }
  }

  activateMesh(id, isActive) {
    const mesh = this.scene.getObjectByName(id);
    if (!mesh) {
      console.error("no Mesh found with ID: " + id);
      return;
    }

    if (mesh.material.uniforms.uAniInImage) {
      gsap.to(mesh.material.uniforms.uAniInImage, {
        duration: this.options.activateMeshOptions.image.uAniInImage.duration,
        value: isActive ? 1 : 0,
        ease: this.options.activateMeshOptions.image.uAniInImage.ease,
      });
    }
    if (mesh.material.uniforms.uAniInText) {
      gsap.to(mesh.material.uniforms.uAniInText, {
        duration: this.options.activateMeshOptions.text.uAniInText.duration,
        value: isActive ? 1 : 0,
        ease: this.options.activateMeshOptions.text.uAniInText.ease,
      });
    }

    const activateMeshUniforms = this.activateMeshUniformMap.get(id);

    if (activateMeshUniforms) {
      for (const [key, value] of Object.entries(activateMeshUniforms)) {
        if (mesh.material.uniforms[key]) {
          gsap.to(mesh.material.uniforms[key], {
            duration: value.duration,
            value: isActive ? 1 : 0,
            ease: value.ease ?? "power1.inOut",
          });
        }
      }
    }
  }

  // setFixedScrollToElement(elNode, margin = 0) {
  //   this.scroll.fixScrollTo = { htmlRef: elNode ?? null, margin: margin };
  // }

  addOnScrollActivateElement(binding) {
    const newBinding = generateBindingLogic(binding);
    this.scroll.DOM.onScrollActivateElements.push(newBinding);
  }

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
  }

  removeScrollActiveElement(elNode) {
    if (!elNode || this.scroll.DOM.onScrollActivateElements.length === 0)
      return;
    for (let i = 0; i < this.scroll.DOM.onScrollActivateElements.length; i++) {
      if (
        this.scroll.DOM.onScrollActivateElements[i].elNode.isEqualNode(elNode)
      ) {
        this.scroll.DOM.onScrollActivateElements.splice(i, 1);
        break;
      }
    }
  }

  removeMesh(id) {
    let toRemove = this.scene.getObjectByName(id);
    if (!toRemove) return;
    this.scene.remove(toRemove);
    toRemove.geometry.dispose();
    toRemove.material.dispose();

    for (let i = 0; i < this.imageStore.length; i++) {
      if (this.imageStore[i].name === id) {
        this.imageStore.splice(i, 1);
        this.materials.splice(i, 1);
        break;
      }
    }
  }

  addTextAsMSDF(shaderName, meshId, htmlEl, textContent, theme, meshUniforms) {
    let vertexShader = this.options.shaders.default.textVertex;
    let fragmentShader = this.options.shaders.default.textFragment;

    if (shaderName) {
      vertexShader = this.options.shaders[shaderName].vertexShader;
      fragmentShader = this.options.shaders[shaderName].fragmentShader;
    }

    let bounds = htmlEl.getBoundingClientRect();
    let position = { top: bounds.top, left: bounds.left };
    position.top += this.currentScroll;

    //*****************************
    // MSDF
    //*****************************

    const geometry = new MSDFTextGeometry({
      text: textContent.trim(),
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
          //TODO: colors dynamic from component
          value: new THREE.Vector4(
            theme === "dark" ? 27 / 255 : 191 / 255, // R
            theme === "dark" ? 24 / 255 : 192 / 255, // G
            theme === "dark" ? 24 / 255 : 178 / 255, // B
          ),
        },
        uViewport: {
          type: "v2",
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
        // uAniInText: { value: 1 },
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

    if (htmlEl.dataset.activeScroll === "true") {
      this.activateMesh(meshId, true);
    }
  }

  async addImageAsMesh(
    imgHtmlEl,
    shaderName,
    meshId,
    meshUniforms,
    activateMeshUniforms,
  ) {
    this.activateMeshUniformMap.set(meshId, activateMeshUniforms);

    const geometryT = new THREE.BoxGeometry(1, 1, 1);
    const materialT = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometryT, materialT);
    this.scene.add(cube);

    let vertexShader = this.options.shaders.default.vertexShader;
    let fragmentShader = this.options.shaders.default.fragmentShader;

    if (shaderName) {
      vertexShader = this.options.shaders[shaderName].vertexShader;
      fragmentShader = this.options.shaders[shaderName].fragmentShader;
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
        uAniInImage: { value: 1 },
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
          type: "v2",
          value: new THREE.Vector2(this.width, this.height),
        },
        ...meshUniforms,
        ...activateMeshUniforms,
      },
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      transparent: true,
      name: meshId,
      // wireframe: true,
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

    //TODO: check what was the intended need for this
    // if (meshUniforms.uAniInImage || imgHtmlEl.dataset.activeScroll === "true") {
    //   this.activateMesh(meshId, true);
    // }

    this.setImageMeshPositions();
  }

  composerPass() {
    this.composer = new EffectComposer(this.renderer);
      this.renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(this.renderPass);

      this.myEffect = {
        uniforms: {
          tDiffuse: { value: null },
          scrollSpeed: { value: null },
        },
        vertexShader: this.options.shaders.scroll.vertexShader,
        fragmentShader: this.options.shaders.scroll.fragmentShader,
      };

      this.customPass = new ShaderPass(this.myEffect);
      this.customPass.renderToScreen = true;

      this.composer.addPass(this.customPass);
  }

  setSize() {
    this.width = this.canvasContainer.offsetWidth;
    this.height = this.canvasContainer.offsetHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.render(this.scene, this.camera); // -> Also needed
  }

  scrollToTop(delay) {
    setTimeout(() => {
      this.scroll.render(0, false);
    }, delay);
  }

  scrollTo(position, delay = 0) {
    setTimeout(() => {
      this.scroll.render(position, true);
    }, delay);
  }

  scrollToElBySelector(elQuerySelector, delay) {
    const element = document.querySelector(elQuerySelector);
    if (!element) return;
    const position = element.offsetTop;
    setTimeout(() => {
      this.scroll.render(position, true);
    }, delay);
  }

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
    for (let i = 0; i < this.materials.length; i++) {
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
  }
}

export const Canvas3 = new Canvas3Class();
