using System.ComponentModel.DataAnnotations;

namespace IoT
{
    public class Resource
    {
        [Key]
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string Url { get; set; } = null!;
        public DateTime DateRegister { get; set; }
    }
}