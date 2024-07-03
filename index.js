const express = require('express');
const cors = require('cors');
const app = express();
const data = require('./db.json');

app.use(cors());  // Adicione esta linha para habilitar CORS

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/ingredientes', (req, res) => {
    res.json(data.ingredientes);
});

app.get('/burgers', (req, res) => {
    res.json(data.burgers);
});

app.get('/status', (req, res) => {
    res.json(data.status);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
