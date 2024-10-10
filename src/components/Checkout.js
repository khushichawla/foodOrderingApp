const Checkout = ({ cartItems }) => {
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    
    return (
      <div>
        <h2>Checkout</h2>
        <Cart items={cartItems} />
        <h3>Total: ${totalPrice}</h3>
        <button>Proceed to Payment</button>
      </div>
    );
  };
  
  export default Checkout;