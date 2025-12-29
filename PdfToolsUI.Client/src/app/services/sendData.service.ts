import { Injectable } from "@angular/core";
import { PdfApiService } from "../api/services/PdfApi.service";
import { IPdfItem } from "../api/services/models/pdfItem";
import { MessageService } from "primeng/api";

@Injectable({
    providedIn: 'root'
})

export class SendDataService {

    constructor(private pdfApiService: PdfApiService,
        private messageService: MessageService) { }

    sendFiles(toolId: number, pdfs: IPdfItem[]): boolean {
        const option: number = toolId;
        let success: boolean = false;

        const formData = new FormData();
        pdfs.forEach(pdf => {
            formData.append('files', pdf.file, pdf.file.name);
        });

        switch (option) {
            case 0:
                this.pdfApiService.mergePdfFiles(formData).subscribe({
                    next: (blob: Blob) => {
                        this.openPdf(blob);

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Listo',
                            detail: 'PDF generated successfully'
                        });
                        success = true;
                    },
                    error: (err) => {
                        console.error(err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error procesing PDFs'
                        });

                    }
                });

            break;
        }

        return success;
    }

    private openPdf(blob: Blob): void {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
    }
}