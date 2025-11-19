<script setup>
// Application State, View Model, Model  -- declarative --> View
//                                      <-- declarative --

import {computed, onMounted, onUnmounted, reactive} from "vue";
import Card from "../common/Card.vue";
import Badge from "../common/Badge.vue";
import InputText from "../common/InputText.vue";
import Button from "../common/Button.vue";
import Row from "../common/Row.vue";
import Column from "../common/Column.vue";
import ProgressBar from "../common/ProgressBar.vue";
import createSecret, {evaluateMove} from "../../utils/mastermind-utils.js";
import Table from "../common/Table.vue";
const LOCAL_STORAGE_KEY = "game-mastermind-vue";

const game = reactive({
  level: 3,
  max_level: 10,
  max_moves: 10,
  lives: 3,
  tries: 0,
  counter: 60,
  max_counter: 60,
  guess: 123,
  secret: createSecret(3),
  moves: []
});
//region alternative state design
/*
const game = reactive({
  score: {
    level: 3,
    lives: 3,
    tries: 0,
    guess: 123,
    counter: 60,
    secret: 549,
    moves: []
  },
  constraints: {
    max_level: 10,
    max_moves: 10,
    max_counter: 60,
  },
});
 */
//endregion
function nextGameLevel() {
  game.level++;
  game.max_moves += 5;
  game.lives += 2;
  game.max_counter += 20;
  game.tries = 0;
  game.moves = [];
  game.counter = game.max_counter;
  game.secret = createSecret(game.level);
}

function initGameLevel() {
  game.tries = 0;
  game.moves = [];
  game.counter = game.max_counter;
  game.secret = createSecret(game.level);
}

function play() {
  // TODO
  if (Number(game.guess) === game.secret) {
    if (game.level === game.max_level) {
      //TODO: player wins!
    } else {
      nextGameLevel();
    }
  } else {
    game.tries++;
    if (game.tries === game.max_moves) {
      if (game.lives === 0) {
        //TODO: player loses!
      } else {
        game.lives--;
        initGameLevel();
      }
    } else {
      game.moves.push(evaluateMove(game.guess, game.secret));
    }
  }
}

let timerId = null;

onMounted(() => {
  let localState = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (localState) {
     localState = JSON.parse(localState);
     for (let field in localState) {
         if(game.hasOwnProperty(field)) {
           game[field] = localState[field];
         }
     }
  }
  timerId = setInterval(() => {
    game.counter--;
    if (game.counter <= 0){
      if (game.lives === 0){
        //TODO: player loses!
      }
      game.lives--;
      initGameLevel();
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(game));
  }, 1_000);
});

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId);
  }
});

let triesLeft = computed(() => {
  return game.max_moves - game.tries;
});

const HistoryTableColumnNames = [
  "Guess",
  "Perfect Match",
  "Partial Match",
  "Evaluation"
];

const MoveFields = [
  "guess",
  "perfectMatch",
  "partialMatch",
  "message"
];

</script>

<template>
  <Row>
    <Column>
      <Card title="Game Console">
        <Badge color="primary" label="Game Level" :value="game.level"></Badge>
        <Badge color="success" label="Lives" :value="game.lives"></Badge>
        <Badge color="warning" label="Tries" :value="game.tries"></Badge>
        <ProgressBar :value="triesLeft" :max-value="game.max_moves"/>
        <Badge color="danger" label="Counter" :value="game.counter"></Badge>
        <ProgressBar :value="game.counter"
                     :maxValue="game.max_counter"/>
        <InputText id="guess"
                   v-model="game.guess"
                   label="Guess"
                   placeholder="Enter your guess">
          <Button @click="play" label="Play"/>
        </InputText>
      </Card>
    </Column>
    <Column>
      <Card title="Game History">
        <Table :items="game.moves"
               table-color="danger"
               :columns="HistoryTableColumnNames"
               :fields="MoveFields"/>
      </Card>
    </Column>
  </Row>
</template>

<style scoped>

</style>