using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PdfToolsApi.Core.DTOs
{
    public class TextPdfRequest
    {
        public IFormFile File { get; set; } = default!;
        public int StartPage { get; set; }
    }
}
