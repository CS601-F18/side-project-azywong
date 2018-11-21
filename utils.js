var utils = {};

utils.orderTodos = function (todos) {
  var orderedTodos = [];
  for (var i = 0; i < todos.length; i++) {
    orderedTodos.push(todos[i].dataValues);
  };
  return orderedTodos;
}

utils.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

utils.getWeekHeader = function (week) {
  return "Week of " + utils.monthNames[week[0].getUTCMonth()] + " " + week[0].getUTCDate() + " - " + utils.monthNames[week[6].getUTCMonth()] + " " + week[6].getUTCDate();
}

utils.orderEvents = function (events, thisWeek) {
  console.log(thisWeek)
  var newEvents = {
    header: utils.getWeekHeader(thisWeek),
    monday: {
      date: thisWeek[0].getUTCDate(),
      startdate: utils.getStartDate(thisWeek[0]),
      enddate: utils.getEndDate(thisWeek[0]),
      events: []
    },
    tuesday: {
      date: thisWeek[1].getUTCDate(),
      startdate: utils.getStartDate(thisWeek[1]),
      enddate: utils.getEndDate(thisWeek[1]),
      events: []
    },
    wednesday: {
      date: thisWeek[2].getUTCDate(),
      startdate: utils.getStartDate(thisWeek[2]),
      enddate: utils.getEndDate(thisWeek[2]),
      events: []
    },
    thursday: {
      date: thisWeek[3].getUTCDate(),
      startdate: utils.getStartDate(thisWeek[3]),
      enddate: utils.getEndDate(thisWeek[3]),
      events: []
    },
    friday: {
      date: thisWeek[4].getUTCDate(),
      startdate: utils.getStartDate(thisWeek[4]),
      enddate: utils.getEndDate(thisWeek[4]),
      events: []
    },
    weekend: {
      date: thisWeek[5].getUTCDate() + " - " + thisWeek[6].getUTCDate(),
      startdate: utils.getStartDate(thisWeek[5]),
      enddate: utils.getEndDate(thisWeek[6]),
      events: []
    }
  }

  for (var i = 0; i < events.length; i++) {
    var event = events[i].dataValues;
    var startdate = utils.moment(event.startdate);
    startdate.hour(0).minute(0).second(0);
    var enddate = utils.moment(event.enddate);
    enddate.hour(23).minute(59).second(59);

    Object.keys(newEvents).forEach(function (key) {
      if (startdate <= newEvents[key].startdate && enddate >= newEvents[key].enddate) {
        newEvents[key].events.push(event);
      }
    })
  };
  return newEvents;
}

utils.getFormattedDate = function (date) {
  var month = date.getUTCMonth() + 1;
  var day = date.getUTCDate();
  var year = date.getFullYear();
  return utils.moment(year + "-" + month + "-" + day);
}

utils.moment = require('moment')

utils.getStartDate = function (date) {
  return utils.getFormattedDate(date).hour(0).minute(0).second(0)
}

utils.getEndDate = function (date) {
  return utils.getFormattedDate(date).hour(23).minute(59).second(59);
}

utils.getThisWeek = function () {
  var range = []
  var d = new Date();
  var day = d.getUTCDay();
  //https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
  var diff = d.getUTCDate() - day + (day == 0 ? -6:1);

  for (var i = 0; i < 7; i++) {
    d = new Date();
    d.setUTCHours(0,0,0);
    range.push(new Date(d.setUTCDate(diff + i)));
  }
  return range;
}

module.exports = utils;