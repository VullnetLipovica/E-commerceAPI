using CloudinaryDotNet.Actions;
using CloudinaryDotNet;

namespace E_commerceAPI.Services
{
    // Klasa ImageService përdoret për menaxhimin e imazheve përmes Cloudinary
    public class ImageService
    {
        private readonly Cloudinary _cloudinary;

        // Konstruktori, merr një IConfiguration për të konfiguruar Cloudinary
        public ImageService(IConfiguration config)
        {
            // Krijon një objekt Account me të dhënat nga konfigurimi
            var acc = new Account
            (
                config["Cloudinary:CloudName"],
                config["Cloudinary:ApiKey"],
                config["Cloudinary:ApiSecret"]
            );

            // Krijon një objekt Cloudinary me Account-in e krijuar
            _cloudinary = new Cloudinary(acc);
        }

        // Metoda për të ngarkuar një imazh në Cloudinary
        public async Task<ImageUploadResult> AddImageAsync(IFormFile file)
        {
            // Krijon një objekt për rezultatin e ngarkimit të imazhit
            var uploadResult = new ImageUploadResult();

            // Verifikon nëse file ka përmbajtje
            if (file.Length > 0)
            {
                // Hap stream-in për lexim të përmbajtjes së file
                using var stream = file.OpenReadStream();

                // Krijon një objekt ImageUploadParams me të dhënat e nevojshme për ngarkim
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream)
                };

                // Kryen ngarkimin e imazhit në Cloudinary
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            // Kthen rezultatin e ngarkimit
            return uploadResult;
        }

        // Metoda për të fshirë një imazh nga Cloudinary
        public async Task<DeletionResult> DeleteImageAsync(string publicId)
        {
            // Krijon një objekt DeletionParams për të konfiguruar fshirjen
            var deleteParams = new DeletionParams(publicId);

            // Kryen fshirjen e imazhit nga Cloudinary
            var result = await _cloudinary.DestroyAsync(deleteParams);

            // Kthen rezultatin e fshirjes
            return result;
        }
    }
}