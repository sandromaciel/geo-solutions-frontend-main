import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  public isSidebarOpen = true;

  public toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
