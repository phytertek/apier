module.exports = {
  // App Components
  Components: {
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
    Auth: {
      Schema: 'authentication user schema',
      Services: 'authenticatedRoute and decodeToken',
      Routes: {
        '/auth': [
          'POST /register - new user registration',
          'POST /update - username and password update',
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
    Level: process.env.NODE_ENV || 'development',
    Name: process.env.NAME || 'Apier',
    Host: process.env.HOST || 'http://localhost',
    Port: process.env.PORT || 3333,
    DatabaseName: process.env.DBNAME || 'Apier Dev DB @ mLab',
    DatabaseURI:
      process.env.DB_URI ||
      'mongodb://student:student@ds147544.mlab.com:47544/lambda-projects', //'mongodb://localhost/apier-dev',
    JWTSecret: process.env.JWT_SECRET || 'a super secure JWT secret',
    BcryptCost: process.env.BCRYPT_COST || 11
  }
};
