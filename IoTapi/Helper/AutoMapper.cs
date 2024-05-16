using AutoMapper;

namespace IoT
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Data, DataDTO>().ReverseMap();
        }
    }
}