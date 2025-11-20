<script setup>
defineProps({
  color: {
    type: String,
    required: false,
    default: 'success'
  },
  label: {
    type: String,
    required: true
  }
})
</script>

<template>
  <button :class='["btn", "btn-sm", `btn-${color}`]'
          :label="label">{{ label }}</button>
</template>

<style scoped>

</style>