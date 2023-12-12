import { setIcon } from "obsidian";

export class CollapsableSection {
  detailsEl: HTMLElement;
  summaryEl: HTMLElement;
  bodyEl: HTMLDivElement;
  constructor(public containerEl: HTMLDivElement, public icon:string, public title: string, private addContent: (bodyEl: HTMLDivElement) => void) {
    this.display();
  }

  display() {
    this.detailsEl = this.containerEl.createEl('details');

    this.summaryEl = this.detailsEl.createEl('summary');
    const iconEl = this.summaryEl.createSpan();

    setIcon(iconEl, this.icon);

    this.summaryEl.createSpan({text: this.title});

    this.bodyEl = this.detailsEl.createDiv();

    this.addContent(this.bodyEl);
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
