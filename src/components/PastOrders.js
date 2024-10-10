import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const PastOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (data) setOrders(data);
    };

    fetchOrders();
  }, []);

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          <h4>Order ID: {order.id}</h4>
          <p>Status: {order.status}</p>
        </div>
      ))}
    </div>
  );
};

export default PastOrders;