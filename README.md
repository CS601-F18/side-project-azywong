# side-project-azywong (Todo Calendar)
## Setup
  - clone repo
  - make sure you have the following installed
    - node.js (https://nodejs.org/en/)
    - npm (https://www.npmjs.com/)
    - postgresql (https://www.postgresql.org/)
  - need config.js in the root directory and set up values to run postgres for the application
    - you probably need to create a database for the application (I called my todocal)
  - sample config.js
```
var config = {
    "development": {
        "sendgrid": "sendgrid api key",
        "database": {
            "user": "username",
            "password": "password",
            "db": "todocal",
            "host": "localhost"
        }
    },
    "secret": "session secret"
}

module.exports = config;
```
  - cd into the root directory of the app and run
```
npm install
node app.js
```
  - visit localhost:8000
## About
 - This project is a todo list and calendar that focuses on a visual of the current week
 - It's envisioned to focus on a student's weekly todos and events after I was frustrated with the planner designs that I was using currently
 ### Notes
 - Todos are not tied to a specific week, they are an aggregate list
 - Events are day long or multi day long at the moment
## Features Implemented
### Todos
  - autheticated user can add a todo to their list
  - autheticated user can mark a todo that belongs to them as checked off
  - autheticated user can delete a todo that belongs to them
  - autheticated user can view a list of all their todos
  - adding, deleting, or checking off a todo stays on the same calendar week
### Events
  - authenticated user can add an event to their calendar
  - authenticated user can see their events for the current week
  - authenticated user can delete an event that belongs to them
  - user can navigate to the previous week in dashboard
  - user can navigate to the next week in dashboard
  - posting a new event on a date's dashboard page now goes back to that date, not the default today dash
### UI
  - calendar shows the current week on login
  - UI is mobile friendly built on a grid system
  - front end javascript handles todo actions and event deletes with ajax
  - some custom css and js styling
### Users
  - User can create an account
  - User can login
  - User can logout
### Persistent Storage
  - Information is stored in a relational database
  - Information is persistent
### Forgot Password
  - a user can send themselves a reset password email
  - application generates a unique token for reset password link
  - user can reset their password
  - user will get a confirmation email after resetting password
### Hosting
  - project is hosted and can be accessed at https://minitodocal.herokuapp.com/
