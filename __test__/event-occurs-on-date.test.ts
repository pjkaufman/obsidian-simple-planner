import { eventOccursOnDate } from '../src/dates';
import { CalendarEvent } from '../src/types';

type eventOccursOnDateTestCase = {
  name: string,
  date: string,
  event: CalendarEvent,
  expectedBool: boolean
};

const eventOccursOnDateTestCases: eventOccursOnDateTestCase[] = [
  {
    name: 'A null date should return false',
    date: null,
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
    expectedBool: false,
  },
  {
    name: 'An event that happens on January 21st should be list as occurring on that day',
    date: '20230121',
    event: {
      name: 'event',
      description: undefined,
      calendar: 'holidays',
      occurrenceInfo: {
        time: undefined,
        months: [0],
        day: 21,
        daysOfWeek: [],
        weeks: [],
        isEaster: false,
        isElectionDay: false,
        isGoodFriday: false,
        isPalmSunday: false,
      },
    },
    expectedBool: true,
  },
];

describe('Event Occurs on Date', () => {
  for (const testCase of eventOccursOnDateTestCases) {
    it(testCase.name, () => {
      const actual = eventOccursOnDate(testCase.date, testCase.event);

      expect(actual).toEqual(testCase.expectedBool);
    });
  }
});
