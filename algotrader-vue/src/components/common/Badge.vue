<script setup>
defineProps({
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
    <h5 v-if="!displayOnly">
      <span class="pe-2">{{label}}:</span><span :class='["badge", `bg-${color}`]'>{{value}}</span>
      <slot />
    </h5>
    <h5 v-if="displayOnly"><span :class='["badge", `bg-${color}`]'>{{value}}</span>
      <slot />
    </h5>

  </div>
</template>

<style scoped>

</style>