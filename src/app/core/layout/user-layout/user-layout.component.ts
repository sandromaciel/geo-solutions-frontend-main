import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UserHeaderComponent } from '../user-header/user-header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [UserHeaderComponent, RouterModule, FooterComponent],
  templateUrl: './user-layout.component.html',
})
export class UserLayoutComponent {}
