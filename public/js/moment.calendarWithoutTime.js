/**
 * https://gist.github.com/timrwood/1771023
 */
define(['moment'], function (moment) {

  var locale = 'en';
  var localeData = moment.localeData(locale);
  // TODO: Do not use undocumented API '_calendar' - it could change / break.
  var oldSettings = localeData._calendar;
  var newSettings = {
    sameDay : '[Today]',
    nextDay : '[Tomorrow]',
    nextWeek : 'dddd',
    lastDay : '[Yesterday]',
    lastWeek : '[last] dddd',
    sameElse : 'L'
  };
 
  moment.fn.oldCalendar = moment.fn.calendar;
  
  moment.fn.calendar = function(referenceTime, withoutTime) {
    if (withoutTime) {
      moment.locale(locale, {
        calendar: newSettings
      });
    } else {
      moment.locale(locale, {
        calendar: oldSettings
      });
    }
    return this.oldCalendar(referenceTime);
  };

});
