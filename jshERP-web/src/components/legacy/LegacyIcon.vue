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
  DeleteOutlined,
  DownCircleOutlined,
  DownOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FullscreenOutlined,
  GoldOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  LoadingOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PaperClipOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
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
  close: CloseOutlined,
  'close-circle': CloseCircleOutlined,
  cloud: CloudOutlined,
  cluster: ClusterOutlined,
  delete: DeleteOutlined,
  down: DownOutlined,
  'down-circle': DownCircleOutlined,
  download: DownloadOutlined,
  'exclamation-circle': ExclamationCircleOutlined,
  fullscreen: FullscreenOutlined,
  gold: GoldOutlined,
  history: HistoryOutlined,
  'info-circle': InfoCircleOutlined,
  'info-circle-o': InfoCircleOutlined,
  loading: LoadingOutlined,
  lock: LockOutlined,
  logout: LogoutOutlined,
  'menu-fold': MenuFoldOutlined,
  'menu-unfold': MenuUnfoldOutlined,
  'paper-clip': PaperClipOutlined,
  plus: PlusOutlined,
  'plus-circle': PlusCircleOutlined,
  'question-circle': QuestionCircleOutlined,
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
