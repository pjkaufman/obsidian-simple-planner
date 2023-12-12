import { App, PluginSettingTab } from "obsidian";
import SimplePlanner from "./main";
import { CalendarSetting } from "./ui/components/calendar-setting";
import { CollapsableSection } from "./ui/components/collapsable-section";

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

    new CollapsableSection(divContainer, 'calendar-with-checkmark', 'Calendars', (bodyEl: HTMLDivElement)=> {
      new CalendarSetting(bodyEl, {name: 'Cal1', color: '#784876'})
    });
	}
}
