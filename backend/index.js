const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 8000;
const file_data = "data.json";

app.use(cors());
app.use(express.json());

app.get('/todos', (req, res) => {
    const data = JSON.parse(fs.readFileSync(file_data));
    res.json(data);
});

app.post('/todos', (req, res) => {
    const { title } = req.body;
    const data = JSON.parse(fs.readFileSync(file_data));
    const newtodo = {
        id: Date.now(),
        title,
        completed: false
    };
    data.push(newtodo);
    fs.writeFileSync(file_data, JSON.stringify(data, null, 2));
    res.status(201).json({ message: "Todo created successfully", todo: newtodo });
});

app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let data = JSON.parse(fs.readFileSync(file_data));
    const newdata = data.filter((todo) => todo.id !== id);
    if (newdata.length === data.length) {
        return res.status(404).json({ message: "Todo not found" });
    }
    fs.writeFileSync(file_data, JSON.stringify(newdata, null, 2));
    res.json({ message: "Todo deleted successfully" });
});

app.put('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let data = JSON.parse(fs.readFileSync(file_data));
    const index = data.findIndex((todo) => todo.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Todo not found" });
    }
    const newTodo = {
        id: id,
        title: req.body.title,
        completed: req.body.completed
    };
    data[index] = newTodo;
    fs.writeFileSync(file_data, JSON.stringify(data, null, 2));
    res.json({ message: "Todo updated successfully" });
});

if (!fs.existsSync(file_data)) {
    fs.writeFileSync(file_data, JSON.stringify([]));
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
