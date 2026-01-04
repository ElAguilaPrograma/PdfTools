using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PdfToolsApi.Core.DTOs;
using PdfToolsApi.Core.Models;
using PdfToolsApi.Core.Services;

namespace PdfToolsApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PdfToolsController : ControllerBase
    {
        private readonly IPdfMergeService _mergeService;
        private readonly IPdfSplitService _splitService;
        private readonly IPdfDeletePagesService _deletePagesService;
        private readonly IPdfTextService _textService;
        private readonly IPdfImageToPdfService _imageToPdfService;
        private readonly IPdfToImageService _pdfToImageService;
        public PdfToolsController(
            IPdfMergeService pdfMergeService,
            IPdfSplitService pdfSplitService,
            IPdfDeletePagesService deletePagesService,
            IPdfTextService textService,
            IPdfImageToPdfService imageToPdfService,
            IPdfToImageService pdfToImageService)
        {
            _mergeService = pdfMergeService;
            _splitService = pdfSplitService;
            _deletePagesService = deletePagesService;
            _textService = textService;
            _imageToPdfService = imageToPdfService;
            _pdfToImageService = pdfToImageService;
        }

        [HttpPost("merge")]
        public IActionResult MergePdfs([FromForm] List<IFormFile> files)
        {
            var streams = files.Select(f => f.OpenReadStream()).ToList();
            var result = _mergeService.MergePdfsFromStreams(streams);

            return File(result, "application/pdf", "merged.pdf");
        }

        [HttpPost("split")]
        [Consumes("multipart/form-data")]
        public IActionResult SplitPdfs([FromForm] SplitPdfRequest request)
        {
            using var stream = request.File.OpenReadStream();
            var result = _splitService.ExtractPages(stream, request.StartPage, request.EndPage);

            return File(result, "application/pdf", "split.pdf");
        }

        [HttpPost("delete")]
        [Consumes("multipart/form-data")]
        public IActionResult DeletePdfs([FromForm] DeletePdfRequest request)
        {
            using var stream = request.File.OpenReadStream();
            var result = _deletePagesService.DeletePages(stream, request.PagesToDelete);

            return File(result, "application/pdf", "delete.pdf");
        }

        [HttpPost("text")]
        [Consumes("multipart/form-data")]
        public IActionResult TextPdf([FromForm] TextPdfRequest request)
        {
            using var stream = request.File.OpenReadStream();
            var result = _textService.AddPageNumbers(stream, request.StartPage);

            return File(result, "application/pdf", "text.pdf");
        }

        [HttpPost("imagetopdf")]
        [Consumes("multipart/form-data")]
        public IActionResult ImageToPdf([FromForm] ImagePdfRequest request)
        {
            using var stream = request.InputImage.OpenReadStream();
            var result = _imageToPdfService.ConvertImageToPdf(stream);

            return File(result, "application/pdf", "image.pdf");
        }

        [HttpPost("imagestopdf")]
        [Consumes("multipart/form-data")]
        public IActionResult ImagesToPdf([FromForm] List<IFormFile> images)
        {
            var streams = images.Select(i => i.OpenReadStream()).ToList();
            var result = _imageToPdfService.ConvertImagesToPdf(streams);

            return File(result, "application/pdf", "image.pdf");
        }

        [HttpPost("imagestopdffixed")]
        [Consumes("multipart/form-data")]
        public IActionResult ImagesToPdfFixed([FromForm] List<IFormFile> images)
        {
            var streams = images.Select(i => i.OpenReadStream()).ToList();
            var result = _imageToPdfService.ConvertImagesToPdfFixedPage(streams);

            return File(result, "application/pdf", "imagesFixed.pdf");
        }

        [HttpPost("pdftoimage")]
        [Consumes("multipart/form-data")]
        public IActionResult PdfToImage(IFormFile file)
        {
            var stream = file.OpenReadStream();
            var result = _pdfToImageService.ConvertPdfToImages(stream);

            return File(result, "application/zip", "images.zip");
        }

        [HttpGet("getalltools")]
        public IActionResult GetAllTools()
        {
            var tools = new List<Tools>
            {
                new Tools { ToolId = 0, Name = "Merge PDFs", Description = "Merges two or more PDFs", IsActive = true, Route = "/merge" },
                new Tools { ToolId = 1, Name = "Split PDF", Description = "Splits the pages of a PDF into individual PDF files", IsActive = true, Route = "/split" },
                new Tools { ToolId = 2, Name = "Delete PDF Pages", Description = "Deletes pages from a PDF", IsActive = true, Route = "/delete" },
                new Tools { ToolId = 3, Name = "Number Pages", Description = "Numbers the pages of the PDF", IsActive = true, Route = "/enum" },
                new Tools { ToolId = 4, Name = "Image to PDF", Description = "Converts images into a PDF", IsActive = true, Route = "/image" },
                new Tools { ToolId = 5, Name = "PDF to Image", Description = "Generates a .zip file with images extracted from a PDF", IsActive = true, Route = "/pdftoimage" }
            };

            return Ok(tools);
        }


    }
}
