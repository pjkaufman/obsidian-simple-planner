import {convertEventToString} from '../src/dates';
import {CalendarEvent} from '../src/types';

type calendarEventToStringTestCase = {
  name: string,
  event: CalendarEvent,
  expectedString: string
};

const getCalendarEventToStringTestCases: calendarEventToStringTestCase[] = [
  {
    name: 'A simple all day event should display just the event name for the calendar in question',
    event: {
      name: 'event',
      description: undefined,
      calendar: 'holidays',
      occurrenceInfo: {
        time: undefined,
        months: [],
        day: 0,
        daysOfWeek: [],
        weeks: [],
        isEaster: false,
        isElectionDay: false,
        isGoodFriday: false,
        isPalmSunday: false,
      },
    },
    expectedString: `- [ ] <mark class="holidays">event</mark>`,
  },
  {
    name: 'An event with time info is properly displayed',
    event: {
      name: 'Running of the Bulls',
      description: undefined,
      calendar: 'personal',
      occurrenceInfo: {
        time: '16:00 - 19:00',
        months: [],
        day: 0,
        daysOfWeek: [],
        weeks: [],
        isEaster: false,
        isElectionDay: false,
        isGoodFriday: false,
        isPalmSunday: false,
      },
    },
    expectedString: `- [ ] <mark class="personal">16:00 - 19:00 Running of the Bulls</mark>`,
  },
  {
    name: 'An event with a description info is properly displayed',
    event: {
      name: 'Running of the Bulls',
      description: 'Run for fun!',
      calendar: 'fun-times',
      occurrenceInfo: {
        time: '16:00 - 19:00',
        months: [],
        day: 0,
        daysOfWeek: [],
        weeks: [],
        isEaster: false,
        isElectionDay: false,
        isGoodFriday: false,
        isPalmSunday: false,
      },
    },
    expectedString: `- [ ] <mark class="fun-times">16:00 - 19:00 Running of the Bulls</mark>\n  - Run for fun!`,
  },
];

describe('Convert Event to String', () => {
  for (const testCase of getCalendarEventToStringTestCases) {
    it(testCase.name, () => {
      const actual = convertEventToString(testCase.event);

      expect(actual).toEqual(testCase.expectedString);
    });
  }
});
