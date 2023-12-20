import {App, DropdownComponent, Modal, Notice, Setting, TextComponent} from 'obsidian';
import {Calendar, CalendarEvent} from '../../types';
import {daysOfWeekLetters, monthAbbreviations, weekOfMonth} from '../../event';

export class AddEditEventModal extends Modal {
  constructor(app: App, public title: string, public event: CalendarEvent, public calendars: Calendar[], private saveCallback: (event: CalendarEvent) => void) {
    super(app);
  }

  onOpen() {
    const {contentEl} = this;

    this.modalEl.addClass('confirm-modal');

    contentEl.createEl('h2', {text: this.title});

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
                      existingCalendars.push(calendar.name);
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
              .setDisabled(this.event.occurrenceInfo.time == undefined || this.event.occurrenceInfo.time.trim() === '')
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

    new Setting(occurrenceDiv).setName('Day of the Month:')
        .addText((text: TextComponent) => {
          text.inputEl.type = 'number';
          text.setValue(this.event.occurrenceInfo.day + '')
              .onChange((eventDay: string) => {
                let day = this.event.occurrenceInfo.day;
                const num = parseInt(eventDay, 10);
                if (typeof num == 'number') {
                  day = num;
                }

                this.event.occurrenceInfo.day = day;
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

    this.contentEl.createDiv('modal-button-container', (buttonsEl) => {
      buttonsEl.createEl('button', {text: 'Cancel'}).addEventListener('click', () => this.close());

      const btnSubmit = buttonsEl.createEl('button', {
        attr: {type: 'submit'},
        cls: 'mod-cta',
        text: 'Save Event',
      });
      btnSubmit.addEventListener('click', async (_e) => {
        this.save();
      });
      setTimeout(() => {
        btnSubmit.focus();
      }, 50);
    });
  }

  isValidEvent(): boolean {
    let isValid = true;
    if (this.event.name.trim() == '') {
      isValid = false;
    }

    if (this.event.calendar.trim() == '') {
      isValid = false;
    }

    if (this.event.occurrenceInfo.day > 31 ) {
      isValid = false;
    }

    if (this.event.occurrenceInfo.time && (this.event.occurrenceInfo.isEaster || this.event.occurrenceInfo.isElectionDay || this.event.occurrenceInfo.isGoodFriday || this.event.occurrenceInfo.isPalmSunday)) {
      isValid = false;
    }

    return isValid;
  }

  getEventValidationMsg(): string {
    const validationMessages: string[] = [];
    if (this.event.name.trim() == '') {
      validationMessages.push('Event name must have a value');
    }

    if (this.event.calendar.trim() == '') {
      validationMessages.push('Event must have a calendar');
    }

    if (this.event.occurrenceInfo.day > 31 ) {
      validationMessages.push('Event day must be less than 32');
    }

    if (this.event.occurrenceInfo.time && (this.event.occurrenceInfo.isEaster || this.event.occurrenceInfo.isElectionDay || this.event.occurrenceInfo.isGoodFriday || this.event.occurrenceInfo.isPalmSunday)) {
      validationMessages.push('Event time cannot be set for special holiday events');
    }

    if (validationMessages.length > 0) {
      return `Event is not valid:\n${validationMessages.join('\n')}`;
    }

    return '';
  }

  save() {
    if (this.event.occurrenceInfo.time && this.event.occurrenceInfo.time.trim() === '') {
      this.event.occurrenceInfo.time = undefined;
    }

    if (!this.isValidEvent()) {
      let validationMessage = this.getEventValidationMsg();
      if (validationMessage === '') {
        validationMessage = 'Event is not valid.';
      }

      new Notice(validationMessage);

      return;
    }

    this.saveCallback(this.event);

    this.close();
  }

  onClose() {
    const {contentEl} = this;
    contentEl.empty();
  }
}
