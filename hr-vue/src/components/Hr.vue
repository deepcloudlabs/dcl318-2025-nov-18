<script setup>

import Card from "./common/Card.vue";
import Row from "./common/Row.vue";
import Column from "./common/Column.vue";
import {reactive} from "vue";
import Employee, {DEPARTMENTS} from "../model/Employee.js";
import InputText from "./common/InputText.vue";
import Button from "./common/Button.vue";
import SelectBox from "./common/SelectBox.vue";
import Photo from "./common/Photo.vue";

const hr = reactive({
  employee: new Employee({}),
  departments: DEPARTMENTS,
  employees: []
});

function hireEmployee(){}
function fireEmployee(){}
function findEmployee(){
  alert(hr.employee.department);
}
function updateEmployee(){}
</script>

<template>
  <Row>
    <Column>
      <Card title="Employee">
          <InputText id="identityNo"
                     :model-value="hr.employee.identityNo"
                     label="Identity No">
            <Button label="Find"
                    @click="findEmployee"
                    color="success" />
            <Button label="Fire" color="danger" />
          </InputText>
          <InputText id="fullname"
                   :model-value="hr.employee.fullname"
                   label="Full Name" />
          <InputText id="salary"
                   :model-value="hr.employee.salary"
                   label="Salary" />
        <InputText id="iban"
                   :model-value="hr.employee.iban"
                   label="Iban" />
        <InputText id="birthYear"
                   :model-value="hr.employee.birthYear"
                   label="Birth Year" />
        <SelectBox id="department"
                   v-model:value="hr.employee.department"
                   :options="hr.departments"
                   label="Department"/>
        <Photo alt="Employee's photo"
               id="photo"
               label="Employee's photo"
               :value="hr.employee.photo"
               :displayOnly="false" />
      </Card>
    </Column>
    <Column>
      <Card title="Employees">

      </Card>
    </Column>
  </Row>
</template>

<style scoped>

</style>