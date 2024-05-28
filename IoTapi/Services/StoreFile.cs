using Interfaces;

namespace Services
{
  public class StoreFile : IStoreFiles
  {

    public StoreFile()
    {
    }

    public Task<int> DeleteFile(string url, string container, string webRootPath)
    {
      if (url != null)
      {
        var nameFile = Path.GetFileName(url);
        string fullUrlRoot = Path.Combine(webRootPath, container, nameFile);
        if (File.Exists(fullUrlRoot))
        {
          File.Delete(fullUrlRoot);
        }
      }
      return Task.FromResult(0);
    }

    public async Task<string> EditFile(byte[] content, string container, string nameFile, string extension, string urlHost, string webRootPath, string urlFile)
    {
      await DeleteFile(urlFile, container, webRootPath);
      return await SaveFile(content, container, nameFile, extension, urlHost, webRootPath);
    }

    public async Task<string> SaveFile(byte[] content, string container, string nameFile, string extension, string urlHost, string webRootPath)
    {
      string folder = Path.Combine(webRootPath, container);
      if (!Directory.Exists(folder))
      {
        Directory.CreateDirectory(folder);
      }
      string fullNameFile = $"{nameFile}.{extension}";
      string route = Path.Combine(folder, fullNameFile);
      await File.WriteAllBytesAsync(route, content);
      return Path.Combine(urlHost, container, fullNameFile).Replace("\\", "/");
    }
  }
}