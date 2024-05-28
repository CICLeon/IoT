namespace Interfaces
{
  public interface IStoreFiles
  {
    Task<int> DeleteFile(string url, string container, string webRootPath);
    Task<string> EditFile(byte[] content, string container, string nameFile, string extension, string urlHost, string webRootPath, string urlFile);
    Task<string> SaveFile(byte[] content, string container, string nameFile, string extension, string urlHost, string webRootPath);
  }
}