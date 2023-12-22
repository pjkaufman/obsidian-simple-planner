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
      isTask: false,
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
    expectedString: `- <mark class="holidays">event</mark>`,
  },
  {
    name: 'An event with time info is properly displayed',
    event: {
      name: 'Running of the Bulls',
      description: undefined,
      calendar: 'personal',
      isTask: false,
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
      isTask: false,
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
  {
    name: 'An event with a multiple calendars should get displayed properly',
    event: {
      name: 'An event',
      description: '',
      calendar: 'personal|other',
      isTask: false,
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
    expectedString: `- [ ] <mark class="personal other">16:00 - 19:00 An event</mark>`,
  },
  {
    name: 'An all day that is a task is properly rendered with a checkbox',
    event: {
      name: 'An event',
      description: '',
      calendar: 'personal',
      isTask: true,
      occurrenceInfo: {
        time: '',
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
    expectedString: `- [ ] <mark class="personal">An event</mark>`,
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
