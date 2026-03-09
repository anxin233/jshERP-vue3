<script setup lang="ts">
/**
 * Dashboard Analysis Page
 * Migrated from Vue 2 views/dashboard/Analysis.vue and IndexChart.vue
 *
 * Phase 1: Simple welcome dashboard with:
 * - Welcome message with user greeting
 * - 4 statistic cards with placeholder data (using el-statistic)
 * - Quick action area
 * - Actual charts will be integrated in phase 3
 */
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { InfoFilled, Goods, ShoppingCart, Money, TrendCharts } from '@element-plus/icons-vue'
import { getAction, postAction } from '@/api/http'
import { getStore } from '@/utils/storage'

const router = useRouter()

// Loading state
const loading = ref(true)

// User info
const username = computed(() => {
  const userInfo = getStore('Login_Userinfo') as any
  return userInfo?.loginName || userInfo?.username || '用户'
})

// Time greeting
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 9) return '早上好'
  if (hour <= 11) return '上午好'
  if (hour <= 13) return '中午好'
  if (hour <= 18) return '下午好'
  return '晚上好'
})

// Statistics data
const statistics = reactive<Record<string, string>>({
  todaySale: '--',
  todayRetailSale: '--',
  todayBuy: '--',
  monthSale: '--',
  monthRetailSale: '--',
  monthBuy: '--',
  yesterdaySale: '--',
  yesterdayRetailSale: '--',
  yesterdayBuy: '--',
  yearSale: '--',
  yearRetailSale: '--',
  yearBuy: '--',
})

// Tenant info
const tenant = reactive({
  type: '',
  expireTime: '',
  userCurrentNum: '',
  userNumLimit: '',
  tenantId: '',
})
const hasExpire = ref(false)
const payFeeUrl = ref('')

// Stat card definitions - 4 main cards for the welcome page
const mainStatCards = [
  { key: 'todaySale', title: '今日销售额', icon: Money, color: '#409EFF' },
  { key: 'todayRetailSale', title: '今日零售额', icon: ShoppingCart, color: '#67C23A' },
  { key: 'todayBuy', title: '今日采购额', icon: Goods, color: '#E6A23C' },
  { key: 'monthSale', title: '本月累计销售', icon: TrendCharts, color: '#F56C6C' },
]

// Full stat card definitions for the detailed grid
const statCards = [
  { key: 'todaySale', title: '今日销售', tooltip: '统计今日销售单据的总金额' },
  { key: 'todayRetailSale', title: '今日零售', tooltip: '统计今日零售单据的总金额' },
  { key: 'todayBuy', title: '今日采购', tooltip: '统计今日采购单据的总金额' },
  { key: 'monthSale', title: '本月累计销售', tooltip: '统计本月销售单据的总金额' },
  { key: 'monthRetailSale', title: '本月累计零售', tooltip: '统计本月零售单据的总金额' },
  { key: 'monthBuy', title: '本月累计采购', tooltip: '统计本月采购单据的总金额' },
  { key: 'yesterdaySale', title: '昨日销售', tooltip: '统计昨日销售单据的总金额' },
  { key: 'yesterdayRetailSale', title: '昨日零售', tooltip: '统计昨日零售单据的总金额' },
  { key: 'yesterdayBuy', title: '昨日采购', tooltip: '统计昨日采购单据的总金额' },
  { key: 'yearSale', title: '今年累计销售', tooltip: '统计今年销售单据的总金额' },
  { key: 'yearRetailSale', title: '今年累计零售', tooltip: '统计今年零售单据的总金额' },
  { key: 'yearBuy', title: '今年累计采购', tooltip: '统计今年采购单据的总金额' },
]

// Quick actions
const quickActions = [
  { title: '销售出库', path: '/bill/sale_out', color: '#409EFF' },
  { title: '采购入库', path: '/bill/buy_in', color: '#67C23A' },
  { title: '零售出库', path: '/bill/retail_out', color: '#E6A23C' },
  { title: '商品管理', path: '/material', color: '#F56C6C' },
]

/**
 * Fetch statistics data
 */
function initInfo() {
  getAction('/depotHead/getBuyAndSaleStatistics')
    .then((res: any) => {
      if (res.code === 200) {
        Object.assign(statistics, res.data)
      }
    })
    .catch(() => {
      // silently fail
    })

  getAction('/platformConfig/getInfoByKey', { platformKey: 'pay_fee_url' })
    .then((res: any) => {
      if (res && res.code === 200) {
        payFeeUrl.value = res.data.platformValue || ''
      }
    })
    .catch(() => {
      // silently fail
    })
}

/**
 * Fetch tenant info
 */
function initWithTenant() {
  getAction('/user/infoWithTenant')
    .then((res: any) => {
      if (res && res.code === 200) {
        Object.assign(tenant, res.data)
        const currentTime = new Date()
        const expireTime = new Date(res.data.expireTime)
        const difftime = expireTime.getTime() - currentTime.getTime()
        if (difftime < 86400000 * 5) {
          hasExpire.value = true
          // Send trial expiry notification for free tenants
          if (res.data.type === '0') {
            getAction('/msg/getMsgCountByType', { type: '试用到期' }).then(
              (msgRes: any) => {
                if (msgRes && msgRes.code === 200 && msgRes.data.count === 0) {
                  postAction('/msg/add', {
                    msgTitle: '试用到期提醒',
                    msgContent:
                      '试用期即将结束，请您及时续费，过期将会影响正常使用！',
                    type: '试用到期',
                    userId: tenant.tenantId,
                  })
                }
              }
            )
          }
        }
      }
    })
    .catch(() => {
      // silently fail
    })
}

/**
 * Navigate to quick action page
 */
function handleQuickAction(path: string) {
  router.push(path)
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 1000)
  initInfo()
  initWithTenant()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- Welcome Section -->
    <el-row :gutter="24" style="margin-bottom: 24px">
      <el-col :span="24">
        <el-card shadow="hover" :body-style="{ padding: '24px 32px' }">
          <div class="welcome-section">
            <div class="welcome-text">
              <h2 class="welcome-title">{{ greeting }}，{{ username }}</h2>
              <p class="welcome-desc">欢迎使用管伊佳ERP管理系统，祝您工作顺利！</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Main Statistics Cards (4 cards with el-statistic) -->
    <el-row :gutter="24" style="margin-bottom: 24px">
      <el-col
        v-for="card in mainStatCards"
        :key="card.key"
        :xs="24"
        :sm="12"
        :md="6"
        style="margin-bottom: 12px"
      >
        <el-card v-loading="loading" shadow="hover" :body-style="{ padding: '20px 24px' }">
          <div class="main-stat-card">
            <div class="main-stat-card-left">
              <div class="main-stat-card-title">{{ card.title }}</div>
              <el-statistic :value="parseFloat(statistics[card.key]) || 0" :precision="2">
                <template #prefix>
                  <span style="font-size: 14px">￥</span>
                </template>
              </el-statistic>
            </div>
            <div class="main-stat-card-icon" :style="{ backgroundColor: card.color + '15' }">
              <el-icon :size="28" :style="{ color: card.color }"><component :is="card.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Quick Actions -->
    <el-row :gutter="24" style="margin-bottom: 24px">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button
              v-for="action in quickActions"
              :key="action.path"
              size="large"
              @click="handleQuickAction(action.path)"
              :style="{ borderColor: action.color, color: action.color }"
            >
              {{ action.title }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Detailed Statistics Cards -->
    <el-row :gutter="24">
      <el-col
        v-for="card in statCards"
        :key="card.key"
        :xs="24"
        :sm="12"
        :md="12"
        :xl="4"
        style="margin-bottom: 12px"
      >
        <el-card v-loading="loading" shadow="hover" :body-style="{ padding: '20px' }">
          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-card-title">{{ card.title }}</span>
              <el-tooltip :content="card.tooltip" placement="top">
                <el-icon class="stat-card-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="stat-card-value">
              {{ statistics[card.key] || '--' }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Chart Placeholders -->
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="12" :xl="8" style="margin-bottom: 12px">
        <el-card v-loading="loading" shadow="hover">
          <template #header>
            <span>销售统计</span>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表将在后续迭代中集成" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :xl="8" style="margin-bottom: 12px">
        <el-card v-loading="loading" shadow="hover">
          <template #header>
            <span>零售统计</span>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表将在后续迭代中集成" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :xl="8" style="margin-bottom: 12px">
        <el-card v-loading="loading" shadow="hover">
          <template #header>
            <span>采购统计</span>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表将在后续迭代中集成" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Footer with tenant info -->
    <el-row :gutter="24">
      <el-col :span="24" style="margin-bottom: 6px">
        <el-card shadow="never" :body-style="{ padding: '12px 20px' }">
          <div class="dashboard-footer">
            <div class="tenant-info">
              <el-tag v-if="tenant.type === '0'" type="primary">
                试用到期：{{ tenant.expireTime }}
              </el-tag>
              <el-tag v-if="tenant.type === '0'" type="primary" class="ml-8">
                试用用户：{{ tenant.userCurrentNum }}/{{ tenant.userNumLimit }}
              </el-tag>
              <el-tag v-if="tenant.type === '1'" type="primary">
                服务到期：{{ tenant.expireTime }}
              </el-tag>
              <el-tag v-if="tenant.type === '1'" type="primary" class="ml-8">
                授权用户：{{ tenant.userCurrentNum }}/{{ tenant.userNumLimit }}
              </el-tag>
              <a
                v-if="hasExpire"
                style="color: red; margin-left: 8px"
                :href="payFeeUrl"
                target="_blank"
              >
                立即续费
              </a>
            </div>
            <div class="copyright-info">
              &copy; 2015-2030 管伊佳ERP V3.6
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  margin: 12px 12px 0;
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .welcome-text {
    .welcome-title {
      font-size: 20px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      margin: 0 0 8px;
    }
    .welcome-desc {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      margin: 0;
    }
  }
}

.main-stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .main-stat-card-left {
    flex: 1;
  }

  .main-stat-card-title {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 8px;
  }

  .main-stat-card-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: 16px;
  }
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-card {
  .stat-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .stat-card-title {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
  }

  .stat-card-icon {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    cursor: pointer;
  }

  .stat-card-value {
    font-size: 24px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
    line-height: 42px;
  }
}

.chart-placeholder {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;

  .tenant-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  .copyright-info {
    color: rgba(0, 0, 0, 0.45);
    font-size: 13px;
  }
}

.ml-8 {
  margin-left: 8px;
}
</style>
