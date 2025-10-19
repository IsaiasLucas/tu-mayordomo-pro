/**
 * Comprime una imagen manteniendo la legibilidad
 * Objetivo: imágenes menores a 200KB
 */
export async function compressImage(file: File): Promise<File> {
  // Si es PDF, no comprimimos
  if (file.type === 'application/pdf') {
    return file;
  }

  // Si ya es menor a 200KB, no hace falta comprimir
  if (file.size < 200 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }

        // Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920; // Máximo ancho/alto para mantener legibilidad

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob con calidad ajustada
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo comprimir la imagen'));
              return;
            }

            // Crear nuevo archivo con el blob comprimido
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.jpg'), // Cambiar extensión a jpg
              {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }
            );

            console.log(`Compresión: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          0.85 // Calidad 85% (buen balance entre tamaño y legibilidad)
        );
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Valida que el archivo sea una imagen o PDF válido
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WEBP) y PDF.',
    };
  }

  // Límite de 5MB antes de comprimir
  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Máximo 5MB.',
    };
  }

  return { valid: true };
}
