<script setup lang="ts">
// @/views/LoginView.vue
import { storeAuth } from '@/stores/storeAuth'
import { useToast } from 'primevue/usetoast'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const toast = useToast()
const authStore = storeAuth() // Using authStore from Pinia

const email = ref('')
const password = ref('')

async function authenticate() {
  try {
    await authStore.loginWithOAuth('discord') // Assuming you have this method set up
    router.push({ name: 'contents' })
  }
  catch (error) {
    console.error('Authentication failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Authentication Failed',
      detail: 'Failed to authenticate with Discord.',
      life: 5000,
    })
  }
}

async function authenticateWithData() {
  try {
    await authStore.login(email.value, password.value) // Assuming you have this method set up
    router.push({ name: 'contents' })
  }
  catch (error) {
    console.error('Authentication failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Authentication Failed',
      detail: 'Failed to log in, check email and password.',
      life: 5000,
    })
  }
}

function featureUnavailable() {
  toast.add({
    severity: 'warn',
    summary: 'Feature Unavailable',
    detail: 'This feature is not available yet, login with Discord.',
    life: 5000,
  })
}
</script>

<template>
  <!-- <div class="flex justify-center items-center min-h-screen bg-gray-900">
    <div class="w-full max-w-xs p-8 bg-gray-800 rounded-lg shadow-lg">
      <h1 class="text-3xl font-extrabold text-white text-center mb-6">
        Login
      </h1>
      <Button
        label="Login with Discord"
        icon="pi pi-discord"
        class="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out"
        @click="authenticate"
      />
    </div>
  </div> -->
  <section class="border-red-500 mt-[150px] flex items-center justify-center">
    <div class="bg-[#0f172a] p-5 flex rounded-2xl shadow-lg max-w-3xl">
      <div class="md:w-1/2 px-5">
        <h2 class="text-2xl font-bold">
          Login
        </h2>
        <p class="text-sm mt-4">
          If you have an account, please login
        </p>
        <form class="mt-6" action="#" method="POST">
          <div>
            <label class="block">Email Address</label>
            <InputText v-model="email" type="email" name="" placeholder="Enter Email Address" class="w-full px-4 py-3 rounded-lg mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none" autofocus required />
          </div>

          <div class="mt-4">
            <label class="block">Password</label>
            <InputText
              v-model="password" type="password" name="" placeholder="Enter Password" minlength="6" class="w-full px-4 py-3 rounded-lg  mt-2 border focus:border-blue-500
                  focus:bg-white focus:outline-none" required
            />
          </div>

          <div class="text-right mt-2">
            <a href="#" class="text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700">Forgot Password?</a>
          </div>

          <Button
            label="Log In"
            icon="pi pi-sign-in"
            class="w-full mt-4 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out"
            @click="authenticateWithData()"
          />
        </form>

        <div class="mt-7 grid grid-cols-3 items-center text-gray-500">
          <hr class="border-gray-500">
          <p class="text-center text-sm">
            OR
          </p>
          <hr class="border-gray-500">
        </div>

        <Button
          label="Login with Discord"
          severity="info"
          icon="pi pi-discord"
          class="w-full mt-7 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out"
          @click="authenticate"
        />

        <div class="text-sm flex justify-between items-center mt-4">
          <p>If you don't have an account...</p>
          <Button
            label="Register"
            severity="contrast"
            class="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out"
            @click="featureUnavailable"
          />
        </div>
      </div>

      <div class="w-1/2 md:block hidden ">
        <img src="https://i.imgur.com/EXCYeCW.jpeg" class="rounded-2xl" alt="page img">
      </div>
    </div>
  </section>
</template>
