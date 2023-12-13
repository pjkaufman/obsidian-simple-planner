import {Setting, App, TextComponent} from 'obsidian';
import {AddCustomRow} from './add-custom-row';
import {Calendar, CalendarEvent} from '../../types';
import { AddEditEventModal } from '../modals/add-edit-event-modal';

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
          new AddEditEventModal(this.app, newEvent, this.calendars).open();
          // this.events.push(newEvent);
          // this.saveSettings();
          // this.addEvent(newEvent, this.events.length - 1, true);
        });

    this.display();
  }

  protected showInputEls() {
    this.events.forEach((command, index) => {
      this.addEvent(command, index);
    });
  }

  private addEvent(event: CalendarEvent, index: number, focusOnCommand = false) {
    new Setting(this.inputElDiv)
        .addText((text: TextComponent) => {
          text.setValue(event.name)
            .onChange((eventName: string) => {
              event.name = eventName;

              this.events[index] = event;
              this.saveSettings();
            });

          text.inputEl.setAttr('tabIndex', index);

          if (focusOnCommand) {
            text.inputEl.focus();
          }
        })
        // .addColorPicker((colorPicker) => {
        //   colorPicker.setValue(event.color)
        //     .onChange((color: string) => {
        //       event.color = color;

        //       this.events[index] = event;
        //       this.saveSettings();
        //     });
        // })
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
