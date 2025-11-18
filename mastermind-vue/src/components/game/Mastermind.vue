<script setup>
// Application State, View Model, Model  -- declarative --> View
//                                      <-- declarative --

import {reactive} from "vue";
import Card from "../common/Card.vue";
import Badge from "../common/Badge.vue";
import InputText from "../common/InputText.vue";
import Button from "../common/Button.vue";
import Row from "../common/Row.vue";
import Column from "../common/Column.vue";

const game = reactive({
  level: 3,
  max_level: 10,
  max_moves: 10,
  lives: 3,
  tries: 0,
  counter: 60,
  max_counter: 60,
  guess: 123,
  secret: 549,
  moves: []
});

function play() {
  alert("play button is clicked!: " + game.guess)
}
</script>

<template>
  <Row>
    <Column>

      <Card title="Game Console">
        <Badge color="primary" label="Game Level" :value="game.level"></Badge>
        <Badge color="success" label="Lives" :value="game.lives"></Badge>
        <Badge color="info" label="Counter" :value="game.counter"></Badge>
        <Badge color="warning" label="Tries" :value="game.tries"></Badge>
        <InputText id="guess"
                   v-model="game.guess"
                   label="Guess"
                   placeholder="Enter your guess">
          <Button @click="play" label="Play"/>
        </InputText>
      </Card>
    </Column>
    <Column>
      <Card title="Game History"></Card>
    </Column>
  </Row>
</template>

<style scoped>

</style>