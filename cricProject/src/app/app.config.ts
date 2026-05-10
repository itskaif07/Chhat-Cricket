import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FirebaseApp, initializeApp, provideFirebaseApp } from '@angular/fire/app'
import {provideAuth, getAuth } from '@angular/fire/auth'

import { environment } from '../environments/environment'

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

      provideFirebaseApp(() =>
      initializeApp(environment.firebaseConfig)
    ),

      provideAuth(() => getAuth())
  ]
};
