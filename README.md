# side-project-azywong (Todo Calendar)
## Setup
  - clone repo
  - make sure you have the following installed
    - node.js
    - npm
    - postgresql
  - look in config.js and set up values to run postgres for the application
    - you probably need to create a database for the application
  - cd into this directory and run
```
npm install
node app.js
```
  - visit localhost:8000
## About
 - This project is a todo list and calendar that focuses on a visual of the current week
 - It's envisioned to focus on a student's weekly todos and events
## Features Implemented
### Todos
  - autheticated user can add a todo to their list
  - autheticated user can mark a todo that belongs to them as checked off
  - autheticated user can delete a todo that belongs to them
  - autheticated user can view a list of all their todos
### Events
  - authenticated user can add an event to their calendar
  - authenticated user can see their events for the current week
  - authenticated user can delete an event that belongs to them
### UI
  - calendar shows the current week on login
  - UI is mobile friendly built on a grid system
  -
### Users
  - User can create an account
  - User can login
  - User can logout
