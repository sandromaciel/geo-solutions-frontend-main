import { Component } from '@angular/core';

import {
  Target,
  Eye,
  Heart,
  Clock,
  Users,
  Award,
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './about.component.html',
})
export class AboutComponent {
  public readonly icons = {
    target: Target,
    eye: Eye,
    heart: Heart,
    clock: Clock,
    users: Users,
    award: Award,
  };
}
