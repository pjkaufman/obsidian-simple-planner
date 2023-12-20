
import {Setting, TextComponent} from 'obsidian';
import {Calendar} from 'src/types';

export class CalendarSetting {
  setting: Setting;
  constructor(public containerEl: HTMLDivElement, public calendar: Calendar) {
    this.display();
  }

  display() {
    this.setting = new Setting(this.containerEl)
        .addText((text: TextComponent) => {
          text.setValue(this.calendar.name);
        })
        .addColorPicker((colorPicker) => {
          colorPicker.setValue(this.calendar.color)
              .onChange((value: string) => {
                console.log(value);
              });
        });
  }

  // async saveValue(value: T) {
  //   const keys = this.keyToUpdate.split('.');
  //   if (keys.length === 2) {
  //     // @ts-ignore allows for updating an arbitrary nested property
  //     this.plugin.settings[keys[0]][keys[1]] = value;
  //   } else {
  //     // @ts-ignore allows for updating an arbitrary property
  //     this.plugin.settings[this.keyToUpdate] = value;
  //   }

  //   if (this.beforeSave) {
  //     this.beforeSave();
  //   }

  //   await this.plugin.saveSettings();
  // }
}
