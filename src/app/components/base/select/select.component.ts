import { CommonModule } from '@angular/common';
import { Component, OnChanges, SimpleChanges, effect, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css'
})
export class SelectComponent<T> implements OnChanges {
  label = input<string>();
  value = model<T>();
  options = input<{ value: T, label: string }[]>();

  ngOnChanges(changes: SimpleChanges): void {
      const { options } = changes;

      if (options.previousValue !== options.currentValue && options.previousValue === undefined && options.currentValue !== undefined && options.currentValue.length > 0) {
          this.value.set(options.currentValue[0].value);
      }
  }
}
