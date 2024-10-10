const MenuItem = ({ item }) => {
    return (
      <div>
        <h3>{item.name}</h3>
        <img src={item.image_url} alt={item.name} />
        <p>{item.price}</p>
        <button>Add to Cart</button>
      </div>
    );
  };
  
  export default MenuItem;