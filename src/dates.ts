import {moment} from 'obsidian';
import {CalendarEvent} from "./types";

function padout(num: number) { 
    return (num < 10) ? '0' + num : num; 
}

function xthDayOfMonth(startDate: string, dayOfWeek: number, weekNumber: number) {
  let date;
  if (weekNumber === 5) { // last instances in month
    const endOfMonth = moment(startDate, 'YYYYMMDD').utc().endOf('month');
    if (endOfMonth.isoWeekday() === dayOfWeek) {
    date = endOfMonth;
    } else if (endOfMonth.isoWeekday() < dayOfWeek) {
    date = endOfMonth.subtract(1, 'w').add(dayOfWeek - endOfMonth.isoWeekday(), 'days');
    } else {
    date = endOfMonth.subtract(endOfMonth.isoWeekday() - dayOfWeek, 'days');
    }

    return date.format('YYYYMMDD');
  } 

  //@ts-ignore for some reason isoweek is not registerd as a valid value here
  const startOfMonth = moment(startDate, 'YYYYMMDD').utc().startOf('month').startOf('isoweek');
  const dayOne = moment((moment(startDate, "YYYYMMDD").format("YYYYMM") + "01"),"YYYYMMDD");
  if (dayOne.isoWeekday() === 1) {
    //@ts-ignore for some reason isoweek is not registerd as a valid value here
    date = moment(startDate, 'YYYYMMDD').utc().startOf('month').startOf('isoweek').add(dayOfWeek - 1, 'days')
        .add(weekNumber, 'w');
  }
  else if (dayOne.isoWeekday() <= dayOfWeek) {
    //@ts-ignore for some reason isoweek is not registerd as a valid value here
    date = moment(startDate, 'YYYYMMDD').utc().startOf('month').startOf('isoweek').add(dayOfWeek - 1, 'days')
        .add(weekNumber - 1, 'w');
  } else {
    //@ts-ignore for some reason isoweek is not registerd as a valid value here
    date = moment(startDate, 'YYYYMMDD').utc().startOf('month').startOf('isoweek').add(dayOfWeek - 1, 'days')
        .add(weekNumber, 'w');
  }

  if (date.month() == startOfMonth.month() && startOfMonth.isoWeekday() <= dayOfWeek) {
    date = date.subtract(1, 'w');
  }

  return date.format('YYYYMMDD');
}

export function getRecurringEvents(date: string | undefined, events: CalendarEvent[]) {
  if (date == undefined) {
    return '';
  }

  const applicableEvents = []
  // const momentDate = moment(date, 'YYYYMMDD');
  // const dayOfWeek = momentDate.day();  
  for (const event of events) {
    if (eventOccursOnDate(date, event)) {
      applicableEvents.push(convertEventToString(event));
    }
      // const event = events[i];        
      // if ((event.month === undefined || event.month.includes(momentDate.month())) && (event.week === undefined || xthDayOfMonth(date, dayOfWeek, event.week) === date)) {
      //     if (event.time === undefined) {
      //         eventInfoString = '- [ ] <mark class="' + event.calendar + '">' + event.name + '</mark>';
      //     } else {
      //         eventInfoString = '- [ ] <mark class="' + event.calendar + '">' + event.time + ' ' + event.name + '</mark>';
      //     }

      //     if (event.description) {
      //         eventInfoString += '\n  - ' + event.description;
      //     }

      //     applicableEvents.push(eventInfoString);
      // }
  }

  return applicableEvents.join('\n');
}

export function convertEventToString(event: CalendarEvent): string {
    let eventInfoString = `- [ ] <mark class="${event.calendar}">`
    if (event.occurrenceInfo.time != undefined) {
        eventInfoString += event.occurrenceInfo.time + ' ';
    }

    eventInfoString += `${event.name}</mark>`
    if (event.description) {
        eventInfoString += `\n  - ${event.description}`
    }

    return eventInfoString
}

export function eventOccursOnDate(date: string, event: CalendarEvent): boolean {
  if (date == null) {
    return false
  }

  if (event.occurrenceInfo.isEaster) {
    return isEaster(date)
  }

  if (event.occurrenceInfo.isGoodFriday) {
    return isGoodFriday(date)
  }

  if (event.occurrenceInfo.isPalmSunday) {
    return isPalmSunday(date)
  }

  if (event.occurrenceInfo.isElectionDay) {
    return isElectionDay(date)
  }

  const momentDate = moment(date, 'YYYYMMDD');
  const dayOfWeek = momentDate.day();
  if (event.occurrenceInfo.months != null && event.occurrenceInfo.months.length > 0 && !event.occurrenceInfo.months.includes(momentDate.month())) {
    return false;
  }

  if (event.occurrenceInfo.daysOfWeek != null && event.occurrenceInfo.daysOfWeek.length > 0 && event.occurrenceInfo.daysOfWeek.length && !event.occurrenceInfo.daysOfWeek.includes(dayOfWeek)) {
    return false;
  }

  if (event.occurrenceInfo.day != 0 && event.occurrenceInfo.day != momentDate.date()) {
    return false;
  }

  if (event.occurrenceInfo.weeks != null && event.occurrenceInfo.weeks.length > 0){
    const length = event.occurrenceInfo.weeks.length;
    for (let i = 0; i < length; i++) {
      if (xthDayOfMonth(date, dayOfWeek, event.occurrenceInfo.weeks[i]) === date) {
        return true;
      }
    }

    return false;
  }

  return true;
}

export function getEaster(year: number) {
  const C = Math.floor(year/100);
  const N = year - 19*Math.floor(year/19);
  const K = Math.floor((C - 17)/25);
  let I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;
  I = I - 30*Math.floor((I/30));
  I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));
  let J = year + Math.floor(year/4) + I + 2 - C + Math.floor(C/4);
  J = J - 7*Math.floor(J/7);
  const L = I - J;
  const M = 3 + Math.floor((L + 40)/44);
  const D = L + 28 - 31*Math.floor(M/4);

  return moment(year + '' + padout(M) + padout(D), 'YYYYMMDD');
}

function isEaster(date: string) {
  const momentDate = moment(date, 'YYYYMMDD');
  const easter = getEaster(momentDate.year());

  return momentDate.month() === easter.month() && momentDate.format('DD') === easter.format('DD');
}

function isGoodFriday(date: string) {
  const momentDate = moment(date, 'YYYYMMDD');
  const goodFriday = getEaster(momentDate.year()).subtract(2, 'days');
  
  return momentDate.month() === goodFriday.month() && momentDate.format('DD') === goodFriday.format('DD');
}
  
function isPalmSunday(date: string) {
  const momentDate = moment(date, 'YYYYMMDD');
  const palmSunday = getEaster(momentDate.year()).subtract(7, 'days');


  return momentDate.month() === palmSunday.month() && momentDate.format('DD') === palmSunday.format('DD');
}

function isElectionDay(date: string) {
  let electionDay = xthDayOfMonth(date, 2, 1);

  if (electionDay.endsWith('01')) {
    electionDay = electionDay.slice(0, -2) + '08';
  }

  return electionDay === date;
}
