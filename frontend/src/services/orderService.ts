import axios from 'axios';
import { Product } from './productService';

interface OrderItem extends Product {
  quantity: number;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id?: string;
  items: OrderItem[];
  total: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  status?: string;
  createdAt?: Date;
}

const API_URL = 'http://localhost:5000/api/orders';

export const createOrder = async (orderData: Order): Promise<Order> => {
  try {
    const response = await axios.post(API_URL, orderData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la création de la commande');
  }
};

export const fetchUserOrders = async (): Promise<Order[]> => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des commandes');
  }
};

export const fetchOrderById = async (orderId: string): Promise<Order> => {
  try {
    const response = await axios.get(`${API_URL}/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des détails de la commande');
  }
};
