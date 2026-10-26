# Solitario Mobile 🃏📱

Una aplicación nativa de Android del clásico juego de Solitario (Klondike), diseñada de forma ligera, fluida e intuitiva, optimizada para ofrecer la mejor experiencia táctil en smartphones y tablets.

## 🚀 Características Principales (Features)

* **Desarrollo 100% Nativo Android**: Rendimiento optimizado y gestión eficiente de memoria ajustada al ciclo de vida de Android.
* **Mecánica de Juego Clásica**: Reglas tradicionales del Solitario Klondike adaptadas a pantallas táctiles.
* **Controles Táctiles Optimizados**: Soporte fluido para arrastrar y soltar (*drag and drop*) o toques rápidos para mover cartas.
* **Modo Offline**: Funcionalidad completa sin requerir conexión a internet.
* **Seguimiento de Partidas**: Sistema en tiempo real de cronómetro, conteo de movimientos y puntuación.
* **Interfaz Adaptativa (Responsive)**: Diseño escalable compatible con diversas resoluciones de pantalla y versiones de Android.

## 🛠️ Tecnologías Utilizadas

* **Plataforma**: Android Nativo
* **Lenguaje de Programación**: Java / Kotlin
* **Entorno de Desarrollo (IDE)**: Android Studio
* **Sistema de Construcción**: Gradle
* **Diseño de Interfaz**: Android Views / Layouts XML

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado el siguiente software en tu entorno de desarrollo:

* **Android Studio** (versión Jellyfish / Iguana o superior recomendada).
* **JDK (Java Development Kit)** versión 17 o superior.
* **Android SDK** configurado con el API Level adecuado (API 21+ recomendado).
* Dispositivo físico Android con **Depuración USB** activada o un emulador **AVD (Android Virtual Device)**.

## ⚙️ Instalación y Configuración

Sigue estos pasos para clonar el proyecto y configurarlo en tu entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Llellesito/Solitario-Mobile.git
   cd Solitario-Mobile
   ```

2. **Abrir en Android Studio:**
   * Abre **Android Studio**.
   * Selecciona la opción **Open** y navega hasta la carpeta del proyecto clonado.
   * Deja que Gradle descargue las dependencias y sincronice el proyecto (`Sync Project with Gradle Files`).

3. **Verificar SDK y Propiedades:**
   * Asegúrate de que el archivo `local.properties` apunte correctamente a la ruta de tu SDK de Android:
     ```properties
     sdk.dir=/tu/ruta/sdk/android
     ```

## 🎮 Modo de Uso

### Ejecución en Desarrollo

Puedes ejecutar la aplicación directamente en un emulador o en tu dispositivo móvil conectado por USB:

* **Desde el IDE**: Selecciona tu dispositivo/emulador en la barra superior de Android Studio y presiona el botón **Run** (`Shift + F10`).
* **Desde la Terminal (Gradle Wrapper)**:
  ```bash
  ./gradlew assembleDebug
  ```

### Ejecutar Pruebas (Tests)

Para ejecutar las pruebas unitarias e instrumentadas del proyecto:

```bash
# Pruebas unitarias
./gradlew test

# Pruebas de instrumentación (requiere emulador/dispositivo conectado)
./gradlew connectedAndroidTest
```

## 📂 Estructura del Proyecto

```text
Solitario-Mobile/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/            # Código fuente en Java/Kotlin (Lógica del juego y Activities)
│   │   │   ├── res/             # Recursos visuales (layouts XML, imágenes de cartas, valores)
│   │   │   └── AndroidManifest.xml # Manifiesto con la configuración principal de la app
│   │   ├── test/                # Pruebas unitarias del código
│   │   └── androidTest/         # Pruebas integradas para Android
│   └── build.gradle             # Dependencias y configuración del módulo principal
├── build.gradle                 # Configuración de compilación a nivel de proyecto
├── settings.gradle              # Inclusión de módulos
└── README.md                    # Documentación del repositorio
```

## 🤝 Contribución

¡Las contribuciones son bien recibidas! Si deseas colaborar en la mejora del juego:

1. Haz un **Fork** de este repositorio.
2. Crea una rama para tu nueva funcionalidad:
   ```bash
   git checkout -b feature/NuevaFuncionalidad
   ```
3. Guarda tus cambios y haz un commit explicativo:
   ```bash
   git commit -m 'Añadida nueva funcionalidad X'
   ```
4. Envía tus cambios a tu repositorio remoto:
   ```bash
   git push origin feature/NuevaFuncionalidad
   ```
5. Abre un **Pull Request** detallando tus cambios.

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para obtener más información.
