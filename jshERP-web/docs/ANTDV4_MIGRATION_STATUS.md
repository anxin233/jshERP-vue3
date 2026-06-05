# Ant Design Vue 4 Migration Status

## Current Stack

| Dependency | Version |
| --- | --- |
| vue | 3.5.35 |
| ant-design-vue | 4.2.6 |
| @ant-design/icons-vue | 7.0.1 |
| vite | 8.0.16 |
| @vitejs/plugin-vue | 6.0.7 |

## Current Status

- Runtime uses Vue 3.
- Ant Design Vue has been upgraded to 4.x.
- The build pipeline uses Vite.
- Vue CLI/Webpack build entries have been removed.
- Legacy Vue2 component packages used by this project have been removed or replaced by Vue3-native local implementations.

## Follow-up Verification

- Continue manual regression for bills, finance, reports, upload, print, and editable tables.
- Existing non-Vue infrastructure packages such as `axios`, `codemirror`, `intro.js`, and `js-cookie` should be handled as separate dependency modernization work, not Vue2 ecosystem cleanup.
