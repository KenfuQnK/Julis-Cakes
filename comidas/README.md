# Food Gallery

Galería local para ordenar las fotografías guardadas en comidas/fotos. No modifica las fotos originales ni necesita conexión, cuentas o paquetes adicionales. Solo utiliza Python 3 y el navegador.

## Iniciar en Windows

Haz doble clic en _START.bat. Abrirá http://127.0.0.1:8765 y mantendrá el servidor local en una ventana de consola. Para detenerlo, cierra esa ventana o pulsa Ctrl+C.

También se puede iniciar desde esta carpeta con py -3 server.py. El servidor escucha únicamente en el equipo local. Si el puerto 8765 está ocupado, inicia con set FOOD_GALLERY_PORT=8766 y py -3 server.py, y visita http://127.0.0.1:8766.

## Uso

- Al abrir la aplicación se escanean JPG, JPEG y PNG. Los vídeos y demás formatos se ignoran.
- Las fotos se agrupan por día a partir de la fecha del nombre del archivo. Si no existe, se usa EXIF y luego la fecha del archivo.
- La organización se guarda en comidas.json con guardado atómico. El escaneo posterior conserva grupos, nombres, portadas, estados ocultos y orden manual; incorpora únicamente imágenes nuevas.
- Las fotos originales no se mueven, cambian de nombre ni se borran. Si falta una foto registrada, se conserva y aparece marcada como no encontrada.
- Usa Escanear fotos después de copiar fotos nuevas a fotos.
- Las fotos se pueden ocultar, recuperar, usar como portada y reordenar desde el menú de acciones de la tarjeta o desde la vista ampliada. Mover a… abre un diálogo con miniaturas de los platos de destino; si el plato de origen queda sin fotos, se elimina.
- Editar foto permite elegir con un recuadro el encuadre del carrusel. Se guarda en comidas.json y la foto original conserva su aspecto en la vista ampliada.
- El icono de marcador junto al nombre guarda el plato y conserva ese estado en comidas.json.
- Para probar el escáner con fotos propias, copia archivos a comidas/fotos y vuelve a escanear.

## Pruebas

py -3 -m unittest -v test_server.py

Las pruebas cubren el escaneo repetido, la exclusión de vídeos, la incorporación a grupos automáticos, la ambigüedad de varios platos en una fecha, la preservación de datos anteriores y la validación de rutas y duplicados.
