import { defineStore } from "pinia";
import * as THREE from "three";

export const useAnimationAssets = defineStore("animationAssets", {
  state: (): {
    textureMaskNoise: null | THREE.Texture;
    textureDefaultBlack: null | THREE.Texture;
    textureDefaultImage: null | THREE.Texture;
  } => ({
    textureMaskNoise: null,
    textureDefaultBlack: null,
    textureDefaultImage: null,
  }),
  actions: {
    async init() {
      const loader = new THREE.TextureLoader();
      const textureMaskNoise = await loader.loadAsync(
        `images/textureMaskNoise.png`,
      );
      if (textureMaskNoise) {
        this.textureMaskNoise = textureMaskNoise;
      }
      const textureImage = await loader.loadAsync(`images/new/10.jpg`);
      if (textureImage) {
        this.textureDefaultImage = textureImage;
      }
      this.textureDefaultBlack = new THREE.Texture();
    },
    getTextureMaskNoise() {
      if (this.textureMaskNoise !== null) {
        return this.textureMaskNoise;
      }
    },
    getTextureDefaultBlack() {
      if (this.textureDefaultBlack !== null) {
        return this.textureDefaultBlack;
      }
    },
    getTextureDefaultImage() {
      if (this.textureDefaultImage !== null) {
        return this.textureDefaultImage;
      }
    },
  },
});
