using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IoT
{
    public class DataDTO
    {
        public string? Id { get; set; } = null!;
        public DateTime? DateRegister { get; set; }
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double Light { get; set; }
        public double Proximity { get; set; }
    }
}