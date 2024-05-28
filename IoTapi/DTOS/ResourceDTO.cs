namespace Dtos
{
    public class ResourceDTO
    {
        public string? Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string FileBase64 { get; set; } = null!;
        public DateTime DateRegister { get; set; }
        public string Url { get; set; } = null!;
    }
}