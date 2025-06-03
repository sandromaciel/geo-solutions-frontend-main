import { Component, input } from '@angular/core';

import {
  Map,
  Bone,
  Leaf,
  Mountain,
  FileCheck,
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './service-card.component.html',
})
export class ServiceCardComponent {
  public icon = input<string>('');
  public title = input<string>('');
  public description = input<string>('');

  public readonly icons = {
    map: Map,
    bone: Bone,
    leaf: Leaf,
    mountain: Mountain,
    fileCheck: FileCheck,
  };
}
