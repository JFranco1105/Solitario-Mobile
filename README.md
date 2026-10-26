# 🔢 Sudoku Mobile

Juego de Sudoku para móvil, desarrollado con JavaScript y empaquetado como app Android con Capacitor.

![Captura de Sudoku Mobile](screenshot.png)

**[▶ Jugar online](ENLACE_A_LA_DEMO)** · [Código](https://github.com/JFranco1105/Sudoku-Mobile)

## Características

- Tablero de Sudoku con las reglas clásicas [y niveles de dificultad]
- Generación y validación de jugadas [confirma si genera puzzles o usa tableros fijos]
- Control de tiempo de partida
- Guardado local de la partida para retomarla más tarde
- Interfaz responsive pensada para pantallas táctiles

## Tecnologías

- **JavaScript, HTML5 y CSS3**
- **Vite**: entorno de desarrollo y build
- **Capacitor**: empaquetado como aplicación Android
- **Android Studio / Gradle**: compilación de la app nativa

## Ejecutar en local

```bash
git clone https://github.com/JFranco1105/Sudoku-Mobile.git
cd Sudoku-Mobile
npm install
npm run dev
```

## Compilar para Android

```bash
npm run build
npx cap sync android
npx cap open android
```

Desde Android Studio, ejecuta la app en un emulador o en un dispositivo con depuración USB activada.

## Estructura

```
Sudoku-Mobile/
├── src/              # Lógica del juego e interfaz
├── public/           # Recursos estáticos
├── assets/           # Imágenes e iconos
├── android/          # Proyecto Android generado por Capacitor
├── index.html
├── capacitor.config.json
└── package.json
```

## Lo que aprendí

- Implementar la lógica de un juego (generación de tableros, validación de reglas, estado de partida).
- Guardar y recuperar estado en el dispositivo.
- Convertir una aplicación web en una app móvil con Capacitor.

## Licencia

MIT. Consulta el archivo [LICENSE](LICENSE).
