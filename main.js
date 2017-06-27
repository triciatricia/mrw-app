import Expo from 'expo';
import App from './javascripts/App';
import Sentry from 'sentry-expo';

Sentry.config('https://dd4470cda4ed444bb6700eaf2eaf3c3b@sentry.io/182829', {
  autoBreadcrumbs: {
    xhr: false
  }
}).install();
Expo.registerRootComponent(App);
