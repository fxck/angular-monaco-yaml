/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  output,
  Signal,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { CODE_FIELD_DEFAULT_OPTIONS } from './monaco.constant';
import { MonacoEditorModel } from './monaco.model';
import { fromEvent, Subscription } from 'rxjs';
import { MonacoService } from './monaco.service';
import { configureMonacoYaml } from 'monaco-yaml';

declare let monaco: any;

@Component({
  selector: 'app-monaco',
  template: `
    <div class="editor" #editorContainerRef></div>
 `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .editor {
      height: 100%;
    }

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonacoComponent),
      multi: true
    }
  ]
})
export class MonacoComponent implements ControlValueAccessor, OnDestroy {

  // # Deps
  #zone = inject(NgZone);
  #monacoService = inject(MonacoService);

  // # Data
  value = input<string>();
  editorModel = input<MonacoEditorModel>();
  editorOptions = input<Partial<editor.IStandaloneEditorConstructionOptions>>({});
  editorContainerRef = viewChild<ElementRef<HTMLElement>>('editorContainerRef');
  editorInit = output<editor.IStandaloneCodeEditor>();
  #value = '';
  #editorInstance!: editor.IStandaloneCodeEditor;
  #editorOptions: Signal<editor.IStandaloneEditorConstructionOptions | undefined> = computed(() => {
    return {
      ...CODE_FIELD_DEFAULT_OPTIONS,
      ...(this.editorOptions() || {})
    };
  });
  #windowResizeSubscription!: Subscription;

  onChange = (_: any) => { return; };
  onTouched = (_: any) => { return; };

  constructor() {
    effect(() => {
      if (this.editorContainerRef()
        && (this.#editorOptions() || this.editorModel())
      ) {
        this.#monacoService.load({
          onMonacoLoad: () => {

            window.MonacoEnvironment = {
              getWorker(_, label) {
                switch (label) {
                  case 'editorWorkerService':
                    return new Worker(new URL('/assets/monaco/monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
                  case 'json':
                    return new Worker(new URL('/assets/monaco/monaco-editor/esm/vs/language/json/json.worker', import.meta.url));
                  case 'yaml':
                    return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url));
                  default:
                    throw new Error(`Unknown label ${label}`);
                }
              }
            };

            configureMonacoYaml(monaco, {
              enableSchemaRequest: true,
              hover: true,
              completion: true,
              validate: true,
              format: true,
              schemas: [
                {
                  uri: 'https://api.app-prg1.zerops.io/api/rest/public/settings/zerops-yml-json-schema.json',
                  fileMatch: [ '**/zerops.yml' ]
                }
              ]
            });

          }
        });

        if (this.#monacoService.loaded()) {
          this.#initMonaco();
        }
      }
    });

    effect(() => {
      if (this.editorContainerRef()
        && this.value() !== undefined
      ) {
        this.writeValue(this.value() || '');
      }
    });

  }

  writeValue(val: string) {
    this.#value = val;
    // fix for value change while dispose in process
    setTimeout(() => {
      if (this.#editorInstance) {
        this.#editorInstance.setValue(this.#value || '');
      }
    });
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  ngOnDestroy() {
    this.#unsubscribeResize();
    if (!this.#editorInstance) { return; }
    this.#editorInstance.dispose();
  }

  #initMonaco() {

    if (this.#editorInstance) {
      this.#editorInstance.dispose();
    }

    const editorModel = this.editorModel();
    const finalOptions = {
      ...this.#editorOptions()
    };

    if (editorModel) {
      const uri = editorModel.fileName
        ? monaco.Uri.parse(editorModel.fileName)
        : undefined;
      const model = uri
        ? monaco.editor.getModel(uri)
        : undefined;
      if (model) {
        finalOptions.model = model;
        finalOptions.model?.setValue(this.#value || '');
      } else {
        finalOptions.model = monaco.editor.createModel(
          editorModel.value || this.#value,
          editorModel.language,
          uri
        );
      }
    }

    this.#zone.runOutsideAngular(() => {
      this.#editorInstance = monaco.editor.create(
        this.editorContainerRef()?.nativeElement,
        finalOptions
      );
    });

    if (!editorModel) {
      console.log('set value no model', this.#value || '');
      this.#editorInstance.setValue(this.#value || '');
    }

    this.#editorInstance.onDidChangeModelContent(() => {
      const value = this.#editorInstance.getValue();

      this.#zone.run(() => {
        this.onChange(value);
        this.#value = value;
      });

    });

    this.#editorInstance.onDidBlurEditorWidget(() => {
      this.onTouched(undefined);
    });

    // refresh layout on resize event.
    this.#unsubscribeResize();
    this.#windowResizeSubscription = fromEvent(window, 'resize').subscribe(
      () => this.#editorInstance.layout()
    );
    this.editorInit.emit(this.#editorInstance);
  }

  #unsubscribeResize() {
    if (this.#windowResizeSubscription) {
      this.#windowResizeSubscription.unsubscribe();
    }
  }

}
