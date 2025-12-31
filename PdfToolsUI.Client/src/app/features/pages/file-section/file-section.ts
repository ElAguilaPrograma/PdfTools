import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IPdfItem } from '../../../api/services/models/pdfItem';
import { TooltipModule } from 'primeng/tooltip';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ModalWindows } from '../../../shared/components/modal-windows/modal-windows';
import { ProcessPdfFilesService } from '../../../services/processPdfFiles.service';
import { LoadingService } from '../../../services/loading.service';
import { InputNumber } from "primeng/inputnumber";
import { FormsModule } from '@angular/forms';
import { IPdf } from '../../../api/services/models/pdf';

@Component({
  selector: 'app-file-section',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    RouterLink,
    RouterLinkActive,
    DialogModule,
    CardModule,
    ConfirmDialogModule,
    TooltipModule,
    DragDropModule,
    ModalWindows,
    InputNumber,
    FormsModule
  ],
  templateUrl: './file-section.html',
  styleUrl: './file-section.css',
  providers: [MessageService, ConfirmationService]
})
export class FileSection implements OnInit {
  toolId: any;
  toolName: any;
  visible: boolean = false;
  pdfs: IPdfItem[] = [];
  pdf: IPdf | undefined;
  pagesToDelete: number[] = [];
  isOrdering: boolean = false;
  startPage: number = 1;
  endPage: number = 1;

  constructor(
    private router: ActivatedRoute,
    private messageService: MessageService,
    private processPdfFilesService: ProcessPdfFilesService,
    private loadingService: LoadingService
  ) { }

  @ViewChild('pdfCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  ngOnInit(): void {
    this.router.paramMap.subscribe(params => {
      this.toolId = params.get('id');
      this.toolId = parseInt(this.toolId);
      this.toolName = params.get('name');
    });
  }

  async onFileSelected(event: Event) {
    this.loadingService.show();
    if (this.toolId !== 2) {
      await this.processPdfFilesService.onFileSelected(event, this.pdfs);
    }
    else {
      this.pdf = await this.processPdfFilesService.onPdfSelected(event);
    }

    this.openModalWindow();
    this.loadingService.hide();
  }

  addPageToDeleteList(index: number): void {
    if (this.pagesToDelete.includes(index)) {
      this.pagesToDelete.splice(this.pagesToDelete.indexOf(index), 1);
    }
    else {
      this.pagesToDelete.push(index);
    }
    console.log(this.pagesToDelete);
  }

  removeSelectedPdf(index: number): void {
    if (this.toolId === 1 ) {
      return;
    }
    if (!this.isOrdering) {
      this.processPdfFilesService.removeSelectedPdf(index, this.isOrdering, this.pdfs);
      this.messageService.add({
        severity: 'secondary',
        summary: 'Deleted',
        detail: 'PDF successfully deleted',
        life: 1000
      })
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.processImages(Array.from(input.files));

    // Clear value to allow selecting the same images again
    try {
      input.value = '';
    } catch (e) {
      // ignore
    }
  }

  processImages(files: File[]) {
    const validImages = files.filter(file =>
      file.type.startsWith('image/')
    );

    if (validImages.length !== files.length) {
      alert('Solo se permiten imágenes');
    }

    console.log(validImages);
    this.openModalWindow();
  }

  openModalWindow(): void {
    this.visible = true;
  }

  drop(event: CdkDragDrop<IPdfItem[]>) {
    moveItemInArray(this.pdfs, event.previousIndex, event.currentIndex);
  }

}
