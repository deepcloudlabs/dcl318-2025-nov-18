<script setup>
defineProps({
  id: {type: String, required: true},
  label: {type: String, required: true},
  options: {type: Array, required: true},
  value: {type: [String, Number], required: true},
});
const emit = defineEmits(["update:value"]);

function onChange(event) {
  emit('update:value', event.target.value);
}
</script>

<template>
  <div class="mb-3">
    <label :for="id" class="form-label">{{ label }}:</label>
    <select :id="id"
            :value="value"
            @change="onChange"
            class="form-select">
      <option v-for="opt in options" :key="opt">{{ opt }}</option>
    </select>
    <slot />
  </div>
</template>

<style scoped>

</style>