import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';

import { LucideAngularModule } from 'lucide-angular';

import { RouterModule } from '@angular/router';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './nav-item.component.html',
})
export class NavItemComponent {
  public path = input<string>();
  public icon = model.required<any>();
  public label = model.required<string>();
  public isActive = input<boolean>(false);

  constructor(public layout: LayoutService) {}
}
