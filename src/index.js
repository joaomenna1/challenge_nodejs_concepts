const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({
      error: "User not found",
    });
  }

  request.user = user;
  return next();
}

function checkUserExist(username) {
  const userExist = users.find((user) => user.username === username);

  return userExist;
}

function checkExistTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todos = user.todos;

  const todoSelected = todos.find((todo) => todo.id === id);

  if (!todoSelected) {
    return response.status(404).json({
      error: "Todo not find index"
    });
  }

  request.todo = todoSelected;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (checkUserExist(username)) {
    return response.status(400).json({error: "User already exist"})
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, checkExistTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistTodo, (request, response) => {
  const { user, todo } = request;

  const todoIndex = user.todos.findIndex((t) => t.id === todo.id);

  user.todos.splice(todoIndex, 1);

  return response.status(204).json(todo);

});

module.exports = app;