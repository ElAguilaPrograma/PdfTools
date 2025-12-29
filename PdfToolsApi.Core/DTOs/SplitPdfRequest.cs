using iText.Forms.Form.Element;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace PdfToolsApi.Core.DTOs
{
    public class SplitPdfRequest
    {
        public IFormFile File { get; set; } = default!;
        public int StartPage { get; set; }
        public int EndPage { get; set; }
    }
}
