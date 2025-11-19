<script setup>
import {computed} from "vue";

let {maxValue, minValue, value} = defineProps({
  maxValue: {
    type: Number,
    required: false,
    default: 100
  },
  minValue: {
    type: Number,
    required: false,
    default: 0
  },
  value: {
    type: Number,
    required: true
  }
});
let pbClasses = computed(() => {
  if (value < (maxValue - minValue) / 4) {
    return ["progress-bar", "progress-bar-striped", "bg-danger"];
  } else if (value < (2 * (maxValue - minValue)) / 4) {
    return ["progress-bar", "progress-bar-striped", "bg-warning"];
  } else if (value < (3 * (maxValue - minValue)) / 4) {
    return ["progress-bar", "progress-bar-striped", "bg-info"];
  } else {
    return ["progress-bar", "progress-bar-striped", "bg-success"];
  }
});
let pbWidth = computed(() => {
  return `${(value - minValue) * 100 / (maxValue - minValue)}%`;
})
</script>

<template>
  <div class="mb-3">
    <div class="progress">
      <div :class="pbClasses"
           role="progressbar"
           :aria-valuenow="value"
           :aria-valuemin="minValue"
           :aria-valuemax="maxValue"
           :style="{width: pbWidth}"
      ></div>
    </div>
  </div>
</template>

<style scoped>

</style>