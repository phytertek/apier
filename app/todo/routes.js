const {
  getAllTodos,
  getTodoById,
  postNewTodo,
  updateTodoById,
  deleteTodoById
} = require('./controllers');
const { authorizeRoute, authorizeAdminRoute } = require('../services').Auth;

module.exports = {
  '/todo': {
    middleware: authorizeRoute,
    get: {
      '/t/all': getAllTodos,
      '/t/:id': getTodoById
    },
    post: {
      '/t/new': postNewTodo,
      '/t/:id': [authorizeAdminRoute, updateTodoById]
    },
    delete: {
      '/t/:id': [authorizeAdminRoute, deleteTodoById]
    }
  }
};
