import pluginVue from 'eslint-plugin-vue'
import vueStandard from '@vue/eslint-config-standard'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**'
    ]
  },
  ...pluginVue.configs['flat/strongly-recommended'],
  ...vueStandard,
  {
    files: ['src/**/*.{js,vue}'],
    rules: {
      'generator-star-spacing': 'off',
      'no-mixed-operators': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/html-self-closing': 'off',
      'vue/component-name-in-template-casing': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/no-unused-components': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/no-use-v-if-with-v-for': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/no-parsing-error': 'off',
      'no-console': 'off',
      'no-tabs': 'off',
      indent: ['warn', 4]
    }
  }
]
