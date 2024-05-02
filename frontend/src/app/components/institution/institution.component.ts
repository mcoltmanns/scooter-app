import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-institution',
    standalone: true,
    templateUrl: './institution.component.html',
    styleUrl: './institution.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstitutionComponent { }
