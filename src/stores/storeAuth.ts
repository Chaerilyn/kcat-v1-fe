// @/stores/storeAuth.ts
import { defineStore } from 'pinia'
import PocketBase from 'pocketbase'
import { ref } from 'vue'

const pb = new PocketBase(import.meta.env.VITE_BASE_URL)

export const storeAuth = defineStore('authStore', () => {
  // State
  const isValid = ref(pb.authStore.isValid)
  const user = ref(pb.authStore.model)
  const uploader = ref(null)

  // Actions
  function update() {
    isValid.value = pb.authStore.isValid
    user.value = pb.authStore.model
    if (isValid.value) {
      fetchUploader()
    }
    else {
      uploader.value = null
    }
  }

  async function login(email: string, password: string) {
    await pb.collection('users').authWithPassword(email, password)
    update()
  }

  function logout() {
    pb.authStore.clear()
    update()
  }

  async function loginWithOAuth(providerType: string) {
    await pb.collection('users').authWithOAuth2({ provider: providerType })
    update()
    if (isValid.value) {
      await fetchUploader() // Fetch additional details right after OAuth login
    }
  }

  async function fetchUploader() {
    try {
      const resultList = await pb.collection('uploaders').getList(1, 50, {
        filter: `user="${user.value.id}"`,
      })
      if (resultList.items.length > 0) {
        uploader.value = resultList.items[0]
      }
    }
    catch (error) {
      console.error('Error fetching uploader details:', error)
    }
  }

  // Initialize the state
  update()

  return {
    isValid,
    user,
    uploader,
    update,
    login,
    loginWithOAuth,
    logout,
  }
})
