import {TFile} from 'obsidian';

export type CalendarEvent = {
  name: string,
  description: string | undefined,
  calendar: string,
  occurrenceInfo: OccurrenceInfo,
  isTask: boolean,
};

export type OccurrenceInfo = {
  time: string | undefined,
  months: number[],
  day: number,
  daysOfWeek: number[],
  weeks: number[],
  isEaster: boolean,
  isElectionDay: boolean,
  isGoodFriday: boolean,
  isPalmSunday: boolean,
};

export type Calendar = {
  name: string,
  color: string,
};

export interface SimplePlannerSettings {
  events: CalendarEvent[];
  calendars: Calendar[];
  plannerBaseFolderPath: string;
}

export const DEFAULT_SETTINGS: SimplePlannerSettings = {
  events: [],
  calendars: [],
  plannerBaseFolderPath: '',
};

export type TemplaterNoteCreateCallbackEntry = {
  content: string,
  file: TFile
}

export type dateFileInfo = {
  folder: string,
  path: string,
}
