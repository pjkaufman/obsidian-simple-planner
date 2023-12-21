import {Plugin, normalizePath, moment} from 'obsidian';
import {DEFAULT_SETTINGS, SimplePlannerSettings} from './types';
import {SampleSettingTab} from './settings';
import {getRecurringEventsForDay, getWeeklyMonthlyYearlyEventsForDateRange} from './dates';
import {WeeklyMonthlyYearlyEventCreateModal} from './ui/modals/weekly-monthly-yearly-event-create-modal';

// Remember to rename these classes and interfaces!
export default class SimplePlanner extends Plugin {
  settings: SimplePlannerSettings;

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
          await this.createFiles(startDate, eventsForYear);
          console.log();
        }).open();
      },
    });
  }

  getEventsForDay(date: string | undefined, calendarsToInclude: string[] = [], calendarsToIgnore: string[] = []): string {
    return getRecurringEventsForDay(date, this.settings.events, calendarsToInclude, calendarsToIgnore);
  }

  getWeeklyMonthlyYearlyEventsForRange(startDate: string | undefined, endDate: string | undefined, calendarsToInclude: string[] = [], calendarsToIgnore: string[] = []): string[] | string[][] {
    return getWeeklyMonthlyYearlyEventsForDateRange(startDate, endDate, this.settings.events, calendarsToInclude, calendarsToIgnore);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private async createFiles(startDate: string, eventsOnDays: string[] | string[][]) {
    if (!eventsOnDays || eventsOnDays.length == 0) {
      return;
    }

    if (typeof eventsOnDays[0] == 'string') {
      await this.createFileIfItDoesNotExist(startDate);

      return;
    }

    const currentDate = moment(startDate, 'YYYYMMDD');
    for (const eventsForDay of eventsOnDays) {
      if (eventsForDay.length == 0) {
        currentDate.add(1, 'day');
        continue;
      }

      await this.createFileIfItDoesNotExist(currentDate.format('YYYYMMDD'));

      currentDate.add(1, 'day');
    }
  }

  private async createFileIfItDoesNotExist(date: string) {
    const filePath = normalizePath(this.settings.plannerBaseFolderPath + '/' + date + '.md');
    const file = this.app.vault.getAbstractFileByPath(filePath);

    if (file) {
      return;
    }

    await this.app.vault.create(filePath, '');
  }
}
