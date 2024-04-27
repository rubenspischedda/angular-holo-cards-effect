import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../label/label.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, FormsModule, LabelComponent, ButtonComponent],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent {
  value = model<number>(0);

  label = input<string>();

  min = input<number>(0);
  max = input<number>(100);
  step = input<number>(1);

  default = input<number>(0);

  showReset = input<boolean>(false);
  showMinMax = input<boolean>(false);
  showValue = input<boolean>(false);

  reset() {
    this.value.set(this.default());
  }
}
