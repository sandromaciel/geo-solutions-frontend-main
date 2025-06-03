import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LucideAngularModule, Map } from 'lucide-angular';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  public readonly icons = {
    map: Map,
  };

  constructor(private router: Router) {}

  public goHome(): void {
    this.router.navigate(['/']);
  }
}
