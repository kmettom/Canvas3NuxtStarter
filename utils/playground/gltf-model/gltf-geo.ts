import {
  baseColor,
  baseEnvIntensity,
  baseLightPositionLeft,
  baseLightPositionRight,
  blueColor,
  redColor,
} from "./gltf-constants";

export const gltfPositioningGeo = {
  keyframes: [
    {
      id: "1_start_to_right",
      start: 0,
      end: 0.1,
      from: {
        position: { x: 0.45, y: 0.05, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1.2, y: 1.2, z: 1.2 },
      },
      to: {
        position: { x: 0, y: 0.1, z: 0 },
        rotation: { x: Math.PI, y: Math.PI, z: 0 },
        scale: { x: 2.5, y: 2.5, z: 2.5 },
      },
    },
    {
      id: "2_to_middle",
      start: 0.1,
      end: 0.2,
      from: {
        position: { x: 0, y: 0.1, z: 0 },
        rotation: { x: Math.PI, y: Math.PI, z: 0 },
        scale: { x: 2.5, y: 2.5, z: 2.5 },
      },
      to: {
        position: { x: -0.35, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI },
        scale: { x: 1, y: 1, z: 1 },
      },
    },
    {
      id: "3_to_left",
      start: 0.2,
      end: 0.4,
      from: {
        position: { x: -0.35, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI },
        scale: { x: 1, y: 1, z: 1 },
        zIndex: 2,
      },
      to: {
        position: { x: 0.55, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI * 2 },
        scale: { x: 0.3, y: 0.3, z: 0.3 },
        zIndex: 2,
      },
    },
    {
      id: "3_to_left",
      start: 0.4,
      end: 0.7,
      from: {
        position: { x: 0.55, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI * 2 },
        scale: { x: 0.3, y: 0.3, z: 0.3 },
        zIndex: 2,
      },
      to: {
        position: { x: 0.55, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI * 2 },
        scale: { x: 0.3, y: 0.3, z: 0.3 },
        zIndex: 0,
      },
    },
    {
      id: "4_scale_up_right",
      start: 0.7,
      end: 0.8,
      from: {
        position: { x: -0.55, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI },
        scale: { x: 0.3, y: 0.3, z: 0.3 },
        lights: {
          geoKey: {
            intensity: 1,
            position: baseLightPositionLeft,
            color: blueColor,
          },
        },
        zIndex: 0,
      },
      to: {
        position: { x: 0.25, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 2, y: 2, z: 2 },
        lights: {
          geoKey: {
            intensity: 1,
            position: baseLightPositionLeft,
            color: redColor,
          },
        },
        zIndex: 0,
      },
    },
    {
      id: "5_transform",
      start: 0.8,
      end: 0.9,
      from: {
        position: { x: 0.25, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 2, y: 2, z: 2 },
        lights: {
          geoKey: { color: redColor },
          geoKey2: {
            intensity: 0,
            position: baseLightPositionRight,
            color: blueColor,
          },
        },
      },
      to: {
        position: { x: 0.25, y: 0, z: 0 },
        rotation: { x: Math.PI / 8, y: Math.PI / 12, z: Math.PI / 2 },
        scale: { x: 1, y: 1, z: 1 },
        lights: {
          geoKey: {
            color: redColor,
            intensity: 2,
            position: { x: -1, y: 1, z: 0 },
          },
          geoKey2: {
            intensity: 1,
            position: baseLightPositionLeft,
            color: blueColor,
          },
        },
      },
    },
    {
      id: "6_transform_final",
      start: 0.9,
      end: 1,
      from: {
        position: { x: 0.25, y: 0, z: 0 },
        rotation: { x: Math.PI / 8, y: Math.PI / 12, z: Math.PI / 2 },
        scale: { x: 1, y: 1, z: 1 },
        lights: {
          geoKey: { color: redColor },
          geoKey2: {
            intensity: 1,
            position: baseLightPositionLeft,
            color: blueColor,
          },
        },
      },
      to: {
        position: { x: 0.35, y: 0.05, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.7, y: 0.7, z: 0.7 },
        lights: {
          geoKey: { color: redColor },
          geoKey2: {
            intensity: 1,
            position: baseLightPositionLeft,
            color: blueColor,
          },
        },
      },
    },
  ],
  mouseParallax: {
    x: 0.025,
    y: 0.025,
    z: -0.5,
  },
};

export const gltfAppearGeo = {
  duration: 1200,
  delay: 300,
  ease: "back.out(2)",
  from: {
    position: { x: 0.55, y: 0.05, z: 0 },
    rotation: { x: -Math.PI, y: -Math.PI, z: 0 },
    scale: { x: 0, y: 0, z: 0 },
  },
  to: {
    position: { x: 0.45, y: 0.05, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1.2, y: 1.2, z: 1.2 },
  },
};

export const gltfLightingGeo = {
  environment: "room",
  environmentIntensity: baseEnvIntensity,
  toneMapping: "aces",
  exposure: 1,
  defaultLights: false,
  lights: [
    {
      id: "geoKey",
      type: "directional",
      color: baseColor,
      intensity: 1,
      position: baseLightPositionLeft,
    },
    {
      id: "geoKey2",
      type: "directional",
      color: redColor,
      intensity: 0,
      position: baseLightPositionRight,
    },
  ],
};
