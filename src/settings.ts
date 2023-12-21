import {App, PluginSettingTab, Setting, TextComponent} from 'obsidian';
import SimplePlanner from './main';
import {CustomCalendarOption} from './ui/components/custom-calendar-option';
import {CustomEventOption} from './ui/components/custom-event-option';

export class SampleSettingTab extends PluginSettingTab {
  plugin: SimplePlanner;

  constructor(app: App, plugin: SimplePlanner) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    const divContainer = containerEl.createDiv();

    divContainer.createEl('h1', {text: 'Simple Planner'});

    new Setting(divContainer).addText((text: TextComponent) => {
      text.setValue(this.plugin.settings.plannerBaseFolderPath)
          .onChange(async (value: string) => {
            this.plugin.settings.plannerBaseFolderPath = value;
            await this.plugin.saveSettings();
          });
    }).setName('Planner Base Folder:');

    const calendarDiv = divContainer.createDiv();
    new CustomCalendarOption(calendarDiv, this.plugin.settings.calendars, this.app, async () => {
      await this.plugin.saveSettings();
    });

    const eventsDiv = divContainer.createDiv();
    new CustomEventOption(eventsDiv, this.plugin.settings.events, this.plugin.settings.calendars, this.app, async () => {
      await this.plugin.saveSettings();
    });
  }
}
