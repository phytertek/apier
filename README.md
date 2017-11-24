# Apier

> #### é-pí-áy-ə́r
>
> > #### A term coined by my wife while I was working too late one evening
> >
> > "Stop working on that d@m# api-er-thing and get some sleep!" - Jen
> >
> > > A Declarative component based API starter

> The goal of this project is to create a solid baseline api server based on
> node, express, and mongo with json web token authentication which allows new
> components to be dropped in with very minimal boilerplate and lends itself to
> self-documentation by centralized declaration of component schema, routes, and
> services

## Architecture

> > Components are composed of:
> >
> > * routes (exported, declared in global app)
> > * controller (route controllers)
> > * services (exported, declared in global app)
> > * schema (exported, declared in the global app)
> > * utils (methods used internally by the component)
> > * tests

---

> ### Structure

    |-appConfig.js           // App wide configuration
    |-app
      |-index.js             // Starts all required services
      |-server
        |-index.js           // Inits express, adds middleware, builds routes supplied to appConfig
        |-utils
          |-buildRoutes.js   // utility for parsing appConfig and building declared routes
        |-middleware
          |-bodyParser.js    // applies bodyParser
          |-cors.js          // applies cors
          |-expressDevice.js // collects device/IP info from client requests
          |-helmet.js        // obfuscates server response headers
          |-morgan.js        // applies logging package
      |-database
        |-index.js           // Inits mongoose, builds models supplied to appConfig, connects db
        |-utils
          |-index.js         // exports common utilities for building schema
          |-buildModel.js    // utility for parsing appConfig and combining schema
          |-buildDB.js       // utility for generating the DB models supplied by buildModel utility
      |-common
        |-errors.js          // error response utilities
        |-logger.js          // logging utilities
        |-timeDate.js        // time/date utilities (moment.js)
        |-utils.js           // miscellaneous utilities
        |-validation.js      // input validation
      |-auth
        |-controllers.js     // route controllers for authentication component
        |-routes.js          // exports authentication routes
        |-services.js        // exports authentication services { authorizeRoute, decodeToken }
        |-schema.js          // exports authentication user schema slice w/ hooks and methods
        |-utils
          |-index.js         // miscellaneous internal auth utilities
          |-jwt.js           // jwt utility functions { encrypt, decrypt }
          |-bcrypt.js        // bcrypt utility functions { hashPassword, comparePassword }
      |-user
        |-controllers.js     // route controllers for user component
        |-routes.js          // exports user routes
        |-schema.js          // exports user schema slice

---

> ### Base API Routes

    |- '/'
      |- '/auth'
        |- POST '/register' - accepts body{ username, password, firstName, lastName, email },
                              returns jwt auth token
        |- POST '/update'   - accepts header 'Authorization: {token}' and
                              body{ username, password }, returns "Success" message
        |- POST '/login'    - accepts body{ username, password}, returns jwt auth token
        |- GET '/logout'    - accepts header 'Authorization: {token}', returns success status

      |- '/admin'           - all routes require authorization, accept header 'Authorization: {token}'
        |- POST '/makeSystemAdmin'
                            - Single execution at app inception, sets only first System Admin user for application,
                              will not work after there is an existing System Admin, returns 'Success' message
        |- POST '/add-route-admin'
                            - requires admin authorization (System Admin or Route Admin), accepts
                              body{ User._id, route}, returns 'Success' message

      |- '/user'            - all routes require authorization, accept header 'Authorization: {token}'
        |- POST '/update'   - accepts body{ firstName, lastName, email }, returns updated user
        |- GET '/get'       - requires admin authorization (System Admin or Route Admin), returns all users
        |- GET '/current'   - returns current logged in user { email, firstName, lastName }

---

## Usage

> ### Starting the dev environment

1. create a data directory in the project root directory
2. start the dev db: $ `npm run start:devdb`
3. start the dev server: $ `npm run start:dev`

> ### Creating components (with cli utility)

1. from the root directory of the apier project, run: $ `create-apier-component`
2. name your component when prompted
3. select the component's features (Schema, Routes, Services) when prompted
4. after the prompts, your component folder, files, and appConfig.js entries
   will be scaffolded for you.
5. if your component will require internal (not shared) utilities, put them in a
   utils directory in your component directory

> ### Creating components (without cli utility)

1. create a new directory for your component in the app directory
2. if your component will add to the existing app database schema, create a
   schema.js file in your component directory (see instructions below for
   expected format)
3. if your component will add routes, add a routes.js and a controllers.js file
   to your component directory (see instructions below for expected format)
4. if your component will add services (functions used by other components), add
   a services.js file to your component directory (see instructions below for
   expected format)
5. if your component will require internal (not shared) utilities, put them in a
   utils directory in your component directory

> ### Declare new component in app

1. in the appConfig.js file in the project root directory, add your component as
   a new property: object to the Components object (use the same name that you
   used for your component folder). Add Schema, Services, and Routes properties
   as required by your component

---

## Example

> ### Create Todo Component

> > app/todo/schema.js

```js
const { Types } = require('../database/utils');
module.exports = {
  Todo: {
    Schema: {
      title: {
        type: String,
        required: true
      },
      body: {
        type: String,
        required: true
      },
      owner: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
      },
      complete: {
        type: Boolean,
        default: false
      },
      stage: {
        type: String,
        enum: {
          values: [
            'Not Started',
            'Started',
            'Blocked',
            'Under Review',
            'Testing',
            'Complete'
          ],
          message: '{VALUE} is not a valid value for {PATH}'
        },
        default: 'Not Started'
      }
    }
  }
};
```

> > app/todo/routes.js

```js
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
```

> > app/todo/controllers.js

```js
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
```

> ### Declare Todo Component in App

> > appConfig.js

```js
module.exports = {
  // App Components
  Components: {
    // Adding todo component
    Todo: {
      Schema: {
        Todo: `{
          title: {
            type: String,
            required: true
          },
          body: {
            type: String,
            required: true
          },
          owner: {
            type: Types.ObjectId,
            ref: 'User',
            required: true
          },
          complete: {
            type: Boolean,
            default: false
          },
          stage: {
            type: String,
            enum: {
              values: [
                'Not Started',
                'Started',
                'Blocked',
                'Under Review',
                'Testing',
                'Complete'
              ]
            },
            default: 'Not Started'
          }
        }`
      },
      Routes: {
        '/todo': [
          'POST /todo/t/new - *auth - create new todo',
          'POST /todo/t/:id - *auth *admin - update todo by id',
          'GET /todo/t/all - *auth - get all todos owned by authorized user',
          'GET /todo/t/:id - *auth - get todo by id',
          'DELETE /todo/t:id - *auth *admin - delete todo by id'
        ]
      }
    },
    // Todo component added
    Auth: {
      Schema: 'authentication user schema',
      Services: 'authenticatedRoute and decodeToken',
      Routes: {
        '/auth': [
          'POST /register - new user registration',
          'POST /update - username and password update',
          'POST /login - user login',
          'GET /logout - user logout'
        ],
        '/admin': [
          'POST /makeSystemAdmin - create first System Admin',
          'POST /add-admin-route - add user as a Route Admin'
        ]
      }
    },
    User: {
      Schema: 'base user schema',
      Routes: {
        '/user': [
          "GET /all - returns all user's",
          'GET /one - returns a user by query params',
          'GET /current - returns currently logged in user'
        ]
      }
    }
  },
  // App Configuration
  Config: {
    Name: process.env.NAME || 'Apier',
    Host: process.env.HOST || 'http://localhost',
    Port: process.env.PORT || 3333,
    DatabaseName: process.env.DBNAME || 'Apier Dev DB',
    DatabaseURI: process.env.DB_URI || 'mongodb://localhost/apier-dev',
    JWTSecret: process.env.JWT_SECRET || 'a super secure JWT secret',
    BcryptCost: process.env.BCRYPT_COST || 11
  }
};
```
