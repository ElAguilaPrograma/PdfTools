import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { IPdfItem } from '../../../api/services/models/pdfItem';
import { ProcessPdfFilesService } from '../../../services/processPdfFiles.service';
import { TooltipModule } from 'primeng/tooltip';
import { PdfApiService } from '../../../api/services/PdfApi.service';
import { LoadingService } from '../../../services/loading.service';
import { FormsModule } from '@angular/forms';
import { IPdf } from '../../../api/services/models/pdf';
import { IImageItem } from '../../../api/services/models/imageItem';
import { ProcessImageFilesService } from '../../../services/precessImagesFiles.service';

@Component({
  selector: 'app-modal-windows',
  imports: [DialogModule, Button, TooltipModule, FormsModule],
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
  @Input() size: 'small' | 'large' | 'pdf' = 'large';
  @Input() pdfs: IPdfItem[] = [];
  @Input() isOrdering: boolean = false;
  @Output() isOrderingChange = new EventEmitter<boolean>();
  @Input() startPage: number = 0;
  @Input() endPage: number = 0;
  @Input() pagesToDelete: number[] = [];
  @Input() pdf: IPdf | undefined;
  @Output() pdfChange = new EventEmitter<IPdf | undefined>();
  @Input() images: IImageItem[] = [];

  constructor(private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private processPdfFilesService: ProcessPdfFilesService,
    private pdfApiService: PdfApiService,
    private loadingService: LoadingService,
    private processImageFilesService: ProcessImageFilesService) { }

  updateVisibleValue(visible: boolean): void {
    this.visible = visible;
    this.visibleChange.emit(this.visible);
  }

  updateIsOrderingValue(isOrdering: boolean): void {
    this.isOrdering = isOrdering;
    this.isOrderingChange.emit(this.isOrdering);
  }

  async onFileSelected(event: Event) {
    if (this.toolId !== 0) {
      this.pdfs.length = 0;
    }
    this.loadingService.show();
    if (this.toolId !== 2) {
      await this.processPdfFilesService.onFileSelected(event, this.pdfs);
    }
    else {
      this.pdf = await this.processPdfFilesService.onPdfSelected(event);
      this.pdfChange.emit(this.pdf);
    }
    this.loadingService.hide();
  }

  async onImageSelected(event: Event) {
    this.loadingService.show();
    await this.processImageFilesService.onImageSelected(event, this.images);
    this.loadingService.hide();
  }

  closeModalWindow(event: Event): void {
    if (this.pdfs.length !== 0 || this.pdf) {
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
            severity: 'info', summary: 'Canceled', detail: 'PDFs deleted'
          });

          this.pdfs.length = 0;
          this.pdf = undefined;
          console.log(this.pdf);
          this.pagesToDelete.length = 0;
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

    switch (option) {
      case 0:
        this.pdfs.forEach(pdf => {
          formData.append('files', pdf.file, pdf.file.name);
        });

        this.pdfApiService.mergePdfFiles(formData).subscribe({
          next: (blob: Blob) => {
            this.openPdf(blob, "merge");

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

      case 1:
        if (this.pdfs.length > 0) {
          formData.append('File', this.pdfs[0].file, this.pdfs[0].file.name);
        }
        formData.append('StartPage', this.startPage.toString());
        formData.append('EndPage', this.endPage.toString());

        this.pdfApiService.splitPdfFile(formData).subscribe({
          next: (blob: Blob) => {
            this.openPdf(blob, this.pdfs[0].file.name + " [split]");

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
            this.loadingService.hide();
          },
          complete: () => {
            this.loadingService.hide();
          }
        });
        break;

      case 2:
        if (!this.pdf?.file) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No PDF file selected'
          });
          this.loadingService.hide();
          return;
        }

        formData.append('File', this.pdf.file, this.pdf.file.name);
        // ASP.NET Core expects multiple fields with the same name for List<int>
        this.pagesToDelete.forEach(page => {
          formData.append('PagesToDelete', page.toString());
        });

        this.pdfApiService.deletePdfPages(formData).subscribe({
          next: (blob: Blob) => {
            this.openPdf(blob, this.pdf!.file.name + " [deleted]");

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
            this.loadingService.hide();
          },
          complete: () => {
            this.loadingService.hide();
          }
        });
        break;
      case 3:
        if (this.startPage > 0) this.startPage -= 1;
        if (this.pdfs.length > 0) {
          formData.append('File', this.pdfs[0].file, this.pdfs[0].file.name);
          console.log(this.startPage);
        }
        formData.append('StartPage', this.startPage.toString());
        this.pdfApiService.enumeratePdfPage(formData).subscribe({
          next: (blob: Blob) => {
            this.openPdf(blob, this.pdfs[0].file.name + " [enumeratedPages]");
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
            this.loadingService.hide();
          },
          complete: () => {
            this.loadingService.hide();
          }
        })
        break;
    }

  }

  private openPdf(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.pdf`;
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

  printStartPageAndEndPage(): void {
    console.log("StartPage: " + this.startPage + " EndPage: " + this.endPage);
  }
}
