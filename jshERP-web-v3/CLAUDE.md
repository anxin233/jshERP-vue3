# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

jshERP-web-v3 is a Vue 3 frontend for the jshERP inventory management system, migrated from a Vue 2 + Ant Design Vue codebase. The backend (Spring Boot on port 9999, context path `/jshERP-boot`) is reused as-is.

## Tech Stack

- **Framework**: Vue 3.5 + Vite 7 + TypeScript 5.9
- **UI**: Element Plus 2.13 + @element-plus/icons-vue
- **State**: Pinia 3
- **Router**: Vue Router 4
- **HTTP**: Axios (wrapped in `src/api/http.ts`)
- **Charts**: ECharts 6 + vue-echarts
- **Styles**: SCSS
- **Date**: Day.js
- **Utilities**: @vueuse/core, mitt, crypto-js

## Build & Dev Commands

```bash
# Install dependencies (use cnpm)
cnpm install

# Development server (proxies /jshERP-boot to localhost:9999)
npm run dev

# Production build
npx vite build

# Type check
npx vue-tsc --noEmit
```

## Project Structure

```
src/src/                    # Source root (note: nested src)
├── api/                    # API layer (http.ts has axios instance + interceptors)
│   ├── http.ts             # getAction/postAction/putAction/deleteAction/httpAction
│   ├── auth.ts             # Login/logout/randomImage
│   ├── bill.ts             # Bill API (depotHead/depotItem)
│   ├── material.ts         # Material API
│   ├── financial.ts        # Financial API (accountHead)
│   ├── report.ts           # Report API endpoints
│   ├── system.ts           # System management API
│   └── common.ts           # Upload/download
├── composables/            # Composition API replacements for Vue 2 mixins
│   ├── useList.ts          # JeecgListMixin → generic list CRUD (662 lines)
│   ├── useBillList.ts      # BillListMixin → bill-specific list (1472 lines)
│   ├── useBillModal.ts     # BillModalMixin → bill modal logic (2011 lines)
│   ├── useEditableTable.ts # JEditableTableMixin replacement
│   ├── useFinancialList.ts # Financial list composable
│   └── useFinancialModal.ts # Financial modal composable
├── components/
│   ├── table/ProTable.vue  # Config-style table wrapper (columns array API)
│   ├── table/EditableTable.vue # Editable table with row CRUD
│   ├── layouts/            # TabLayout, BasicLayout, UserLayout, etc.
│   └── page/               # GlobalLayout, GlobalHeader, SideMenu
├── stores/                 # Pinia stores (user, app, permission, tab, enhance)
├── router/                 # Vue Router 4 with dynamic routes (import.meta.glob)
├── views/                  # Page views matching backend menu component paths
│   ├── bill/               # 14 bill types (SaleOut, PurchaseIn, etc.)
│   ├── financial/          # 6 financial pages (MoneyIn, MoneyOut, etc.)
│   ├── material/           # 4 material pages
│   ├── report/             # 14 report pages
│   ├── system/             # 18 system management pages
│   └── dashboard/          # Dashboard with charts
└── utils/                  # Utilities (auth, storage, date, encryption, etc.)
```

## Key Architecture Patterns

### Composable Pattern (Mixin → Composable)
All list pages use `useList()` or its extensions (`useBillList`, `useFinancialList`). Modal pages use corresponding modal composables. This replaces the Vue 2 mixin pattern.

```typescript
// List page pattern
const { loading, dataSource, columns, ... } = useList({
  url: { list: '/user/list', delete: '/user/delete', ... },
  defColumns: [...],
  urlPath: '/system/user',
})

// Bill list extends useList
const { ...billState } = useBillList({
  url: { list: '/depotHead/list', ... },
  prefixNo: 'XSCK',
  queryParam: { type: '出库', subType: '销售' },
  ...
})
```

### API Function Signatures (Preserved from Vue 2)
```typescript
import { getAction, postAction, putAction, deleteAction } from '@/api/http'
```
These signatures are kept identical to the original `manage.js` to minimize migration effort.

### ProTable (Config-style columns)
ProTable wraps el-table with a columns config array (like Ant Design Table), supporting `dataIndex`, `customRender` slots, `ellipsis`, etc. This keeps ~100 list pages compatible with minimal template changes.

### Dynamic Routing
Routes are generated from backend menu data using `import.meta.glob('../views/**/*.vue')`. The `component` field in menu data maps to `@/views/...` paths.

### Storage
Uses `getStore`/`setStore`/`clearStore` from `@/utils/storage.ts` with `pro__` namespace prefix and expiration support.

### Auth
JWT token stored via `getToken`/`setToken` from `@/utils/auth.ts`. Sent as `X-Access-Token` header. 7-day expiry.

## Bill Types and Prefixes

| Prefix | Type | SubType | Description |
|--------|------|---------|-------------|
| XSCK | 出库 | 销售 | 销售出库 |
| XSDD | 其它 | 销售订单 | 销售订单 |
| XSTH | 入库 | 销售退货 | 销售退货 |
| CGRK | 入库 | 采购 | 采购入库 |
| CGDD | 其它 | 采购订单 | 采购订单 |
| CGTH | 出库 | 采购退货 | 采购退货 |
| LSCK | 出库 | 零售 | 零售出库 |
| LSTH | 入库 | 零售退货 | 零售退货 |
| QTRK | 入库 | 其它 | 其它入库 |
| QTCK | 出库 | 其它 | 其它出库 |
| DBCK | 出库 | 调拨 | 调拨出库 |
| ZZD | 其它 | 组装单 | 组装 |
| CXD | 其它 | 拆卸单 | 拆卸 |

## Default Test Credentials

- Tenant: `jsh`
- Username: `admin`
- Password: `123456`
