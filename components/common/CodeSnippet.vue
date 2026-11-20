<template>
  <div class="code-container" :class="`theme-${theme}`">
    <pre class="code-pre"><code>{{ formatted }}</code></pre>
    <button
      type="button"
      class="code-copy"
      :aria-label="copied ? 'Copied' : 'Copy code'"
      @click="copy"
    >
      {{ copied ? "Copied" : "Copy" }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    code: string;
    tabSize?: number;
    theme?: "light" | "dark";
  }>(),
  { tabSize: 2, theme: "light" },
);

const formatted = computed(() => {
  const lines = props.code
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ".repeat(props.tabSize))
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""));

  while (lines.length && !lines[0]) lines.shift();
  while (lines.length && !lines[lines.length - 1]) lines.pop();

  const indent = Math.min(
    ...lines.filter(Boolean).map((line) => line.match(/^ */)![0].length),
  );

  return lines
    .map((line) => line.slice(Number.isFinite(indent) ? indent : 0))
    .join("\n");
});

const copied = ref(false);
let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

const copy = async () => {
  try {
    await navigator.clipboard.writeText(formatted.value);
    copied.value = true;
    clearTimeout(copiedTimeout);
    copiedTimeout = setTimeout(() => (copied.value = false), 1500);
  } catch {
    // clipboard unavailable (insecure context) – user can still select the text
  }
};

onBeforeUnmount(() => clearTimeout(copiedTimeout));
</script>

<style lang="scss" scoped>
.code-container {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 375px;
  margin: 10px 0;
  border-radius: 8px;
  overflow: hidden;
  color: var(--code-fg);
  background: var(--code-bg);
  border: 1px solid var(--code-border);

  // Light theme: soft off-white surface, dark text
  &.theme-light {
    --code-fg: var(--dark-color);
    --code-bg: color-mix(in srgb, var(--light-color) 92%, var(--dark-color));
    --code-border: color-mix(
      in srgb,
      var(--light-color) 80%,
      var(--dark-color)
    );
  }

  // Dark theme: slightly lifted dark surface, light text
  &.theme-dark {
    --code-fg: var(--light-color);
    --code-bg: color-mix(in srgb, var(--dark-color) 90%, var(--light-color));
    --code-border: color-mix(
      in srgb,
      var(--dark-color) 78%,
      var(--light-color)
    );
  }
}

.code-pre {
  margin: 0;
  padding: 12px 14px;
  overflow-x: auto;
  white-space: pre;
  tab-size: 2;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    monospace;
  font-size: 13px;
  line-height: 1.5;
  user-select: text;
  @include respond-width($w-m-s) {
    font-size: 11px;
  }

  code {
    font: inherit;
  }
}

.code-copy {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 6px;
  font: inherit;
  font-size: 11px;
  color: var(--code-fg);
  background: var(--code-bg);
  border: 1px solid var(--code-border);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  .code-container:hover &,
  &:focus-visible {
    opacity: 1;
  }
}
</style>
