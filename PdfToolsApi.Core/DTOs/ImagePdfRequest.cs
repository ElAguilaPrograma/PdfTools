using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PdfToolsApi.Core.DTOs
{
    public class ImagePdfRequest
    {
        public IFormFile InputImage { get; set; } = null!;
    }
}
