# Cifras y Letras Cracker

Web estática hecha únicamente con HTML, CSS y JavaScript.

## Estructura del proyecto

El sitio es multi-sección: un menú lateral colapsable (botón de tres líneas
arriba a la izquierda) permite moverse entre secciones. Cada sección vive en
su propia carpeta con su propio HTML/CSS/JS, y la barra lateral es un
componente compartido para que las secciones no repitan ese código.

```
cifras-y-letras-cracker/
├─ index.html                 # Página de la sección "Cifras" (página principal)
├─ shared/
│  ├─ shell.css                # Topbar, botón hamburguesa y menú lateral (chrome compartido)
│  └─ shell.js                 # Inyecta el topbar/menú y gestiona su apertura/cierre
└─ sections/
   └─ cifras/
      ├─ cifras.css            # Estilos propios de la sección Cifras
      └─ cifras.js             # Reglas del juego, interacción y cracker
```

Para añadir una sección nueva:

1. Crea `sections/<seccion>/index.html`, `<seccion>.css` y `<seccion>.js`.
2. En el `<head>` enlaza `../../shared/shell.css` y luego el CSS propio de la
   sección; al final del `<body>` carga `../../shared/shell.js` y luego el
   JS propio.
3. Pon `<body data-section="<seccion>">` para que su enlace se marque como
   activo en el menú.
4. Añade `{ id: "<seccion>", label: "...", href: "sections/<seccion>/index.html" }`
   al array `SECTIONS` en `shared/shell.js`.

## Ejecutar en local

No necesita instalación ni dependencias. Puedes abrir `index.html` directamente en el navegador.

También puedes usar cualquier servidor estático, por ejemplo con Python:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000`.

## Publicar con GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube el contenido de esta carpeta (manteniendo la estructura de subcarpetas) a la raíz del repositorio.
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
