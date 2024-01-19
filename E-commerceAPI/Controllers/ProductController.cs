using AutoMapper;
using E_commerceAPI.Data;
using E_commerceAPI.DTOs;
using E_commerceAPI.Entities;
using E_commerceAPI.Extensions;
using E_commerceAPI.RequestHelpers;
using E_commerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace E_commerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : BaseApiController
    {
        private readonly StoreContext _context;
        private readonly IMapper _mapper;
        private readonly ImageService _imageService;

        // Konstruktori i ProductsController merr instancën e StoreContext, IMapper dhe ImageService
        public ProductsController(StoreContext context, IMapper mapper, ImageService imageService)
        {
            _imageService = imageService;
            _mapper = mapper;
            _context = context;
        }

        // Endpoint për marrjen e produkteve duke përdorur parametrat e filtrimit dhe renditjes
        [HttpGet]
        public async Task<ActionResult<List<Product>>> GetProducts([FromQuery] ProductParams productParams)
        {
            // Krijon një query nga tabela e produkteve duke përdorur metodat e filtrimit, kërkimit dhe renditjes
            var query = _context.Products
                .Sort(productParams.OrderBy)
                .Search(productParams.SearchTerm)
                .Filter(productParams.Brands, productParams.Types)
                .AsQueryable();

            // Kthen faqen aktuale të produkteve duke përdorur klasën PagedList
            var products = await PagedList<Product>.ToPagedList(query, productParams.PageNumber, productParams.PageSize);

            // Shton informacionin e paginimit në header të përgjigjes
            Response.AddPaginationHeader(products.MetaData);

            return products;
        }

        // Endpoint për marrjen e një produkti me id të caktuar
        [HttpGet("{id}", Name = "GetProduct")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            // Merr produktin nga tabela e produkteve duke përdorur id
            var product = await _context.Products.FindAsync(id);

            // Nëse produkti nuk gjendet, kthehet një përgjigje NotFound
            if (product == null) return NotFound();

            return product;
        }

        // Endpoint për marrjen e filtrave (brands, types) të disponueshme për produktet
        [HttpGet("filters")]
        public async Task<IActionResult> GetFilters()
        {
            // Merr brand-et unike dhe type-et unike nga tabela e produkteve
            var brands = await _context.Products.Select(p => p.Brand).Distinct().ToListAsync();
            var types = await _context.Products.Select(p => p.Type).Distinct().ToListAsync();

            // Kthehet një përgjigje OK me një objekt që përmban brand-et dhe type-et
            return Ok(new { brands, types });
        }

        // Endpoint për krijimin e një produkti të ri nga një objekt CreateProductDto
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromForm] CreateProductDto productDto)
        {
            // Harton një objekt Product duke përdorur AutoMapper për mapimin e CreateProductDto
            var product = _mapper.Map<Product>(productDto);

            // Nëse ka një skedar të bashkangjitur (file), shtohet si imazh dhe përditësohen fushat e imazhit
            if (productDto.File != null)
            {
                var imageResult = await _imageService.AddImageAsync(productDto.File);

                // Në rast se ka një problem me ngarkimin e imazhit, kthehet një përgjigje BadRequest
                if (imageResult.Error != null) return BadRequest(new ProblemDetails
                {
                    Title = imageResult.Error.Message
                });

                // Përditësohen fushat e imazhit të produktit
                product.PictureURL = imageResult.SecureUrl.ToString();
                product.PublicId = imageResult.PublicId;
            }

            // Shton produktin në tabelën e produkteve
            _context.Products.Add(product);

            // Ruajtja e ndryshimeve në bazën e të dhënave
            var result = await _context.SaveChangesAsync() > 0;

            // Nëse ruajtja ka sukses, kthehet një përgjigje CreatedAtRoute me emrin e route "GetProduct" dhe id e produktit
            if (result) return CreatedAtRoute("GetProduct", new { Id = product.Id }, product);

            // Në rast se ruajtja nuk ka sukses, kthehet një përgjigje BadRequest me një mesazh të problematikës
            return BadRequest(new ProblemDetails { Title = "Problem creating new product" });
        }

        // Endpoint për përditësimin e një produkti ekzistues nga një objekt UpdateProductDto
        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<ActionResult<Product>> UpdateProduct([FromForm] UpdateProductDto productDto)
        {
            // Merr produktin nga tabela e produkteve duke përdorur id e produktit nga objekti i dto
            var product = await _context.Products.FindAsync(productDto.Id);

            // Nëse produkti nuk gjendet, kthehet një përgjigje NotFound
            if (product == null) return NotFound();

            // Përditëson fushat e produktit duke përdorur AutoMapper për mapimin e UpdateProductDto
            _mapper.Map(productDto, product);

            // Nëse ka një skedar të bashkangjitur (file), shtohet si imazh dhe përditësohen fushat e imazhit
            if (productDto.File != null)
            {
                var imageUploadResult = await _imageService.AddImageAsync(productDto.File);

                // Në rast se ka një problem me ngarkimin e imazhit, kthehet një përgjigje BadRequest
                if (imageUploadResult.Error != null)
                    return BadRequest(new ProblemDetails { Title = imageUploadResult.Error.Message });

                // Nëse produkti ka një PublicId, fshihet imazhi ekzistues nga shërbimi i imazheve
                if (!string.IsNullOrEmpty(product.PublicId))
                    await _imageService.DeleteImageAsync(product.PublicId);

                // Përditësohen fushat e imazhit të produktit
                product.PictureURL = imageUploadResult.SecureUrl.ToString();
                product.PublicId = imageUploadResult.PublicId;
            }

            // Ruajtja e ndryshimeve në bazën e të dhënave
            var result = await _context.SaveChangesAsync() > 0;

            // Nëse ruajtja ka sukses, kthehet një përgjigje OK me produktin e përditësuar
            if (result) return Ok(product);

            // Në rast se ruajtja nuk ka sukses, kthehet një përgjigje BadRequest me një mesazh të problematikës
            return BadRequest(new ProblemDetails { Title = "Problem updating product" });
        }

        // Endpoint për fshirjen e një produkti nga tabela e produkteve
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            // Merr produktin nga tabela e produkteve duke përdorur id e produktit
            var product = await _context.Products.FindAsync(id);

            // Nëse produkti nuk gjendet, kthehet një përgjigje NotFound
            if (product == null) return NotFound();

            // Nëse produkti ka një PublicId, fshihet imazhi nga shërbimi i imazheve
            if (!string.IsNullOrEmpty(product.PublicId))
                await _imageService.DeleteImageAsync(product.PublicId);

            // Fshirja e produktit nga tabela e produkteve
            _context.Products.Remove(product);

            // Ruajtja e ndryshimeve në bazën e të dhënave
            var result = await _context.SaveChangesAsync() > 0;

            // Nëse ruajtja ka sukses, kthehet një përgjigje OK
            if (result) return Ok();

            // Në rast se ruajtja nuk ka sukses, kthehet një përgjigje BadRequest me një mesazh të problematikës
            return BadRequest(new ProblemDetails { Title = "Problem deleting product" });
        }
    }
}
