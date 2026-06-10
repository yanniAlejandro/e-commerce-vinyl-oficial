from datetime import datetime

from fastapi import HTTPException, status

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import (
    AddToCartRequest,
    CartItemResponse,
    CartResponse,
    UpdateCartItemRequest,
)
from app.services.product_service import get_product_by_id


def _cart_to_response(cart: Cart) -> CartResponse:
    items = [
        CartItemResponse(
            product_id=item.product_id,
            name=item.name,
            artist=item.artist,
            price=item.price,
            quantity=item.quantity,
            image_url=item.image_url,
            line_total=round(item.price * item.quantity, 2),
        )
        for item in cart.items
    ]
    subtotal = round(sum(i.line_total for i in items), 2)
    item_count = sum(i.quantity for i in items)
    return CartResponse(
        items=items,
        subtotal=subtotal,
        item_count=item_count,
        updated_at=cart.updated_at,
    )


async def _get_or_create_cart(user_id: str) -> Cart:
    cart = await Cart.find_one(Cart.user_id == user_id)
    if not cart:
        cart = Cart(user_id=user_id)
        await cart.insert()
    return cart


async def get_cart(user_id: str) -> CartResponse:
    cart = await _get_or_create_cart(user_id)
    return _cart_to_response(cart)


async def add_to_cart(user_id: str, payload: AddToCartRequest) -> CartResponse:
    product = await get_product_by_id(payload.product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if product.stock < payload.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock")

    cart = await _get_or_create_cart(user_id)
    existing = next((i for i in cart.items if i.product_id == payload.product_id), None)

    if existing:
        new_qty = existing.quantity + payload.quantity
        if product.stock < new_qty:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock")
        existing.quantity = new_qty
    else:
        cart.items.append(
            CartItem(
                product_id=str(product.id),
                name=product.name,
                artist=product.artist,
                price=product.price,
                quantity=payload.quantity,
                image_url=product.image_url,
            )
        )

    cart.updated_at = datetime.utcnow()
    await cart.save()
    return _cart_to_response(cart)


async def update_cart_item(user_id: str, product_id: str, payload: UpdateCartItemRequest) -> CartResponse:
    cart = await _get_or_create_cart(user_id)
    item = next((i for i in cart.items if i.product_id == product_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in cart")

    if payload.quantity == 0:
        cart.items = [i for i in cart.items if i.product_id != product_id]
    else:
        product = await get_product_by_id(product_id)
        if not product or product.stock < payload.quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock")
        item.quantity = payload.quantity

    cart.updated_at = datetime.utcnow()
    await cart.save()
    return _cart_to_response(cart)


async def remove_from_cart(user_id: str, product_id: str) -> CartResponse:
    return await update_cart_item(user_id, product_id, UpdateCartItemRequest(quantity=0))


async def clear_cart(user_id: str) -> CartResponse:
    cart = await _get_or_create_cart(user_id)
    cart.items = []
    cart.updated_at = datetime.utcnow()
    await cart.save()
    return _cart_to_response(cart)
