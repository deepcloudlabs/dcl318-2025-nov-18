<script setup>
import Photo from "./Photo.vue";
import Badge from "./Badge.vue";
import Button from "./Button.vue";

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
  },
  operationClick: {
    type: Function,
    required: false,
    default: null
  },
  operationName: {
    type: String,
    required: false,
    default: ""
  },
  rowClick: {
    type: Function,
    required: false,
    default: () => {
    }
  }
});

const TableClasses = [
  "table",
  "table-striped",
  "table-striped-columns",
  "table-responsive",
  "table-hover",
  `table-${tableColor}`];

</script>

<template>
  <table :class="TableClasses" v-if="items">
    <thead>
    <tr>
      <th v-for="column in columns">{{ column }}</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="item in items"
        @click="()=>rowClick(item)"
        @mouseover="()=>rowClick(item)">
      <td v-for="field in fields">
        <span v-if="field.type !== 'Photo' && !field.ui">{{ item[field.name] }}</span>
        <Photo v-if="field.type === 'Photo'"
               alt="Employee's Photo"
               :value="item[field.name]"
               :displayOnly="true"
               :id="id"></Photo>
        <Badge v-if="field.ui && field.ui === 'Badge'"
               :color="field.color"
               :value="item[field.name]"
               :displayOnly="true"></Badge>
      </td>
      <td v-if="operationClick">
        <Button :label="operationName" @click="()=>operationClick(item)" color="danger"/>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>

</style>