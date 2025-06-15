<script setup lang="ts">
// @/components/SkeletonBaseContent.vue
</script>

<template>
  <div class="py-2 px-2 rounded-md bg-[#0f172a] relative">
    <div class="flex items-center gap-1 mb-2">
      <Skeleton width="100%" height="24px" class="flex-1" />
      <div class="flex-shrink-0 flex gap-2">
        <Skeleton shape="circle" size="2rem" />
      </div>
    </div>
    <Skeleton width="100%" height="360px" class="rounded-md" />
    <div class="flex justify-between mt-0.4">
      <div class="flex flex-wrap flex-1">
        <Skeleton width="70px" height="20px" class="mr-2 mt-2" />
        <Skeleton width="70px" height="20px" class="mr-2 mt-2" />
      </div>
      <div class="mt-2">
        <Skeleton width="90px" height="20px" />
      </div>
    </div>
  </div>
</template>
