<script setup>
defineProps({
  value: { type: String, required: true },
  id: { type: String, required: true },
  label: { type: String, required: true },
  alt: { type: String, required: true },
  displayOnly: { type: Boolean, required: false, default: false },
})
</script>

<template>
  <div class="mb-3" v-if="displayOnly">
    <label :for="id" class="form-label p-2">{{ label }}:</label>
    <img class="img-thumbnail p-2"
         :id="id"
         :alt="alt"
         style="width: 64px;"
         :src="value">
  </div>
  <div class="mb-3" v-if="!displayOnly">
    <label :for="id" class="form-label p-2">{{ label }}:</label>
    <img class="img-thumbnail p-2"
         :alt="alt"
         :id="id"
         style="width: 64px;"
         :src="value">
    <label class="p-2">
      <input class="form-control"
             :style="{display: 'none'}"
             type="file" />
      <span class="btn btn-primary">File</span>
    </label>
  </div>
</template>

<style scoped>

</style>