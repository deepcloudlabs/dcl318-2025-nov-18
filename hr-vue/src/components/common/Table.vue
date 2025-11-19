<script setup>
let {tableColor} = defineProps({
  columns: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    required: true
  },
  fields: {
    type: Array,
    required: true
  },
  tableColor: {
    type: String,
    required: false,
    default: "success"
  }
});

const TableClasses = [
  "table",
  "table-striped",
  "table-striped-columns",
  "table-responsive",
  "table-hover",
  `table-${tableColor}`
];

</script>

<template>
  <table :class="TableClasses">
    <thead>
    <tr>
      <th v-for="column in columns">{{ column }}</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="item in items">
      <td v-for="field in fields">{{ item[field] }}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>

</style>