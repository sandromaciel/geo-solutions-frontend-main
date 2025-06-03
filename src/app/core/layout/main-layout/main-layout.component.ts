import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, SidebarComponent, MainHeaderComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  constructor(public layout: LayoutService) {}
}
