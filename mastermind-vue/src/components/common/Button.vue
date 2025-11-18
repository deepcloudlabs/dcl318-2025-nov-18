<script setup>
  const props = defineProps({
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
  <button :class='["btn", `btn-${color}`]'>{{label}}</button>
</template>

<style scoped>

</style>