import { onMounted, onUnmounted, ref } from 'vue'

export function useWindowSize() {
  const isMobile = ref(window.innerWidth < 712)

  const updateWindowSize = () => {
    isMobile.value = window.innerWidth < 712
  }

  onMounted(() => {
    window.addEventListener('resize', updateWindowSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWindowSize)
  })

  return { isMobile }
}
