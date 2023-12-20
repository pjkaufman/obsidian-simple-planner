import {Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, SimplePlannerSettings} from './types';
import {SampleSettingTab} from './settings';
import {getRecurringEventsForDay, getWeeklyMonthlyYearlyEventsForDateRange} from './dates';

// Remember to rename these classes and interfaces!
export default class SimplePlanner extends Plugin {
  settings: SimplePlannerSettings;

  async onload() {
    await this.loadSettings();

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  onunload() {

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
}
