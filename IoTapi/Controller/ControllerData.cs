using AutoMapper;
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

        public ControllerData(Contex contex, IHubContext<IoTHub> hub, IMapper mapper)
        {
            _contex = contex;
            _hub = hub;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<Data>> GetData()
        {
            try
            {
                var data = await _contex.Data.ToListAsync();
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
    }
}