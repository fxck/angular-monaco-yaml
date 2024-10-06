import { Component, signal } from '@angular/core';
import { MonacoComponent } from './monaco/monaco.component';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MonacoComponent,
    FormsModule,
    JsonPipe
  ],
  template: `
    <app-monaco
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
      [editorModel]="{
        language: 'yaml',
        fileName: 'zerops.yml'
      }"
    />
    @if (value()) {
      <pre class="output">{{ value() }}</pre>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 80px;
      height: 100%;
    }

    .output {
      position: fixed;
      overflow: hidden;
      top: 0px;
      right: 0px;
      width: 150px;
      height: 150px;
      padding: 10px;
      font-size: 8px;
      background: #f1f1f1;
    }
  `
})
export class AppComponent {
  value = signal('zerops: ');
}
