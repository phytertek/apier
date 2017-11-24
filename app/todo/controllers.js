const Todo = require('../database').Todo;
const {
  setUserAdminForRoutes,
  generateRouteList,
  removeUserAdminForRoutes
} = require('../services').Auth;
const { requireFields } = require('../common/validation');
const {
  objectFromExistingFields: existing,
  dbDocumentUpdateFromExistingFields: updateIfExists
} = require('../common/utils');
const { sendUserError, throwError } = require('../common/errors');

const todoUserAdminRoutes = id =>
  generateRouteList(['POST', 'DELETE'], `/todo/t/${id}`);
module.exports = {
  getAllTodos: async (req, res) => {
    try {
      const todos = await Todo.find({ owner: req.safeUser._id });
      res.json(todos);
    } catch (error) {
      sendUserError(error, res);
    }
  },
  updateTodoById: async (req, res) => {
    try {
      const _id = req.params.id;
      const { title, body, stage, complete } = req.body;
      const todo = await Todo.findOne({ _id });
      if (!!!todo) throwError('Todo does not exist');
      const updatedTodo = updateIfExists(todo, {
        title,
        body,
        stage,
        complete
      });
      await updatedTodo.save();
      res.json('Success');
    } catch (error) {
      sendUserError(error, res);
    }
  },
  deleteTodoById: async (req, res) => {
    try {
      const _id = req.params.id;
      const todo = await Todo.findOne({ _id }).populate('owner');
      const user = todo.owner;
      await removeUserAdminForRoutes(user, todoUserAdminRoutes(_id)).save();
      await Todo.findOneAndRemove({ _id });
      res.json('Success');
    } catch (error) {
      sendUserError(error, res);
    }
  },
  getTodoById: async (req, res) => {
    try {
      const _id = req.params.id;
      const todo = await Todo.findOne({ _id });
      if (!!!todo) throwError('Todo not found');
      res.json(todo);
    } catch (error) {
      sendUserError(error, res);
    }
  },
  postNewTodo: async (req, res) => {
    try {
      const user = req.unsafeUser;
      const { title, body, stage, complete } = req.body;
      requireFields({ title, body });
      const newTodoFromReq = existing({
        owner: user._id,
        title,
        body,
        stage,
        complete
      });
      const newTodo = await new Todo(newTodoFromReq).save();
      await setUserAdminForRoutes(
        user,
        todoUserAdminRoutes(newTodo._id)
      ).save();
      res.json(newTodo);
    } catch (error) {
      sendUserError(error, res);
    }
  }
};
