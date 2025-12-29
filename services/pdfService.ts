
/**
 * Exports a DOM element to a professional PDF file using window globals.
 */
export const exportScheduleToPDF = (elementId: string, fileName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const element = document.getElementById(elementId);
    if (!element) return reject(new Error("Elemento PDF não encontrado."));

    // @ts-ignore
    const html2canvas = (window as any).html2canvas;
    // @ts-ignore
    const { jsPDF } = (window as any).jspdf || {};

    if (!html2canvas || !jsPDF) {
        return reject(new Error("Bibliotecas de PDF ausentes. Verifique a conexão."));
    }

    setTimeout(() => {
        html2canvas(element, {
            scale: 1.5, // Reduzido ligeiramente para maior compatibilidade de memória
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: 800,
            onclone: (clonedDoc: Document) => {
                const el = clonedDoc.getElementById(elementId);
                if (el) {
                    el.style.position = 'relative';
                    el.style.left = '0';
                    el.style.top = '0';
                    el.style.visibility = 'visible';
                    el.style.display = 'block';
                }
            }
        }).then((canvas: HTMLCanvasElement) => {
            try {
                const imgData = canvas.toDataURL('image/jpeg', 0.9);
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4',
                });
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgProps = pdf.getImageProperties(imgData);
                const totalHeight = (imgProps.height * pdfWidth) / imgProps.width;

                let hLeft = totalHeight;
                let pos = 0;

                pdf.addImage(imgData, 'JPEG', 0, pos, pdfWidth, totalHeight);
                hLeft -= pdfHeight;
                
                while (hLeft > 0) {
                    pos = hLeft - totalHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, pos, pdfWidth, totalHeight);
                    hLeft -= pdfHeight;
                }

                pdf.save(fileName);
                resolve();
            } catch (error) {
                reject(error);
            }
        }).catch(reject);
    }, 500);
  });
};
