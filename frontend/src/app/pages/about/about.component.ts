import { Component } from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { SampleService } from 'src/app/services/sample.service';
import { AboutUsComponent } from 'src/app/components/about-us/about-us.component';
import { InstitutionComponent } from 'src/app/components/institution/institution.component';

@Component({
  standalone: true,
  imports: [BackButtonComponent, AboutUsComponent, InstitutionComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {
  constructor(public sampleService: SampleService) {
    /**
     *  Üblicherweise bleibt der Konstruktor von Komponenten in Angular leer. Der Constructor
     *  wird von Angular selbst aufgerufen.
     *  Via Konstruktor können wir aber Services durch "Dependency Injection" der Komponente
     *  zur Verfügung stellen - Angular kümmert sich um den Rest.
     */
  }
}
