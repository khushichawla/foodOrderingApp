import React from 'react';

const Cart = ({ items, onRemove }) => {
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h4>{item.name}</h4>
          <p>Quantity: {item.quantity}</p>
          <button onClick={() => onRemove(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default Cart;