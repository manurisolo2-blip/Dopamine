# Sistema de Diseño Oficial y Especificaciones Visuales — Dopamine

Documento de referencia técnica del proyecto **Dopamine**.

---

## 1. Identidad y Tono de Marca
- **Personalidad:** Urbana, joven, segura, minimalista, atrevida, exclusiva pero accesible.
- **Voz:** Directa, limpia, enérgica.
- **Slogans:**
  - *"Vestí tu energía."*
  - *"Built for movement."*
  - *"No seguimos tendencias."*
  - *"WEAR YOUR ENERGY."*

---

## 2. Paleta de Colores

| Rol | Nombre | HEX | Aplicación |
| :--- | :--- | :--- | :--- |
| **Principal** | Negro Carbón | `#0D0D0D` | Fondo modo oscuro, textos modo claro, headers |
| **Secundario** | Blanco Cálido | `#F5F4EF` | Texto modo oscuro, fondo tarjetas claras |
| **Secundario** | Gris Cemento | `#8A8A8A` | Textos secundarios, bordes sutiles, detalles |
| **Secundario** | Gris Oscuro | `#1A1A1A` | Tarjetas oscuras, fondos secundarios |
| **Acento** | Verde Lima Eléctrico | `#B8FF00` | Botones de acción principales, badges, hovers, acentos |

---

## 3. Arquitectura Tipográfica de Alto Rendimiento (Máximo 2 Familias)
- **Bebas Neue**: Titulares principales, Display (H1-H3), Banners de Drops y Colecciones (`font-family: 'Bebas Neue', 'Space Grotesk', sans-serif;`). Mayúsculas condensadas de alta urgencia urbana.
- **Space Grotesk**: Cuerpo de texto, UI, Navegación, Formularios, Precios, Badges y Botones (`font-family: 'Space Grotesk', sans-serif;`). Tipografía geométrica vanguardista, ultra-legible.

---

## 4. Estándares Técnicos y Accesibilidad (WCAG 2.2 AA/AAA & Core Web Vitals)
- **Tamaño Base:** Mínimo 16px (1rem) en dispositivos móviles, escalando a 18px (1.125rem) en escritorio.
- **Interlineado (`line-height`):** Mínimo de 1.5 en párrafos para saltos sacádicos fluidos.
- **Pesos Permitidos:** Restringido a 400 (Regular) hasta 700 (Bold) para asegurar alta legibilidad bajo luz solar móvil.
- **Área Táctil Móvil (Thumb Zone):** Mínimo de $44 \times 44$ píxeles en todos los botones, selectores de talle, enlaces e inputs interactivos.
- **Matemáticas CSS:** `font-size: clamp(...)` fluida e interpolación de tracking `letter-spacing: clamp(-0.04em, calc((1em - 1rem) / -12), 0em)`.
- **Rendimiento:** Archivos WOFF2 optimizados con precarga `<link rel="preload">` y `font-display: swap`.

## 4. Estructura de la Landing Page (10 Secciones + 2 Drawers)

1. **Barra de Anuncio (`.announcement-bar`)**: Fondo `#B8FF00`, texto `#0D0D0D`.
2. **Encabezado (`.header`)**: Logo left, nav center, acciones right. Fixed/Sticky.
3. **Sección Hero (`.hero`)**: 2 columnas desktop. Título "WEAR YOUR ENERGY", CTAs.
4. **Categorías (`.categories`)**: Fondo oscuro (`#0D0D0D`), 4 tarjetas 1/4 grid.
5. **Productos Destacados (`.featured-products`)**: Fondo claro (`#F5F4EF`), 4 tarjetas vertical `4:5`.
6. **Banner Colección (`.collection-banner`)**: Sección campaña "OFF THE GRID".
7. **Historia de Marca (`.brand-story`)**: Sección editorial "WHY DOPAMINE".
8. **Beneficios (`.benefits-bar`)**: Franja verde lima con 4 pilares.
9. **Newsletter (`.newsletter`)**: Formulario con estado de éxito.
10. **Pie de Página (`.footer`)**: Acordeones móvil, multi-columna desktop.
11. **Cart Drawer (`.cart-drawer`)**: Menú deslizante lateral derecho para carrito.
12. **Mobile Menu (`.mobile-menu`)**: Menú deslizante lateral izquierdo para navegación móvil.
