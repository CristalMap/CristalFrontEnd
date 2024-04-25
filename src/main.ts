import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = '';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
