declare const jspdf: any;
declare const html2canvas: any;

export const exportScheduleToPDF = (elementId: string, fileName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const element = document.getElementById(elementId);
    if (!element) {
      const error = new Error(`Element with id ${elementId} not found.`);
      console.error(error);
      return reject(error);
    }

    html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      backgroundColor: '#ffffff', // Explicitly set background
    }).then((canvas: HTMLCanvasElement) => {
      try {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        
        const margin = 10; // 10mm margin
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = pdfWidth - (margin * 2);
        const pageContentHeight = pdfHeight - (margin * 2);

        const imgProps = pdf.getImageProperties(imgData);
        const totalImgHeight = (imgProps.height * contentWidth) / imgProps.width;

        let heightLeft = totalImgHeight;
        let position = margin;

        // Add the image to the PDF, placing it at the top margin.
        // The Y position will be negative on subsequent pages to "scroll" the image up.
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, totalImgHeight);
        heightLeft -= pageContentHeight;
        
        while (heightLeft > 0) {
          position -= pageContentHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position, contentWidth, totalImgHeight);
          heightLeft -= pageContentHeight;
        }

        pdf.save(fileName);
        resolve();
      } catch (error) {
        console.error("Error generating PDF:", error);
        reject(error);
      }
    }).catch(error => {
        console.error("Error with html2canvas:", error);
        reject(error);
    });
  });
};
