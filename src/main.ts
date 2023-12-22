import {Plugin, normalizePath, moment} from 'obsidian';
import {DEFAULT_SETTINGS, SimplePlannerSettings} from './types';
import {SampleSettingTab} from './settings';
import {getRecurringEventsForDay, getWeeklyMonthlyYearlyEventsForDateRange} from './dates';
import {WeeklyMonthlyYearlyEventCreateModal} from './ui/modals/weekly-monthly-yearly-event-create-modal';
import {CreateEventsForDateRange} from './ui/modals/create-events-for-date-range-modal';

export default class SimplePlanner extends Plugin {
  settings: SimplePlannerSettings;
  private foldersVerifiedToExist: string[] = [];
	private msDelay: number = 250;
	private xthFileToCreate: number = 1;
	// private eventRefs = [];

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

	// addEvents() {
	// 	const eventRef = this.app.workspace.on('templater:new-note-from-template', this.validateFileContentSeemsRight);
	// 	if (eventRef) {
	// 		this.eventRefs.push(eventRef);
	// 	}
	// }

	// validateFileContentSeemsRight = function(...args) {
  //   if (args.length > 0) {
	// 		console.log(args);
      // const fileInfo = args[0],
      //   fileDate = moment(fileInfo.file.basename, momentFormat).format('MM/DD/YYYY'),
      //   correctFileIndicator = `date: ${fileDate}`,
      //   fileSeemsCorrect = fileInfo.content.includes(correctFileIndicator);

      // if (fileSeemsCorrect === false) {
      //   console.error(`Creating holidays/birthdays for ${fileDate} did not generate the expected date contents: ${correctFileIndicator}.`); 
      // }
  //   }
  // }

	/**
	 

if (holidaysInRestOfYear) {
  for (const [index, holiday] of holidaysInRestOfYear.entries()) {
    if (holiday.length > 0) {
        await createFileIfNotExists(index, folderPath, templateFile, tFolder)
    }
  }
}

if (birthdaysInRestOfYear) {
  for (const [index, birthday] of birthdaysInRestOfYear.entries()) {
    if (birthday.length > 0 && holidaysInRestOfYear[index].length < 1) {
        await createFileIfNotExists(index, folderPath, templateFile, tFolder)
    }
  }
}

setTimeout(function(){
  app.workspace.offref(eventRef);
}, xthFileToCreate * 2 * timeDelayInMilliseconds);
	 */

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

		this.xthFileToCreate = 1;

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

		this.xthFileToCreate = 1;
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

		setTimeout(async function(){
			await this.app.vault.create(filePath, '');
		}, this.xthFileToCreate * this.msDelay);

		this.xthFileToCreate++;
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
