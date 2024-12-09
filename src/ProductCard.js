import React, { useState } from 'react';
import './ProductCard.css';  
import heartNorm from './heartnorm.png'; 
import heartLiked from './heartliked.png';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({name, price, rating, sold, id, imageUrl}) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const handleHeartClick = () => {
    setIsLiked(!isLiked);
  };

  const handleCardClick = (e) => {
    if(e.target.className !== "wishlist")
    {
      navigate(`/product/${id}`);
    }
  }

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image">
        <img src={imageUrl} alt="Product" />
      </div>
      <div className="product-details">
        <div className="product-title">
          <h3>{name}</h3>
          <div className="wishlist" onClick={(e) => {e.stopPropagation(); handleHeartClick();}}>
            <img src={isLiked ? heartLiked : heartNorm} alt="Heart Icon" className={isLiked ? 'clicked' : 'not-clicked'} />
          </div>
        </div>
        <p className="price" style={{ marginBottom: "0px" }}>{price} CROW</p>
        <p className="estimated-price">~ RM{(price * 2500).toFixed(2)}</p> {/* Example conversion: 1 CROW = $0.05 */}
        <div className="rating-sold">
          <span className="rating">⭐ {rating}</span>
          <span className="sold">{sold} sold</span>
        </div>  
      </div>
    </div>
  );  
};

export default ProductCard;
