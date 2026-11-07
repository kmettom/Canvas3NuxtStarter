import {
  baseColor,
  baseEnvIntensity,
  baseLightPositionRight,
  blueColor,
  pinkColor,
  redColor,
} from "./gltf-constants";

export const gltfPositioningDavid = {
  keyframes: [
    {
      id: "1_left_to_middle",
      start: 0,
      end: 0.1,
      from: {
        position: { x: -0.45, y: -0.45, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      to: {
        position: { x: 0, y: -0.45, z: 0 },
        rotation: { x: 0, y: -Math.PI, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.5 },
      },
    },
    {
      id: "2_middle_to_right",
      start: 0.1,
      end: 0.2,
      from: {
        position: { x: 0, y: -0.45, z: 0 },
        rotation: { x: 0, y: -Math.PI, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.5 },
      },
      to: {
        position: { x: 0.4, y: -0.45, z: 0 },
        rotation: { x: 0, y: -Math.PI * 2.5, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    },
    {
      id: "3_right_stay_rotate",
      start: 0.2,
      end: 0.4,
      from: {
        position: { x: 0.4, y: -0.45, z: 0 },
        rotation: { x: 0, y: -Math.PI * 2.5, z: 0 },
      },
      to: {
        position: { x: 0.4, y: -0.5, z: 0 },
        rotation: { x: Math.PI / 8, y: -Math.PI * 2, z: 0 },
      },
    },
    {
      id: "4_to_middle_light",
      start: 0.4,
      end: 0.5,
      from: {
        position: { x: 0.4, y: -0.5, z: 0 },
        rotation: { x: Math.PI / 8, y: 0, z: 0 },
        lights: { davidKey: { intensity: 1, color: baseColor } },
      },
      to: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            intensity: 2,
            position: { x: 1, y: 0, z: 0.1 },
            color: pinkColor,
          },
        },
      },
    },
    {
      id: "5_light_mid",
      start: 0.5,
      end: 0.6,
      from: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            position: { x: 1, y: 0, z: 0.1 },
          },
        },
      },
      to: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            position: { x: 0, y: 1, z: 0 },
          },
        },
      },
    },
    {
      id: "6_light_left",
      start: 0.6,
      end: 0.7,
      from: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            intensity: 2,
            position: { x: 0, y: 1, z: 0 },
            color: pinkColor,
          },
        },
      },
      to: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            intensity: 2,
            position: { x: -1, y: 0, z: 0 },
            color: blueColor,
          },
        },
      },
    },
    {
      id: "7_pos_rotate_scale_1",
      start: 0.7,
      end: 0.8,
      from: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            intensity: 2,
            position: { x: -1, y: 0, z: 0 },
            color: blueColor,
          },
          davidKey2: {
            intensity: 0,
            position: { x: 0, y: 0, z: 0 },
            color: redColor,
          },
        },
      },
      to: {
        position: { x: -0.2, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 6, z: 0 },
        lights: {
          davidKey: {
            intensity: 0,
            position: { x: -1, y: 0, z: 0 },
            color: blueColor,
          },
          davidKey2: {
            intensity: 1,
            position: { x: 1, y: 0, z: 0 },
            color: redColor,
          },
        },
      },
    },
    {
      id: "8_transform",
      start: 0.8,
      end: 0.9,
      from: {
        position: { x: -0.2, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 6, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        lights: {
          davidKey: {
            intensity: 0,
            position: { x: -1, y: 1, z: 0 },
            color: blueColor,
          },
          davidKey2: {
            intensity: 1,
            position: { x: 1, y: 0, z: 0 },
          },
        },
      },
      to: {
        position: { x: -0.1, y: -0.35, z: -0.5 },
        rotation: { x: 0, y: 0, z: 0 },
        lights: {
          davidKey: {
            intensity: 1,
            position: baseLightPositionRight,
            color: blueColor,
          },
          davidKey2: {
            intensity: 2,
            position: { x: 1, y: 1, z: 0 },
          },
        },
      },
    },
    {
      id: "9_transform_final",
      start: 0.9,
      end: 1,
      from: {
        position: { x: -0.1, y: -0.35, z: -0.5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        lights: {
          davidKey: {
            intensity: 1,
            position: baseLightPositionRight,
            color: blueColor,
          },
          davidKey2: {
            intensity: 1,
          },
        },
      },
      to: {
        position: { x: -0.35, y: -0.2, z: 0 },
        rotation: { x: 0, y: Math.PI / 3, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.5 },
        lights: {
          davidKey: {
            intensity: 2,
            position: { x: 1, y: 2, z: 0.1 },
            color: baseColor,
          },
          davidKey2: {
            intensity: 0,
          },
        },
      },
    },
  ],
  mouseParallax: {
    x: -0.025,
    y: -0.025,
    z: -0.025,
  },
};

export const gltfAppearDavid = {
  duration: 2000,
  ease: "power3.out",
  from: {
    position: { x: -0.45, y: -0.9, z: 0 },
    rotation: { x: 0, y: -Math.PI, z: 0 },
    scale: { x: 0.4, y: 0.4, z: 0.4 },
    lights: { davidKey: { intensity: 0, position: { x: 0, y: 0, z: 0 } } },
  },
  to: {
    position: { x: -0.45, y: -0.45, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    lights: { davidKey: { intensity: 1, position: baseLightPositionRight } },
  },
};

export const gltfLightingDavid = {
  environment: "room",
  environmentIntensity: baseEnvIntensity,
  toneMapping: "aces",
  exposure: 1,
  defaultLights: false,
  lights: [
    {
      id: "davidKey",
      type: "directional",
      color: baseColor,
      intensity: 0,
      position: { x: 0, y: 0, z: 0 },
    },
    {
      id: "davidKey2",
      type: "directional",
      color: blueColor,
      intensity: 0,
      position: { x: 0, y: 0, z: 0 },
    },
  ],
};
