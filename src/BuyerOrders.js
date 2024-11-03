// BuyerOrders.js
import React from 'react';
import { BrowserProvider, Contract } from 'ethers'; // Make sure ethers is installed
import './Orders.css';

const contractAddress = '0xc1082A249ADA138DE70e0736676727bDd601c6b8';
const contractABI = [
  // Include only the acceptOrder function in the ABI here for simplicity
  {
    "inputs": [{"internalType": "uint", "name": "_orderId", "type": "uint"}],
    "name": "acceptOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Add other contract ABI definitions as needed
];

const BuyerOrders = ({ orders, account }) => {
  const acceptOrder = async (orderId) => {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAddress, contractABI, signer);

        // Call the acceptOrder function on the contract
        const tx = await contract.acceptOrder(orderId);
        await tx.wait();
        alert('Order accepted successfully!');
      } catch (error) {
        console.error('Error accepting order:', error);
        alert('Failed to accept the order.');
      }
    } else {
      console.warn('Ethereum provider not available.');
    }
  };

  return (
    <div className="orders-wrapper">
      <h3>Your Orders</h3>
      {orders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className="order-card">
            <div className="order-content">
              <h4>Order ID: {parseInt(order.orderId)}</h4>
              <p className="order-price">Total: {order.totalPrice} CROW</p>
              <div className="order-details">
                <h5>Products:</h5>
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="order-item">
                    <div className="order-image">
                      <img src="https://via.placeholder.com/100" alt="Product" />
                    </div>
                    <div className="item-details">
                      <p className="product-id">Product ID: {parseInt(item.productId)}</p>
                      <p className="product-quantity">Quantity: {parseInt(item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-status">
                <p>Status: {order.isFulfilled ? 'Fulfilled' : 'Pending'}</p>
              </div>
              <div className="order-actions">
                {order.isFulfilled && !order.isAccepted && (
                  <button
                    className="accept-button"
                    onClick={() => acceptOrder(order.orderId)}
                  >
                    Accept Order
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BuyerOrders;
