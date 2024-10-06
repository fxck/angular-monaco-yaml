/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, signal } from '@angular/core';
import { MonacoConfig } from './monaco.model';

@Injectable({ providedIn: 'root' })
export class MonacoService {
  loaded = signal(false);

  load(config: MonacoConfig = {}) {
    if (!this.loaded()) {

      let baseUrl = config.baseUrl;
      // ensure backward compatibility
      if (baseUrl === "assets" || !baseUrl) {
        baseUrl = "./public/monaco/min/vs";
      }
      if (typeof ((<any>window).monaco) === 'object') {
        this.loaded.set(true);
        return;
      }
      const onGotAmdLoader: any = (require?: any) => {
        const usedRequire = require || (<any>window).require;
        const requireConfig = { paths: { vs: `${baseUrl}` } };
        Object.assign(requireConfig, config.requireConfig || {});

        // Load monaco
        usedRequire.config(requireConfig);
        usedRequire([`vs/editor/editor.main`], () => {
          if (typeof config.onMonacoLoad === 'function') {
            config.onMonacoLoad();
          }
          this.loaded.set(true);
        });
      };

      if (config.monacoRequire) {
        onGotAmdLoader(config.monacoRequire);
      // Load AMD loader if necessary
      } else if (!(<any>window).require) {
        const loaderScript: HTMLScriptElement = document.createElement('script');
        loaderScript.type = 'text/javascript';
        loaderScript.src = `${baseUrl}/loader.js`;
        loaderScript.addEventListener('load', () => { onGotAmdLoader(); });
        document.body.appendChild(loaderScript);
      // Load AMD loader without over-riding node's require
      } else if (!(<any>window).require.config) {
          const src = `${baseUrl}/loader.js`;

          const loaderRequest = new XMLHttpRequest();
          loaderRequest.addEventListener("load", () => {
              const scriptElem = document.createElement('script');
              scriptElem.type = 'text/javascript';
              scriptElem.text = [
                  // Monaco uses a custom amd loader that over-rides node's require.
                  // Keep a reference to node's require so we can restore it after executing the amd loader file.
                  'var nodeRequire = require;',
                  loaderRequest.responseText.replace('"use strict";', ''),
                  // Save Monaco's amd require and restore Node's require
                  'var monacoAmdRequire = require;',
                  'require = nodeRequire;',
                  'require.nodeRequire = require;'
              ].join('\n');
              document.body.appendChild(scriptElem);
              onGotAmdLoader((<any>window).monacoAmdRequire);
          });
          loaderRequest.open("GET", src);
          loaderRequest.send();
      } else {
        onGotAmdLoader();
      }

    }
  }
}
