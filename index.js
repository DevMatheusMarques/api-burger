const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
let data = require('./db.json');

app.use(cors());
app.use(express.json());

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

app.post('/ingredientes', (req, res) => {
    const newIngrediente = req.body;
    data.ingredientes.push(newIngrediente);
    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.status(201).json(newIngrediente);
    });
});

app.post('/burgers', (req, res) => {
    const { nome, carne, pao, opcionais, status } = req.body;
    const id = data.burgers.length ? data.burgers[data.burgers.length - 1].id + 1 : 1;

    const newBurger = {
        id,
        nome,
        carne,
        pao,
        opcionais,
        status
    };

    data.burgers.push(newBurger);
    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.status(201).json(newBurger);
    });
});

app.post('/status', (req, res) => {
    const newStatus = req.body;
    data.status.push(newStatus);
    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.status(201).json(newStatus);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
