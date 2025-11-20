export const CHART_OPTIONS = {
    responsive: false,
    animation: false,
    maintainAspectRatio: true,
    scales: {
        y: {
            type: 'linear',
            position: 'left',
            stack: "demo",
            stackWeight: 2
        }
    },
    plugins: {
        legend: {
            position: 'top'
        },
        title: {
            display: true,
            text: "Binance BTCUSDT Market Data"
        }
    }
};