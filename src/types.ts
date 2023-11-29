export type CalendarEvent = {
    name: string,
    description: string | undefined,
    calendar: string,
    occurrenceInfo: OccurrenceInfo,
};

export type OccurrenceInfo = {
    time: string | undefined,
    months: number[],
    day: number,
    dayOfWeek: number[],
    week: number[],
    isEaster: boolean,
    isElectionDay: boolean,
    isGoodFriday: boolean,
};


export interface SimplePlannerSettings {
	mySetting: string;
}

export const DEFAULT_SETTINGS: SimplePlannerSettings = {
	mySetting: 'default'
}
