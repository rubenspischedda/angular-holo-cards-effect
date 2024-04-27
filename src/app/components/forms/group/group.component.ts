import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';

export enum GroupSpace {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  ExtraLarge = 'extra-large'
}

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent {

  GroupSpace = GroupSpace;

  label = input<string>();
  space = input<GroupSpace>(GroupSpace.Medium);

  expanded = model<boolean>(true);

  toggleExpanded() {
    this.expanded.update((expanded) => !expanded);
  }
}
