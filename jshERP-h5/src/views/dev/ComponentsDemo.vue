<template>
  <div class="demo">
    <van-nav-bar title="公共组件演示（P2）" />

    <van-cell-group
      inset
      title="商品选择"
    >
      <van-field
        label="单据前缀"
        readonly
      >
        <template #input>
          <van-radio-group
            v-model="prefixNo"
            direction="horizontal"
          >
            <van-radio name="LSCK">
              零售 LSCK
            </van-radio>
            <van-radio name="XSCK">
              销售 XSCK
            </van-radio>
            <van-radio name="CGRK">
              采购 CGRK
            </van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-cell
        title="当前仓库"
        :value="depot ? depot.name : '-'"
      />
      <van-cell
        title="选择商品（搜索/扫码）"
        is-link
        @click="goodsVisible = true"
      />
      <van-cell title="已选商品">
        <template #value>
          <span data-result="goods">{{ goods ? goods.name + '|' + goods.unit + '|' + goods.stock + '|' + priceText : '-' }}</span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group
      inset
      title="往来单位"
    >
      <van-cell
        title="选择会员"
        is-link
        data-test="open-member"
        @click="memberVisible = true"
      />
      <van-cell
        title="选择客户"
        is-link
        @click="customerVisible = true"
      />
      <van-cell
        title="选择供应商"
        is-link
        @click="supplierVisible = true"
      />
      <van-cell title="已选往来单位">
        <template #value>
          <span data-result="partner">{{ partnerText }}</span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group
      inset
      title="仓库 / 账户 / 经手人"
    >
      <van-cell
        title="选择仓库"
        is-link
        @click="depotVisible = true"
      />
      <van-cell
        title="选择账户"
        is-link
        @click="accountVisible = true"
      />
      <van-cell
        title="选择经手人（销售员）"
        is-link
        @click="personVisible = true"
      />
      <van-cell title="已选仓库">
        <template #value>
          <span data-result="depot">{{ depot ? depot.name + (depot.isDefault ? '(默认)' : '') : '-' }}</span>
        </template>
      </van-cell>
      <van-cell title="已选账户">
        <template #value>
          <span data-result="account">{{ account ? account.name : '-' }}</span>
        </template>
      </van-cell>
      <van-cell title="已选经手人">
        <template #value>
          <span data-result="person">{{ person ? person.text : '-' }}</span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group
      inset
      title="扫码输入（独立）"
    >
      <ScanInput @scan="onScan" />
      <van-cell title="最近扫码">
        <template #value>
          <span data-result="scan">{{ lastScan || '-' }}</span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group
      inset
      title="单据状态标签"
    >
      <van-cell title="未审核">
        <template #value>
          <BillStatusTag status="0" />
        </template>
      </van-cell>
      <van-cell title="已审核">
        <template #value>
          <BillStatusTag status="1" />
        </template>
      </van-cell>
    </van-cell-group>

    <GoodsPicker
      v-model:show="goodsVisible"
      :prefix-no="prefixNo"
      :depot-id="depot ? depot.id : ''"
      @select="onGoodsSelect"
    />
    <MemberPicker
      v-model:show="memberVisible"
      type="member"
      @select="onPartnerSelect"
    />
    <MemberPicker
      v-model:show="customerVisible"
      type="customer"
      @select="onPartnerSelect"
    />
    <MemberPicker
      v-model:show="supplierVisible"
      type="supplier"
      @select="onPartnerSelect"
    />
    <DepotPicker
      v-model:show="depotVisible"
      @select="depot = $event"
    />
    <AccountPicker
      v-model:show="accountVisible"
      @select="account = $event"
    />
    <PersonPicker
      v-model:show="personVisible"
      :type="1"
      @select="person = $event"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { findDepotByCurrentUser } from '@/api/depot'
import AccountPicker from '@/components/AccountPicker.vue'
import BillStatusTag from '@/components/BillStatusTag.vue'
import DepotPicker from '@/components/DepotPicker.vue'
import GoodsPicker from '@/components/GoodsPicker.vue'
import MemberPicker from '@/components/MemberPicker.vue'
import PersonPicker from '@/components/PersonPicker.vue'
import ScanInput from '@/components/ScanInput.vue'

const prefixNo = ref('LSCK')
const depot = ref(null)
const goods = ref(null)
const partner = ref(null)
const account = ref(null)
const person = ref(null)
const lastScan = ref('')

const goodsVisible = ref(false)
const memberVisible = ref(false)
const customerVisible = ref(false)
const supplierVisible = ref(false)
const depotVisible = ref(false)
const accountVisible = ref(false)
const personVisible = ref(false)

const partnerText = computed(() => {
  if (!partner.value) return '-'
  const balance = partner.value.advanceIn != null ? `|预付${partner.value.advanceIn}` : ''
  return partner.value.name + balance
})

const priceText = computed(() => {
  const val = goods.value && goods.value.unitPrice
  return val == null ? '-' : Number(val).toFixed(2)
})

function onGoodsSelect (item) {
  goods.value = item
}

function onPartnerSelect (item) {
  partner.value = item
}

function onScan (code) {
  lastScan.value = code
}

onMounted(async () => {
  const res = await findDepotByCurrentUser()
  if (res && res.code === 200 && Array.isArray(res.data) && res.data.length) {
    const def = res.data.find(d => d.isDefault) || res.data[0]
    depot.value = { id: def.id, name: def.depotName, isDefault: !!def.isDefault }
  }
})
</script>

<style lang="less" scoped>
.demo {
  min-height: 100%;
  padding-bottom: 24px;
  background: var(--jsh-page-bg, #f7f8fa);
}
</style>
