import {Setting, App, TextComponent} from 'obsidian';
import {AddCustomRow} from './add-custom-row';
import {Calendar} from '../../types';

export class CustomCalendarOption extends AddCustomRow {
  constructor(containerEl: HTMLElement, public calendars: Calendar[], private app: App, saveSettings: () => void) {
    super(containerEl,
        'Calendars',
        'Calendars that can be used on the events that exist',
        'Add Calendar',
        saveSettings,
        () => {
          const newCalendar = {name: '', color: '#000000'};
          this.calendars.push(newCalendar);
          this.saveSettings();
          this.addCalendar(newCalendar, this.calendars.length - 1, true);
        });

    this.display();
  }

  protected showInputEls() {
    this.calendars.forEach((command, index) => {
      this.addCalendar(command, index);
    });
  }

  private addCalendar(calendar: Calendar, index: number, focusOnCommand = false) {
    new Setting(this.inputElDiv)
        .addText((text: TextComponent) => {
          text.setValue(calendar.name)
              .onChange((calendarName: string) => {
                calendar.name = calendarName;

                this.calendars[index] = calendar;
                this.saveSettings();
              });

          text.inputEl.setAttr('tabIndex', index);

          if (focusOnCommand) {
            text.inputEl.focus();
          }
        })
        .addColorPicker((colorPicker) => {
          colorPicker.setValue(calendar.color)
              .onChange((color: string) => {
                calendar.color = color;

                this.calendars[index] = calendar;
                this.saveSettings();
              });
        })
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
                this.calendars.splice(index, 1);
                this.saveSettings();
                this.resetInputEls();
              });
        });
  }

  // TODO: swap this out for something that actually swaps the values of the html elements as well to avoid the need for a refresh of these settings on swap and delete
  private arrayMove(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex === this.calendars.length) {
      return;
    }

    const element = this.calendars[fromIndex];
    this.calendars[fromIndex] = this.calendars[toIndex];
    this.calendars[toIndex] = element;
  }
}
