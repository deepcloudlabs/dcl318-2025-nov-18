<script setup>
const props = defineProps({
  label: {
    type: String,
    required: false
  },
  value: {
    type: [String, Number],
    required: true
  },
  color: {
    type: String,
    required: false,
    default: 'info'
  },
  displayOnly: {
    type: Boolean,
    required: false,
    default: false
  }
})
</script>

<template>
  <div class="mb-3">
    <h5 v-if="!displayOnly">{{label}}:<span :class='["badge", `bg-${color}`]'>{{value}}</span></h5>
    <h5 v-if="displayOnly"><span :class='["badge", `bg-${color}`]'>{{value}}</span></h5>
  </div>
</template>

<style scoped>

</style>