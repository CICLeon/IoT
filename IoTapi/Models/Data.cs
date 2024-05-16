using System.ComponentModel.DataAnnotations;

namespace IoT
{
    public class Data
    {
        [Key]
        public string Id { get; set; } = null!;
        public DateTime DateRegister { get; set; }
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double Light { get; set; }
        public double Proximity { get; set; }
    }
}