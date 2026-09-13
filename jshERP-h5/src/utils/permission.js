import { useUserStore } from '@/store/user'

export function hasBtn (url, code) {
  return useUserStore().hasBtn(url, code)
}
