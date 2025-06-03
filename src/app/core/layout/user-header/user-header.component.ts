import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Menu, Monitor, X } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [LucideAngularModule, CommonModule, RouterModule],
  templateUrl: './user-header.component.html',
})
export class UserHeaderComponent {
  public readonly icons = {
    x: X,
    menu: Menu,
    monitor: Monitor,
  };

  public isMenuOpen = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  public goToHome(): void {
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  public logout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
  }
}