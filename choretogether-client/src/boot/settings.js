import { boot } from 'quasar/wrappers'
import { useThemeStore } from '@/stores/theme-store'
import { useLocaleStore } from '@/stores/locale-store'

export default boot(() => {
  useThemeStore().primijeniZaGosta()
  useLocaleStore().primijeniZaGosta()
})
