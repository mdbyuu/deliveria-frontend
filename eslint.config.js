import vue from 'eslint-plugin-vue'
import globals from 'globals'
export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'vue/multi-word-component-names': 'off',
    },
  },
]
