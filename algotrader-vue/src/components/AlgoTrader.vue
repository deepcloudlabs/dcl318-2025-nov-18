<script setup>

import Card from "./common/Card.vue";
import {computed, markRaw, onMounted, onUnmounted, reactive, ref} from "vue";
import SelectBox from "./common/SelectBox.vue";
import {io} from "socket.io-client";
import Table from "./common/Table.vue";
import Badge from "./common/Badge.vue";
import Row from "./common/Row.vue";
import Column from "./common/Column.vue";
import Button from "./common/Button.vue";
import {Line} from 'vue-chartjs';
import {CHART_OPTIONS} from "./utils/chart-config.js";
import {
  CategoryScale,
  Tooltip,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  Title,
  PointElement
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, PointElement,LineElement, CategoryScale, LinearScale);

const market = reactive({
  symbols: [],
  symbol: "BTCUSDT",
  windowSize: 50,
  isMonitoring: false
});

const trades = ref([]);
const prices = ref([]);
const timestamps = ref([]);


const socket = io("ws://localhost:5555");

const WINDOW_SIZES = [10, 25, 50, 100];
const BINANCE_REST_API_URL = "https://api.binance.com/api/v3/ticker/price";
const TRADE_FIELDS = [{name: "symbol"}, {name: "price"}, {name: "quantity"}, {name: "volume"}, {name: "timestamp"}, {name: "datetime"}];
const TRADE_COLUMNS = ["Symbol", "Price", "Quantity", "Volume", "Timestamp", "DataTime"];

function fetchSymbols() {
  fetch(BINANCE_REST_API_URL)
      .then(res => res.json())
      .then(tickers => {
        tickers.sort((t1, t2) => t1.symbol.localeCompare(t2.symbol));
        market.symbols = tickers.map(ticker => ticker["symbol"]);
        // market.symbols.sort();
      })
}

const totalVolume = computed(() => {
  return trades.value.map(trade => trade["volume"]).reduce((acc, volume) => acc + volume, 0).toFixed(0);
});

const chartData = computed(() =>
    markRaw(
        {
          labels: [...timestamps.value],
          datasets: [
            {
              label: "Price",
              fill: false,
              backgroundColor: "rgba(75,192,192,0.4)",
              borderColor: "rgba(75,192,192,1)",
              borderDashOffset: 0.0,
              pointBorderColor: "rgba(75,192,192,1)",
              pointBackgroundColor: "#fff",
              pointBorderWidth: 1,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgba(75,192,192,1)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: [...prices.value]
            }
          ]
        })
)
onMounted(fetchSymbols);

onMounted(() => {
  socket.on("ticker", async (trade) => {
    if (!market.isMonitoring) return;
    trades.value.push(trade);
    prices.value.push(trade["price"]);
    timestamps.value.push(trade["timestamp"]);
    if (trades.value.length > market.windowSize) {
      const overflow = trades.value.length - market.windowSize;
      trades.value.splice(0, overflow);
      prices.value.splice(0, overflow);
      timestamps.value.splice(0, overflow);
    }
  });
});
onUnmounted(() => {
  socket.close();
})
</script>

<template>
  <Card title="Market">
    <SelectBox id="symbols"
               v-model:value="market.symbol"
               :options="market.symbols"
               label="Market Symbol"/>
    <SelectBox id="windowSizes"
               v-model:value="market.windowSize"
               :options="WINDOW_SIZES"
               label="Window Size"/>
    <Row>
      <Column>
        <Button v-if="!market.isMonitoring"
                @click="()=>{market.isMonitoring = !market.isMonitoring}"
                label="Start Monitoring"
                color="success"/>
        <Button v-if="market.isMonitoring"
                @click="()=>{market.isMonitoring = !market.isMonitoring}"
                label="Stop Monitoring"
                color="danger"/>
      </Column>
      <Column></Column>
    </Row>
  </Card>
  <Card title="Market Chart">
    <Line :data="chartData"
          style="width: 1080px; height: 720px;"
          :options="CHART_OPTIONS"/>

  </Card>
  <Card title="Market Data">
    <Badge :value="totalVolume"
           label="Total Volume"
           color="info"/>
    <Table :items="trades"
           :fields="TRADE_FIELDS"
           :columns="TRADE_COLUMNS"/>
  </Card>
</template>

<style scoped>

</style>