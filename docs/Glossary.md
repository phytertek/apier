## **Component**

> Unit of closely related functionality - The intent is for a component to
> describe only what its properties are - boilerplate code is filled in at
> startup - and be able to stand alone with minimal dependency. While components
> _can_ export "services" to one another and thus be come dependent upon one
> another, this is actually an anti pattern and should be avoided via expantion
> of the Common utilities library for the project. A future feature will be for
> common utilities to be a form of dependency management once a component
> exchange is established.

---

## **Standard components**

> Core components included when a new project is created -- _may_ not adhere to
> the standardized component file and directory structure

* _Server_ - a self contained express app that loads specified middleware,
  parses the app configuration for components exporting routes then fills in the
  boilerplate and adds them to the app, then error handles all unspecified
  routes, and finally starts the express app on the port specified in the
  configuration or env variable
* _Database_ - a self contained mongoose connection app which starts by
  initiating a new instance of the mongoose ORM, parses the app configuration
  for components exporting schema then fills in the boilerplate and creates the
  models, then connects to the mongo db via the URI specified in the app
  configuration, and lastly exports the built db model.
* _Services_ - a simple utility that parses the app config for components
  exporting services and initializes then exports them all from a single
  location
* _Common_ - an ever expanding / evolving component of the project that contains
  and exports common functionality used by multiple components
  * Error handling
  * Validation
  * Logging
  * Localization

---

## **Custom components**

> Components added to the project beyond the core Standard components. Adheres
> to the standardized file / directory structure to ensure they are parsed
> correctly!

> ## **`componentDirectory`**
>
> > ## **`schema.js`**
> >
> > * Included **if** the component will add any schema to the database model
> >
> > - is the most limited of all component parts as it only has access to the
> >   component's private utilities and common utilities. Component services are
> >   not initialized until after the database model is built.
> > - can import mongoose specific "types" from the database's utilities export
> > - the schema export is structured in the following format

```js
// app/componentName/schema.js

const { validateEmail } = require('../common/validation');
const { Types } = require('../database/utils');
const { componentUtility } = require('./utils');

module.exports = {
  // Name of schema(s) in capitalized camel case - file may contain multiple schemas
  ComponentSchema : {
    // Describe the schema here
    Schema: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: value => validateEmail(value),
          message: '{VALUE} is not a valid email address'
        }
      },
      greeting: {
        type: String
      }
    },
    // Define hooks for schema
    Hooks: Schema => {
      Schema.pre('save' => async function (next) {
        try {
          const componentSchemaRecord = this;
          // Example - if name field is updated, update the stored greeting
          if (componentSchemaRecord.isModified('name')) {
            componentSchemaRecord.greeting = `Hi my name is ${componentSchemaRecord.name}`;
          }

          // go to next function
          next();
        } catch (error) {
          throw new Error(error);
        }
      })
    },
    // Define custom schema methods
    Methods: Schema => {
      Schema.methods.returnIntroString = async function() {
        try {
          const componentSchemaRecord = this;
          // Example - return a string constructed from the record's values
          return `${componentSchemaRecord.greeting}. My email address is ${componentSchemaRecord.email}. I hope to hear from you soon, thanks!`
        } catch (error) {
          throw new Error(error);
        }
      }
    }
  }
}
```

> > ## **`routes.js`**
> >
> > * Included **if** the component will add any routes to the server
> >   application
> >
> > - will be paired with a seperate `controllers.js` file which contains the
> >   route handler functions
> > - in addition to its controllers, it can import any route middlewares
> >   provided via common utilities or component services -- middleware is
> >   applied in the order they are declared in the array
> > - supports HEAD, GET, PATCH, PUT, POST, and DELETE verbs
> > - the route export is structured in the following format

```js
// app/componentName/routes.js

const {
  getComponentNameById,
  createComponentName,
  updateComponentName,
  deleteComponentNameById,
  miscellaneousRouteFunction,
  rootFunction,
  rootSubRouteFunction
} = require('./controller');

const {
  middlewareFunction,
  anotherMiddleware
} = require('../common/middlwareProvider');

module.exports = {
  // Root of the route
  '/componentRootRoute1': {
    // middleware applied to all sub routes under this root route
    middleware: [middlewareFunction],
    // HTTP verb
    get: {
      // http://hostname.com/componentRootRoute1/get/:id
      '/get/:id': getComponentNameById
    },
    post: {
      // http://hostname.com/componentRootRoute1/post/new
      '/post/new': createComponentName,
      // http://hostname.com/componentRootRoute2/post/update
      '/post/update': updateComponentName
    },
    delete: {
      // http://hostname.com/componentRootRoute2/delete/:id
      '/delete/:id': deleteComponentNameById
    }
  },
  // Multiple root routes can be defined
  '/componentRootRoute2': {
    post: {
      // middleware applied to a single sub route
      // http://hostname.com/componentRootRoute2/miscellaneous
      '/miscellaneous': [anotherMiddleware, miscellaneousRouteFunction]
    }
  },
  // Absolute root route and absolute root sub routes can be defined as well
  '/': {
    get: {
      // Absolute root route -- !!! Can Only Be Declared Once, will be overwritten if declared in multiple components with no gaurantee on the order components are loaded
      // http://hostname.com/
      '/': rootFunction,
      // Root sub route -- can be declared in multiple components as long as they are not duplicated
      // http://hostname.com/rootSubRoute
      '/rootSubRoute': rootSubRouteFunction
    }
  }
};
```

> > ## **`controllers.js`**
> >
> > * Included **if** the component will add any routes to the server
> >   application
> >
> > - will be paired with `routes.js` file which declares the routes to be
> >   handled by the component
> > - has access to all common utilities, all component services, and all db
> >   models
> > - use of async / await syntax highly encouraged
> > - exports an object defining the async req/res handlers used in the routes,
> >   formatted as follows

```js
// app/componentName/controllers.js
const ComponentSchema = require('../database').ComponentSchema;
const { requireFields } = require('../common/validation');
const { sendErrorResponse } = require('../common/errors');
const { logger } = require('../common/logger');

module.exports = {
  rootFunction: async (req, res) => {
    // use try / catch to handle promise errors with async / await
    try: {
      // do stuff here
    } catch (error) {
      logger.error(error)
      sendErrorResponse(error, res)
    }
  },
  rootSubRouteFunction: async (req, res) => {
    try: {
      // do stuff here
      res.json({ success: true })
    } catch (error) {
      sendErrorResponse(error, res)
    }
  },
  getComponentNameById: async (req,res) => {
    try {
      // get params from request url
      const { id } = req.params;
      // handle async database transactions with async / await syntax
      const componentRecord = await ComponentSchema.findOne({ _id: id });
      res.json({ componentRecord });
    } catch (error) {
      sendErrorResponse(error, res)
    }
  },
  createComponentName: async (req,res) => {...},
  updateComponentName: async (req,res) => {...},
  deleteComponentNameById: async (req,res) => {...},
  miscellaneousRouteFunction: async (req,res) => {...},
};
```

> > ## **`services.js`**
> >
> > * Included **if** the component exports functionality for use by other
> >   components
> >
> > - has access to all common utilities, all component services, and all db
> >   models
> > - exports an object containing the functions the component will make
> >   available to other components

```js
// app/componentName/services.js
const ComponentSchema = require('../database').ComponentSchema;
const { requireFields } = require('../common/validation');
const { sendUserError } = requier('../common/errors');

module.exports = {
  // Example - route middleware
  componentMiddlewareService: async (req, res, next) => {
    try {
      const headerValue = req.get('headerValue');
      requireFields({ headerValue });
      req.componentRecords = await ComponentSchema.find({
        name: { $in: headerValue.split(':') }
      });
      next();
    } catch (error) {
      sendUserError(error, res);
    }
  }
};
```

---
