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
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    }).then((canvas: HTMLCanvasElement) => {
      try {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        
        const imgProperties = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pageHeight;
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
