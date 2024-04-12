import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

export interface NavigationEntry {
  icon: string;
  url: string;
  name: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css'],
})
export class NavigationBarComponent implements OnInit, OnDestroy {
  private routerSub = Subscription.EMPTY;

  public entries: NavigationEntry[] = [
    {
      icon: 'search',
      name: 'Scooter',
      url: '/search',
      isActive: true,
    },

    {
      icon: 'check_circle',
      name: 'Buchungen',
      url: '/booking',
    },

    {
      icon: 'settings',
      name: 'Einstellungen',
      url: '/settings',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    /**
     *  Hier hören wir auf die Navigations-Events von Angular ("subscribe").
     *  Sobald die "Router" Komponente ein Event verschickt, wird die
     *  übergebene Methode aufgerufen (welche die derzeit aktuelle Route
     *  in der Navigationsleiste anzeigen).
     *
     *  Da Komponenten immer wieder zerstört und wieder-kreiert werden ist es wichtig,
     *  dass wir uns selbst wieder deregistrieren ("unsubscribe") sobald die Komponente
     *  zerstört wird (siehe ngOnDestroy Methode)
     */
    this.routerSub = this.router.events.subscribe((route) => {
      if (route instanceof NavigationEnd) {
        this.showActiveRoute(route.urlAfterRedirects);
      }
    });

    // Initialisierung der Navigationsleiste nach Reload
    this.showActiveRoute(this.router.url);
  }

  /**
   *  Diese Methode wird automatisch von Angular aufgerufen, sobald die Komponente
   *  zerstört wird. Dazu ist es notwendig, dass die Komponente das "OnDestroy" Interface
   *  implementiert (siehe Klassendefinition in Zeile 20)
   */
  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }

  private showActiveRoute(url: string): void {
    for (const entry of this.entries) {
      entry.isActive = url.startsWith(entry.url);
    }
  }
}
