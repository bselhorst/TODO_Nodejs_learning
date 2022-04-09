const express = require('express');
const { json } = require('express/lib/response');
const { v4: uuidv4 } = require("uuid");
const app = express();
app.use(express.json());

const users = [];

//MIDDLEWARE
function usernameVerification(request, response, next) {
    const { username } = request.headers;
    user = users.find(user => user.username === username);

    if (!user) {
        return response.json({ error: "Username not found!" });
    }

    request.user = user;

    return next();
}

function todoVerification(request, response, next) {
    const { username } = request.headers;
    const { id } = request.params;
    user = users.find(user => user.username === username);
    todo = user.todos.find(todo => todo.id === id);
    if (!todo) {
        return response.status(400).json({ error: "TODO not found!" });
    }
    request.user = user;
    request.todo = todo;

    return next();
}
//END OF MIDDLEWARES

app.get('/', (request, response) => {
    return response.json({ message: "HelloWorld" });
});

app.get("/users", (request, response) => {
    return response.json(users);
});

app.post("/users", (request, response) => {
    const { name, username } = request.body;

    user = users.some(user => user.username === username);
    if (user) {
        return response.status(400).json({ error: "Username already exists!" });
    }

    users.push({
        uuid: uuidv4(),
        name,
        username,
        todos: [],
        created_at: new Date(),
    });
    return response.status(200).send();
});

app.get("/todos", usernameVerification, (request, response) => {
    const { user } = request;
    return response.json(user.todos);
});

app.post("/todos", usernameVerification, (request, response) => {
    const { user } = request;
    const { title, description } = request.body;
    user.todos.push({
        id: uuidv4(),
        title,
        description,
        done: false,
        created_at: new Date()
    });

    return response.status(200).json({ error: "TODO created!" });
});

app.put("/todos/:id", todoVerification, (request, response) => {
    const { todo } = request;
    const { title, description } = request.body;
    todo.title = title;
    todo.description = description;

    return response.status(200).json(todo);
});

app.delete("/todos/:id", todoVerification, (request, response) => {
    const { user, todo } = request;

    user.todos = user.todos.filter(function (item) {
        return item !== todo;
    });
    return response.status(204).send();
});

app.patch("/todos/:id", todoVerification, (request, response) => {
    const { todo } = request;
    todo.done = !todo.done;

    return response.status(201).send();
});

app.listen(3333);