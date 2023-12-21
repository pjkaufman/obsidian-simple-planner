import {Setting, moment} from 'obsidian';
import {DatePickerSetting, datePickerFormat} from './date-picker-setting';

export class DateRangePickerSetting extends Setting {
  startDate: DatePickerSetting;
  endDate: DatePickerSetting;
  constructor(containerEl: HTMLElement) {
    super(containerEl);

    this.startDate = new DatePickerSetting(containerEl).setName('Start Date').onChange((value: string) => {
      if (this.endDate.getValue() == '') {
        const val = moment(value, datePickerFormat);
        this.endDate.setMinValue(val.format('YYYYMMDD'));
      }
    });

    this.endDate = new DatePickerSetting(containerEl).setName('End Date').onChange((value: string) => {
      if (this.startDate.getValue() == '') {
        const val = moment(value, datePickerFormat);
        this.startDate.setMaxValue(val.format('YYYYMMDD'));
      }
    });
  }
}
