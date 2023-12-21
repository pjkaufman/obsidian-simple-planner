import {Setting, App} from 'obsidian';
import {AddCustomRow} from './add-custom-row';
import {Calendar, CalendarEvent} from '../../types';
import {AddEditEventModal} from '../modals/add-edit-event-modal';
import {daysOfWeekLetters, monthAbbreviations, weekOfMonth} from '../../event';

export class CustomEventOption extends AddCustomRow {
  constructor(containerEl: HTMLElement, public events: CalendarEvent[], private calendars: Calendar[], private app: App, saveSettings: () => void) {
    super(containerEl,
        'Events',
        'Events that are reoccurring that will be used when getting events happening on a specific day',
        'Add Event',
        saveSettings,
        () => {
          const newEvent: CalendarEvent = {
            name: '',
            description: undefined,
            calendar: '',
            occurrenceInfo: {
              time: undefined,
              months: null,
              day: 0,
              daysOfWeek: [],
              weeks: [],
              isEaster: false,
              isElectionDay: false,
              isGoodFriday: false,
              isPalmSunday: false,
            },
          };

          new AddEditEventModal(this.app, 'Add Event', newEvent, this.calendars, (event: CalendarEvent) => {
            this.events.push(event);
            this.saveSettings();
            this.addEvent(event, this.events.length - 1);
          }).open();
        });

    this.display();
  }

  protected showInputEls() {
    this.events.forEach((command, index) => {
      this.addEvent(command, index);
    });
  }

  private addEvent(event: CalendarEvent, index: number) {
    new Setting(this.inputElDiv).setName(createEventFragment(event))
        .addExtraButton((cb) => {
          cb.setIcon('up-chevron-glyph')
              .setTooltip('Move down')
              .onClick(() => {
                this.arrayMove(index, index - 1);
                this.saveSettings();
                this.resetInputEls();
              });
        })
        .addExtraButton((cb) => {
          cb.setIcon('down-chevron-glyph')
              .setTooltip('Move up')
              .onClick(() => {
                this.arrayMove(index, index + 1);
                this.saveSettings();
                this.resetInputEls();
              });
        })
        .addExtraButton((cb) => {
          cb.setIcon('pencil')
              .setTooltip('Edit')
              .onClick(() => {
                new AddEditEventModal(this.app, 'Edit Event', this.events[index], this.calendars, (event: CalendarEvent) => {
                  this.events[index] = event;
                  this.saveSettings();
                  this.resetInputEls();
                }).open();
              });
        })
        .addExtraButton((cb) => {
          cb.setIcon('cross')
              .setTooltip('Delete')
              .onClick(() => {
                this.events.splice(index, 1);
                this.saveSettings();
                this.resetInputEls();
              });
        });
  }

  // TODO: swap this out for something that actually swaps the values of the html elements as well to avoid the need for a refresh of these settings on swap and delete
  private arrayMove(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex === this.events.length) {
      return;
    }

    const element = this.events[fromIndex];
    this.events[fromIndex] = this.events[toIndex];
    this.events[toIndex] = element;
  }
}

function createEventFragment(event: CalendarEvent): DocumentFragment {
  // eslint-disable-next-line no-undef
  return createFragment((el: DocumentFragment) => {
    const nameHeader =el.createSpan({text: event.name});
    if (event.calendar && event.calendar.trim() != '') {
      nameHeader.createEl('i', {text: ` (${event.calendar.replaceAll('|', ' ')})`});
    }

    el.createEl('br');

    if (event.description && event.description.trim() != '') {
      el.createSpan({text: event.description, cls: 'setting-item-description'});
      el.createEl('br');
      el.createEl('br');
    }

    if (!event.occurrenceInfo || event.occurrenceInfo.isElectionDay || event.occurrenceInfo.isEaster || event.occurrenceInfo.isGoodFriday || event.occurrenceInfo.isPalmSunday) {
      return;
    }


    let occurrenceText = '';
    if (event.occurrenceInfo.months && event.occurrenceInfo.months.length > 0) {
      occurrenceText += 'every';

      for (const month of event.occurrenceInfo.months) {
        occurrenceText += ' ' + monthAbbreviations[month] + ',';
      }

      occurrenceText = occurrenceText.substring(0, occurrenceText.length -1) + ' ';
    }

    if (event.occurrenceInfo.weeks && event.occurrenceInfo.weeks.length > 0) {
      occurrenceText += 'on the';

      for (const week of event.occurrenceInfo.weeks) {
        occurrenceText += ' ' + weekOfMonth[week-1] + ',';
      }

      const weekText = event.occurrenceInfo.weeks.length > 1 ? ' weeks' : ' week';
      occurrenceText = occurrenceText.substring(0, occurrenceText.length -1) + weekText + ' ';
    }

    if (event.occurrenceInfo.daysOfWeek && event.occurrenceInfo.daysOfWeek.length > 0) {
      occurrenceText += 'on ';

      for (const dayOfWeek of event.occurrenceInfo.daysOfWeek) {
        occurrenceText += daysOfWeekLetters[dayOfWeek];
      }

      occurrenceText += ' ';
    }

    if (event.occurrenceInfo.day > 0) {
      occurrenceText += 'on day ' + event.occurrenceInfo.day + ' ';
    }

    if (event.occurrenceInfo.time && event.occurrenceInfo.time.trim() != '') {
      occurrenceText += 'at ' + event.occurrenceInfo.time;
    }

    occurrenceText = occurrenceText.trim();

    if (occurrenceText != '') {
      el.createSpan({text: occurrenceText.charAt(0).toUpperCase() + occurrenceText.substring(1)});
    }
  });
}
