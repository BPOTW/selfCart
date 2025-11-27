import './App.css';
import Add from "./assets/plus.svg";
import Remove from "./assets/minus.svg";
import React, { useState } from "react";
import Scanner from "./scanner";
import axios from "axios";

function App() {
  const [code, setCode] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [recentProduct, setRecentProduct] = useState([]);
  const [cart, setCart] = useState([]);

  async function getProductDetails(barcode) {
    if (!barcode) return;
    console.log(`Searching barcode: ${barcode}`);
    setCode(barcode);

    try {
      const response = await axios.post(
        "https://self-cart-server.vercel.app/api/check-barcode",
        { barcode },
        { headers: { "Content-Type": "application/json" } }
      );

      const product = response.data.product;
      console.log(product)
      if (product) {
        setProductDetails({ ...product, quantity: 1 });

        setRecentProduct(prev => {
          const filtered = prev.filter(item => item.barcode !== product.barcode);
          const updated = [product, ...filtered];
          return updated.slice(0, 2);
        });

      } else {
        console.log("No product found!");
        setProductDetails(null);
      }
    } catch (error) {
      setCode(error);
      console.error("Error fetching product:", error);
      setProductDetails(null);
    }
  }

  // Handle manual input search
  const handleInputSearch = () => {
    getProductDetails(code);
  };

  const increaseTemp = () => {
    if (productDetails) {
      setProductDetails(prev => ({ ...prev, quantity: prev.quantity + 1 }));
    }
  };

  const decreaseTemp = () => {
    if (productDetails && productDetails.quantity > 1) {
      setProductDetails(prev => ({ ...prev, quantity: prev.quantity - 1 }));
    }
  };

  const addToCart = () => {
    if (!productDetails) return;

    const existingIndex = cart.findIndex(item => item._id === productDetails._id);

    if (existingIndex > -1) {
      setCart(prev =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + productDetails.quantity }
            : item
        )
      );
    } else {
      setCart(prev => [...prev, productDetails]);
    }

    setProductDetails(null);
    setCode('');
  };

  const increaseCart = (id) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseCart = (id) => {
    setCart(prev =>
      prev
        .map(item =>
          item._id === id
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
    );
  };

  const totalBill = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className='body'>
      <div className='header'>Self Counter</div>

      <Scanner onDetected={(value) => getProductDetails(value)} />

      <div className="or-div">— or —</div>

      <div className="input-search-div">
        <input
          type="text"
          placeholder="Enter Product ID"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="product-id-input"
        />
        <button className="search-btn" onClick={handleInputSearch}>Search</button>
      </div>

      {productDetails && (
        <div className='product-details-div'>
          <div className='product-name'>{productDetails.name}</div>
          <div className='product-price'>Rs.{productDetails.price}</div>

          <div className='product-count-div'>
            <div className='count-decrease-btn' onClick={decreaseTemp}>
              <img src={Remove} alt="" />
            </div>

            <div className='product-count'>{productDetails.quantity}</div>

            <div className='count-increase-btn' onClick={increaseTemp}>
              <img src={Add} alt="" />
            </div>
          </div>

          <div className='add-to-cart-btn' onClick={addToCart}>
            Add to cart
          </div>
        </div>
      )}

      {recentProduct.length > 0 && (
        <div className='recent-scanned-items-div'>
          <div className='recent-scanned-item-title'>Recent Scanned Items</div>

          {recentProduct.slice(0, 2).map(item => (
            <div className='recent-scanned-item-div' key={item._id}>
              <div className='recent-product-name'>{item.name}</div>
              <div className='recent-product-price'>Rs.{item.price}</div>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div className='cart-items-div'>
          <div className='cart-items-title'>Cart Items</div>

          {cart.map(item => (
            <div className='cart-item-div' key={item._id}>
              <div className='cart-product-name'>
                {item.name}
              </div>

              <div className='cart-product-controls'>
                <div className='count-decrease-btn' onClick={() => decreaseCart(item._id)}>
                  <img src={Remove} alt="" />
                </div>

                <div className='product-count'>{item.quantity}</div>

                <div className='count-increase-btn' onClick={() => increaseCart(item._id)}>
                  <img src={Add} alt="" />
                </div>
              </div>

              <div className='cart-product-price'>
                Rs.{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {(cart.length === 0 && recentProduct.length === 0 && !productDetails) && (
        <div className='emptyInfo'>Scan any item or enter product ID to get info</div>
      )}

      <div className='total-bill-div'>Total Bill Rs.{totalBill.toFixed(2)}</div>
    </div>
  );
}

export default App;
