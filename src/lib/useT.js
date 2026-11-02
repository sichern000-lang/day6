import { useAppStore } from '../store/useAppStore'
import { translate } from './i18n'

// 컴포넌트에서: const t = useT();  t('nav.home')
export function useT() {
  const lang = useAppStore((s) => s.lang)
  return (key, vars) => translate(lang, key, vars)
}
