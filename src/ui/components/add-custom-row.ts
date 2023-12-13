import {Setting} from 'obsidian';

/**
 * AddCustomRow is meant to be used where you have a setting that needs a name a description
 * and a button that allows the user to add another entry.
 */
export abstract class AddCustomRow {
  protected inputElDiv: HTMLDivElement;

  constructor(
    public containerEl: HTMLElement,
    public name: string,
    public description: string,
    private addInputBtnText: string,
    protected saveSettings: () => void,
    private onAddInput: () => void) {
  }

  display() {
    this.containerEl.createDiv({cls: 'setting-item-name', text: this.name});

    const descriptionAndWarningContainer = this.containerEl.createDiv({cls: 'setting-item-description'});

    descriptionAndWarningContainer.createEl('p', {text: this.description, cls: 'custom-row-description'});

    new Setting(this.containerEl)
        .addButton((cb)=>{
          cb.setButtonText(this.addInputBtnText)
              .setCta()
              .onClick(() => this.onAddInput());
        });

    this.inputElDiv = this.containerEl.createDiv();
    this.showInputEls();
  }

  protected resetInputEls() {
    this.inputElDiv.empty();
    this.showInputEls();
  }

  protected abstract showInputEls(): void;
}
