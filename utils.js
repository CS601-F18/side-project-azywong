var utils = {};

/**
* utility methods stored here, mainly to do with formatting dates and data
**/

// method that coverts the  list of todos from the database into a format the front end can easily parse
utils.orderTodos = function (todos) {
  var orderedTodos = [];
  for (var i = 0; i < todos.length; i++) {
    orderedTodos.push(todos[i].dataValues);
  };
  return orderedTodos;
}

// method that takes in a date as input and returns the full month name
utils.getMonthName = function (date) {
  return utils.moment(date, 'YYYY-MM-DD').format('MMM');
}

// method that takes in a date as input and returns the day of the month
utils.getDateName = function (date) {
  return utils.moment(date, 'YYYY-MM-DD').format('D');
}

// method that takes in a week in array format and generate header text
utils.getWeekHeader = function (week) {
  return "Week of " + utils.getMonthName(week[0]) + " " + utils.getDateName(week[0]) + " - " + utils.getMonthName(week[6]) + " " + utils.getDateName(week[6]);
}

// method that that thats a week in array form and returns it in a formatted object
utils.getFormattedWeek = function (thisWeek){
  var newEvents = {
    header: utils.getWeekHeader(thisWeek),
    monday: {
      date: utils.getDateName(thisWeek[0]),
      startdate: utils.getStartDate(thisWeek[0]),
      enddate: utils.getEndDate(thisWeek[0]),
      events: []
    },
    tuesday: {
      date: utils.getDateName(thisWeek[1]),
      startdate: utils.getStartDate(thisWeek[1]),
      enddate: utils.getEndDate(thisWeek[1]),
      events: []
    },
    wednesday: {
      date: utils.getDateName(thisWeek[2]),
      startdate: utils.getStartDate(thisWeek[2]),
      enddate: utils.getEndDate(thisWeek[2]),
      events: []
    },
    thursday: {
      date: utils.getDateName(thisWeek[3]),
      startdate: utils.getStartDate(thisWeek[3]),
      enddate: utils.getEndDate(thisWeek[3]),
      events: []
    },
    friday: {
      date: utils.getDateName(thisWeek[4]),
      startdate: utils.getStartDate(thisWeek[4]),
      enddate: utils.getEndDate(thisWeek[4]),
      events: []
    },
    weekend: {
      date: utils.getDateName(thisWeek[5]) + " - " + utils.getDateName(thisWeek[6]),
      startdate: utils.getStartDate(thisWeek[5]),
      enddate: utils.getEndDate(thisWeek[6]),
      events: []
    }
  }
  return newEvents;
}

// method that takes a list of events and the current week as input and returns a formatted object representing this week and the events for each day
utils.orderEvents = function (events, thisWeek) {
  var formattedEvents = utils.getFormattedWeek(thisWeek);
  for (var i = 0; i < events.length; i++) {
    var event = events[i].dataValues;
    var startdate = utils.moment(event.startdate, 'YYYY-MM-DD').startOf('day');
    var enddate = utils.moment(event.enddate, 'YYYY-MM-DD').startOf('day');

    Object.keys(formattedEvents).forEach(function (key) {
      var startdate2 = formattedEvents[key].startdate;
      var enddate2 = formattedEvents[key].enddate;
      if(startdate2 && enddate2) {
        if ( startdate.isSameOrBefore(startdate2) && (enddate.isSameOrAfter(enddate2) || enddate.isSameOrAfter(startdate2)) ) {
          formattedEvents[key].events.push(event);
        }
      }
    })
  };
  return formattedEvents;
}

// method that takes a date as input and returns it in a moment format
utils.getFormattedDate = function (date) {
  return utils.moment(date, 'YYYY-MM-DD');
}

// requiring the moment js library
utils.moment = require('moment')

// method that returns the start of the day for the date in moment format
utils.getStartDate = function (date) {
  return utils.getFormattedDate(date).startOf('day');
}

// method that returns the end of the day for the date in moment format
utils.getEndDate = function (date) {
  return utils.getFormattedDate(date).endOf('day');
}

// method that returns the current week in array format
utils.getThisWeek = function () {
  var range = []
  var d = new Date();
  var day = utils.moment().startOf('day').fromNow();
  //https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
  var startOfPeriod = utils.moment();
  var begin = utils.moment(startOfPeriod).isoWeekday(1);
  begin.startOf('isoWeek');

  for (var i = 0; i < 7; i++) {
    range.push(begin.format('YYYY-MM-DD'));
    begin.add(1, 'd');
  }
  return range;
}

module.exports = utils;