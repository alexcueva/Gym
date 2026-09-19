# Rutinas Gym

Sitio web mobile-first para generar rutinas de ejercicio (estilo [MuscleWiki](https://musclewiki.com)) para dos perfiles de entrenamiento, cada uno con su propio gimnasio.

## Cómo funciona

1. Se elige un perfil (Ella / Él).
2. Se elige qué entrenar: cuerpo completo o un grupo muscular específico (pecho, espalda, brazo, pierna, abdomen).
3. Se despliega la rutina con: nombre del ejercicio, series/repeticiones, imagen ilustrativa y video explicativo de YouTube (embebido en un modal).

## Estructura

```
index.html          Punto de entrada
assets/styles.css    Estilos (mobile-first, tema oscuro)
assets/app.js        Lógica de la app (sin frameworks, JS puro)
assets/data.js        Base de datos de ejercicios (generada desde las rutinas en Word)
assets/img/           Imágenes ilustrativas por ejercicio
```

## Editar rutinas

Los ejercicios viven en `assets/data.js` como un objeto `ROUTINE_DATA`. Cada ejercicio tiene:

```js
{
  "id": "pecho-barbell-bench-press",
  "name": "Barbell bench press",
  "seriesReps": "3-4 Series · 10-12 Repeticiones",
  "image": "assets/img/pecho-barbell-bench-press.jpeg",
  "wikiUrl": "https://musclewiki.com/...",
  "videos": [{ "id": "hWbUlkb5Ms4", "url": "https://youtube.com/shorts/hWbUlkb5Ms4" }]
}
```

Para agregar o cambiar ejercicios (por ejemplo, para el perfil de Él con su propio gimnasio), edita las listas dentro de `assets/data.js` o vuelve a generar el archivo si tienes nuevas rutinas en Word.

## Perfiles y gimnasios

Configurados en `assets/app.js`, objeto `PROFILES`. Ahí se cambia el nombre, ícono y gimnasio de cada persona.

## Créditos

Imágenes de referencia e ideas de ejercicio tomadas de [MuscleWiki](https://musclewiki.com) (uso personal, no comercial). Videos alojados en YouTube y enlazados/embebidos desde sus URLs originales.
