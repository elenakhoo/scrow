import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetails.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDetails = ({ products, cart, setCart, isConnected }) => {
  const { id } = useParams(); // Get the product ID from the URL parameters
  const product = products.find((product) => parseInt(product.id) === parseInt(id)); // Find the product by ID
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const addToCart = () => {
    if (isConnected) {
      const existingItem = cart.find(item => item.id === product.id);

      if (existingItem) {
        const updatedCart = cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
        setCart(updatedCart);
      } else {
        setCart([...cart, { ...product, quantity }]);
      }

      toast.success(`${product.name} added to cart!`, { autoClose: 2000 });
    } else {
      navigate('/login');
    }
  };

  const handleCartClick = () => {
    if (isConnected) {
      addToCart();
      navigate('/cart');
    } else {
      navigate('/login');
    }
  };

  if (!product) {
    return <h2>Product not found</h2>;
  }

  return (
    <div className="product-container">
      <div className="product-image-section">
        <div
          className="main-image"
          style={{
            backgroundImage: `url(${product.imageUrl || 'https://via.placeholder.com/300'})`
          }}
        ></div>
      </div>

      <div className="product-info-section">
        <h2 className="product-details-title">{product.name}</h2>

        <div className="product-rating">
          <span>N/A</span> {/* Rating is hardcoded as it's not provided */}
        </div>

        <div className="amount-sold">0 sold</div> {/* Sold count is hardcoded as it's not provided */}

        <div className="product-price">
          <span>{product.price} CROW</span>
        </div>

        <hr width="100%" size="1" color='#E0E0E0' />
        
        <div>
          <h4 className="description">Description</h4>
          <div className="product-description">
            {product.description || 'No description available.'}
          </div>
        </div>

        <hr width="100%" size="1" color='#E0E0E0' />

        <div className="quantity-section">
          <label>Quantity: </label>
          <input 
            className='quantity-input'
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
            min="1" 
          />
        </div>

        <div className="product-buttons">
          <button className="add-to-cart" onClick={addToCart}>Add to Cart</button>
          <button className="buy-now" onClick={handleCartClick}>Buy Now</button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ProductDetails;
