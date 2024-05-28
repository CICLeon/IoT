using AutoMapper;
using Dtos;

namespace IoT
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Data, DataDTO>().ReverseMap();
            CreateMap<Resource, ResourceDTO>().ReverseMap();
        }
    }
}