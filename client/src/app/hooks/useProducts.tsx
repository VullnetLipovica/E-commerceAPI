import { useEffect } from "react";
import { fetchFilters, fetchProductsAsync, productSelectors } from "../features/catalog/catalogSlice";
import { useAppDispatch, useAppSelector } from "../store/configureStore";

// Definojm� k�t� hook funksionale
export default function useProducts() {
    // Merrim t� dh�nat e produkteve p�rmes Redux selector-it productSelectors.selectAll
    const products = useAppSelector(productSelectors.selectAll);

    // Merrim disa prej t� dh�nave t� kataloget global p�rmes Redux selectors
    const { productsLoaded, filtersLoaded, brands, types, metaData } = useAppSelector(state => state.catalog);

    // P�rdorim funksionin e dispe�erit (dispatch) nga Redux p�r t� thirrur veprimet (actions)
    const dispatch = useAppDispatch();

    // P�rdorim useEffect p�r t� thirrur veprimin fetchProductsAsync vet�m n�se produkteve nuk jan� ngarkuar ende (productsLoaded �sht� false)
    useEffect(() => {
        if (!productsLoaded) dispatch(fetchProductsAsync());
    }, [productsLoaded, dispatch]);

    // P�rdorim useEffect p�r t� thirrur veprimin fetchFilters vet�m n�se filtrat nuk jan� ngarkuar ende (filtersLoaded �sht� false)
    useEffect(() => {
        if (!filtersLoaded) dispatch(fetchFilters());
    }, [dispatch, filtersLoaded]);

    // Kthejm� nj� objekt q� p�rmir�son lexueshm�rin� e kodit duke sjell� t� dh�nat e p�rdorura n� komponent
    return {
        products,
        productsLoaded,
        filtersLoaded,
        brands,
        types,
        metaData
    };
}