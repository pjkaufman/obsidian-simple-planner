import { convertEventToString } from '../src/dates';
import { CalendarEvent } from '../src/types';

type tablesInTextTestCase = {
  name: string,
  event: CalendarEvent,
  expectedString: string
};

const getTablesInTextTestCases: tablesInTextTestCase[] = [
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
        dayOfWeek: [],
        week: [],
        isEaster: false,
        isElectionDay: false,
        isGoodFriday: false,
      },
    },
    expectedString: `- [ ] <mark class="holidays">event</mark>`,
  },
];

describe('Convert Event to String', () => {
  for (const testCase of getTablesInTextTestCases) {
    it(testCase.name, () => {
      const actual = convertEventToString(testCase.event);

      expect(actual).toEqual(testCase.expectedString);
    });
  }
});
