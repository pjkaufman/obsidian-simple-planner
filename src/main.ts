import {Plugin} from 'obsidian';
import {CalendarEvent, DEFAULT_SETTINGS, SimplePlannerSettings} from './types';
import {SampleSettingTab} from './settings';
import {getRecurringEventsForDay} from './dates';

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

  getEventsForDay(date: string | undefined, events: CalendarEvent[], calendarsToInclude: string[] = [], calendarsToIgnore: string[] = []): string {
    return getRecurringEventsForDay(date, events, calendarsToInclude, calendarsToIgnore);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
