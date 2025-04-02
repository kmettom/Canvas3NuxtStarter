<template>
  <div ref="gameContainer" class="contact-section">
    <Container>
      <div class="">
        <div class="contact-line">
          <div class="heading-1">
            <span
              v-onScrollActivate="{ activeRange: 0.99, activateOnce: true }"
            >
              <CanvasText :theme="'dark'"> GET </CanvasText>
              <span
                v-onScrollActivate="{ activeRange: 0.99, activateOnce: true }"
                class="canvas-text-spacing"
              >
                <CanvasText :theme="'dark'"> IN </CanvasText>
              </span>
            </span>
          </div>
          <div
            v-onScrollActivate="{
              activeRange: 0.85,
              activateOnce: true,
              activateCallback: (item) => {
                splitLineAnimation(item.elNode);
              },
            }"
            class="side-list action-list body-m"
          >
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '📞',
                }"
                href="https://calendly.com/tomaskmet/meeting"
                target="_blank"
              >
                <span>📞 Book a call</span>
              </a>
            </div>
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '📮',
                }"
                href="mailto:hello@tomaskmet.com"
                data-email="hello@tomaskmet.com"
              >
                <span>✉️ Send a request</span>
              </a>
            </div>
          </div>
        </div>
        <div class="contact-line align-right">
          <div
            v-onScrollActivate="{
              activeRange: 0.85,
              activateOnce: true,
              activateCallback: (item) => {
                splitLineAnimation(item.elNode);
              },
            }"
            class="side-list social-media-list body-m"
          >
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '📷',
                }"
                href="https://www.instagram.com/kmettom"
                target="_blank"
                >Instagram</a
              >
            </div>
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '𝕏',
                }"
                href="https://x.com/KmetTom"
                target="_blank"
                >X (Twitter)</a
              >
            </div>
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '👀',
                }"
                href="https://www.linkedin.com/in/tomas-kmet/"
                target="_blank"
                >LinkedIn</a
              >
            </div>
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '📮',
                }"
                href="mailto:hello@tomaskmet.com"
                data-email="hello@tomaskmet.com"
                >Email</a
              >
            </div>
          </div>
          <div class="heading-1">
            <span
              v-onScrollActivate="{ activeRange: 0.99, activateOnce: true }"
            >
              <CanvasText :theme="'dark'"> TOUCH </CanvasText>
            </span>
          </div>
        </div>
      </div>
    </Container>
    <div
      ref="gameBall"
      v-set-data-attrs="{
        cursoropacity: 0.7,
        cursorsize: 70,
        cursoricon: game.started ? '' : '🏁',
      }"
      class="basketball-icon-wrapper"
      @click="startGame"
    >
      <img
        class="basketball-icon"
        :src="BasketBallIcon"
        alt="Basket ball icon"
      />
    </div>

    <div class="basketball-game">
      <div ref="gamePad" class="game-pad">
        <div ref="gamePoints" class="game-points">
          {{ game.points }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Container from '~/components/common/Container.vue';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import BasketBallIcon from 'public/images/ball.png';
import { Canvas } from '~/utils/canvas';

import { useDisplayStore } from '~/stores/display';

const displayStore = useDisplayStore();

gsap.registerPlugin(SplitText);

const splitLineAnimation = (item) => {
  const tl = gsap.timeline({ delay: 0.5 });
  const lines = new SplitText(item, {
    type: 'lines',
  }).lines;
  tl.set(item, { opacity: 1 });
  tl.fromTo(
    lines,
    { y: '10px', opacity: 0 },
    {
      duration: 0.3,
      opacity: 1,
      y: '0px',
      stagger: 0.1,
    },
  );
};

// game
const navigationStore = useNavigationStore();

const gamePad = ref('gamePad');
const gameBall = ref('gameBall');
const gamePoints = ref('gamePoints');
const gameContainer = ref('gameContainer');
const gameBaseSpeed = -5;
const gameBallPadding = 75;
const game = ref({
  activated: false,
  started: false,
  points: 0,
  currentSpeed: gameBaseSpeed,
  // difficulty: {
  //   easy: true,
  //   medium: false,
  //   hard: false,
  // },
  ball: {
    position: { y: 0, x: 0 },
    speed: { x: 0, y: 0 },
    elNode: null,
  },
  container: { elNode: null },
});

const startGame = () => {
  game.value.started = true;
  gsap.set(gamePoints.value, { scale: 1 });
  gsap.to(gamePoints.value, { opacity: 1, duration: 0.2, y: 0 });
  game.value.ball.speed.y = game.value.currentSpeed;
  Canvas.animations.footerBallGame = animateBall;
};

const gameStop = () => {
  Canvas.animations.footerBallGame = null;
  game.value.currentSpeed = gameBaseSpeed;
  game.value.ball.speed.y = 0;
  game.value.ball.position = {
    x:
      gamePad.value.getBoundingClientRect().x +
      gamePad.value.clientWidth / 2 -
      gameBall.value.clientWidth / 2,
    y: gameContainer.value.clientHeight - gameBallPadding,
  };
  game.value.started = false;

  const tl = gsap.timeline({
    onComplete: () => {
      game.value.points = 0;
    },
  });

  tl.to(gamePoints.value, { opacity: 0, duration: 0.5, scale: 2 });
  tl.set(gameBall.value, {
    x: game.value.ball.position.x,
    y: game.value.ball.position.y,
  });
  tl.fromTo(gameBall.value, { opacity: 0 }, { opacity: 1, duration: 0.3 });

  tl.fromTo(gameBall.value, { opacity: 0 }, { opacity: 1, duration: 0.2 }, '<');
};

const gameInit = () => {
  if (game.value.activated) return;
  game.value.activated = true;

  gsap.set(gamePad.value, {
    x: gameContainer.value.clientWidth / 2,
  });
  game.value.ball.position = {
    x:
      gamePad.value.getBoundingClientRect().x +
      gamePad.value.clientWidth / 2 -
      gameBall.value.clientWidth / 2,
    y: gameContainer.value.clientHeight - gameBallPadding,
  };
  gsap.set(gameBall.value, {
    opacity: 1,
    y: game.value.ball.position.y,
    x: game.value.ball.position.x,
  });

  window.addEventListener('mousemove', (e) => {
    gsap.to(gamePad.value, {
      x: e.clientX - gamePad.value.clientWidth / 2,
      duration: 0.1,
    });
    if (!game.value.started) {
      game.value.ball.position.x =
        e.clientX - gamePad.value.clientWidth / 2 + gameBall.value.clientWidth;
      gsap.to(gameBall.value, { x: game.value.ball.position.x, duration: 0.1 });
    }
  });
};

function animateBall() {
  game.value.ball.position.x += game.value.ball.speed.x;
  game.value.ball.position.y += game.value.ball.speed.y;

  Canvas.footerGameBall = {
    x:
      (game.value.ball.position.x + gameBall.value.clientWidth / 2) /
      gameContainer.value.clientWidth,
    y:
      (game.value.ball.position.y - gameBall.value.clientHeight / 2) /
      gameContainer.value.clientHeight,
  };

  // Wall collision detection
  if (
    game.value.ball.position.x <= 0 ||
    game.value.ball.position.x >=
      gameContainer.value.clientWidth - gameBall.value.clientWidth
  ) {
    game.value.ball.speed.x *= -1;
  }
  if (game.value.ball.position.y <= 0) {
    game.value.ball.speed.y *= -1;
    if (game.value.points < 50) {
      game.value.ball.speed.x =
        (Math.random() * 2 - 1) * game.value.points * 0.1;
    } else {
      game.value.ball.speed.x = (Math.random() * 2 - 1) * 50 * 0.1;
    }
  }

  // Paddle collision detection
  const paddleRect = gamePad.value.getBoundingClientRect();
  const ballRect = gameBall.value.getBoundingClientRect();
  if (
    ballRect.bottom >= paddleRect.top &&
    ballRect.right >= paddleRect.left &&
    ballRect.left <= paddleRect.right
  ) {
    game.value.ball.speed.y = game.value.currentSpeed;
    // Adjust ball speed based on where it hits the paddle
    const hitPosition =
      ballRect.left +
      ballRect.width / 2 -
      (paddleRect.left + paddleRect.width / 2);
    game.value.ball.speed.x = hitPosition * 0.05;

    game.value.points += 1;
    if (game.value.currentSpeed < 9) {
      game.value.currentSpeed -= 0.03;
      game.value.points += 1;
    }
    if (game.value.currentSpeed < 12) {
      game.value.currentSpeed -= 0.02;
      game.value.points += 1;
    }
    if (game.value.currentSpeed < 15) {
      game.value.currentSpeed -= 0.01;
    }
    if (game.value.currentSpeed > 13) {
      game.value.points += 1;
    }
    gsap.fromTo(
      gamePoints.value,
      { opacity: 0, y: 10 },
      { opacity: 1, duration: 0.15, y: 0 },
    );
  }

  gsap.set(gameBall.value, {
    x: game.value.ball.position.x,
    y: game.value.ball.position.y,
  });

  // Reset ball if it goes below the paddle
  if (
    game.value.ball.position.y >=
    gameContainer.value.clientHeight - gameBall.value.clientHeight + 100
  ) {
    gameStop();
  }
}

watch(
  () => navigationStore.activeNavItem,
  (activeNavItem) => {
    if (
      activeNavItem === 'contact' &&
      !displayStore.isTablet &&
      !displayStore.prefersReducedMotion
    ) {
      gameInit();
    }
  },
);
</script>

<style lang="scss" scoped>
.contact-section {
  position: relative;
  color: var(--dark-color);
  background-color: var(--light-color);
  padding: 17vh 0 7vh;
  @include respond-width($w-xs) {
    padding: 20vh 0 12vh;
  }
}
.canvas-text-spacing {
  padding-left: 20px;
  position: relative;
  display: inline-block;
}

.heading-1 {
  @include respond-width($w-xs) {
    font-size: 100px;
  }
}

.contact-line {
  display: flex;
  justify-content: start;
  padding-left: 20px;
  @include respond-width($w-m-s) {
    justify-content: center;
  }
  @include respond-width($w-xs) {
    padding-left: 0;
  }
  &.align-right {
    padding-right: 20px;
    justify-content: end;
    @include respond-width($w-m-s) {
      justify-content: center;
    }
    @include respond-width($w-xs) {
      padding-right: 0;
    }
  }
}

.side-list {
  display: flex;
  flex-direction: column;
  justify-content: end;
  position: relative;
  bottom: 75px;
  gap: 5px;

  @include respond-width($w-m-s) {
    bottom: 50px;
  }
  @include respond-width($w-xs) {
    bottom: 0;
    display: block;
    padding: 0 10px;
  }
  &.social-media-list div {
    text-align: right;
  }
  a {
    cursor: none;
  }
}

.basketball-game {
  width: 100%;
  height: 25px;
  position: absolute;
  bottom: 0;
  left: 0;
  @include respond-width($w-m-s) {
    display: none;
  }
}

.game-pad {
  width: 150px;
  height: 25px;
  background-color: var(--dark-color);
  position: absolute;
  left: 0;
  bottom: 0;
}

.game-points {
  text-align: center;
  opacity: 0;
  bottom: 35px;
  left: 0;
  right: 0;
  margin: 0 auto;
  position: absolute;
  pointer-events: none;
  font-size: 25px;
  font-weight: bold;
}

.basketball-icon-wrapper {
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
  @include respond-width($w-m-s) {
    display: none;
  }
}
</style>
