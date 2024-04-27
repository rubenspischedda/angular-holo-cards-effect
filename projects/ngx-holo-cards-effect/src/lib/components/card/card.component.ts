import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  model,
  signal,
  viewChild
} from '@angular/core';
import {
  clamp,
  getAspectRatio,
  isFacingFront,
  remap
} from '../../utils/Math';
import { calculateMousePosition, calculateRotationFromMousePosition } from '../../utils/Coordinates';
import { rarities } from '../../models/Rarity';

interface CardStyle {
  'width': string;
  'max-width': string;
  '--rotate-x': string;
  '--rotate-y': string;
  '--pointer-x': string;
  '--pointer-y': string;
  '--pointer-from-center': string;
  '--pointer-from-left': string;
  '--pointer-from-top': string;
  '--card-opacity': number;
  '--card-aspect': number;
  '--card-radius': string;
  '--seedx'?: number;
  '--seedy'?: number;
  '--foil'?: string;
  '--mask'?: string;
  '--grain': string;
  '--glitter': string;
  '--glittersize': string;
  '--space': string;
  '--angle': string;
}

@Component({
  selector: 'lib-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent implements AfterViewInit {
  frontImageElement = viewChild<ElementRef | undefined>('frontImageElement');

  cardContainer = viewChild<ElementRef | undefined>('cardContainer');

  raritiesObject = rarities;

  frontImage = input<string>();
  backImage = input<string>();
  foilImage = input<string>();
  maskImage = input<string>();

  rarities = model<Partial<Record<keyof typeof rarities, boolean>>>({});

  maxXRotation = input<number>(25);
  maxYRotation = input<number>(15);

  showCard = model(true);

  showBack = model(true);
  showFront = model(true);
  showFoil = model(true);
  showMask = model(true);

  interactive = input(true);

  xAxis = model(0);
  yAxis = model(0);
  zAxis = model(0);

  rotation = computed(() => {
    return calculateRotationFromMousePosition({ x: this.mousePointerX(), y: this.mousePointerY() }, this.maxXRotation(), this.maxYRotation());
  });

  size = model(20);

  mousePointerX = model(0.5);
  mousePointerY = model(0.5);

  internalMousePointerX: number|undefined;
  internalMousePointerY: number|undefined;

  percentageDistanceFromCenter = computed(() => {
    return clamp(
      Math.sqrt(
        (this.mousePointerY() * 100 - 50) * (this.mousePointerY() * 100 - 50) +
          (this.mousePointerX() * 100 - 50) * (this.mousePointerX() * 100 - 50)
      ) / 50,
      0,
      1
    );
  });

  facingFront = computed(() => {
    return isFacingFront(this.xAxis(), this.yAxis(), [0, 0, 1]);
  });

  aspectRatio = signal(1);

  cardStyle = signal<any>({});
  isMouseInCard = signal(false);

  firstRadius = model(4.55);
  secondRadius = model(3.5);

  enterInterval: NodeJS.Timeout | undefined;
  resettingInterval: NodeJS.Timeout | undefined;

  effectsOpacity = signal(0);

  constructor() {

    effect(() => {
      if (this.frontImage() !== undefined) {
        this.frontImageElement()?.nativeElement?.addEventListener('load', () => {
          this.aspectRatio.set(
            getAspectRatio(this.frontImageElement()?.nativeElement)
          );
        });
      }
    });

    effect(
      () => {
        const xAxisString = this.isMouseInCard()
          ? this.rotation().xAxis
          : this.xAxis();
        const yAxisString = this.isMouseInCard()
          ? this.rotation().yAxis
          : this.yAxis();

        const style: CardStyle = {
          'max-width': `${this.size()}rem`,
          'width': `${this.size()}rem`,
          '--rotate-x': `${xAxisString}deg`,
          '--rotate-y': `${yAxisString}deg`,
          '--pointer-x': `${this.mousePointerX() * 100}%`,
          '--pointer-y': `${this.mousePointerY() * 100}%`,
          '--pointer-from-center': `${this.percentageDistanceFromCenter()}`,
          '--pointer-from-left': `${this.mousePointerX()}`,
          '--pointer-from-top': `${this.mousePointerY()}`,
          '--card-opacity': this.effectsOpacity(),
          '--card-aspect': this.aspectRatio(),
          '--card-radius': `${this.firstRadius()}% / ${this.secondRadius()}%`,
          '--grain': 'url("/assets/grain.webp")',
          '--glitter': 'url("/assets/glitter.png")',
          '--glittersize': '25%',
          '--space': '5%',
          '--angle': '133deg',
        }

        if (this.foilImage() !== undefined && this.foilImage() !== '') {
          style['--foil'] = `url(${this.foilImage()})`;
        }

        if (this.maskImage() !== undefined && this.maskImage() !== '') {
          style['--mask'] = `url(${this.maskImage()})`;
        }

        this.cardStyle.set(style);
      },
      { allowSignalWrites: true }
    );
  }

  ngAfterViewInit(): void {
    this.setAspectRatioListener();
  }

  private setAspectRatioListener() {
    this.frontImageElement()?.nativeElement?.addEventListener('load', () => {
      this.aspectRatio.set(
        getAspectRatio(this.frontImageElement()?.nativeElement)
      );
    });
  }

  onMouseEnterCard(event: MouseEvent|TouchEvent) {
    if (!this.interactive()) return;

    this.enterInterval && clearInterval(this.enterInterval);
    this.resettingInterval && clearInterval(this.resettingInterval);
    const mousePosition = calculateMousePosition(event);
    const rotation = calculateRotationFromMousePosition(mousePosition, this.maxXRotation(), this.maxYRotation());
    this.moveToCurrentPositionGracefully((endingRotation, endingX, endingY) => {
      this.xAxis.set(endingRotation.xAxis);
      this.yAxis.set(endingRotation.yAxis);
      this.mousePointerX.set(endingX);
      this.mousePointerY.set(endingY);
      this.isMouseInCard.set(true);
    })
  }

  onMouseLeaveCard() {
    this.resettingInterval && clearInterval(this.resettingInterval);
    this.enterInterval && clearInterval(this.enterInterval);
    this.isMouseInCard.set(false);
    this.resetPositionGracefully();
  }

  onMouseMoveInCard(event: MouseEvent | TouchEvent) {
    const mousePosition = calculateMousePosition(event);
    this.internalMousePointerX = mousePosition.x;
    this.internalMousePointerY = mousePosition.y;
    
    if (this.isMouseInCard()) {
      this.enterInterval && clearInterval(this.enterInterval);
      this.resettingInterval && clearInterval(this.resettingInterval);
      
      this.mousePointerX.set(mousePosition.x);
      this.mousePointerY.set(mousePosition.y);

      this.xAxis.set(this.rotation().xAxis);
      this.yAxis.set(this.rotation().yAxis);
    }
  }

  private moveToCurrentPositionGracefully(onAnimationComplete: (endingRotation: { xAxis: number, yAxis: number }, endingX: number, endingY: number) => void) {
    // animate rotations to 0
    this.enterInterval = setInterval(() => {
      const x = this.xAxis();
      const y = this.yAxis();

      const opacity = this.effectsOpacity();

      const currentMousePointerX = this.internalMousePointerX;
      const currentMousePointerY = this.internalMousePointerY;

      const currentRealRotation = calculateRotationFromMousePosition({ x: currentMousePointerX ?? 0.5, y: currentMousePointerY ?? 0.5 }, this.maxXRotation(), this.maxYRotation());
      
      const xAxisNew = x * 0.9 + currentRealRotation.xAxis * 0.1;
      const yAxisNew = y * 0.9 + currentRealRotation.yAxis * 0.1;
      const opacityNew = opacity * 0.9 + 1 * 0.1;

      const simulatedMousePointerX = remap(xAxisNew, this.maxXRotation(), -this.maxXRotation(), 0, 1);
      const simulatedMousePointerY = remap(yAxisNew, -this.maxYRotation(), this.maxYRotation(), 0, 1);

      this.mousePointerX.set(simulatedMousePointerX);
      this.mousePointerY.set(simulatedMousePointerY);

      this.xAxis.set(xAxisNew);
      this.yAxis.set(yAxisNew);
      this.effectsOpacity.set(opacityNew);

      if (Math.abs(xAxisNew - currentRealRotation.xAxis) < 0.1 && Math.abs(yAxisNew - currentRealRotation.yAxis) < 0.1) {
        clearInterval(this.enterInterval);
        this.xAxis.set(currentRealRotation.xAxis);
        this.yAxis.set(currentRealRotation.yAxis);
        this.effectsOpacity.set(1);
        onAnimationComplete(currentRealRotation, currentMousePointerX ?? 0.5, currentMousePointerY ?? 0.5);
      }
    }, 8);
  }

  private resetPositionGracefully() {
    // animate rotations to 0
    this.resettingInterval = setInterval(() => {
      const x = this.xAxis();
      const y = this.yAxis();
      const effectsOpacity = this.effectsOpacity();

      const xAxisNew = x * 0.9;
      const yAxisNew = y * 0.9;
      const opacityNew = effectsOpacity * 0.9;

      const simulatedMousePointerX = remap(xAxisNew, this.maxXRotation(), -this.maxXRotation(), 0, 1);
      const simulatedMousePointerY = remap(yAxisNew, -this.maxYRotation(), this.maxYRotation(), 0, 1);

      this.mousePointerX.set(simulatedMousePointerX);
      this.mousePointerY.set(simulatedMousePointerY);

      this.xAxis.set(xAxisNew);
      this.yAxis.set(yAxisNew);

      this.effectsOpacity.set(opacityNew);

      if (Math.abs(xAxisNew) < 0.1 && Math.abs(yAxisNew) < 0.1) {
        clearInterval(this.resettingInterval);
        this.xAxis.set(0);
        this.yAxis.set(0);
        this.effectsOpacity.set(0);
      }
    }, 16);
  }

  getRaritiesAttribute(): string {
    const activeAttributes = Object.entries(this.rarities())
      .filter(([, value]) => value)
      .map(([key]) => key);

    return Object.entries(rarities).filter(([key, value]) => {
      return activeAttributes.includes(key) && value;
    }).map(([key]) => key).join(' ');
  }

  addClassToCard(className: string) {
    this.cardContainer()?.nativeElement.classList.add(className);
  }

  removeClassFromCard(className: string) {
    this.cardContainer()?.nativeElement.classList.remove(className);
  }
}
