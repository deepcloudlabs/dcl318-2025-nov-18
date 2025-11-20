const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const WebSocket = require('ws');

const port = 5555;

const connectionUrl = 'mongodb://127.0.0.1:27017/tradedb';

async function main() {
    try {
        await mongoose.connect(connectionUrl);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }

    const tradeSchema = new mongoose.Schema({
        symbol: String,
        price: String,
        quantity: String,
        timestamp: Number
    });

    const Trade = mongoose.model('Trade', tradeSchema, 'trades');

    const app = express();
    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: '*', // adjust in production
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    server.listen(port, () => {
        console.log(`HTTP/Socket.IO server listening on http://localhost:${port}`);
    });

    const binanceUrl = 'wss://stream.binance.com:9443/ws/btcusdt@trade';
    const ws = new WebSocket(binanceUrl);

    ws.on('open', () => {
        console.log('Connected to Binance trade stream');
    });

    ws.on('message', async (data) => {
        try {
            const frame = JSON.parse(data);
            //console.log(frame);
            const model = {
                symbol: frame.s,
                price: frame.p,
                volume: Number(frame.p) * Number(frame.q),
                quantity: frame.q,
                timestamp: frame.E,
                datetime: new Date(frame.E)
            };

            const trade = new Trade(model);
            await trade.save();

            io.emit('ticker', model);
        } catch (err) {
            console.error('Error processing trade frame:', err);
        }
    });

    ws.on('error', (err) => {
        console.error('Binance WS error:', err);
    });

    ws.on('close', () => {
        console.log('Binance WS connection closed');
    });
}

// start app
main().then(()=>{
    console.log('Application is up and running!');
});
