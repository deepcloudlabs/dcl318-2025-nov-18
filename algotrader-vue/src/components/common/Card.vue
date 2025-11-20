<script setup>
const {title} = defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="p-2">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">{{ title }}</h3>
      </div>
      <div class="card-body">
        <slot/>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>