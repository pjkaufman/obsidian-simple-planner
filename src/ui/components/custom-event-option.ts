import {Setting, App} from 'obsidian';
import {AddCustomRow} from './add-custom-row';
import {Calendar, CalendarEvent} from '../../types';
import { AddEditEventModal } from '../modals/add-edit-event-modal';
import { eventToDisplayString } from 'src/event';

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
    new Setting(this.inputElDiv).setName(eventToDisplayString(event))
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
