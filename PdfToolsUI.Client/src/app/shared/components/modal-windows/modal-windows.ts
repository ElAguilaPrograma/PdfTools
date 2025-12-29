import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { IPdfItem } from '../../../api/services/models/pdfItem';
import { ProcessPdfFilesService } from '../../../services/processPdfFiles.service';
import { TooltipModule } from 'primeng/tooltip';
import { PdfApiService } from '../../../api/services/PdfApi.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-modal-windows',
  imports: [DialogModule, Button, TooltipModule],
  templateUrl: './modal-windows.html',
  styleUrl: './modal-windows.css',
})
export class ModalWindows {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() header: string = "";
  @Input() toolId: number = 0;
  @Input() multipleFiles: boolean = false;
  @Input() canOrder: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() pdfs: IPdfItem[] = [];
  @Input() isOrdering: boolean = false;
  @Output() isOrderingChange = new EventEmitter<boolean>();

  constructor(private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private processPdfFilesService: ProcessPdfFilesService,
    private pdfApiService: PdfApiService,
    private loadingService: LoadingService) { }

  updateVisibleValue(visible: boolean): void {
    this.visible = visible;
    this.visibleChange.emit(this.visible);
  }

  updateIsOrderingValue(isOrdering: boolean): void {
    this.isOrdering = isOrdering;
    this.isOrderingChange.emit(this.isOrdering);
  }

  onFileSelected(event: Event): void {
    this.processPdfFilesService.onFileSelected(event, this.pdfs);
  }

  closeModalWindow(event: Event): void {
    if (this.pdfs.length !== 0) {
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Do you want to discard the PDFs?',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        rejectButtonProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Delete',
          severity: 'danger',
        },

        accept: () => {
          this.messageService.add({
            severity: 'info', summary: 'Confirmed', detail: 'PDFs deleted'
          });

          this.pdfs.length = 0;
          this.visible = false;
          this.isOrdering = false;
        },
        reject: () => {
          // this.messageService.add({ /*No hace nada.jpg */ });
        },
      });
    }
    else {
      this.visible = false;
    }
  }

  sendFiles(): void {
    this.loadingService.show();
    const option: number = this.toolId;

    const formData = new FormData();
    this.pdfs.forEach(pdf => {
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

            this.pdfs.length = 0;
            this.visible = false;
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error procesing PDFs'
            });
          },
          complete: () => {
            this.loadingService.hide();
          }
        });

        break;
    }

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

  messageActiveOrder(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Order active',
      detail: 'Drag and drop files to change order',
      life: 2000
    });
  }

  messageDesactiveOrder(): void {
    this.messageService.add({
      severity: 'secondary',
      summary: 'Order desactivated',
      detail: 'Drag and drop files to change order',
      life: 2000
    });
  }
}
