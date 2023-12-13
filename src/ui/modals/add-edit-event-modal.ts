import {App, DropdownComponent, Modal, Setting, TextComponent} from "obsidian";
import {Calendar, CalendarEvent} from "../../types";

const daysOfWeekLetters = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];
const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekOfMonth = ['1st', '2nd', '3rd', '4th', 'Last'];

export class AddEditEventModal extends Modal {
	constructor(app: App, public event: CalendarEvent, public calendars: Calendar[]) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;

		contentEl.createEl('h2', {text: 'Add Event'});

		new Setting(contentEl).setName('Event Name:')
			.addText((text: TextComponent) => {
			text.setValue(this.event.name)
				.onChange((eventName: string) => {
					this.event.name = eventName;
				});
		});

		new Setting(contentEl).setName('Event Description:')
			.addText((text: TextComponent) => {
			text.setValue(this.event.description)
				.onChange((eventDescription: string) => {
					this.event.description = eventDescription;
				});
		});

		new Setting(contentEl).setName('Calendar(s):')
			.addText((text: TextComponent) => {
			text.setValue(this.event.calendar)
				.onChange((eventCalendar: string) => {
					const calendars = eventCalendar.split(' ');
					const existingCalendars = [];
					for (const calendarName of calendars) {
						for (const calendar of this.calendars) {
							if (calendarName === calendar.name) {
								existingCalendars.push(calendar);
								break;
							}
						}
					}

					this.event.calendar = existingCalendars.join(' ');
				});
		});

		const occurrenceDiv = contentEl.createDiv();
		let timeText: TextComponent;
		const timeSetting = new Setting(occurrenceDiv).setName('Time:')
			.addText((text: TextComponent) => {
				timeText = text.setValue(this.event.occurrenceInfo.time ?? '')
					.onChange((time: string) => {
						this.event.occurrenceInfo.time = time;
					});
			});

		timeSetting.controlEl.createSpan({text: 'All Day Event'});
		timeSetting.addText((text: TextComponent) => {
			text.inputEl.type = 'checkbox';
			text.inputEl.checked = this.event.occurrenceInfo.time === undefined;
			text.onChange(() => {
				if (text.inputEl.checked) {
					this.event.occurrenceInfo.time = undefined;
				} else {
					this.event.occurrenceInfo.time = timeText.getValue();
				}

				timeText.setDisabled(text.inputEl.checked);
			});
		});

		const dayOfWeekSetting = new Setting(occurrenceDiv).setName('Days of Week:');
		dayOfWeekSetting.controlEl.style.flexWrap = 'wrap';

		let index = 0;
		for (const dayOfWeekLetter of daysOfWeekLetters) {
			dayOfWeekSetting.controlEl.createSpan({text: dayOfWeekLetter});

			dayOfWeekSetting.addText((text: TextComponent) => {
					const dayNum = index;
					text.inputEl.type = 'checkbox';
					text.inputEl.checked = this.event.occurrenceInfo.daysOfWeek && this.event.occurrenceInfo.daysOfWeek.includes(dayNum);
					text.onChange(() => {
						if (!this.event.occurrenceInfo.daysOfWeek) {
							this.event.occurrenceInfo.daysOfWeek = [dayNum];

							return;
						}

						if (text.inputEl.checked) {
							this.event.occurrenceInfo.daysOfWeek.push(dayNum);
						} else {
							this.event.occurrenceInfo.daysOfWeek.remove(dayNum);
						}
					});
				});

			index++;
		}

		const weeksSetting = new Setting(occurrenceDiv).setName('Week Occurrence:');
		weeksSetting.controlEl.style.flexWrap = 'wrap';

		index = 0;
		for (const week of weekOfMonth) {
			weeksSetting.controlEl.createSpan({text: week});

			weeksSetting.addText((text: TextComponent) => {
					const weekNum = index+1;
					text.inputEl.type = 'checkbox';
					text.inputEl.checked = this.event.occurrenceInfo.weeks && this.event.occurrenceInfo.weeks.includes(weekNum);
					text.onChange(() => {
						if (!this.event.occurrenceInfo.weeks) {
							this.event.occurrenceInfo.weeks = [weekNum];

							return;
						}

						if (text.inputEl.checked) {
							this.event.occurrenceInfo.weeks.push(weekNum);
						} else {
							this.event.occurrenceInfo.weeks.remove(weekNum);
						}
					});
				});

			index++;
		}

		const monthsOfYearSetting = new Setting(occurrenceDiv).setName('Months of Year:');
		monthsOfYearSetting.controlEl.style.flexWrap = 'wrap';

		index = 0;
		for (const monthAbbreviation of monthAbbreviations) {
			monthsOfYearSetting.controlEl.createSpan({text: monthAbbreviation});

			monthsOfYearSetting.addText((text: TextComponent) => {
					const monthNum = index;
					text.inputEl.type = 'checkbox';
					text.inputEl.checked = this.event.occurrenceInfo.months && this.event.occurrenceInfo.months.includes(monthNum);
					text.onChange(() => {
						if (!this.event.occurrenceInfo.months) {
							this.event.occurrenceInfo.months = [monthNum];

							return;
						}

						if (text.inputEl.checked) {
							this.event.occurrenceInfo.months.push(monthNum);
						} else {
							this.event.occurrenceInfo.months.remove(monthNum);
						}
					});
				});

			index++;
		}

		new Setting(occurrenceDiv).setName('Special Holiday:')
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown.addOption('NA', 'NA');
				dropdown.addOption('Easter', 'Easter');
				dropdown.addOption('Good Friday', 'Good Friday');
				dropdown.addOption('Palm Sunday', 'Palm Sunday');
				dropdown.addOption('Election Day', 'Election Day');

				dropdown.setValue('NA');

				dropdown.onChange((value: string) => {
					this.event.occurrenceInfo.isEaster = false;
					this.event.occurrenceInfo.isElectionDay = false;
					this.event.occurrenceInfo.isGoodFriday = false;
					this.event.occurrenceInfo.isPalmSunday = false;

					switch (value) {
						case 'Easter':
							this.event.occurrenceInfo.isEaster = true;
							break;
						case 'Good Friday':
							this.event.occurrenceInfo.isGoodFriday = true;
							break;
						case 'Palm Sunday':
							this.event.occurrenceInfo.isPalmSunday = true;
							break;
						case 'Election Day':
							this.event.occurrenceInfo.isElectionDay = true;
							break;
					}
				});
			});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();

		console.log(this.event);
	}
}
