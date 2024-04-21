import { Component } from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ExampleComponent } from 'src/app/components/example/example.component';
import { SilvanRongeComponent } from 'src/app/components/silvan-ronge/silvan-ronge.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { SampleService } from 'src/app/services/sample.service';
import {JonasComponent} from 'src/app/components/jonas-dickhoefer/jonas-dickhoefer.component';
import { MaximilianJaegerComponent } from 'src/app/components/maximilian-jaeger/maximilian-jaeger.component';
import { MaxOComponent } from 'src/app/components/max-oltmanns/max-oltmanns.component';
import { IgorZiesmannComponent } from 'src/app/components/igor-ziesmann/igor-ziesmann.component';

@Component({
  standalone: true,
  imports: [ExampleComponent, UserInputComponent, BackButtonComponent, JonasComponent, MaximilianJaegerComponent, MaxOComponent, SilvanRongeComponent, IgorZiesmannComponent],
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
