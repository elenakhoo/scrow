import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import './ProductList.css';

const ProductList = ({ products, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="product-list">
      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        products.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)} // Navigate to ProductDetails page
          >
            <ProductCard
              name={product.name}
              price={product.price}
              rating="N/A" // Placeholder since rating is not available
              sold={0}     // Placeholder for sold count
              id={product.id}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default ProductList;
