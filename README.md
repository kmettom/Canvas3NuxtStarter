# Nuxt 3 ThreeJS Startpack

This is a starter template for Nuxt 3 with ThreeJS. It includes:

- Smooth scroll
- One RequestAnimation Frame call Renders both smooth scroll render, Three.js render and related logic
- CanvasImage component
  - adds the loaded image to Scene's Mesh
  - applies the defined shaders
  - define any uniform and connect it to the business logic
- CanvasText component
  - adds text to Scene's Mesh as MSDF font
  - applies the defined shaders
  - define any uniform and connect it to the business logic
- Scroll Active directive
  - adjusts the scroll speed of element
  - automatically handles scroll difference for Scene's Mesh objects added through CanvasImage component
  - adds active class to element when it is in viewport
  - automatically includes appear animation for a Mesh object added through CanvasImage component

Working example and road map: https://nuxt-three-js-starter-pack.vercel.app

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
- Renders both SmoothScroll and Three.js render
- Initiates Scene and adds Images to Scene's Mesh
- Import and define shaders

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
<CanvasImage :srcLink="<String>" :shader="<String | undefined>"  :uniforms="<{uName: {value:Number , duration: Number}}>"  />
```

Props:

- :shader - String value used for assigning a predefined shader effect. Shader effects are defined in Canvas.js file in
  Utils directory.
- :srcLink - String value used for assigning a source link to the image.
- :uniforms - Object used to pass uniform values to shaders

Example:

```bash
    <div class="example"
         @mouseover="imageHover=true"
         @mouseleave="imageHover=false"
    >
      <CanvasImage :uniforms="{ uHover: {value: imageHover ? 1:0, duration: 0.5 }}" :shader="'example1'" :srcLink="'img/example1.jpg'" />
    </div>
```

### Scroll Activate directive

- adjusts the scroll speed of element
- activate element with several parameters for flexibility
- all child CanvasImage and CanvasText get uAniInImage and uAniInText uniform passed automatically
- automatically handles scroll difference for Scene's Mesh objects added through CanvasImage component
- set fixed element

Options:

```bash
  {
    activeRange: Number, // optional, default 1
    activateOnce: Boolean, // default false
    activateCallback: (item) => void,
    trackOnly: Boolean,
    bidirectionalActivation: Boolean (default: false),
    activeRangeOrigin: Number, //(0-1, 0 from top of screen, 1 bottom of the screen)
    activeRangeMargin: Number, //(in pixels)
    fixToParentId: String (id of parent element),
    onScrollCallback: (item, speed) => void,
    scrollSpeedSetTo: {value: Number, duration: Number}
  }
```

Example:

```bash
    <div v-onScrollActivate="{ activeRange: 0.95, activateOnce: true }" ></div>
```

If value is 0, scroll speed is normal, if the number is positive, the element will move faster upwards, if negative, the
element will move slowly downwards.

For fixed element, the value should be the id of the parent element. The first child element will be fixed.

Example:

```bash
  <div id="parentSectionId">
    <div v-onScrollActivate="{ scrollSpeed: 1, fixToParentId: 'parentSectionId' }" >
      <div>First child element of v-scrollSpeed will be fixed</div>
    </div>
  </div>
```

Additional options:

- activateOnce - once the element is active, it will stay active even after it is not visible in the viewport anymore.
- bidirectionalActivation - the element will be switched to active and non-active scrolling in/out both from top and from bottom
- Examples:

```bash
    <div v-onScrollActivate:once="{activeRange: 0.8, activateOnce: true }" ></div>
    <div v-onScrollActivate:top="{activeRange: 0.8, bidirectionalActivation: true }" ></div>
```

Value is the percentage of screen's height that should be in viewport to trigger the active class. Default value is 1,
covering 100% of the screen.

v-onScrollActivate elements will ge assigned a 'show-on-scroll' classes and 'active' class when active.

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
    <div v-scrollActive"{activeRange: 0.7, activateCallback: (item) => {console.log('item activated -> ' , item)}}" ></div>
```
