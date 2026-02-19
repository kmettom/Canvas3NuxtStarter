<template>
  <div class="">
    <Container>
      <h2 class="heading-2">
        <span v-action-on-scroll="{ activeRange: 0.9, activateOnce: true }">
          <!--          <Canvas3Text :theme="'light'"> EXAMPLES </Canvas3Text>-->
          EXAMPLES
        </span>
      </h2>
      <div>
        <div class="examples-row">
          <div class="example-wrapper">
            <h3 class="body-l heading-example">Add images to scene 😌</h3>
            <img
              v-canvas3-image="{
                shaderName: 'example1',
              }"
              :src="'/images/01.jpg'"
              alt="building"
            />
            <CodeSnippet>
              <span> {{ String("<") }}</span
              >Canvas3Image <br />
              &nbsp;&nbsp;:src-link="'images/01.JPG'" <br />
              &nbsp;&nbsp;:shader="'example1'" <br />
              &nbsp;&nbsp;:load-strategy="'eager'"<br />
              />
            </CodeSnippet>
          </div>

          <div
            v-set-data-attributes="{
              cursorsize: 55,
              cursoropacity: 0.9,
            }"
            class="example-wrapper"
            @mouseenter="example1Hover = true"
            @mouseleave="example1Hover = false"
          >
            <h3 class="body-l heading-example">
              Add shader uniforms
              <span class="">(hover: {{ example1Hover ? "👍" : "👎" }})</span>
            </h3>
            <img
              v-canvas3-image="{
                uniforms: {
                  uHover: { value: example1Hover ? 1 : 0, duration: 0 },
                },
                shaderName: 'example2',
              }"
              :src="'/images/02.jpg'"
              alt="building"
            />
            <CodeSnippet>
              <span> {{ String("<") }}</span
              >Canvas3Image <br />
              &nbsp;&nbsp;:src-link="'images/02.JPG'"<br />
              &nbsp;&nbsp;:shader="'example2'"<br />
              &nbsp;&nbsp;:uniforms="{<br />
              &nbsp;&nbsp;&nbsp;&nbsp;uHover: {<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;value: example1Hover ? 1 :
              0,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;duration: 0<br />
              &nbsp;&nbsp;&nbsp;&nbsp;}<br />
              &nbsp;&nbsp;}"<br />
              />
            </CodeSnippet>
          </div>
        </div>
        <div class="example-row-second">
          <h3 class="body-l heading-example">
            Directive for scroll manipulation and feedback
          </h3>
          <p class="example-txt">
            Use directive for scroll manipulation and feedback. All Canvas3Image
            or Canvas3Text get activated automatically by uAniIn uniform float
            variable
          </p>
          <div class="examples-row">
            <div
              v-action-on-scroll="{
                activeRange: 0.9,
                activateOnce: false,
                onScrollCallback: (
                  item: ScrollActionBinding,
                  speed: number,
                ) => {
                  example3ScrollCallback(item, speed);
                },
              }"
              class="example-wrapper"
            >
              <div class="code-example-wrapper">
                <p class="example-txt">
                  Scroll speed: {{ example3Speed }}
                  <span class="scroll-speed-ani" />
                </p>
                <img
                  v-canvas3-image="{
                    uniforms: {
                      uScrollSpeed: { value: example3Speed, duration: 0 },
                    },
                    shaderName: 'example3',
                  }"
                  :src="'/images/03.jpg'"
                  alt="sky"
                />
                <CodeSnippet>
                  v-action-on-scroll="{ <br />
                  &nbsp;&nbsp;activeRange: 0.9,<br />
                  &nbsp;&nbsp;activateOnce: false,<br />
                  &nbsp;&nbsp;onScrollCallback: (item, speed) => {
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;// do something on scroll<br />
                  }"
                </CodeSnippet>
              </div>
            </div>
            <div
              v-action-on-scroll="{
                activeRange: 0.7,
                activateOnce: false,
                scrollSpeedSetTo: { value: 0.3 },
                bidirectionalActivation: true,
                activateCallback: (item: ScrollActionBinding) => {
                  const el = item.elNode.querySelector('.example-activate-txt');
                  const tl = gsap.timeline();
                  tl.to(el, { x: -10, opacity: 1, duration: 0.5 });
                  tl.to(el, { x: 0, opacity: 0, duration: 0.5 });
                },
              }"
              class="example-4 example-wrapper"
            >
              <p class="example-txt">
                Set Scroll speed of elements
                <span class="example-activate-txt">Activated 👋</span>
              </p>
              <img
                v-canvas3-image="{
                  loadStrategy: 'eager',
                  shaderName: 'example4',
                  activateMeshUniforms: {
                    uAniInExample4: { duration: 1 },
                  },
                }"
                :src="'/images/04.jpg'"
                alt="sky"
              />
              <CodeSnippet>
                v-action-on-scroll="{ <br />
                &nbsp;&nbsp;activeRange: 0.7,<br />
                &nbsp;&nbsp;scrollSpeedSetTo: { value: 0.3 },<br />
                &nbsp;&nbsp;bidirectionalActivation: true,<br />
                &nbsp;&nbsp;activateOnce: false,<br />
                &nbsp;&nbsp;activateCallback: (item, speed) => {
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;// do something when activated<br />
                }"
              </CodeSnippet>
            </div>
            <div
              id="fixedParent"
              v-action-on-scroll="{
                activeRange: 0.9,
                fixToParentId: 'fixedParent',
              }"
              class="fixed-scroll-example example-wrapper"
            >
              <div>
                <p class="example-txt">Fix element to Parent</p>
                <img
                  v-canvas3-image="{
                    loadStrategy: 'eager',
                    uHover: { value: example2Hover ? 1 : 0, duration: 0.55 },
                  }"
                  :src="'/images/01.jpg'"
                  alt="building"
                />
                <CodeSnippet>
                  v-action-on-scroll="{<br />
                  &nbsp;&nbsp;activeRange: 0.9,<br />
                  &nbsp;&nbsp;fixToParentId: 'fixedParent',<br />
                  }"
                </CodeSnippet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup lang="ts">
import Container from "~/components/common/Container.vue";
import CodeSnippet from "~/components/common/CodeSnippet.vue";
import gsap from "gsap";

//TODO: proper type import export
import type { ScrollActionBinding } from "../../../canvas3-nuxt/dist/runtime/types/types";

const example1Hover = ref(false);
const example3Speed = ref(0);
const example2Hover = ref(false);

const example3ScrollCallback = (item: ScrollActionBinding, speed: number) => {
  example3Speed.value = speed;
  gsap.to(item.elNode.querySelector(".scroll-speed-ani"), {
    width: `${speed * 100}%`,
    duration: 0.1,
  });
};
</script>

<style lang="scss" scoped>
.heading-2 {
  padding-top: 50px;
  padding-bottom: 20px;
}

.heading-example {
  padding-bottom: 10px;
}

.examples-row {
  display: flex;
  padding: 20px 0;
}

.example-row-second {
  padding-top: 75px;
}

.example-wrapper {
  width: 50%;
  padding: 0 15px;
}

.example-txt {
  padding: 10px 0;
  position: relative;
}

.fixed-scroll-example {
  margin-right: 10px;
  border-right: 1px solid var(--light-color);
  height: 1000px;
  margin-bottom: 100px;
}

.scroll-speed-ani {
  position: absolute;
  bottom: 2px;
  left: 0;
  border-bottom: 5px solid var(--light-color);
}

.example-activate-txt {
  //color: var(--light-color);
  opacity: 0;
  position: absolute;
  font-weight: bold;
  bottom: 10px;
  right: 0;
}
</style>
