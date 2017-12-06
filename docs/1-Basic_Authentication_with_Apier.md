# Basic Authentication with Apier

**Note: You will need to use a tool such as curl or postman to make requests to
the server**

---

> Apier comes with Auth and User components installed "out of the box".

> At its core, the Auth component provides everything neccessary to provide
> basic, user level JWT route authentication
>
> * It defines the 'email', 'password', and 'activeTokens' fields for the User
>   schema
> * It defines the 'register', 'login', and 'logout' routes for user creation,
>   token generation, and active token removal
> * It provides authorization middleware (services) for verifying authentication
>   in routes defined by other components

---

## _Starting the development server_

> In the terminal, from the project's root directory run

```
npm run start:dev
```

> This will start your development server

---

## _Making a registration request_

> A registration request is a POST to '{hostname}/auth/register' which includes
> the new user's email address and password(required) and optionally their
> firstName and lastName fields.

> If the request is successful, a new user is created in the database with the
> supplied fields -- the password is hashed using bcrypt prior to the database
> document. A active auth token is also generated and saved with the user, then
> sent in the response body to the client

> An example curl request to a local development server with the default
> settings would look like

```
curl -X POST http://localhost:3000/auth/register
-d '{
  "email": "example@example.com",
  "password": "Horse Castle Desk Rain Basket",
  "firstName": "Testy",
  "lastName": "McTesterson"
}'
```

> A successful response with a new active auth token would look like

```
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YTI2ZTgxOGVjNDEyZjA5NGY2YTlhMTkiLCJlbWFpbCI6ImV4YW1wbGVAZXhhbXBsZS5jb20iLCJpYXQiOjE1MTI0OTkyMjQ1NzR9.1La2CFu-CI71iHxv0ldsXEbGyoGz1kWLmJEY9mqrNpo"
}
```

---

## _Making a login request_

> A login request is a POST to '{hostname}/auth/login' which includes the
> existing user's email address and password.

> When the request is recieved by the server, the provided password is checked
> against the user's saved password hash -- If they match, the server responds
> with a new active auth token, otherwise a failure response is sent.

> An example curl request to a local development server with the default
> settings would look like

```
curl -X POST http://localhost:3000/auth/login
-d '{
  "email": "example@example.com",
  "password": "Horse Castle Desk Rain Basket"
}'
```

> A successful response with a new active auth token would look like

```
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YTI2ZTgxOGVjNDEyZjA5NGY2YTlhMTkiLCJlbWFpbCI6ImV4YW1wbGVAZXhhbXBsZS5jb20iLCJpYXQiOjE1MTI0OTkyMjQ1NzR9.1La2CFu-CI71iHxv0ldsXEbGyoGz1kWLmJEY9mqrNpo"
}
```

---

## _Making a logout request_

> A logout request is a GET to '{hostname}/auth/logout' which includes an
> 'Authorization' header with an active auth token as its value.

> When the request is recieved by the server, the token is removed from the
> user's activeTokens list and is deleted.

> An example curl request to a local development server with the default
> settings would look like

```
curl -X GET http://localhost:3000m/auth/logout
-H 'authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YTI2ZTgxOGVjNDEyZjA5NGY2YTlhMTkiLCJlbWFpbCI6ImV4YW1wbGVAZXhhbXBsZS5jb20iLCJpYXQiOjE1MTI1MDAwNTQ2ODV9.hOxzzwCxHHAIU7-qGCknY6n9RCFNBmYlCPQRxg9-arY'
-d '{
  "email": "example@example.com",
  "password": "Horse Castle Desk Rain Basket"
}'
```

A successful response would look like

```
{
    "success": "User successfully logged out"
}
```

---

### Stay tuned for the next tutorial, [**Building a todo project**](/docs/2-Building_a_todo_project.md), where we'll build a simple todo component to demonstrate the building blocks that compose a component.
