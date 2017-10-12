# Apier
>>> Declarative component based API starter

> The goal of this project is to create a solid baseline 
> api server based on node, express, and mongo
> with json web token authentication which allows new
> components to be dropped in with very minimal boilerplate and 
> lends itself to self-documentation by centralized declaration 
> of component schema, routes, and services

## Architecture

>> Components are composed of:
>> * routes (exported, declared in global app)
>> * controller (route controllers)
>> * services (exported, declared in global app)
>> * schema (exported, declared in the global app)
>> * utils (methods used internally by the component)
>> * tests
***
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
        |-test                           
      |-database
        |-index.js           // Inits mongoose, builds models supplied to appConfig, connects db
        |-utils
          |-index.js         // exports common utilities for building schema
          |-buildModel.js    // utility for parsing appConfig and combining schema
          |-buildDB.js       // utility for generating the DB models supplied by buildModel utility
        |-tests                           
      |-common
        |-errors.js          // error response utilities
        |-utils.js           // other common utilities
        |-validation.js      // input validation
        |-tests                         
      |-auth
        |-controllers.js     // route controllers for authentication component
        |-routes.js          // exports authentication routes 
        |-services.js        // exports authentication services { authorizeRoute, decodeToken }
        |-schema.js          // exports authentication user schema slice w/ hooks and methods
        |-utils
          |-jwt.js           // jwt utility functions { encrypt, decrypt }
          |-bcrypt.js        // bcrypt utility functions { hashPassword, comparePassword }
        |-tests                        
      |-user
        |-controllers.js     // route controllers for user component
        |-routes.js          // exports user routes
        |-schema.js          // exports user schema slice
        |-tests                             
***
> ### Base API Routes
    |- '/'
      |- '/auth'
        |- POST '/register' - accepts req.body{ username, password, firstName, lastName, email },
                              returns jwt auth token
        |- PATCH '/update'  - accepts header 'Authorization: {token}' and 
                              req.body{ username, password }
        |- POST '/login'    - accepts req.body{ username, password}, returns jwt auth token
        |- HEAD '/logout'   - accepts header 'Authorization: {token}', returns success status
      |- '/user'            - all routes require authorization,
                              accept header 'Authorization: {token}'
        |- PATCH '/update'  - accepts req.body{ firstName, lastName, email }, returns updated user
        |- GET '/get-all'   - returns all users
***

## Usage

>### Starting the dev environment
  1. create a data directory in the project root directory
  2. start the dev db: $ `npm run start:devdb`
  3. start the dev server: $ `npm run start:dev`

>### Creating components
  1. create a new directory for your component in the app directory
  2. if your component will add to the existing app database schema,
     create a schema.js file in your component directory (see instructions
     below for expected format)
  3. if your component will add routes, add a routes.js and a controllers.js
     file to your component directory (see instructions below for expected 
     format)
  4. if your component will add services (functions used by other components),
     add a services.js file to your component directory (see instructions
     below for expected format)
  5. if your component will require internal (not shared) utilities,
     put them in a utils directory in your component directory 

>### Declare new component in app
  1. in the appConfig.js file in the project root directory, add your component as
     a new property: object to the Components object (use the same name that you used 
     for your component folder).  Add Schema, Services, and Routes properties as required
     by your component

***

## Example

>### Create Todo Component

>> app/todo/schema.js
``` js
const { Types } = require('../database/utils')
module.exports = {
  Todo: {                       // declares the model 'name'
    Schema: {                   // declares the schema for the model
      title: {
        type: String,
        required: true
      },
      body: {
        type: String
      },
      owner: {                  // example of referencing another model type
        type: Types.ObjectId,
        ref: 'User'
      }
    },
    Hooks: (Todo) => {          // declares the hooks on the model
      Todo.pre('save', function() {
        const todo = this
        console.log('Doing something to the todo before save', todo)
      })
    },
    Methods: (Todo) => {        // declares the methods on the model
      Todo.methods.exampleMethod = function () {
        const todo = this
        console.log('A builtin todo method here', todo)
      }
    }
  }
}
```
>> app/todo/routes.js
``` js
const { createTodo, updateTodo, deleteTodo, getTodos } = require('./controllers.js')
const { authorizeRoute } = require('../services').Auth  // example of adding declared services

module.exports = {
  '/todo': {                        // declares the 'root' of the routes
    middleware: [authorizedRoute]   // declare any middleware that runs on the 'root' (optional)
    post: {                         // POST routes
      '/create': createTodo,        // declares a route with a controller method
      '/update': updateTodo
    },
    get: {
      '/get-todos': [otherMiddleware, getTodos]     // example of adding middleware on the 'route'
    },
    delete: {
      '/delete': deleteTodo
    }
  }
}
``` 
>> app/todo/controllers.js
``` js
const Todo = require('../database').Todo
const { decode } = require('../services').Auth
const { requireFields } = require('../common/validation')
const { sendUserError, throwError } = require('../common/errors')
const { 
  dbDocumentUpdateFromExistingFields: updateIfExists
} = require('../common/utils')

module.exports = {
  createTodo: async (req, res) => {
    try {
      const token = req.get('Authorization')
      const { title, body } = req.body
      const { _id: owner } = await decode(token)
      requireFields({ title })
      const todo = new Todo({ title, body, owner })
      await todo.save()
      res.json(todo)
    } catch (error) {
      sendUserError(error, res)
    }
  },
  updateTodo: async (req, res) => {
    try {
      const { id, title, body } = req.body
      requireFields({ id, title });
      const todo = await Todo.findById(id)
      const updatedTodo = await updateIfExists({ title, body }).save()
      res.json(updatedTodo);
    } catch (error) {
      sendUserError(error, res)
    }
  },
  deleteTodo: async (req, res) => {
    try {
      const { id } = req.body
      requireFields({ id })
      await Todo.findByIdAndRemove(id)
      res.json({ success: true })
    } catch (error) {
      sendUserError(error, res)
    }
  },
  getTodos: async (req, res) => {
    try {
      const todos = await Todo.find()
      res.json(todos)
    } catch (error) {
      sendUserError(error, res)
    }
  }
}
```
>> app/todo/services.js
``` js
module.exports = {
  aTodoService: (someInput) => {
    console.log('Todo service ran with', someInput)
  }
}
```

>### Declare Todo Component in App

>> appConfig.js
``` js
module.exports = {
  // App Components
  Components: {
    // Adding todo component
    Todo: {
      Schema: 'todo schema', // preferably set the properties to some description, anything can go here as long as it's not null
      Services:  'todo services',
      Routes: 'todo routes'
    }
    // Todo component added
    Auth: {
      Schema: 'authentication user schema',
      Services: 'authenticatedRoute and decodeToken',
      Routes: {       // example of describing with an object, the parser only checks if the property is null, so anything goes 
        '/auth': [
          'POST /register - new user registration',
          'POST /login - user login',
          'GET /logout - user logout'
        ]
      }
    },
    User: {
      Schema: 'base user schema',
      Routes: {
        '/user': [
          "GET /all - returns all user's",
          'GET /one - returns a user by query params'
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
}
```