<script>
import { h } from 'vue'
import {
  AlignLeftOutlined,
  AlignRightOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BankOutlined,
  BarsOutlined,
  BellOutlined,
  CarOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  CloseCircleOutlined,
  CloudFilled,
  CloudOutlined,
  ClusterOutlined,
  CheckSquareOutlined,
  CloseSquareOutlined,
  DashboardOutlined,
  DeleteOutlined,
  DownCircleOutlined,
  DownOutlined,
  DownloadOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  GoldOutlined,
  HistoryOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  LoadingOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MinusOutlined,
  PaperClipOutlined,
  PayCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  PrinterOutlined,
  ProfileOutlined,
  QuestionCircleOutlined,
  RedoOutlined,
  ReloadOutlined,
  ScheduleOutlined,
  SearchOutlined,
  SettingOutlined,
  SmileOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  UpOutlined,
  UploadOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

const outlinedIcons = {
  'align-left': AlignLeftOutlined,
  'align-right': AlignRightOutlined,
  apartment: ApartmentOutlined,
  appstore: AppstoreOutlined,
  'arrow-left': ArrowLeftOutlined,
  'arrow-right': ArrowRightOutlined,
  bank: BankOutlined,
  bars: BarsOutlined,
  bell: BellOutlined,
  car: CarOutlined,
  'caret-down': CaretDownOutlined,
  'caret-up': CaretUpOutlined,
  check: CheckOutlined,
  'check-circle': CheckCircleOutlined,
  'check-square': CheckSquareOutlined,
  close: CloseOutlined,
  'close-circle': CloseCircleOutlined,
  'close-square': CloseSquareOutlined,
  cloud: CloudOutlined,
  cluster: ClusterOutlined,
  dashboard: DashboardOutlined,
  delete: DeleteOutlined,
  down: DownOutlined,
  'down-circle': DownCircleOutlined,
  download: DownloadOutlined,
  dollar: DollarOutlined,
  'exclamation-circle': ExclamationCircleOutlined,
  filter: FilterOutlined,
  fullscreen: FullscreenOutlined,
  'fullscreen-exit': FullscreenExitOutlined,
  gold: GoldOutlined,
  history: HistoryOutlined,
  import: ImportOutlined,
  'info-circle': InfoCircleOutlined,
  'info-circle-o': InfoCircleOutlined,
  loading: LoadingOutlined,
  lock: LockOutlined,
  logout: LogoutOutlined,
  'menu-fold': MenuFoldOutlined,
  'menu-unfold': MenuUnfoldOutlined,
  minus: MinusOutlined,
  'paper-clip': PaperClipOutlined,
  'pay-circle': PayCircleOutlined,
  plus: PlusOutlined,
  'plus-circle': PlusCircleOutlined,
  printer: PrinterOutlined,
  profile: ProfileOutlined,
  'question-circle': QuestionCircleOutlined,
  redo: RedoOutlined,
  reload: ReloadOutlined,
  schedule: ScheduleOutlined,
  search: SearchOutlined,
  setting: SettingOutlined,
  smile: SmileOutlined,
  tool: ToolOutlined,
  'unordered-list': UnorderedListOutlined,
  up: UpOutlined,
  upload: UploadOutlined,
  user: UserOutlined
}

const filledIcons = {
  cloud: CloudFilled
}

function normalizeType(type) {
  return String(type || '')
    .trim()
    .replace(/-o$/, '')
}

function getIcon(type, theme) {
  const normalizedType = normalizeType(type)
  if (theme === 'filled' && filledIcons[normalizedType]) {
    return filledIcons[normalizedType]
  }
  return outlinedIcons[normalizedType] || QuestionCircleOutlined
}

export default {
  name: 'LegacyIcon',
  inheritAttrs: false,
  props: {
    type: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'outlined'
    },
    spin: {
      type: Boolean,
      default: false
    },
    rotate: {
      type: Number,
      default: undefined
    },
    twoToneColor: {
      type: String,
      default: undefined
    }
  },
  render() {
    const Icon = getIcon(this.type, this.theme)
    return h(Icon, {
      ...this.$attrs,
      spin: this.spin || this.type === 'loading',
      rotate: this.rotate,
      twoToneColor: this.twoToneColor
    })
  }
}
</script>
