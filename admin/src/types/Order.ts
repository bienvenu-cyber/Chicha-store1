export interface Order {
    _id: string;
    user: string; // ID de l'utilisateur
    products: Array<{
        product: string; // ID du produit
        quantity: number;
        price: number;
    }>;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
}
