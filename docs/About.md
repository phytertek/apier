## Why does Apier even exist?

> Apier was my attempt at reducing the amount of repitition required for me to
> build full stack apps. For both API and client, the amount of boiler plate I
> found I was creating for every project, which was essentially just copy and
> pasted from previous projects but would also be subject to light refactoring
> in the process... This led to some serious issues when going back to projects
> after long stretches of time, for one there was cognitive effort required to
> parse the code, it being from a previous iteration in my evolution as a
> developer. Secondly it lead to refactoring again... I can't bring myself to
> work on a project of my own making without it being up to my current code
> standards and best practices, right?!?

> I knew this was a huge time suck, I was rarely improving the application
> itself - I was stuck in an ever expanding loop of _maintenance_

---

> It was then that I realized that the type of development _I_ wanted to do --
> working through ideas and problems that haven't been attempted -- creating NEW
> things

> Now I just needed to figure out a way to create a standardized package that
> could give me the platform to solve new problems from... Thus Apier was born.

---

## The development approach to building Apier

> As I intend this will be the basis of many of my API projects going forward, I
> had a few _requirements_ for its architecture in regards to maintainability
> and modularity.

1. Core package must be updateable without disturbing the rest of the app
   * Decouple the core server/db functionality by creating them as independent
     "components" complete with their own startup utilities and the ability to
     find other components which dictate configuration and load them on startup,
     i.e db schema or server routes.
   * Set a central startup point that starts the services in the correct order.
2. Standardized format for additional components' schema, routes, and services
   * {component name} folder (component's root directory)
   * 'utils' folder (_optional_ private component utilities)
   * routes.js file (_optional_ component's server routes)
   * controllers.js file (_optional_ handler functions for component's server
     routes)
   * schema.js file (_optional_ component's database schema with their hooks and
     methods)
   * services.js file (_optional_ component's exported functionality for use by
     other components)
3. Managed component interdependency. **_Planned_**
4. Ability to package components to be easily distributed to and installed in
   other Apier projects **_In Development_**

> I also had a list of _wants_ to create as much stability and versatility to
> ensure I really could abstract it entirely from additional components

* _Server_ - based on Express
  * Standard CORS, Body Parser, Morgan, Helmut, and Express Device middlewares
    applied -- all fully configurable
  * Standard unrecognized route handler
  * Exports all functionality required to define server routes
  * Build utility which parses all components in the project providing routes
    and add them to the server on startup
* _Database_ - based on MongoDB via Mongoose
  * Exports all functionality required to define database schema
  * Build utility which parses all components in the project providing schema
    (including "extensible" schema, i.e two or more components define parts of a
    single model) and builds all models on startup
  * Exports all schema and models from a single location after database
    connection established
* _Services_ - centralized, cross-app, exported component functionality
  * Startup utility which parses all components in te project exporting
    "services"
  * Exports all provided component services from a single location after the
    services are initialized
* _Components_ - Units of closely related functionality for custom application
  pieces
  * All custom components will be scaffolded with the same file and directory
    structure
  * Depending on the functionality, the component can export any combination of
    Routes, Schema, or Services
  * Routes are defined and exported as an object whos properties and values
    describe the route(s) via url labels, middleware, HTTP verbs, and the
    individual controllers which handle the specific routes
  * Controllers are only required when the component has routes to handle and
    are the handler functions for the specific routes defined in the routes
    file. They are defined and exported as an object
  * Schema is defined and exported as an object whos properties can include the
    Schema, Hooks, and Methods of multiple models. Multiple components can
    describe "extensions" of a single db model
  * Services are defined and exported as an object containing whatever
    functionality the component will expose to the rest of the application.
    Service functions are initialized _after_ the database is connected, as such
    they have full access to the database
* _Common Utilities_ - ubiquitus error / validation / other functionality
  * Exposes a centralized repository for standardized utility functions that
    will be commonly required by components such as error handling, validation,
    localization, etc..
  * Functions are grouped as a file which exports a single object containing all
    of the functions in the group.

> This approach of combining rigidly structured and highly standardized
> components allowed for automation of MUCH of the repetitive "boiler plate"
> code needed in a typical node / express / mongo app - the code in the custom
> components needs only describe the schema, route, or service -- the core
> application provides the coupling mechanism to apply the components to the
> application.

---

## The benefits of using Apier

> The biggest benefit to using Apier is the reduced cognitive effort required
> during API development. I've found that it is far easier to reason through
> complex requirements by using the component approach for breaking down
> functionality into small reusable pieces. With the rigid component structure,
> I don't have to waste cognitive effort on organization and coupling,
> everything has its place, and every component interacts with the other
> components and the application as a whole in the same way.

> Another benefit is that I generally just write less code now. Without having
> to constantly add repetitive boiler plate, my code serves _my_ purposes, I
> don't have to worry about tying everything together just right to keep the app
> running.

> Using Apier for my recent projects has meant a great boost in productivity
> already, especially with actually prototyping a backend for a client project
> as opposed to mocking it -- the amount of time required to create API
> components is comparable to the amount of time required to generate a mock,
> and has allowed the APIs to be developed organically in tandem with the
> clients they are supporting.
