import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// ID de prueba de Google para Android
const AD_UNIT_ID_TEST = 'ca-app-pub-3940256099942544/1033173712';

export async function initAdMob() {
    // Si estamos en el navegador de la PC, no inicializamos AdMob nativo
    if (!Capacitor.isNativePlatform()) {
        console.log('🌐 Modo Navegador Web detectado: AdMob en modo simulación.');
        return;
    }

    try {
        await AdMob.initialize({
            requestTrackingAuthorization: true,
            testingDevices: [],
            initializeForTesting: true,
        });
        console.log('AdMob Inicializado');
        await prepareInterstitialAd();
    } catch (error) {
        console.error('Error al inicializar AdMob:', error);
    }
}

export async function prepareInterstitialAd() {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await AdMob.prepareInterstitial({
            adId: AD_UNIT_ID_TEST,
            isTesting: true,
        });
    } catch (error) {
        console.error('Error al preparar anuncio:', error);
    }
}

export async function showInterstitialAd() {
    // Si estamos en la PC, simulamos el anuncio con una alerta o log
    if (!Capacitor.isNativePlatform()) {
        console.log('📺 [SIMULACIÓN WEB] ¡Anuncio Intersticial Activado!');
        alert('📺 [SIMULACIÓN DE ANUNCIO ADMOB]\n\n¡Han pasado 2 partidas! En el móvil aquí se abrirá el anuncio a pantalla completa.');
        return;
    }

    try {
        await AdMob.showInterstitial();
        await prepareInterstitialAd();
    } catch (error) {
        console.error('Error al mostrar anuncio:', error);
        prepareInterstitialAd();
    }
}