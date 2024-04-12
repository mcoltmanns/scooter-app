import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationBarComponent } from 'src/app/components/navigation-bar/navigation-bar.component';
import { LoginService } from 'src/app/services/login.service';
import { CommonModule } from '@angular/common';

/**
 *  Die Root-Komponente stellt die "Haupt-Komponente" dar, die alle anderen Komponenten enthält.
 *  Hier können wir z.B. HTML Komponenten festlegen, die auf allen Seiten erscheinen (beispielsweise
 *  eine Navigation Bar).  In der "app.module.ts" Datei legen wir für Angular fest, dass
 *  diese Komponente die "Haupt-Komponente" ist.
 */
@Component({
  standalone: true,
  imports: [CommonModule, NavigationBarComponent, RouterModule],
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.css'],
  selector: 'app-root',
})
export class RootComponent {
  constructor(public loginService: LoginService) {}
}
