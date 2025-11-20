export const CHART_OPTIONS = {
    responsive: false,
    animation: false,
    maintainAspectRatio: true,
    scales: {
        x: {
            type: "category",
            ticks: {
                autoSkip: true,
                maxTicksLimit: 10
            }
        },
        y: {
            type: 'logarithmic',
            position: 'left',
            stack: "demo",
            stackWeight: 10
        }
    },
    plugins: {
        legend: {
            position: 'top'
        },
        title: {
            display: true,
            text: "Binance Market Data"
        }
    }
};