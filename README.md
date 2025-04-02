# Nuxt 3 ThreeJS Startpack

This is a starter template for Nuxt 3 with ThreeJS. It includes:

- Smooth scroll
- One RequestAnimation Frame call Renders both smooth scroll and Canvas
- CanvasImage component
  - adds the loaded image to Scene's Mesh
  - applies the defined shaders
  - hover and appear variables for shaders implemented
- CanvasText component
  - adds text to Scene's Mesh as MSDF font
  - applies the defined shaders
  - hover and appear variables for shaders are implemented
- Scroll Speed directive
  - adjusts the scroll speed of element
  - automatically handles scroll difference for Scene's Mesh objects added through CanvasImage component
- Scroll Active Directive
  - adds active class to element when it is in viewport
  - automatically includes appear animation for a Mesh object added through CanvasImage component

Working example: https://nuxt-three-js-starter-pack.vercel.app

Upcoming features

- Responsiveness management - easily turn on/off canvas animations depending on screen size
- side scroll sections

## Setup

Install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

## Features

### Canvas.js Utility

- Activates SmoothScroll
- Initiates a single requestAnimationFrame call
- Renders both SmoothScroll and Canvas
- Initiates Scene and adds Images to Scene's Mesh
- Predefined shaders are defined in this file

```bash
const CanvasOptions = {
    default: {
        fragmentShader: defaultFragment,
        vertexShader: defaultVertex,
    },
    scroll: {
        fragmentShader: scrollFragment,
        vertexShader: scrollVertex,
    },
    example1: {
        fragmentShader: example1Fragment,
        vertexShader: example1Vertex,
    },
    example2: {
        fragmentShader: example2Fragment,
        vertexShader: example2Vertex,
    },
};
```

### CanvasImage component

- adds the loaded image to Scene's Mesh
- applies the defined shaders
- hover and appear animation are implemented

Usage:

```bash
<CanvasImage :imageHover="<Boolean>" :meshId="<UniqueString>" :shader="<String>" :srcLink="<String>" />
```

Props:

- :imageHover - Boolean value used for hover effect on the mesh object triggered from a parent component. If not used,
  the hover effect will apply from hovering on the original <img> element.
- :shader - String value used for assigning a predefined shader effect. Shader effects are defined in Canvas.js file in
  Utils directory.
- :srcLink - String value used for assigning a source link to the image.

Example:

```bash

    <div class="example"
         @mouseover="imageHover=true"
         @mouseleave="imageHover=false"
    >
      <CanvasImage :imageHover="imageHover" :meshId="ex1" :shader="'example1'" :srcLink="'img/example1.jpg'" />
    </div>

    <p>Some text</p>
    <CanvasImage :meshId="ex2" :shader="'example2'" :srcLink="'img/example2.jpg'" />

```

### Scroll Speed directive

- adjusts the scroll speed of element
- automatically handles scroll difference for Scene's Mesh objects added through CanvasImage component
- set fixed element

Example:

```bash
    <div v-scrollSpeed="0" ></div>
    <div v-scrollSpeed="0.1" ></div>
    <div v-scrollSpeed="-0.1" ></div>
```

If value is 0, scroll speed is normal, if the number is positive, the element will move faster upwards, if negative, the
element will move slowly downwards.

For fixed element, the value should be the id of the parent element. The first child element will be fixed.

Example:

```bash
  <div id="parentSection">
    <div v-scrollSpeed="'parentSection'" >
      <div>First child element of v-scrollSpeed will be fixed</div>
    </div>
  </div>
```

### Scroll Active directive - Coming soon

- adds active class to element when it is in viewport
- automatically includes appear animation for a Mesh object added through CanvasImage component

Example:

```bash
    <div v-scrollActive="0.8" ></div>
```

Includes additional options:

- show only once - once the element is active, it will stay active even after it is not visible in the viewport anymore.
- activate from top - the element will be switched to active and non-active only scrolling in/out from top
- Example:

```bash
    <div v-scrollActive:top="0.8" ></div>
    <div v-scrollActive:once="0.8" ></div>
    <div v-scrollActive:once:top="0.8" ></div>
```

Value is the percentage of screen's height that should be in viewport to trigger the active class. Default value is 1,
covering 100% of the screen.

SctollActive elements will ge assigned a 'show-on-scroll' classes and 'active' class when active.

```bash
    .show-on-scroll{
      transition: ease all 0.5s;
      opacity: 0;
      &.active{
        opacity: 1;
      }
    }
```

To trigger a specific call back function when element is activated or set to non-active, set a value to the directive and use this value in the Canvas.js file.

```bash
    <div v-scrollActive:top:examplecallback="0.8" ></div>
```

```bash
onActiveElCallback(_item, _active){
  if(_item.options?.includes('examplecallback')) {
    // do something when _active is true or false
  }
},
```
