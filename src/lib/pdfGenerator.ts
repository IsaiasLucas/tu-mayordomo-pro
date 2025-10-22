import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Factura } from '@/hooks/useFacturas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export async function generateFacturasPDF(
  facturas: Factura[],
  rangoFechas: { desde: Date; hasta: Date }
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Título
  doc.setFontSize(20);
  doc.setTextColor(120, 81, 169); // Violeta
  doc.text('Facturas y Boletas', pageWidth / 2, 20, { align: 'center' });
  
  // Rango de fechas
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  const rangoTexto = `Del ${format(rangoFechas.desde, 'dd/MM/yyyy', { locale: es })} al ${format(rangoFechas.hasta, 'dd/MM/yyyy', { locale: es })}`;
  doc.text(rangoTexto, pageWidth / 2, 28, { align: 'center' });
  
  // Resumen
  const totalDocumentos = facturas.length;
  const totalMonto = facturas.reduce((sum, f) => sum + (f.monto || 0), 0);
  
  doc.setFontSize(10);
  doc.text(`Total de documentos: ${totalDocumentos}`, 14, 38);
  doc.text(`Monto total: $${totalMonto.toLocaleString('es-CL')}`, 14, 44);
  
  // Tabla de facturas
  const tableData = facturas.map(f => [
    format(new Date(f.fecha_documento), 'dd/MM/yyyy'),
    f.tipo.charAt(0).toUpperCase() + f.tipo.slice(1),
    f.archivo_nombre.length > 30 ? f.archivo_nombre.substring(0, 27) + '...' : f.archivo_nombre,
    f.monto ? `$${f.monto.toLocaleString('es-CL')}` : '-',
    f.descripcion || '-',
  ]);

  autoTable(doc, {
    startY: 52,
    head: [['Fecha', 'Tipo', 'Archivo', 'Monto', 'Descripción']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [120, 81, 169], // Violeta
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250],
    },
    margin: { top: 52, left: 14, right: 14 },
  });

  // Agregar miniaturas de imágenes (solo las primeras 10 para no exceder tamaño)
  let yPosition = (doc as any).lastAutoTable.finalY + 15;
  const imagesToInclude = facturas.slice(0, 10).filter(f => 
    f.archivo_url.match(/\.(jpg|jpeg|png|webp)$/i)
  );

  if (imagesToInclude.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(120, 81, 169);
    doc.text('Vista previa de documentos', 14, yPosition);
    yPosition += 8;

    for (const factura of imagesToInclude) {
      // Verificar si necesitamos nueva página
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      try {
        // Cargar imagen
        const img = await loadImage(factura.archivo_url);
        const imgAspect = img.width / img.height;
        const maxWidth = 80;
        const maxHeight = 60;
        
        let imgWidth = maxWidth;
        let imgHeight = maxWidth / imgAspect;
        
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = maxHeight * imgAspect;
        }

        // Añadir imagen
        doc.addImage(factura.archivo_url, 'JPEG', 14, yPosition, imgWidth, imgHeight);
        
        // Añadir información al lado
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        const textX = 14 + imgWidth + 5;
        doc.text(`Fecha: ${format(new Date(factura.fecha_documento), 'dd/MM/yyyy')}`, textX, yPosition + 5);
        doc.text(`Tipo: ${factura.tipo}`, textX, yPosition + 12);
        if (factura.monto) {
          doc.text(`Monto: $${factura.monto.toLocaleString('es-CL')}`, textX, yPosition + 19);
        }
        
        yPosition += imgHeight + 12;
      } catch (error) {
        console.error('Error loading image for PDF:', error);
      }
    }
  }

  // Footer en todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, pageHeight - 10);
  }

  // Descargar PDF
  const fileName = `facturas_${format(rangoFechas.desde, 'ddMMyyyy')}_${format(rangoFechas.hasta, 'ddMMyyyy')}.pdf`;
  doc.save(fileName);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
