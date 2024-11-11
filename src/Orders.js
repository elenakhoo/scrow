import React from 'react';
import { BrowserProvider, Contract } from 'ethers';
import './Orders.css';

// Contract address and ABI
const contractAddress = '0x14D7303E376B5C20465a139c9f95Ee5Eae561620';
const contractABI = [
  // ABI for fulfillOrder function
  {
    "inputs": [
      { "internalType": "uint", "name": "_orderId", "type": "uint" }
    ],
    "name": "fulfillOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
];

const Orders = ({ orders }) => {
  // Function to fulfill an order
  const handleFulfillOrder = async (orderId) => {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAddress, contractABI, signer);

        console.log(`Fulfilling order with ID: ${orderId}`);
        const tx = await contract.fulfillOrder(orderId);
        await tx.wait();

        alert(`Order ${orderId} fulfilled successfully!`);
      } catch (error) {
        console.error('Error fulfilling order:', error);
        alert('Failed to fulfill the order.');
      }
    } else {
      console.warn('Ethereum provider not available.');
    }
  };

  return (
    <div className="orders-wrapper">
      <h3>Seller Orders</h3>
      {orders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className="order-card">
            <div className="order-content">
              <h4>Order ID: {parseInt(order.orderId)}</h4>
              <p className="buyer-info">Buyer: {order.buyer}</p>
              <p className="order-price">Total: {order.totalPrice} CROW</p>
              <div className="order-details">
                <h5>Products:</h5>
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="order-item">
                    <div className="order-image">
                    <img src={item.imageUrl || "https://via.placeholder.com/100"} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <p className="product-name">Name: {item.name}</p>
                      <p className="product-id">Product ID: {parseInt(item.productId)}</p>
                      <p className="product-quantity">Quantity: {parseInt(item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-actions">
                <div className="action-buttons">
                  <button className="cancel-button">Cancel</button>
                  <button 
                    className="fulfill-button" 
                    onClick={() => handleFulfillOrder(order.orderId)}
                  >
                    Fulfill Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
