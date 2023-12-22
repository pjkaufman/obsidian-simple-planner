import {Plugin, normalizePath, moment, EventRef, Notice, TFile, TFolder} from 'obsidian';
import {DEFAULT_SETTINGS, SimplePlannerSettings, TemplaterNoteCreateCallbackEntry, dateFileInfo} from './types';
import {SampleSettingTab} from './settings';
import {getRecurringEventsForDay, getWeeklyMonthlyYearlyEventsForDateRange} from './dates';
import {WeeklyMonthlyYearlyEventCreateModal} from './ui/modals/weekly-monthly-yearly-event-create-modal';
import {CreateEventsForDateRange} from './ui/modals/create-events-for-date-range-modal';

export default class SimplePlanner extends Plugin {
  settings: SimplePlannerSettings;
  private foldersVerifiedToExist: string[] = [];
  private eventRefs: EventRef[] = [];
  private datesToCreateFilesFor: string[] = [];

  async onload() {
    await this.loadSettings();

    this.addCommands();

    this.addEvents();

    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  onunload() {
    for (const event of this.eventRefs) {
      this.app.workspace.offref(event);
    }
  }

  addCommands() {
    this.addCommand({
      id: 'simple-planner-create-calendar-events-for-year',
      name: 'Create Weekly, Monthly, and Yearly Events for Year',
      callback: () => {
        new WeeklyMonthlyYearlyEventCreateModal(this.app, this.settings.calendars, (year: number, calendars: string[]) => {
          const startDate = year + '0101';
          const eventsForYear = this.getWeeklyMonthlyYearlyEventsForRange(startDate, year + '1231', calendars);
          this.createFilesWithEvents(startDate, eventsForYear);
        }).open();
      },
    });

    this.addCommand({
      id: 'simple-planner-create-calendar-events-for-range',
      name: 'Create Events for Date Range',
      callback: () => {
        new CreateEventsForDateRange(this.app, (startDate: string, endDate: string) => {
          this.createFilesForDateRange(startDate, endDate);
        }).open();
      },
    });
  }

  addEvents() {
    // @ts-expect-error the event exists, it is just created by Templater
    const eventRef = this.app.workspace.on('templater:new-note-from-template', (...values: TemplaterNoteCreateCallbackEntry[][]) => {
      this.validateCreatedFileLooksRightAndStartNextFileCreate(values);
    });
    if (eventRef) {
      this.eventRefs.push(eventRef);
    }
  }

  validateCreatedFileLooksRightAndStartNextFileCreate = function(...values: TemplaterNoteCreateCallbackEntry[][]) {
    if (values.length > 0) {
      const fileInfo = values[0][0];
      if (!this.datesToCreateFilesFor.includes(fileInfo.file.basename)) {
        return;
      }

      this.datesToCreateFilesFor.remove(fileInfo.file.basename);

      const fileDate = moment(fileInfo.file.basename, 'YYYYMMDD').format('MM/DD/YYYY');
      const correctFileIndicator = `date: ${fileDate}`;
      const fileSeemsCorrect = fileInfo.content.includes(correctFileIndicator);

      if (fileSeemsCorrect === false) {
        new Notice(`Creating file for ${fileDate} did not generate the expected date contents: ${correctFileIndicator}.`);
      }

      if (this.datesToCreateFilesFor.length > 0) {
        const dateToCreate = this.datesToCreateFilesFor[0];
        this.createFile(this.getFileInfoFromDateAndYear(dateToCreate, moment(dateToCreate, 'YYYYMMDD').year()));
      } else {
        new Notice('Finished creating files for applicable dates');
      }
    }
  };

  getEventsForDay(date: string | undefined, boldEventNames: boolean = false, calendarsToInclude: string[] = [], calendarsToIgnore: string[] = []): string {
    return getRecurringEventsForDay(date, this.settings.events, boldEventNames, calendarsToInclude, calendarsToIgnore);
  }

  getWeeklyMonthlyYearlyEventsForRange(startDate: string | undefined, endDate: string | undefined, calendarsToInclude: string[] = [], calendarsToIgnore: string[] = []): string[] | string[][] {
    return getWeeklyMonthlyYearlyEventsForDateRange(startDate, endDate, this.settings.events, calendarsToInclude, calendarsToIgnore);
  }

  getBirthdayAndHolidaySectionForDay(holidaysForDay: string, birthdaysForDay: string) {
    if ((birthdaysForDay == undefined || birthdaysForDay == '') && (holidaysForDay == undefined || holidaysForDay == '')) {
      return '';
    }

    let sectionInfo = '\n';

    if (birthdaysForDay != undefined && birthdaysForDay != '') {
      sectionInfo += `## Birthdays\n\n${birthdaysForDay}\n`;
    }

    if (holidaysForDay != undefined && holidaysForDay != '') {
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

  private createFilesWithEvents(startDate: string, eventsOnDays: string[] | string[][]) {
    if (!eventsOnDays || eventsOnDays.length == 0) {
      return;
    }

    this.foldersVerifiedToExist = [];

    const currentDate = moment(startDate, 'YYYYMMDD');
    if (typeof eventsOnDays[0] == 'string') {
      const fileInfo = this.getFileInfoFromDateAndYear(startDate, currentDate.year());

      if (!this.fileExists(fileInfo)) {
        this.datesToCreateFilesFor.push(startDate);
        this.createFile(fileInfo);
      }

      return;
    }

    let firstFileInfo: dateFileInfo = null;
    for (const eventsForDay of eventsOnDays) {
      if (eventsForDay.length == 0) {
        currentDate.add(1, 'day');
        continue;
      }

      const formattedDate = currentDate.format('YYYYMMDD');

      const fileInfo = this.getFileInfoFromDateAndYear(formattedDate, currentDate.year());
      if (!this.fileExists(fileInfo)) {
        this.datesToCreateFilesFor.push(formattedDate);

        if (firstFileInfo == null) {
          firstFileInfo = fileInfo;
        }
      }

      currentDate.add(1, 'day');
    }

    if (firstFileInfo) {
      this.createFile(firstFileInfo);
    }
  }

  private createFilesForDateRange(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      return;
    }

    this.foldersVerifiedToExist = [];

    const start = moment(startDate, 'YYYYMMDD');
    const end = moment(endDate, 'YYYYMMDD');
    const amountOfDays = end.diff(start, 'days') + 1;
    let firstFileInfo: dateFileInfo = null;
    for (let index = 0; index < amountOfDays; index++) {
      const formattedDate = start.format('YYYYMMDD');
      const fileInfo = this.getFileInfoFromDateAndYear(formattedDate, start.year());
      if (!this.fileExists(fileInfo)) {
        this.datesToCreateFilesFor.push(formattedDate);

        if (firstFileInfo == null) {
          firstFileInfo = fileInfo;
        }
      }

      start.add(1, 'day');
    }

    if (firstFileInfo) {
      this.createFile(firstFileInfo);
    }
  }

  private async createFile(fileInfo: dateFileInfo) {
    await this.createFolderIfDoesNotExist(fileInfo.folder);
    await this.app.vault.create(fileInfo.path, '');
  }

  private async createFolderIfDoesNotExist(folderPath: string) {
    if (this.foldersVerifiedToExist.includes(folderPath)) {
      return;
    }

    this.foldersVerifiedToExist.push(folderPath);

    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (folder instanceof TFolder) {
      return;
    }

    await this.app.vault.createFolder(folderPath);
  }

  private fileExists(fileInfo: dateFileInfo): boolean {
    const file = this.app.vault.getAbstractFileByPath(fileInfo.path);

    if (file instanceof TFile) {
      return true;
    }

    return false;
  }

  private getFileInfoFromDateAndYear(date: string, year: number): dateFileInfo {
    const folderPath = normalizePath(this.settings.plannerBaseFolderPath + '/' + year);
    const filePath = normalizePath(folderPath + '/' + date + '.md');

    return {
      folder: folderPath,
      path: filePath,
    };
  }
}
