using AutoMapper;
using Dtos;
using Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace IoT
{
    [Route("api/[controller]")]
    [ApiController]
    public class ControllerData : ControllerBase
    {
        private readonly Contex _contex;
        private readonly IHubContext<IoTHub> _hub;
        private readonly IMapper _mapper;
        private readonly IStoreFiles _storeFiles;
        private readonly IWebHostEnvironment _env;

        public ControllerData(Contex contex, IHubContext<IoTHub> hub, IMapper mapper, IStoreFiles storeFiles, IWebHostEnvironment env)
        {
            _contex = contex;
            _hub = hub;
            _mapper = mapper;
            _storeFiles = storeFiles;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<Data>> GetData()
        {
            try
            {
                var data = await _contex.Data.OrderByDescending(x => x.DateRegister).ToListAsync();
                return Ok(data);
            }
            catch (Exception exc)
            {
                return BadRequest(exc.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult> AddData([FromBody] DataDTO dataDto)
        {
            try
            {
                var data = _mapper.Map<Data>(dataDto);
                data.Id = Guid.NewGuid().ToString();
                data.DateRegister = DateTime.UtcNow;
                _contex.Data.Add(data);
                var status = await _contex.SaveChangesAsync();
                if(status > 0){
                    await _hub.Clients.All.SendAsync("data", data);
                    return Ok();
                }
                return BadRequest();
            }
            catch (Exception exc)
            {
                return BadRequest(exc.Message);
            }
        }

        [HttpGet("resource")]
        public async Task<ActionResult<List<ResourceDTO>>> GetResource()
        {
            try
            {
                var resource = await _contex.Resources.OrderByDescending(x => x.DateRegister).ToListAsync();
                return _mapper.Map<List<ResourceDTO>>(resource);
            }
            catch (Exception exc)
            {
                return BadRequest(exc.Message);
            }
        }

        [HttpPost("resource")]
        public async Task<ActionResult> AddResource([FromBody] ResourceDTO resourceDTO)
        {
            try
            {
                if (resourceDTO.FileBase64 != null && resourceDTO.FileBase64 != string.Empty)
                {
                    byte[] content = Convert.FromBase64String(resourceDTO.FileBase64);
                    var container = Path.Combine("Resources");
                    var Url = await _storeFiles.SaveFile(content, container, resourceDTO.FileName!, resourceDTO.ContentType.Split("/")[^1].ToLower(), resourceDTO.Url, _env.WebRootPath);
                    var resource = new Resource
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = resourceDTO.Name,
                        Description = resourceDTO.Description,
                        ContentType = resourceDTO.ContentType,
                        FileName = resourceDTO.FileName,
                        Url = Url,
                        DateRegister = resourceDTO.DateRegister
                    };
                    _contex.Resources.Add(resource);
                    var status = await _contex.SaveChangesAsync();
                    if(status > 0){
                        return Ok();
                    }
                    return BadRequest();
                }
                return BadRequest("FileBase64 is required");
            }
            catch (Exception exc)
            {
                return BadRequest(exc.Message);
            }
        }
    }
}