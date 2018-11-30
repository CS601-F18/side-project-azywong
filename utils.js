var utils = {};

utils.orderTodos = function (todos) {
  var orderedTodos = [];
  for (var i = 0; i < todos.length; i++) {
    orderedTodos.push(todos[i].dataValues);
  };
  return orderedTodos;
}

utils.getMonthName = function (date) {
  return utils.moment(date, 'YYYY-MM-DD').format('MMM');
}

utils.getDateName = function (date) {
  return utils.moment(date, 'YYYY-MM-DD').format('D');
}

utils.getWeekHeader = function (week) {
  return "Week of " + utils.getMonthName(week[0]) + " " + utils.getDateName(week[0]) + " - " + utils.getMonthName(week[6]) + " " + utils.getDateName(week[6]);
}

utils.getNewEvents = function (thisWeek){
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

utils.orderEvents = function (events, thisWeek) {
  var newEvents = utils.getNewEvents(thisWeek);
  for (var i = 0; i < events.length; i++) {
    var event = events[i].dataValues;
    var startdate = utils.moment(event.startdate, 'YYYY-MM-DD').startOf('day');
    var enddate = utils.moment(event.enddate, 'YYYY-MM-DD').startOf('day');

    Object.keys(newEvents).forEach(function (key) {
      var startdate2 = newEvents[key].startdate;
      var enddate2 = newEvents[key].enddate;
      if(startdate2 && enddate2) {
        if ( startdate.isSameOrBefore(startdate2) && (enddate.isSameOrAfter(enddate2) || enddate.isSameOrAfter(startdate2)) ) {
          newEvents[key].events.push(event);
        }
      }
    })
  };
  return newEvents;
}

utils.getFormattedDate = function (date) {
  return utils.moment(date, 'YYYY-MM-DD');
}

utils.moment = require('moment')

utils.getStartDate = function (date) {
  return utils.getFormattedDate(date).startOf('day');
}

utils.getEndDate = function (date) {
  return utils.getFormattedDate(date).endOf('day');
}

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