import { Component, inject } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { LayoutService } from '../../services/layout.service';

import { LucideAngularModule, Menu, Search, User } from 'lucide-angular';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './main-header.component.html',
})
export class MainHeaderComponent {
  public readonly icons = {
    menu: Menu,
    user: User,
    search: Search,
  };
  public userName: string | null = null;
  public userRole = inject(AuthService).getUserRole(); 
  private authService = inject(AuthService);

  constructor(public layout: LayoutService) {}

  ngOnInit(): void {
    this.authService.usernameSubject.subscribe((username) => {
      this.userName = username;
    });
  }
}
