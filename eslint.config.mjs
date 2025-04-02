// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  settings: {
    // 'no-warn-ignored': true,
  },
  rules: {
    'vue/no-v-html': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/html-self-closing': [
      'warn',
      {
        html: {
          void: 'any',
        },
      },
    ],
  },
});
