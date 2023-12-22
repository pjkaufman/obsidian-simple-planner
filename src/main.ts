import {Plugin, normalizePath, moment} from 'obsidian';
import {DEFAULT_SETTINGS, SimplePlannerSettings} from './types';
import {SampleSettingTab} from './settings';
import {getRecurringEventsForDay, getWeeklyMonthlyYearlyEventsForDateRange} from './dates';
import {WeeklyMonthlyYearlyEventCreateModal} from './ui/modals/weekly-monthly-yearly-event-create-modal';
import {CreateEventsForDateRange} from './ui/modals/create-events-for-date-range-modal';

export default class SimplePlanner extends Plugin {
  settings: SimplePlannerSettings;
  private foldersVerifiedToExist: string[] = [];

  async onload() {
    await this.loadSettings();

    this.addCommands();

    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  onunload() {}

  addCommands() {
    this.addCommand({
      id: 'simple-planner-create-calendar-events-for-year',
      name: 'Create Weekly, Monthly, and Yearly Events for Year',
      callback: () => {
        new WeeklyMonthlyYearlyEventCreateModal(this.app, this.settings.calendars, async (year: number, calendars: string[]) => {
          const startDate = year + '0101';
          const eventsForYear = this.getWeeklyMonthlyYearlyEventsForRange(startDate, year + '1231', calendars);
          await this.createFilesWithEvents(startDate, eventsForYear);
        }).open();
      },
    });

    this.addCommand({
      id: 'simple-planner-create-calendar-events-for-range',
      name: 'Create Events for Date Range',
      callback: () => {
        new CreateEventsForDateRange(this.app, async (startDate: string, endDate: string) => {
          await this.createFilesForDateRange(startDate, endDate);
        }).open();
      },
    });
  }

  getEventsForDay(date: string | undefined, boldEventNames: boolean = false, calendarsToInclude: string[] = [], calendarsToIgnore: string[] = []): string {
    return getRecurringEventsForDay(date, this.settings.events, boldEventNames, calendarsToInclude, calendarsToIgnore);
  }

  getWeeklyMonthlyYearlyEventsForRange(startDate: string | undefined, endDate: string | undefined, calendarsToInclude: string[] = [], calendarsToIgnore: string[] = []): string[] | string[][] {
    return getWeeklyMonthlyYearlyEventsForDateRange(startDate, endDate, this.settings.events, calendarsToInclude, calendarsToIgnore);
  }

	getBirthdayAndHolidaySectionForDay(holidaysForDay: string, birthdaysForDay: string) {
    if ((birthdaysForDay == undefined || birthdaysForDay == "") && (holidaysForDay == undefined || holidaysForDay == "")) {
        return '';
    }

    let sectionInfo = '\n';

    if (birthdaysForDay != undefined && birthdaysForDay != "") {
          sectionInfo += `## Birthdays\n\n${birthdaysForDay}\n`;
    }

    if (holidaysForDay != undefined && holidaysForDay != "") {
				sectionInfo += `## Holidays\n\n${holidaysForDay}\n`;
    }

    return sectionInfo;
}


  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private async createFilesWithEvents(startDate: string, eventsOnDays: string[] | string[][]) {
    if (!eventsOnDays || eventsOnDays.length == 0) {
      return;
    }

    this.foldersVerifiedToExist = [];

    const currentDate = moment(startDate, 'YYYYMMDD');
    if (typeof eventsOnDays[0] == 'string') {
      await this.createFileIfItDoesNotExist(startDate, currentDate.year());

      return;
    }

    for (const eventsForDay of eventsOnDays) {
      if (eventsForDay.length == 0) {
        currentDate.add(1, 'day');
        continue;
      }

      await this.createFileIfItDoesNotExist(currentDate.format('YYYYMMDD'), currentDate.year());

      currentDate.add(1, 'day');
    }
  }

  private async createFilesForDateRange(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      return;
    }

    this.foldersVerifiedToExist = [];

    const start = moment(startDate, 'YYYYMMDD');
    const end = moment(endDate, 'YYYYMMDD');
    const amountOfDays = end.diff(start, 'days') + 1;

    for (let index = 0; index < amountOfDays; index++) {
      await this.createFileIfItDoesNotExist(start.format('YYYYMMDD'), start.year());

      start.add(1, 'day');
    }
  }

  private async createFileIfItDoesNotExist(date: string, year: number) {
    const folderPath = normalizePath(this.settings.plannerBaseFolderPath + '/' + year);
    const filePath = normalizePath(folderPath + '/' + date + '.md');
    const file = this.app.vault.getAbstractFileByPath(filePath);

    if (file) {
      return;
    }

    await this.createFolderIfDoesNotExist(folderPath);

    await this.app.vault.create(filePath, '');
  }

  private async createFolderIfDoesNotExist(folderPath: string) {
    if (this.foldersVerifiedToExist.includes(folderPath)) {
      return;
    }

    this.foldersVerifiedToExist.push(folderPath);

    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (folder) {
      return;
    }

    await this.app.vault.createFolder(folderPath);
  }
}
