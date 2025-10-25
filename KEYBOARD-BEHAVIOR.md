# Comportamiento del Teclado - Guía de Implementación

## Resumen
Esta aplicación está configurada para que el teclado **solo se abra cuando hay un campo de texto activo** (email, contraseña, búsqueda, etc.). En todas las demás pantallas, el teclado no se abrirá automáticamente.

## Características Implementadas

### 1. **Meta Tags para Control del Teclado**
```html
<!-- Previene zoom automático en iOS -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />

<!-- Previene detección de números como teléfonos -->
<meta name="format-detection" content="telephone=no" />
```

### 2. **Cierre Automático del Teclado**

#### Al Cambiar de Vista
- Cuando el usuario cambia de pestaña (Inicio → Gastos → Reportes, etc.)
- El teclado se cierra automáticamente usando `document.activeElement.blur()`

#### Al Tocar Fuera de Inputs
- Si el usuario toca cualquier área que no sea un input/textarea
- El teclado se cierra automáticamente

#### En Transiciones de Vista
- El componente `ViewTransition` cierra el teclado al ocultar una vista

### 3. **Prevención de Apertura Accidental**

#### CSS Global
```css
/* Prevenir comportamiento no deseado del teclado */
input:not(:focus),
textarea:not(:focus),
select:not(:focus) {
  caret-color: transparent;
}

/* Asegurar que el teclado solo se abre en tap directo */
input,
textarea {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

#### Atributos de Input Optimizados
```jsx
<Input
  type="email"
  autoComplete="email"
  inputMode="email"  // Muestra teclado de email en móviles
  // Sin autofocus
/>
```

### 4. **Compatibilidad iOS y Android**

#### iOS
- `user-scalable=no` previene zoom al enfocar inputs
- `format-detection` previene detección automática de teléfonos
- `-webkit-user-select` controla la selección de texto

#### Android
- `touch-action: manipulation` previene delay en taps
- `inputMode` optimiza el tipo de teclado mostrado

## Buenas Prácticas

### ✅ HACER
- Usar `autoComplete` apropiado en inputs (`email`, `current-password`, `new-password`)
- Usar `inputMode` para mostrar el teclado correcto (`email`, `numeric`, `tel`, etc.)
- Cerrar el teclado explícitamente al cambiar de vista
- Agregar `blur()` en navegación y transiciones

### ❌ NO HACER
- **NUNCA** usar `autofocus` en inputs (causa apertura automática del teclado)
- **NUNCA** programar focus automático en `useEffect` sin interacción del usuario
- Evitar múltiples inputs visibles simultáneamente sin necesidad
- No usar `setTimeout` para enfocar inputs automáticamente

## Verificación Manual

### En iOS (Safari/Chrome)
1. Abrir la app en Safari/Chrome
2. Navegar entre pestañas (Inicio → Gastos → Reportes)
3. Verificar que el teclado NO se abre al cambiar de vista
4. Tocar un input → El teclado SÍ debe abrirse
5. Tocar fuera del input → El teclado debe cerrarse

### En Android (Chrome/Firefox)
1. Abrir la app en Chrome/Firefox
2. Navegar entre pestañas
3. Verificar comportamiento similar a iOS
4. Hacer scroll en listas largas → El teclado NO debe abrirse

## Solución de Problemas

### Problema: El teclado se abre al cambiar de vista
**Solución:** Verificar que no hay `autofocus` en ningún input. Buscar en el código:
```bash
grep -r "autoFocus" src/
grep -r "autofocus" src/
```

### Problema: El teclado no se cierra al navegar
**Solución:** Verificar que los handlers de navegación incluyen:
```javascript
if (document.activeElement instanceof HTMLElement) {
  document.activeElement.blur();
}
```

### Problema: El teclado se abre al hacer scroll
**Solución:** Verificar CSS:
```css
/* Debe estar presente en index.css */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}
```

## Testing en Dispositivos Reales

Para probar en un dispositivo real:

1. **PWA (Recomendado para testing rápido)**
   - Publicar la app
   - Abrir en dispositivo móvil
   - Instalar como PWA desde el menú del navegador

2. **Capacitor (Para testing de app nativa)**
   - Exportar a GitHub
   - Seguir instrucciones en `capacitor.config.ts`
   - Ejecutar en emulador/dispositivo físico

## Referencias

- [MDN: Mobile-First Design](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)
- [iOS Safari Meta Tags](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html)
- [Android Web Best Practices](https://developer.android.com/guide/webapps/best-practices)
