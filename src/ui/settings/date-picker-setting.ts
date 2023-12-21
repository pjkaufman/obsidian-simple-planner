import {Setting, TextComponent, moment} from 'obsidian';

export const datePickerFormat = 'YYYY-MM-DD';

export class DatePickerSetting extends Setting {
  inputEl: HTMLInputElement;
  private textCb: TextComponent;
  private onChangeCallback: (value: string) => void = null;
  constructor(containerEl: HTMLElement) {
    super(containerEl);

    this.addText((text: TextComponent) => {
      this.textCb = text;
      this.inputEl = text.inputEl;
      this.textCb.onChange((value: string) => {
        if (!this.onChangeCallback) {
          return;
        }

        this.onChangeCallback(value);
      });

      this.inputEl.type = 'date';
    });
  }

  /**
   * Takes in a date in the format YYYYMMDD and sets the date picker's value.
   * @param {string} value The date to set the date picker to in the format YYYYMMDD or empty in order to remove the current value.
   * @return {DatePickerSetting} the current date picker
   */
  setValue(value: string): DatePickerSetting {
    if (value.trim() == '') {
      this.textCb.setValue('');

      return this;
    }

    const val = moment(value, 'YYYYMMDD');
    if (val.isValid()) {
      this.textCb.setValue(val.format(datePickerFormat));
    }

    return this;
  }

  setMinValue(min: string): DatePickerSetting {
    if (min.trim() == '') {
      this.inputEl.setAttribute('min', '');

      return this;
    }

    const val = moment(min, 'YYYYMMDD');
    if (val.isValid()) {
      this.inputEl.setAttribute('min', val.format(datePickerFormat));
    }

    return this;
  }

  setMaxValue(max: string): DatePickerSetting {
    if (max.trim() == '') {
      this.inputEl.setAttribute('max', '');

      return this;
    }

    const val = moment(max, 'YYYYMMDD');
    if (val.isValid()) {
      this.inputEl.setAttribute('max', val.format(datePickerFormat));
    }

    return this;
  }

  onChange(callback: (value: string) => void): DatePickerSetting {
    this.onChangeCallback = callback;

    return this;
  }

  getValue(): string {
    return this.inputEl.value;
  }
}
