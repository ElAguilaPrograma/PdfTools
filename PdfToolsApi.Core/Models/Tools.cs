using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PdfToolsApi.Core.Models
{
    public class Tools
    {
        public int ToolId { get; set; }
        public string Name { get; set; } = string.Empty!;
        public string Description { get; set; } = string.Empty!;
        public bool IsActive { get; set; }
        public string Route { get; set; } = string.Empty;
    }
}
