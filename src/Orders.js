import React from 'react';
import './Orders.css'; // Create a CSS file for custom styles

const Orders = ({ orders }) => {
  return (
    <div className="orders-wrapper">
      <h3>Orders</h3>
      {orders.map((order, index) => (
        <div key={index} className="order-card">
          <div className="order-content">
            <div className="order-image">
              <img src="https://via.placeholder.com/100" alt="Product" />
            </div>
            <div className="order-details">
              <p className="product-name">Product Name</p>
              <p className="product-quantity">Quantity: {order.quantity}</p>
              <p className="buyer-info">Buyer: {order.buyerAddress}</p>
              <p className="shipping-address">
                Address: {order.shippingAddress}
              </p>
            </div>
            <div className="order-actions">
              <p className="order-price">{order.price} CROW</p>
              <div className="action-buttons">
                <button className="cancel-button">Cancel</button>
                <button className="fulfill-button">Fulfill Order</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
