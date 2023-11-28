

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

    const startOfMonth = moment(startDate, 'YYYYMMDD').utc().startOf('month').startOf('isoweek');
    const dayOne = moment((moment(startDate, "YYYYMMDD").format("YYYYMM") + "01"),"YYYYMMDD");
    if (dayOne.isoWeekday() === 1) {
        date = moment(startDate, 'YYYYMMDD').utc().startOf('month').startOf('isoweek').add(dayOfWeek - 1, 'days')
            .add(weekNumber, 'w');
    }
    else if (dayOne.isoWeekday() <= dayOfWeek) {
        date = moment(startDate, 'YYYYMMDD').utc().startOf('month').startOf('isoweek').add(dayOfWeek - 1, 'days')
            .add(weekNumber - 1, 'w');
    } else {
        date = moment(startDate, 'YYYYMMDD').utc().startOf('month').startOf('isoweek').add(dayOfWeek - 1, 'days')
            .add(weekNumber, 'w');
    }

    if (date.month() == startOfMonth.month() && startOfMonth.isoWeekday() <= dayOfWeek) {
      date = date.subtract(1, 'w');
    }

    return date.format('YYYYMMDD');
}

function GetRecurringEvents(date: string | undefined) {
    if (date == undefined) {
        return '';
    }

    const applicableEvents = []
    const momentDate = moment(date, 'YYYYMMDD');
    const dayOfWeek = momentDate.day();
    const eventInfoString = '';
    for (const i in dayBasedEvents[dayOfWeek]) {
        let event = dayBasedEvents[dayOfWeek][i];        
        if ((event.month === undefined || event.month.includes(momentDate.month())) && (event.week === undefined || xthDayOfMonth(date, dayOfWeek, event.week) === date)) {
            if (event.time === undefined) {
                eventInfoString = '- [ ] <mark class="' + event.calendar + '">' + event.name + '</mark>';
            } else {
                eventInfoString = '- [ ] <mark class="' + event.calendar + '">' + event.time + ' ' + event.name + '</mark>';
            }

            if (event.description) {
                eventInfoString += '\n  - ' + event.description;
            }

            applicableEvents.push(eventInfoString);
        }
    }

    return applicableEvents.join('\n');
}