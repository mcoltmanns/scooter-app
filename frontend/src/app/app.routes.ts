import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './pages/login/login.component';
import { TodoComponent } from './pages/todo/todo.component';
import { AboutComponent } from './pages/about/about.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { MapComponent } from './pages/map/map.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { Observable, map, of } from 'rxjs';
import { ProfileComponent } from './pages/profile/profile.component';
import { ScooterComponent } from './pages/scooter/scooter.component';
import { RentalsComponent } from './pages/rentals/rentals.component';

/**
 *  Hier definieren wir eine Funktion, die wir später (Zeile 43ff) dem Router übergeben.
 *  Damit fangen wir ab, falls ein Benutzer nicht eingeloggt ist,
 *      if (!inject(LoginService).isLoggedIn()) {
 *  leiten den Benutzer an die Startseite weiter
 *      inject(Router).navigate(['/login']);
 *  und sagen dem Angular Router, dass die Route geblockt ist
 *      return false;
 *
 *  (Siehe 'canActivate' Attribut bei den 'routes')
 */
const loginGuard = (): Observable<boolean> => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if(authService.authChecked){
        return of(authService.isLoggedIn());
    }
    return authService.checkAuth().pipe(map(isAuthenticated => {
        if (!isAuthenticated){
            router.navigate(['/login']);
            return false;
        }
      return true;
    }));
};
const notLoggedInGuard = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if(authService.authChecked){
      return of(!authService.isLoggedIn());
  }
  return authService.checkAuth().pipe(map(isAuthenticated => {
      if (isAuthenticated){
          router.navigate(['/search']);
          return false;
      }
    return true;
  }));
};

/**
 *  Hier können die verschiedenen Routen definiert werden.
 *  Jeder Eintrag ist eine URL, die von Angular selbst kontrolliert wird.
 *  Dazu wird die angebene Komponente in das "<router-outlet>" der "root" Komponente geladen.
 *
 *  Dokumentation: https://angular.io/guide/router
 */
export const routes: Routes = [
  // Jede Route, die wir festlegen wollen, braucht eine Komponente,
  // die beim Laden der Route instanziiert und angezeigt wird.
  // Die hier angegebenen Routen sind ein Beispiel; die "TodoComponent"
  // sollten über den Lauf des Projektes ausgetauscht werden
  { path: 'login', component: LoginComponent, canActivate: [notLoggedInGuard] },
  { path: 'register', component: RegistrationComponent, canActivate: [notLoggedInGuard] }, //registerComponent instead of TodoComponent
  { path: 'about', component: AboutComponent },

  // Durch 'canActive' können wir festlegen, ob eine Route aktiviert werden kann - z.B. können wir
  // die Route sperren, falls der Benutzer nicht eingeloggt ist.
  { path: 'search', component: MapComponent, canActivate: [loginGuard] },
  { path: 'scooter/:id', component: ScooterComponent, canActivate: [loginGuard] },
  { path: 'booking', component: RentalsComponent, canActivate: [loginGuard] },

  // Routen können auch geschachtelt werden, indem der "Child" Eigenschaft der
  // Route nochmals ein paar Routen übergeben werden.
  // Falls Routen geschachtelt werden muss die "Hauptkomponente" der Schachtelung
  // auch eine <router-outlet> Komponente anbieten, in die "Unterkomponenten" hereingeladen
  // werden können (siehe auch RootComponent)
  {
    path: 'settings',
    canActivate: [loginGuard],
    children: [
      // Falls kein Pfad angegeben ist, wird diese Komponente automatisch geladen
      // (z.B. bei Aufruf von /profile/ )
      { path: '', component: SettingsComponent },
      // Ansonsten werden die Pfade geschachtelt - folgende Komponente wird über den Pfad
      // "/settings/profil" geladen.
      { path: 'profil', component: ProfileComponent }, //edit-personal-information instead of TodoComponent
      // Alternativ können die Seiten (Komponenten) auch wiederverwendet werden auf mehreren Routen
      { path: 'about', component: AboutComponent },
    ],
  },

  // Je nach Konfiguration können wir auf eine andere Route weiterleiten
  // z.B. wollen wir bei Seitenaufruf (wenn keine 'route' festgelegt ist)
  // sofort auf die Login Route weiterleiten
  { path: '**', redirectTo: '/search' },
];
