import type { ContentsItem } from '@/interfaces/typesContents'
import { storeAuth } from '@/stores/storeAuth'
import PocketBase from 'pocketbase'
import { useToast } from 'primevue/usetoast'
// @/composables/useLikeItem.ts
import { ref } from 'vue'

const pb = new PocketBase(import.meta.env.VITE_BASE_URL)

export function useLikeItem(content: ContentsItem) {
  const isLiked = ref(false)
  const toast = useToast()
  const authStore = storeAuth()

  async function likeContent() {
    try {
      const userId = authStore.user.id
      if (!userId) {
        throw new Error('User is not authenticated.')
      }

      if (!content.expand.likes) {
        content.expand.likes = []
      }

      if (isLiked.value) {
        const likeRecord = content.expand.likes.find(like => like.user === userId)
        if (likeRecord) {
          await pb.collection('users_likes').delete(likeRecord.id)

          const updateData = {
            'likes-': likeRecord.id,
          }

          await pb.collection('contents').update(content.id, updateData)
          isLiked.value = false

          const likeIndex = content.expand.likes.findIndex(like => like.id === likeRecord.id)
          if (likeIndex !== -1) {
            content.expand.likes.splice(likeIndex, 1)
          }
        }
      }
      else {
        const data = {
          user: userId,
          content: content.id,
        }

        const likeRecord = await pb.collection('users_likes').create(data)

        const updateData = {
          'likes+': likeRecord.id,
        }

        await pb.collection('contents').update(content.id, updateData)
        isLiked.value = true

        content.expand.likes.push({
          ...likeRecord,
        })
      }
    }
    catch (error) {
      console.error('Error liking/unliking content:', error)
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to like/unlike content.', life: 1000 })
    }
  }

  // Initialize `isLiked` state based on existing likes
  function initializeLikeState() {
    if (content.expand?.likes && content.expand.likes.some(like => like.user === authStore.user.id)) {
      isLiked.value = true
    }
  }

  return {
    isLiked,
    likeContent,
    initializeLikeState,
  }
}
