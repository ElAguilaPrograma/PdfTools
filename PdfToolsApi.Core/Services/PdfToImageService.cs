using PdfiumViewer;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO.Compression;

namespace PdfToolsApi.Core.Services
{
    public interface IPdfToImageService
    {
        byte[] ConvertPdfToImages(Stream pdfStream);
    }
    public class PdfToImageService : IPdfToImageService
    {
        private readonly InterfaceIsPdf _validatePdf;
        public PdfToImageService(InterfaceIsPdf interfaceIsPdf)
        {
            _validatePdf = interfaceIsPdf;
        }

        public byte[] ConvertPdfToImages(Stream pdfStream)
        {
            if (pdfStream == null || pdfStream.Length == 0)
                throw new ArgumentException("No se proporciono el PDF");

            if (!_validatePdf.ValidatePdf(pdfStream))
                throw new InvalidDataException("Archivo PDF no valido");

            pdfStream.Position = 0;

            using var document = PdfDocument.Load(pdfStream);

            using var zipStream = new MemoryStream();
            using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
            {
                for (int i = 0; i < document.PageCount; i++)
                {
                    using var image = document.Render(
                        i,
                        300,
                        300,
                        PdfRenderFlags.Annotations
                        );

                    using var imageStream = new MemoryStream();
                    image.Save(imageStream, ImageFormat.Png);

                    var entry = archive.CreateEntry($"page_{i + 1}.png");
                    using var entryStream = entry.Open();
                    entryStream.Write(imageStream.ToArray());
                }
            }

            return zipStream.ToArray();
        }
    }
}
