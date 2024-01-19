import ProductList from './ProductList';
import { fetchFilters, fetchProductsAsync, productSelectors, setPageNumber, setProductParams } from './catalogSlice';
import { Grid, Paper } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/configureStore';
import { useEffect } from 'react';
import LoadingComponent from '../../layout/LoadingComponent';
import RadioButtonGroup from '../../components/RadioButtonGroup';
import CheckboxButtons from '../../components/CheckboxButtons';
import AppPagination from '../../components/AppPagination';
import ProductSearch from './ProductSearch';
import useProducts from '../../hooks/useProducts';


// Nj� list� e mund�sive p�r renditjen e produkteve n� katalog
const sortOptions = [
    { value: 'name', label: 'Alphabetical' },
    { value: 'priceDesc', label: 'Price - High to low' },
    { value: 'price', label: 'Price - Low to high' },
]

// Eksportojm� komponentin Catalog
export default function Catalog() {
    // P�rdorim hook-un useProducts p�r t� marr� t� dh�nat e produkteve nga API
    const { products, filtersLoaded, brands, types, metaData } = useProducts();

    // P�rdorim hook-un useAppSelector p�r t� marr� parametrat e produkteve nga vargu i reduksit
    const { productParams } = useAppSelector(state => state.catalog);

    // P�rdorim hook-un useAppDispatch p�r t� marr� funksionin dispatch
    const dispatch = useAppDispatch();

    // N�se filtrimet nuk jan� ngarkuar ende, shfaq nj� komponent Loading
    if (!filtersLoaded) return <LoadingComponent message='Loading products...' />;

return (
        <Grid container columnSpacing={4}>
            <Grid item xs={3}>
                <Paper sx={{ mb: 2 }}>
                    <ProductSearch />
                </Paper>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <RadioButtonGroup
                        selectedValue={productParams.orderBy}
                        options={sortOptions}
                        onChange={(e) => dispatch(setProductParams({ orderBy: e.target.value }))}
                    />
                </Paper>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <CheckboxButtons
                        items={brands}
                        checked={productParams.brands}
                        onChange={(items: string[]) => dispatch(setProductParams({ brands: items }))}
                    />
                </Paper>
                <Paper sx={{ p: 2 }}>
                    <CheckboxButtons
                        items={types}
                        checked={productParams.types}
                        onChange={(items: string[]) => dispatch(setProductParams({ types: items }))}
                    />
                </Paper>
            </Grid>
            <Grid item xs={9}>
                <ProductList products={products} />
            </Grid>
            <Grid item xs={3} />
            <Grid item xs={9} sx={{mb:2}}>
                {metaData &&
                <AppPagination 
                    metaData={metaData}
                    onPageChange={(page: number) => dispatch(setPageNumber({pageNumber: page}))}
                />}
            </Grid>
        </Grid>
)
}