import { CalendarEvent } from "./types";

export const daysOfWeekLetters = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];
export const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const weekOfMonth = ['1st', '2nd', '3rd', '4th', 'Last'];

export function eventToDisplayString(event: CalendarEvent): string {
  let eventString = event.name;
  if (event.description && event.description.trim() != '') {
    eventString += '; ' + event.description;
  }

  // TODO: finish off this logic

  if (event.occurrenceInfo.time && event.description.trim() != '') {
    eventString += '; ' + event.occurrenceInfo.time;
  }

  return eventString;
}
