import { useState, useEffect } from 'react';
import ProductList from './ProductList';
import { Product } from '../../models/product';
import agent from '../../api/agent';
import LoadingComponent from '../../layout/LoadingComponent';


export default function Catalog() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        agent.Catalog.list()
            .then(products => {
                setProducts(products)
            })
            .catch(error => console.log(error))
            .finally(() => setLoading(false));
    }, [])

    if (loading) return <LoadingComponent message='Loading products...' />

    return (
        <>
            <ProductList products={products} />
        </>
    )
}
