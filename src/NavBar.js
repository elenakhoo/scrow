import React from 'react';
import './NavBar.css';
import logo from './scrow_logo.png';
import logo1 from './cart.png';
import logo2 from './metamask_fox.png';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ account, isConnected, connectMetaMask }) => {

  const navigate = useNavigate();

  const handleCartClick = () => {
    if (isConnected) {
      navigate(`/cart`);
    } else {
      navigate(`/login`);
    }
  }

  const handleHomeClick = () => {
    navigate(`/`);
  }

  const handleWalletClick = () => {
    navigate(`/login`);
  }

  const handleOrderClick = () => {
    navigate(`/seller`);
  }

  const handleBuyerClick = () => {
    navigate(`/buyer`);
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="profile-icon" onClick={handleHomeClick}>
          <img src={logo} alt="SCROW logo" />
        </div>
        <div className="logo" onClick={handleHomeClick}> 
          <span>$CROW</span>
          <link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'></link>
        </div>
      </div>

      <div className="navbar-center">
        <input type="text" className="search-input" placeholder="Search marketplace" />
      </div>

      <div className="navbar-right">
        <a className="nav-link" onClick={handleOrderClick}>Seller Center</a>
        <a className="nav-link" onClick={handleBuyerClick}>Buyer Center</a>
        <div className="profile-icon">
          <img src={logo1} alt="Cart icon" onClick={handleCartClick} />
        </div>
        <div className="profile-icon">
          {isConnected ? (
            <span className="nav-acc-number">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
          ) : (
            <img onClick={handleWalletClick} src={logo2} alt="MetaMask wallet icon" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
