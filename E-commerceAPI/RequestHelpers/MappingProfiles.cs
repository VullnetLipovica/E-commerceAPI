using AutoMapper;
using E_commerceAPI.DTOs;
using E_commerceAPI.Entities;

namespace E_commerceAPI.RequestHelpers
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>();
        }
    }
}
