<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  modelValue: {
    type: [String, Number],
    required: true
  },
  placeholder: {
    type: String,
    required: false,
    default: 'Enter your input'
  }
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="mb-3">
    <label class="form-label" :for="id">{{ label }}:</label>
    <input :id="id"
           class="form-control"
           :value="modelValue"
           :placeholder="placeholder"
           @input="$emit('update:modelValue', $event.target.value)"
           type="text"/>
    <slot/>
  </div>
</template>

<style scoped>

</style>