import { CommonModule } from '@angular/common';
import { Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '../../base/select/select.component';
import { TextInputComponent } from '../../base/text-input/text-input.component';
import { LabelComponent } from '../../base/label/label.component';

interface ImageSelectorOption {
  url: string;
  label: string;
}

@Component({
  selector: 'app-image-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectComponent, TextInputComponent, LabelComponent],
  templateUrl: './image-selector.component.html',
  styleUrl: './image-selector.component.css'
})
export class ImageSelectorComponent {
  label = input<string>('');
  options = input<ImageSelectorOption[]>([]);

  selectOptions = computed(() => {
    return this.options()?.map((option) => ({ value: option.url, label: option.label }));
  });

  url = model<string|undefined>('');

  file: File | null = null;

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.file = file;
      this.url.set(URL.createObjectURL(file));
    }
  }
}
