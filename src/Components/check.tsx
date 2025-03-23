import React from 'react';

interface CartItem {
  "Original Title": string;
  Price: number;
  quantity: number;
  [key: string]: any;
}

interface CheckoutProps {
  cart: CartItem[];
  handleCheckout: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, handleCheckout }) => {
  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold">Checkout Details</h3>
      {cart.map((item, index) => (
        <div key={index} className="flex justify-between">
          <span>{item["Original Title"]}</span>
          <span>${(item.Price * item.quantity).toFixed(2)}</span>
        </div>
      ))}
      <h4 className="font-semibold mt-2">
        Total: ${cart.reduce((total, item) => total + (item.Price * item.quantity), 0).toFixed(2)}
      </h4>
      <button
        className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        onClick={handleCheckout}
      >
        Confirm Checkout
      </button>
    </div>
  );
};

export default Checkout; 