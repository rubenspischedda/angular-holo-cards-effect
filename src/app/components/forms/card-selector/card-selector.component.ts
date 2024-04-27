import { Component, input, model, output } from '@angular/core';
import { SelectComponent } from '../../base/select/select.component';
import { ButtonComponent } from '../../base/button/button.component';
import { Card } from '../../../models/Card';

@Component({
  selector: 'app-card-selector',
  standalone: true,
  imports: [SelectComponent, ButtonComponent],
  templateUrl: './card-selector.component.html',
  styleUrl: './card-selector.component.css'
})
export class CardSelectorComponent {
  cards = input<Card[]>([]);

  selectedCard = model<Card|undefined>(undefined);

  importClick = output();

  getCardsOptions() {
    return this.cards()?.map((card) => ({ value: card, label: `[${card.type}] ${card.name}` }));
  }
}
