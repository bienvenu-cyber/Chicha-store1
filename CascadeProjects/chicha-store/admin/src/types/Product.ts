export type ProductCategory = 'chicha' | 'tabac' | 'charbon' | 'accessoire';

export interface Product {
    _id?: string;
    name: string;
    description: string;
    price: number;
    promotionalPrice?: number;
    category: ProductCategory;
    imageUrl: string;
    stock: number;
    featured: boolean;
    ratings?: Array<{
        user: string;
        rating: number;
        comment: string;
    }>;
    averageRating?: number;
    specifications?: {
        height?: number;
        material?: string;
        color?: string;
    };
}
