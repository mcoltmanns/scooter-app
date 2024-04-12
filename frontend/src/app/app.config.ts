import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';

/**
 * Hier wird Angular mitgeteilt, welche Provider (Services, ...) für die Anwendung
 * verfügbar sein sollen. In diesem Fall sind es die Router und HttpClientModule.
 * Dies wird meist in der Dokumentation angegeben, wenn ein Eintrag hier notwendig ist.
 * Da wir standalone Komponenten verwenden, sind diese "provider" *größtenteils* nur für
 * Services notwendig.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(HttpClientModule)],
};
