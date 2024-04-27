import { Component, OnInit, computed, effect, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardComponent, rarities } from 'ngx-holo-cards-effect';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import backs from './backs.json';
import { ImageSelectorComponent } from './components/forms/image-selector/image-selector.component';
import { CheckboxComponent } from './components/base/checkbox/checkbox.component';
import { SliderComponent } from './components/base/slider/slider.component';
import {
  GroupComponent,
  GroupSpace,
} from './components/forms/group/group.component';
import { CardSelectorComponent } from './components/forms/card-selector/card-selector.component';
import { ButtonComponent } from './components/base/button/button.component';
import { DialogService } from './services/dialog.service';
import { Card } from './models/Card';
import pkg from '../../package.json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CardComponent,
    CommonModule,
    FormsModule,
    ImageSelectorComponent,
    CheckboxComponent,
    SliderComponent,
    GroupComponent,
    CardSelectorComponent,
    ButtonComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'holo-cards-effect';
  version = pkg.version;

  card = viewChild('card', { read: CardComponent });

  dialogOpen = computed(() => this.dialogService.dialogOpen());

  GroupSpace = GroupSpace;
  RaritiesObject = rarities;
  
  importedCards: Card[] = [];
  
  frontUrl: string = '';
  backUrl: string = '';
  foilUrl: string|undefined = undefined;
  maskUrl: string|undefined = undefined;
  
  showCard = true;
  
  showBack = true;
  showFront = true;
  showFoil = true;
  showMask = true;
  
  xAxis = 0;
  yAxis = 0;
  zAxis = 0;

  size = 20;
  
  maxXRotation = 25;
  maxYRotation = 15;
  
  firstRadius = 4.55;
  secondRadius = 3.5;
  
  rarities: Partial<Record<keyof typeof rarities, boolean>> = {};

  jsonCardsText: string = '';
  selectedCard = signal<Card|undefined>(undefined);

  interactiveCard: boolean = true;
  
  cardFronts = () =>
    this.importedCards.map((card) => ({ url: card.frontUrl, label: `[${card.type}] ${card.name}` }));
  cardBacks = () =>
    backs.map((back) => ({ url: back.url, label: back.name }));
  cardFoils = () =>
    this.importedCards.filter((card) => card.foilUrl !== undefined).map((card) => ({ url: card.foilUrl ?? '', label: `[${card.type}] ${card.name}` }));
  cardMasks = () =>
    this.importedCards.filter((card) => card.maskUrl !== undefined).map((card) => ({ url: card.maskUrl ?? '', label: `[${card.type}] ${card.name}` }));
  
  constructor(private dialogService: DialogService) {
    effect(() => {
      if (this.selectedCard() !== undefined) {
        this.onCardSelected(this.selectedCard());
      }
    })
  }

  ngOnInit(): void {
    if (localStorage.getItem('cards')) {
      const parsed = JSON.parse(localStorage.getItem('cards')!);
      this.importedCards = parsed.cards;
    }
  }

  getRaritiesOptions: () => { label: string, value: keyof typeof rarities }[] = () => {
    return Object.entries(rarities).map(([key, value]) => ({
      label: value,
      value: key as keyof typeof rarities,
    }));
  }

  resetRarities() {
    this.rarities = {};
  }

  openDialog() {
    this.dialogService.openDialog();
  }

  closeDialog() {
    this.dialogService.closeDialog();
  }

  importCards() {
    try {
      const parsed = JSON.parse(this.jsonCardsText);
      this.importedCards = parsed.cards;
      localStorage.setItem('cards', JSON.stringify(parsed));
      this.closeDialog();
    } catch (error) {
      console.error(error);
    }
  }

  onCardSelected(card: Card|undefined) {
    this.frontUrl = card?.frontUrl ?? '';
    this.backUrl = card?.backUrl ?? '';
    this.foilUrl = card?.foilUrl;
    this.maskUrl = card?.maskUrl;

    this.resetRarities();

    card?.rarity.split(' ').forEach((rarity) => {
      this.rarities[rarity as keyof typeof rarities] = true;
    });
  }

  jump() {
    this.card()?.addClassToCard('jump');
    setTimeout(() => {
      this.card()?.removeClassFromCard('jump');
    }, 1000);
  }

  flip() {
    this.card()?.addClassToCard('flip');
    setTimeout(() => {
      this.card()?.removeClassFromCard('flip');
    }, 1500);
  }

  rotate() {
    this.card()?.addClassToCard('rotate');
    setTimeout(() => {
      this.card()?.removeClassFromCard('rotate');
    }, 1500);
  }
}
