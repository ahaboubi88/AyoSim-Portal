/**
 * Environment-aware URL resolution for AyoSim Portal & Simulators.
 * Keeps localhost (Mode A), dev.* staging (Mode C), and production isolated.
 */
(function () {
  'use strict';

  var PROD_URLS = {
    portal: 'https://www.ayosim.app/',
    arduino: 'https://arduino.ayosim.app/',
    esp32: 'https://esp32.ayosim.app/',
    rpi: 'https://rpi.ayosim.app/'
  };

  var DEV_SUBDOMAIN_URLS = {
    portal: 'https://dev.ayosim.app/',
    arduino: 'https://dev-arduino.ayosim.app/',
    esp32: 'https://dev-esp32.ayosim.app/',
    rpi: 'https://dev-rpi.ayosim.app/'
  };

  var LOCAL_URLS = {
    portal: 'http://localhost:3000/',
    arduino: 'http://localhost:5173/',
    esp32: 'http://localhost:5174/',
    rpi: 'http://localhost:5175/'
  };

  function resolveEnvironment() {
    var host = (typeof window !== 'undefined' && window.location && window.location.hostname)
      ? window.location.hostname.toLowerCase()
      : 'www.ayosim.app';

    if (host === 'localhost' || host === '127.0.0.1') {
      return { name: 'local', urls: LOCAL_URLS };
    }
    if (host === 'dev.ayosim.app' || host.indexOf('dev-') === 0 || host.indexOf('-git-dev-') !== -1) {
      return { name: 'dev', urls: DEV_SUBDOMAIN_URLS };
    }
    return { name: 'prod', urls: PROD_URLS };
  }

  var env = resolveEnvironment();

  window.AYOSIM_ENV = {
    envName: env.name,
    portalOrigin: env.urls.portal,
    simulators: {
      arduino: env.urls.arduino,
      esp32: env.urls.esp32,
      rpi: env.urls.rpi
    },
    getSimulatorUrl: function (boardId) {
      return this.simulators[boardId] || this.simulators.arduino;
    }
  };
})();
