# 18 · Referencias

> Estado: estable · Actualizado: 2026-10-11

Uso de **imágenes fotográficas reales como guía** para dibujar los sprites de flora y fauna con más
fidelidad. Las referencias son **material de edición**: nunca se cargan en runtime (el sprite sigue
siendo una matriz de píxeles en código, [D-010](12-decisiones.md),
[08 · Arte pixel](08-arte-pixel.md)) y **no se versionan en el repositorio**
([D-053](12-decisiones.md)).

## Reglas

1. **Licencia:** solo **dominio público / CC0** (uso libre, sin obligación de atribución). No se
   aceptan CC-BY/CC-BY-SA ni "todos los derechos reservados" para referencias.
2. **Manifiesto versionado** con la procedencia de cada imagen; el binario queda fuera.
3. **Sin runtime:** ninguna imagen entra al render ni a los tests.
4. **Fidelidad primero:** la silueta y la proporción mandan sobre el color
   ([D-047](12-decisiones.md), [D-048](12-decisiones.md)).

## Manifiesto

`docs/referencias/manifiesto.csv` (una fila por imagen; parser y validador en `src/references.js`):

| Campo | Descripción |
|-------|-------------|
| `id` | Identificador de la fila (referenciado por el campo `ref` de `FLORA`/`SPECIES`) |
| `especie` | Tipo en código (`kind` de `FLORA` / clave de `SPECIES`) |
| `sci` | Nombre científico |
| `fuente` | URL de la fuente (Wikimedia Commons, GBIF, iNaturalist con filtro PD/CC0…) |
| `autor` | Autoría (informativo) |
| `licencia` | `PD` o `CC0` |
| `encuadre` | `perfil`, `frontal`, `tres-cuartos`, `detalle` (qué se toma) |
| `archivo` | Nombre local esperado (p. ej. `condor-01.jpg`) |

Las imágenes se descargan localmente (p. ej. en `refs/`, en `.gitignore`) con ese nombre. El campo
**`ref`** de cada entrada de `FLORA`/`SPECIES` apunta a su(s) `id` del manifiesto, y
`npm run species` lo muestra en la ficha de `docs/especies/`. El manifiesto se puebla **por lotes**;
`test/species.test.js` valida solo los `ref` ya declarados.

## Flujo de trabajo por especie

1. Elegir 2 fuentes **PD/CC0** representativas (idealmente perfil y detalle de cabeza/silueta).
2. Registrar la fila en el manifiesto (fuente, autor, licencia, encuadre).
3. Descargar la imagen a `refs/` con el nombre indicado.
4. Traducir a matriz: silueta y proporción sobre la foto; luego color con las claves de
   `getPalette`/hex ([08 · Arte pixel](08-arte-pixel.md)).
5. `npm test` valida caracteres y `palette`; regenerar fichas con `npm run species` si se tocó el
   registro.

## Alcance

- **Fauna:** 21 especies ([06 · Fauna](06-fauna.md)).
- **Flora:** 17 especies reales; los tipos genéricos (`bush`, `crop`, `grass`, `rock`, `flower`) no
  tienen referencia ([05 · Flora](05-flora.md)).
- Total: ~38 especies × 2 referencias ≈ **76 imágenes**, por lotes (un bioma/gremio a la vez).

## Criterios de aceptación

- [ ] Cada especie real tiene ≥ 1 referencia PD/CC0 registrada en el manifiesto (poblado por lotes).
- [x] Existe la carpeta de imágenes locales y está en `.gitignore` (`refs/`).
- [x] El campo `ref` del registro aparece en la ficha generada (`npm run species`).
- [x] Ninguna imagen se carga en runtime (solo matrices en código).

## Riesgos / dudas

- Cobertura de fuentes PD/CC0 por especie: algunas endémicas tienen pocas fotos libres (curaduría
  manual por lotes).
- Formato del campo `ref`: **array de `id`** del manifiesto (implementado).
- Validación del manifiesto: `test/species.test.js` comprueba `licencia ∈ {PD, CC0}`, `archivo` y
  `fuente` (implementado).

## Referencias

- [D-053](12-decisiones.md) · [D-047](12-decisiones.md) · [D-048](12-decisiones.md) ·
  [08 · Arte pixel](08-arte-pixel.md) · [05 · Flora](05-flora.md) · [06 · Fauna](06-fauna.md)
