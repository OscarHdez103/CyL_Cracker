# Cifras y Letras Cracker

Web estática hecha únicamente con HTML, CSS y JavaScript.

## Archivos

- `index.html`: estructura de la interfaz.
- `styles.css`: diseño responsive para ordenador y móvil.
- `app.js`: reglas del juego, interacción y cracker.

## Ejecutar en local

No necesita instalación ni dependencias. Puedes abrir `index.html` directamente en el navegador.

También puedes usar cualquier servidor estático, por ejemplo con Python:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000`.

## Publicar con GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube los cuatro archivos de esta carpeta a la raíz del repositorio.
3. En GitHub entra en **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/ (root)`.
6. Guarda los cambios.

GitHub publicará la web sin necesidad de compilar nada.

## Reglas implementadas

- Se utilizan 6 números.
- Números permitidos: `1` a `10`, `25`, `50`, `75` y `100`.
- Objetivo entre `100` y `999`.
- Operaciones: suma, resta, multiplicación y división.
- La resta solo se permite si el resultado no es negativo.
- La división solo se permite si es exacta.
- Cada número disponible solo puede utilizarse una vez por operación.
- El resultado de una operación vuelve a estar disponible para operaciones posteriores.

El cracker recorre combinaciones posibles y usa memoización para evitar recalcular estados equivalentes.
