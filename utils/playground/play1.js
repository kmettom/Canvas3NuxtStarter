// import * as THREE from 'three';
// import { loadTexture } from '~/utils/canvasHelpers';
// import { Canvas } from '~/utils/canvas';

// export async function addObjectPlay1(
//   imgHtmlEl, // elNode html element
//   meshUniforms,
// ) {
//   const meshId = 'play1Id';
//
//   let vertexShader = Canvas3.options.play1.vertexShader;
//   let fragmentShader = Canvas3.options.play1.fragmentShader;
//
//   let bounds = imgHtmlEl.getBoundingClientRect();
//   let position = {
//     // top: bounds.top,
//     // left: bounds.left
//     top: 0,
//     left: 0,
//   };
//   position.top += Canvas.currentScroll;
//
//   let geometry = new THREE.SphereGeometry(1, 32, 32);
//
//   const texture = await loadTexture('http://localhost:4200/images/ovp.webp');
//   texture.needsUpdate = true;
//
//   let material = new THREE.ShaderMaterial({
//     side: THREE.DoubleSide,
//     uniforms: {
//       uTime: { value: 0 },
//       uImage: { value: texture },
//       uAniInImage: { value: meshUniforms.uAniInImage?.value ?? 0 },
//       uMouse: { value: new THREE.Vector2(0, 0) },
//       uMouseMovement: { value: new THREE.Vector2(0, 0) },
//       uTextureSize: {
//         value: new THREE.Vector2(
//           texture.image.naturalWidth,
//           texture.image.naturalHeight,
//         ),
//       },
//       uMeshSize: { value: new THREE.Vector2(bounds.width, bounds.height) },
//       ...meshUniforms,
//     },
//     fragmentShader: fragmentShader,
//     vertexShader: vertexShader,
//     name: meshId,
//   });
//
//   Canvas.materials.push(material);
//
//   let mesh = new THREE.Mesh(geometry, material);
//   mesh.name = meshId;
//   mesh.scale.set(bounds.width, bounds.height);
//   // mesh.scale.set(window.innerWidth, window.innerHeight);
//   Canvas.scene.add(mesh);
//   const newMesh = {
//     name: meshId,
//     htmlEl: imgHtmlEl,
//     mesh: mesh,
//     top: position.top,
//     left: position.left,
//     width: bounds.width,
//     height: bounds.height,
//   };
//
//   Canvas.imageStore.push(newMesh);
//
//   if (meshUniforms.uAniInImage || imgHtmlEl.dataset.activeScroll === 'true') {
//     Canvas.activateMesh(meshId, true);
//   }
//
//   Canvas.setImageMeshPositions();
//   // Canvas.meshMouseListeners(newMesh, material);
// }
