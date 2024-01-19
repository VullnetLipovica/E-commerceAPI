import { useEffect } from "react";
import { fetchFilters, fetchProductsAsync, productSelectors } from "../features/catalog/catalogSlice";
import { useAppDispatch, useAppSelector } from "../store/configureStore";

// Definojmë këtë hook funksionale
export default function useProducts() {
    // Merrim të dhënat e produkteve përmes Redux selector-it productSelectors.selectAll
    const products = useAppSelector(productSelectors.selectAll);

    // Merrim disa prej të dhënave të kataloget global përmes Redux selectors
    const { productsLoaded, filtersLoaded, brands, types, metaData } = useAppSelector(state => state.catalog);

    // Përdorim funksionin e dispeçerit (dispatch) nga Redux për të thirrur veprimet (actions)
    const dispatch = useAppDispatch();

    // Përdorim useEffect për të thirrur veprimin fetchProductsAsync vetëm nëse produkteve nuk janë ngarkuar ende (productsLoaded është false)
    useEffect(() => {
        if (!productsLoaded) dispatch(fetchProductsAsync());
    }, [productsLoaded, dispatch]);

    // Përdorim useEffect për të thirrur veprimin fetchFilters vetëm nëse filtrat nuk janë ngarkuar ende (filtersLoaded është false)
    useEffect(() => {
        if (!filtersLoaded) dispatch(fetchFilters());
    }, [dispatch, filtersLoaded]);

    // Kthejmë një objekt që përmirëson lexueshmërinë e kodit duke sjellë të dhënat e përdorura në komponent
    return {
        products,
        productsLoaded,
        filtersLoaded,
        brands,
        types,
        metaData
    };
}