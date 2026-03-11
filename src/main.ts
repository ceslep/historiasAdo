import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { registerSW } from 'virtual:pwa-register'

const app = mount(App, {
  target: document.getElementById('app')!,
})

// Registrar SW con auto-actualización
// Cuando se detecta una nueva versión, recarga la página automáticamente
registerSW({
  onNeedRefresh() {
    // Nueva versión disponible: recargar inmediatamente
    window.location.reload();
  },
  onOfflineReady() {
    console.log('App lista para uso offline');
  },
  immediate: true,
  // Verificar actualizaciones cada 5 minutos (en ms)
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);
    }
  },
})

export default app
