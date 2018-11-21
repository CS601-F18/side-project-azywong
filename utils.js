var utils = {};

utils.orderTodos = function (todos) {
  var orderedTodos = [];
  for (var i = 0; i < todos.length; i++) {
    orderedTodos.push(todos[i].dataValues);
  };
  return orderedTodos;
}

utils.orderEvents = function (events, thisWeek) {
  var newEvents = {
    monday: {
      startdate: new Date(thisWeek[0].getFullYear(), thisWeek[0].getMonth(), thisWeek[0].getDate(), 0, 0, 0),
      enddate: new Date(thisWeek[0].getFullYear(), thisWeek[0].getMonth(), thisWeek[0].getDate(), 23, 59, 59),
      events: []
    },
    tuesday: {
      startdate: new Date(thisWeek[1].getFullYear(), thisWeek[1].getMonth(), thisWeek[1].getDate(), 0, 0, 0),
      enddate: new Date(thisWeek[1].getFullYear(), thisWeek[1].getMonth(), thisWeek[1].getDate(), 23, 59, 59),
      events: []
    },
    wednesday: {
      startdate: new Date(thisWeek[2].getFullYear(), thisWeek[2].getMonth(), thisWeek[2].getDate(), 0, 0, 0),
      enddate: new Date(thisWeek[2].getFullYear(), thisWeek[2].getMonth(), thisWeek[2].getDate(), 23, 59, 59),
      events: []
    },
    thursday: {
      startdate: new Date(thisWeek[3].getFullYear(), thisWeek[3].getMonth(), thisWeek[3].getDate(), 0, 0, 0),
      enddate: new Date(thisWeek[3].getFullYear(), thisWeek[3].getMonth(), thisWeek[3].getDate(), 23, 59, 59),
      events: []
    },
    friday: {
      startdate: new Date(thisWeek[4].getFullYear(), thisWeek[4].getMonth(), thisWeek[4].getDate(), 0, 0, 0),
      enddate: new Date(thisWeek[4].getFullYear(), thisWeek[4].getMonth(), thisWeek[4].getDate(), 23, 59, 59),
      events: []
    },
    weekend: {
      startdate: new Date(thisWeek[5].getFullYear(), thisWeek[5].getMonth(), thisWeek[5].getDate(), 0, 0, 0),
      enddate: new Date(thisWeek[6].getFullYear(), thisWeek[6].getMonth(), thisWeek[6].getDate(), 23, 59, 59),
      events: []
    }
  }

  for (var i = 0; i < events.length; i++) {
    var event = events[i].dataValues;
    var startdate = new Date(event.startdate.getFullYear(), event.startdate.getMonth(), event.startdate.getDate(), 0, 0, 0);
    var enddate = new Date(event.enddate.getFullYear(), event.enddate.getMonth(), event.enddate.getDate(), 0, 0, 0);
    Object.keys(newEvents).forEach(function (key) {
      if (startdate <= newEvents[key].startdate && enddate >= newEvents[key].startdate) {
        newEvents[key].events.push(event);
      }
    })
  };
  return newEvents;
}


utils.getThisWeek = function () {
  var range = []
  var d = new Date();
  var day = d.getDay();
  //https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
  var diff = d.getDate() - day + (day == 0 ? -6:1);

  for (var i = 0; i < 7; i++) {
    d = new Date();
    d.setHours(0,0,0);
    range.push(new Date(d.setDate(diff + i)));
  }
  return range;
}

module.exports = utils;