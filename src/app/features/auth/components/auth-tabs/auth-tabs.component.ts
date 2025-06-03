import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-auth-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-tabs.component.html',
})
export class AuthTabsComponent {
  @Input() activeTab: 'signup' | 'login' = 'login';
  @Output() changeTab = new EventEmitter<'signup' | 'login'>();

  public onTabClick(tab: 'signup' | 'login'): void {
    this.changeTab.emit(tab);
  }
}
