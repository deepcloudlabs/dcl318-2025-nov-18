<script setup>

import Card from "./common/Card.vue";
import {computed, markRaw, onMounted, onUnmounted, reactive, ref} from "vue";
import SelectBox from "./common/SelectBox.vue";
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

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale);

const market = reactive({
  symbols: [],
  symbol: "BTCUSDT",
  windowSize: 50,
  isMonitoring: false,
  marketBasket: ["btcusdt", "ethusdt", 'bnbusdt', 'solusdt', 'xrpusdt', 'dogeusdt'],
  trades: {},
  prices: {}
});

//const trades = ref({});
//const prices = ref({});
const timestamps = ref([]);
let socket = null;


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
              data: [...prices.value[market.marketBasket[0]]]
            }
          ]
        })
)
onMounted(fetchSymbols);

onUnmounted(() => {
  socket.close();
})

function removeFromBasket(selectedSymbol) {
  market.marketBasket = market.marketBasket.filter(symbol => symbol !== selectedSymbol);
}

function addToBasket() {
  if (market.marketBasket.includes(market.symbol.toLowerCase())) return;
  market.marketBasket.push(market.symbol.toLowerCase());
  market.trades[market.symbol.toLowerCase()] = [];
  market.prices[market.symbol.toLowerCase()] = [];
}

function startMonitoring() {
  market.isMonitoring = true;
  const streams = market.marketBasket.map(symbol => `${symbol.toLowerCase()}@trade`).join("/");
  socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  socket.onopen = () => {
    console.log("Connected to binance websocket service!");
  }

  socket.onmessage = (frame) => {
    let trade = JSON.parse(frame.data);
    const symbol = trade.stream.split('@')[0];
    trade.data["symbol"] = trade.data["s"];
    trade.data["price"] = Number(trade.data["p"]);
    trade.data["quantity"] = Number(trade.data["q"]);
    trade.data["volume"] = trade.data["price"] * trade.data["quantity"];
    trade.data["timestamp"] = trade.data["t"];
    trade.data["datetime"] = new Date(trade.data["t"]);
    if (!market.isMonitoring) return;
    if (!market.trades.hasOwnProperty(symbol)) {
      market.trades[symbol] = [];
      market.prices[symbol] = [];

    }
    market.trades[symbol].push(trade.data);
    market.prices[symbol].push(trade.data["price"]);
    timestamps.value.push(trade["timestamp"]);
    if (market.trades[symbol].length > market.windowSize) {
      const overflow = market.trades[symbol].length - market.windowSize;
      market.trades[symbol].splice(0, overflow);
      market.prices[symbol].splice(0, overflow);
      timestamps.value.splice(0, overflow);
    }
  }
}

function stopMonitoring() {
  market.isMonitoring = false;
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(1000, 'User closed the connection!');
    socket = null;
  }
}
</script>

<template>
  <Card title="Market">
    <SelectBox id="symbols"
               v-model:value="market.symbol"
               :options="market.symbols"
               label="Market Symbol">
      <Button label="Add" color="primary" @click="addToBasket"/>
      <ul>
        <li v-for="basketSymbol in market.marketBasket">
          <Badge :displayOnly="true" color="primary" :value="basketSymbol">
            <Button label="x" color="danger" @click="() => removeFromBasket(basketSymbol)"/>
          </Badge>
        </li>
      </ul>
    </SelectBox>
    <SelectBox id="windowSizes"
               v-model:value="market.windowSize"
               :options="WINDOW_SIZES"
               label="Window Size"/>
    <Row>
      <Button v-if="!market.isMonitoring"
              @click="startMonitoring"
              label="Start Monitoring"
              color="success"/>
      <Button v-if="market.isMonitoring"
              @click="stopMonitoring"
              label="Stop Monitoring"
              color="danger"/>
    </Row>
  </Card>
  <Card title="Market Chart">

  </Card>
  <Card v-if="market.marketBasket.length > 0"
        v-for="symbol in market.marketBasket"
        :title="`Market Data [${symbol.toUpperCase()}]`">
    <Table :items="market.trades[symbol]"
           :fields="TRADE_FIELDS"
           :columns="TRADE_COLUMNS"/>
  </Card>
</template>

<style scoped>

</style>