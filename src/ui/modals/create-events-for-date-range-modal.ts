import {App, Modal, Notice, moment} from 'obsidian';
import {DateRangePickerSetting} from '../settings/date-range-picker-setting';
import {datePickerFormat} from '../settings/date-picker-setting';

export class CreateEventsForDateRange extends Modal {
  public dateRange: DateRangePickerSetting;
  constructor(app: App, private submitCallback: (startDate: string, endDate: string) => Promise<void>) {
    super(app);
  }

  onOpen() {
    const {contentEl} = this;

    this.modalEl.addClass('confirm-modal');

    contentEl.createEl('h2', {text: 'Create Events for the Specified Date Range'});


    this.dateRange = new DateRangePickerSetting(contentEl);

    this.contentEl.createDiv('modal-button-container', (buttonsEl) => {
      buttonsEl.createEl('button', {text: 'Cancel'}).addEventListener('click', () => this.close());

      const btnSubmit = buttonsEl.createEl('button', {
        attr: {type: 'submit'},
        cls: 'mod-cta',
        text: 'Create Events',
      });
      btnSubmit.addEventListener('click', async (_e) => {
        await this.save();
      });
      setTimeout(() => {
        btnSubmit.focus();
      }, 50);
    });
  }

  async save() {
    const startValue = this.dateRange.startDate.getValue();
    const endValue = this.dateRange.endDate.getValue();
    if (startValue == '' || endValue == '') {
      new Notice('Start date and end date must be set.');

      return;
    }

    await this.submitCallback(moment(startValue, datePickerFormat).format('YYYYMMDD'), moment(endValue, datePickerFormat).format('YYYYMMDD'));

    this.close();
  }

  onClose() {
    const {contentEl} = this;
    contentEl.empty();
  }
}
