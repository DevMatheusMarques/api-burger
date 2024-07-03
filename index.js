const express = require('express');
const app = express();
const data = require('./db.json');

// Rota para obter ingredientes
app.get('/ingredientes', (req, res) => {
    res.json(data.ingredientes);
});

// Rota para obter burgers
app.get('/burgers', (req, res) => {
    res.json(data.burgers);
});

// Rota para obter status
app.get('/status', (req, res) => {
    res.json(data.status);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
