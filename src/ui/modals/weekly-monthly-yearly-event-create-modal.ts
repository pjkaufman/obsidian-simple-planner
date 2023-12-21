import {App, DropdownComponent, Modal, Notice, Setting, TextComponent, moment} from 'obsidian';
import {Calendar} from '../../types';

export class WeeklyMonthlyYearlyEventCreateModal extends Modal {
  public selectedCalendars: string[] = [];
  public selectedYear: number;
  constructor(app: App, public calendars: Calendar[], private submitCallback: (year: number, calendars: string[]) => Promise<void>) {
    super(app);
  }

  onOpen() {
    const {contentEl} = this;

    this.modalEl.addClass('confirm-modal');

    contentEl.createEl('h2', {text: 'Create Weekly, Monthly, and Yearly Events for Year'});

    const currentDate = moment();
    new Setting(contentEl).setName('Year:')
        .addDropdown((dropdown: DropdownComponent) => {
          let year = currentDate.year();
          this.selectedYear = year;
          let i = 1;
          do {
            dropdown.addOption(year + '', year + '');

            year++;
            i++;
          } while (i <= 5);


          dropdown.setValue(this.selectedYear + '');

          dropdown.onChange((value: string) => {
            let year = this.selectedYear;
            const num = parseInt(value, 10);
            if (typeof num == 'number') {
              year = num;
            }

            this.selectedYear = year;
          });
        });

    const calendarSetting = new Setting(contentEl).setName('Calendar(s):');
    calendarSetting.controlEl.style.flexWrap = 'wrap';

    for (const calendar of this.calendars) {
      calendarSetting.controlEl.createSpan({text: calendar.name});

      calendarSetting.addText((text: TextComponent) => {
        text.inputEl.type = 'checkbox';
        text.inputEl.checked = false;
        text.onChange(() => {
          if (text.inputEl.checked) {
            this.selectedCalendars.push(calendar.name);
          } else {
            this.selectedCalendars.remove(calendar.name);
          }
        });
      });
    }

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
    if (!this.selectedCalendars || this.selectedCalendars.length == 0) {
      const validationMessage = 'At least one calendar must be selected.';
      new Notice(validationMessage);

      return;
    }

    await this.submitCallback(this.selectedYear, this.selectedCalendars);

    this.close();
  }

  onClose() {
    const {contentEl} = this;
    contentEl.empty();
  }
}
