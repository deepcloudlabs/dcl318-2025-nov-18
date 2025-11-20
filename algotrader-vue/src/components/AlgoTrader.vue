<script setup>
import { computed, markRaw, onMounted, onUnmounted, reactive } from "vue";
import { Line } from "vue-chartjs";
import {
  CategoryScale,
  Tooltip,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  Title,
  PointElement,
  LogarithmicScale
} from "chart.js";

import Card from "./common/Card.vue";
import SelectBox from "./common/SelectBox.vue";
import Table from "./common/Table.vue";
import Badge from "./common/Badge.vue";
import Row from "./common/Row.vue";
import Column from "./common/Column.vue";
import Button from "./common/Button.vue";
import { CHART_OPTIONS } from "./utils/chart-config.js";

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    CategoryScale,
    LinearScale,
    LogarithmicScale
);

const WINDOW_SIZES = Object.freeze([10, 25, 50, 100]);
const BINANCE_REST_API_URL = "https://api.binance.com/api/v3/ticker/price";

const TRADE_FIELDS = Object.freeze([
  { name: "symbol" },
  { name: "price" },
  { name: "quantity" },
  { name: "volume" },
  { name: "timestamp" },
  { name: "datetime" }
]);

const TRADE_COLUMNS = Object.freeze([
  "Symbol",
  "Price",
  "Quantity",
  "Volume",
  "Timestamp",
  "DataTime"
]);

const EMPTY_CHART_DATA = markRaw({
  labels: [],
  datasets: []
});

const LINE_COLORS = [
  "rgba(75,192,192,1)",   // teal
  "rgba(255,99,132,1)",   // pink/red
  "rgba(54,162,235,1)",   // blue
  "rgba(255,206,86,1)",   // yellow
  "rgba(153,102,255,1)",  // purple
  "rgba(255,159,64,1)",   // orange
  "rgba(199,199,199,1)",  // grey
  "rgba(60,179,113,1)",   // green
  "rgba(106,90,205,1)",   // slate blue
  "rgba(255,215,0,1)",    // gold
  "rgba(0,191,255,1)",    // deep sky blue
  "rgba(220,20,60,1)",    // crimson
  "rgba(0,128,128,1)",    // teal/dark
  "rgba(210,105,30,1)",   // chocolate
  "rgba(148,0,211,1)",    // dark violet
  "rgba(127,255,0,1)"     // chartreuse
];

const market = reactive({
  symbols: [],
  symbol: "btcusdt",
  windowSize: 50,
  isMonitoring: false,
  marketBasket: ["btcusdt", "ethusdt", "bnbusdt", "solusdt", "xrpusdt", "dogeusdt"],
  trades: {},
  prices: {}
});

let socket = null;

const fetchSymbols = async () => {
  try {
    const res = await fetch(BINANCE_REST_API_URL);
    const tickers = await res.json();

    tickers.sort((t1, t2) => t1.symbol.localeCompare(t2.symbol));
    market.symbols = tickers.map((ticker) => ticker.symbol.toLowerCase());
  } catch (err) {
    console.error("Failed to fetch Binance symbols:", err);
  }
};

const removeFromBasket = (selectedSymbol) => {
  const lower = selectedSymbol.toLowerCase();
  market.marketBasket = market.marketBasket.filter(
      (symbol) => symbol !== lower
  );

  delete market.trades[lower];
  delete market.prices[lower];
};

const addToBasket = () => {
  const lower = market.symbol.toLowerCase();
  if (market.marketBasket.includes(lower)) return;

  market.marketBasket.push(lower);
  if (!market.trades[lower]) {
    market.trades[lower] = [];
    market.prices[lower] = [];
  }
};

const startMonitoring = () => {
  if (market.isMonitoring || market.marketBasket.length === 0) return;

  stopMonitoring();

  market.isMonitoring = true;

  const streams = market.marketBasket
      .map((symbol) => `${symbol.toLowerCase()}@trade`)
      .join("/");

  socket = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${streams}`
  );

  socket.onopen = () => {
    console.log("Connected to Binance WebSocket service");
  };

  socket.onmessage = (frame) => {
    if (!market.isMonitoring) return;

    const message = JSON.parse(frame.data);
    const symbol = message.stream.split("@")[0];
    const data = message.data;

    const price = Number(data.p);
    const quantity = Number(data.q);
    const timestamp = data.t;

    const normalizedTrade = {
      symbol: data.s,
      price,
      quantity,
      volume: price * quantity,
      timestamp,
      datetime: new Date(timestamp).toLocaleString()
    };

    if (!market.trades[symbol]) {
      market.trades[symbol] = [];
      market.prices[symbol] = [];
    }

    market.trades[symbol].push(normalizedTrade);
    market.prices[symbol].push(price);

    const overflow = market.trades[symbol].length - market.windowSize;
    if (overflow > 0) {
      market.trades[symbol].splice(0, overflow);
      market.prices[symbol].splice(0, overflow);
    }
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  socket.onclose = (event) => {
    console.log(`WebSocket closed (code=${event.code}, reason=${event.reason})`
    );
  };
};

const stopMonitoring = () => {
  market.isMonitoring = false;

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(1000, "User closed the connection");
  }

  socket = null;
};

const hasBasket = computed(() => market.marketBasket.length > 0);

const hasChartData = computed(
    () => chartData.value.datasets && chartData.value.datasets.length > 0
);

const chartSymbol = computed(() => {
  const selectedLower = market.symbol.toLowerCase();
  if (market.marketBasket.includes(selectedLower)) return selectedLower;
  return market.marketBasket[0] || null;
});

const chartData = computed(() => {
  const activeSymbols = market.marketBasket.filter(
      (s) => (market.prices[s] || []).length > 0
  );

  if (!activeSymbols.length) {
    return EMPTY_CHART_DATA;
  }

  const refSymbol = activeSymbols[0];
  const tradesForRef = market.trades[refSymbol] || [];

  const labels = tradesForRef.map((t) =>
      new Date(t.timestamp).toTimeString()
  );
  const datasets = activeSymbols.map((symbol, index) => {
    const pricesForSymbol = market.prices[symbol] || [];

    return {
      label: symbol.toUpperCase(),
      fill: false,
      backgroundColor: LINE_COLORS[index % LINE_COLORS.length],
      borderColor: LINE_COLORS[index % LINE_COLORS.length],
      pointRadius: 1,
      pointHitRadius: 10,
      data: [...pricesForSymbol]
    };
  });

  return markRaw({
    labels,
    datasets
  });
});

onMounted(() => {
  fetchSymbols();
});

onUnmounted(() => {
  stopMonitoring();
});
</script>

<template>
  <Card title="Market">
    <SelectBox
        id="symbols"
        v-model:value="market.symbol"
        :options="market.symbols"
        label="Market Symbol">
      <Button label="Add" color="primary" @click="addToBasket" />
      <ul>
        <li
            v-for="basketSymbol in market.marketBasket"
            :key="basketSymbol"
            style="display: inline-block; margin-right: 0.5rem;">
          <Badge :displayOnly="true" color="primary" :value="basketSymbol">
            <Button
                label="x"
                color="danger"
                @click="removeFromBasket(basketSymbol)"/>
          </Badge>
        </li>
      </ul>
    </SelectBox>

    <SelectBox
        id="windowSizes"
        v-model:value="market.windowSize"
        :options="WINDOW_SIZES"
        label="Window Size"/>
    <Row>
      <Column>
        <Button
            v-if="!market.isMonitoring"
            :disabled="!hasBasket"
            @click="startMonitoring"
            label="Start Monitoring"
            color="success"
        />
        <Button
            v-else
            @click="stopMonitoring"
            label="Stop Monitoring"
            color="danger"
        />
      </Column>
    </Row>
  </Card>


  <Card title="Market Chart">
    <Line
        v-if="hasChartData"
        :data="chartData"
        :options="CHART_OPTIONS"
        style="width: 1080px; height: 720px;"/>
    <p v-else>No data yet. Start monitoring to see the chart.</p>
  </Card>

  <Card
      v-for="symbol in market.marketBasket"
      :key="symbol"
      :title="`Market Data [${symbol.toUpperCase()}]`">
    <Table
        :items="market.trades[symbol] || []"
        :fields="TRADE_FIELDS"
        :columns="TRADE_COLUMNS"/>
  </Card>
</template>

<style scoped>
</style>
