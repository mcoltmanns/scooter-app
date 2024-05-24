import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { SampleService } from 'src/app/services/sample.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-todo',
  imports: [BackButtonComponent, UserInputComponent, CommonModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
export class TodoComponent implements OnInit {
  /**
   *  Damit der Text in der HTML Komponente bereitsteht, legen wir den Text als 'public' fest.
   */
  public text = 'Dieser Text wird zwischen zwei Komponenten synchronisiert!';

  /**
   *  Hier definieren wir ein Array von Objekten für Links. Damit das HTML Template (landingpage.component.html)
   *  auch Zugriff auf dieses Attribut hat, deklarieren wir es als public. Der Typ dieses Attributs definieren wir
   *  als Array [] von Objekten {}, die einen "name" String und einen "url" String haben.
   */
  public links: { name: string; url: string }[] = [
    {
      name: 'Overview: HTML',
      url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML',
    },
    {
      name: 'Overview: CSS',
      url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS',
    },
    {
      name: 'Overview: JavaScript',
      url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript',
    },
    {
      name: 'Getting Started with Typescript',
      url: 'https://www.typescriptlang.org/docs/',
    },
    { name: 'Angular Homepage', url: 'https://angular.io/' },
    { name: 'Angular Documentation', url: 'https://angular.io/docs' },
    { name: 'Learn Angular', url: 'https://angular.io/tutorial' },
    { name: 'UI Komponenten', url: 'https://primeng.org/' },
  ];

  /**
   *  Wie bei den Services wird auch in den Komponenten der Konstruktor über Angular aufgerufen.
   *  D.h. wir können hier verschiedene Services spezifizieren, auf die wir Zugriff haben möchten, welche
   *  automatisch durch "Dependency injection" hier instanziiert werden.
   */
  constructor(public sampleService: SampleService, private route: ActivatedRoute) {}

  /**
   *  Da unsere Komponente das "OnInit" Interface implementiert müssen wir eine "ngOnInit" Methhode implementieren.
   *  Diese Methode wird aufgerufen, sobald der HTML code dieser Komponente instanziiert und aufgebaut wurde
   *  (quasi wie ein zweiter Constructor, der von Angular automatisch aufgerufen wird).
   *  Weiterführende Infos gibt es hier: https://angular.io/guide/lifecycle-hooks
   */
  ngOnInit(): void {
    // TESTEN OB DIE ÜBERGABE MIT DEN PARAMETERN KLAPPT
    this.route.queryParams.subscribe(params => {
      const scooterId = params['id'];
      const name = params['name'];
      const description_html = params['description_html'];
      const image = params['image'];
      console.log('Received scooterId:', scooterId);
      console.log(name);
      console.log(description_html);
      console.log(image);
    });
  }
}
