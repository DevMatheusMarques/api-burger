const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
let data = require('./db.json');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = 'api_burgers_key'; // Use uma chave secreta forte

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

function authorizeRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: insufficient role' });
        }
        next();
    };
}

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// GET endpoints

// app.get('/ingredients', authenticateToken, authorizeRole('admin', 'waiter'), (req, res) => {
//     res.json(data.ingredients);
// });

app.get('/ingredients', authenticateToken, authorizeRole('admin', 'waiter'), (req, res) => {
    res.json(data.ingredients);
});

app.get('/burgers', (req, res) => {
    res.json(data.burgers);
});

app.get('/requests', (req, res) => {
    res.json(data.requests);
});

app.get('/status', authenticateToken, authorizeRole('admin', 'waiter'), (req, res) => {
    res.json(data.status);
});

app.get('/users', (req, res) => {
    res.json(data.users);
});

// POST endpoints
app.post('/ingredients', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { tipo, quantidade, categoria } = req.body;
    const id = data.ingredients.length ? data.ingredients[data.ingredients.length - 1].id + 1 : 1;

    const newIngredient = {
        id,
        tipo,
        quantidade,
        categoria
    };

    data.ingredients.push(newIngredient);
    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.status(201).json(newIngredient);
    });
});

app.post('/burgers', authenticateToken, authorizeRole('admin', 'waiter'), (req, res) => {
    const { nome, descricao, preco } = req.body;
    const id = data.burgers.length ? data.burgers[data.burgers.length - 1].id + 1 : 1;

    const newBurger = {
        id,
        nome,
        descricao,
        preco
    };

    data.burgers.push(newBurger);

    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.status(201).json(newBurger);
    });
});

app.post('/requests', authenticateToken, authorizeRole('admin', 'waiter'), (req, res) => {
    const { nome, pao, carne, opcionais, status, dataHora } = req.body;
    const id = data.requests.length ? data.requests[data.requests.length - 1].id + 1 : 1;

    const newRequest = {
        id,
        nome,
        carne,
        pao,
        opcionais,
        status,
        dataHora
    };

    data.requests.push(newRequest);

    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.status(201).json(newRequest);
    });
});

app.post('/status', authenticateToken, authorizeRole('admin'), (req, res) => {
    const newStatus = req.body;
    data.status.push(newStatus);
    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.status(201).json(newStatus);
    });
});

// Registro de Usuário
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const existingUser = data.users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = data.users.length ? data.users[data.users.length - 1].id + 1 : 1;

    const newUser = { id, username, password: hashedPassword, role };
    data.users.push(newUser);

    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.status(201).json(newUser);
    });
});


// Login de Usuário
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = data.users.find(user => user.username === username);
    if (!user) return res.sendStatus(400);

    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (!isMatch) return res.sendStatus(403);

        const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY);
        res.json({ token });
    });
});


// PUT endpoints
app.put('/ingredients/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { id } = req.params;
    const updatedIngredients = req.body;

    const index = data.ingredients.findIndex(i => i.id == id);
    if (index === -1) {
        return res.status(404).json({ error: 'Ingredients not found' });
    }

    data.ingredients[index] = { ...data.ingredients[index], ...updatedIngredients };

    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.json(data.ingredients[index]);
    });
});

app.put('/burgers/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { id } = req.params;
    const updatedBurger = req.body;

    const index = data.burgers.findIndex(b => b.id == id);
    if (index === -1) {
        return res.status(404).json({ error: 'Burger not found' });
    }

    data.burgers[index] = { ...data.burgers[index], ...updatedBurger };

    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.json(data.burgers[index]);
    });
});

app.put('/requests/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { id } = req.params;
    const updatedRequest = req.body;

    const index = data.requests.findIndex(b => b.id == id);
    if (index === -1) {
        return res.status(404).json({ error: 'Request not found' });
    }

    data.requests[index] = { ...data.requests[index], ...updatedRequest };

    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.json(data.requests[index]);
    });
});

app.put('/status/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { id } = req.params;
    const updatedStatus = req.body;

    const index = data.status.findIndex(s => s.id == id);
    if (index === -1) {
        return res.status(404).json({ error: 'Status not found' });
    }

    data.status[index] = { ...data.status[index], ...updatedStatus };

    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.json(data.status[index]);
    });
});

// DELETE endpoints
app.delete('/ingredients/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { id } = req.params;

    // const index = data.ingredients.categorias[categoria].findIndex(i => i.id == id);
    const index = data.ingredients.findIndex(i => i.id == id);
    if (index === -1) {
        return res.status(404).json({ error: 'Ingredients not found' });
    }

    const deletedIngredient = data.ingredients.splice(index, 1);

    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.json(deletedIngredient);
    });
});

app.delete('/burgers/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { id } = req.params;

    const index = data.burgers.findIndex(b => b.id == id);
    if (index === -1) {
        return res.status(404).json({ error: 'Burger not found' });
    }

    const deletedBurger = data.burgers.splice(index, 1);

    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.json(deletedBurger);
    });
});

app.delete('/requests/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { id } = req.params;

    const index = data.requests.findIndex(b => b.id == id);
    if (index === -1) {
        return res.status(404).json({ error: 'Request not found' });
    }

    const deletedRequest = data.requests.splice(index, 1);

    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.json(deletedRequest);
    });
});

app.delete('/status/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { id } = req.params;

    const index = data.status.findIndex(s => s.id == id);
    if (index === -1) {
        return res.status(404).json({ error: 'Status not found' });
    }

    const deletedStatus = data.status.splice(index, 1);

    fs.writeFile('./db.json', JSON.stringify(data, null, 2), (err) => {
        res.json(deletedStatus);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
