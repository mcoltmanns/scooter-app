import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-institution',
    standalone: true,
    imports: [
        CommonModule,
    ],
    templateUrl: './institution.component.html',
    styleUrl: './institution.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstitutionComponent { }
