using CakeManagementAPI.DTOs.Cart;
namespace CakeManagementAPI.Services.Interfaces
{
    public interface ICartService
    {
        Task<CartResponseDto> GetCartAsync(int userId);

        Task<CartResponseDto> AddToCartAsync(
            int userId,
            AddToCartDto dto);

        Task<CartResponseDto> UpdateCartItemAsync(
            int userId,
            int cartItemId,
            int quantity);

        Task RemoveCartItemAsync(
            int userId,
            int cartItemId);

        Task ClearCartAsync(int userId);
    }
}
