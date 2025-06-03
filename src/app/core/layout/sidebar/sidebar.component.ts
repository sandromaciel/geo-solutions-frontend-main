import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  Home,
  Menu,
  Users,
  LogOut,
  Building2,
  FileText,
  Settings,
  MapPinned,
  Wrench, // Novo ícone adicionado
  LucideAngularModule,
} from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { LayoutService } from '../../services/layout.service';
import { NavItemComponent } from '../nav-item/nav-item.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NavItemComponent, LucideAngularModule, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  public activeItem = 'dashboard';
  public icons = {
    home: Home,
    menu: Menu,
    users: Users,
    logout: LogOut,
    fileText: FileText,
    settings: Settings,
    mapPinned: MapPinned,
    building2: Building2,
    wrench: Wrench, // Novo ícone para Serviços
  };

  public readonly menuItems = [
    { icon: this.icons.home, text: 'Dashboard', path: '/admin/dashboard' },
    // { icon: this.icons.users, text: 'Usuários', path: '/admin/users' },
    {
      icon: this.icons.building2,
      text: 'Variáveis',
      path: '/admin/variables',
    },
    {
      icon: this.icons.mapPinned,
      text: 'Regiões',
      path: '/admin/regions',
    },
    {
      icon: this.icons.fileText,
      text: 'Orçamentos',
      path: '/admin/budget-reports',
    },
    {
      icon: this.icons.wrench,
      text: 'Serviços',
      path: '/admin/service-manager',
    },
    {
      icon: this.icons.settings,
      text: 'Configurações',
      path: '/admin/configurations',
    },
  ];

  constructor(
    public readonly layout: LayoutService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  public isActive(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'subset',
      fragment: 'ignored',
      queryParams: 'exact',
      matrixParams: 'ignored',
    });
  }

  public logout(): void {
    this.authService.logout();
  }
}