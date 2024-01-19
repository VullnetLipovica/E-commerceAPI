import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { Product, ProductParams } from "../../models/product";
import agent from "../../api/agent";
import { RootState } from "../../store/configureStore";
import { MetaData } from "../../models/pagination";

// P�rshkrimi i nj�sie p�r gjendjen e seksionit t� Katalogut n� aplikacion
interface CatalogState {
    // Tregon n�se produktet jan� ngarkuar apo jo
    productsLoaded: boolean;
    // Tregon n�se informacioni i filtrave �sht� ngarkuar apo jo
    filtersLoaded: boolean;
    // Reprezenton statusin aktual t� gjendjes s� katalogut, mund t� p�rdoret p�r mesazhe apo reagim n� ndonj� status t� caktuar
    status: string;
    // List� e emrave t� markave t� disponueshme p�r produktet n� katalog
    brands: string[];
    // List� e llojeve t� produkteve n� katalog
    types: string[];
    // Struktura q� mban parametrat e produkteve
    productParams: ProductParams;
    // Informacion shtes� mbi katalogun, mund t� jet� null n�se nuk ka informacion t� disponuesh�m
    metaData: MetaData | null;
}

// Krijon nj� adapter t� entiteteve p�r produktet n� Redux. 
const productsAdapter = createEntityAdapter<Product>();

// Kjo �sht� nj� funksion q� merr nj� objekt ProductParams dhe kthen nj� objekt t� tipit URLSearchParams.
function getAxiosParams(productParams: ProductParams) {
    // Ky funksion p�rgatit parametrat p�r nj� k�rkes� HTTP, duke i shtuar ato n� nj� objekt t� tipit URLSearchParams.
    const params = new URLSearchParams();
    //shton numrin e faqes n� parametrat e k�rkes�s.
    params.append('pageNumber', productParams.pageNumber.toString());
    //shton madh�sin� e faqes n� parametrat e k�rkes�s.
    params.append('pageSize', productParams.pageSize.toString());
    //Shton rregullimin e renditjes n� parametrat e k�rkes�s.
    params.append('orderBy', productParams.orderBy);
    //N�se ka nj� term� k�rkimi, shton at� n� parametrat e k�rkes�s.
    if (productParams.searchTerm) params.append('searchTerm', productParams.searchTerm);
         //N�se ka lloje t� specifikuara, shton ato n� parametrat e k�rkes�s.
    if (productParams.types.length > 0) params.append('types', productParams.types.toString());
        // N�se ka marka t� specifikuara, shton ato n� parametrat e k�rkes�s.
    if (productParams.brands.length > 0) params.append('brands', productParams.brands.toString());
    //Kthen objektin e tipit URLSearchParams q� p�rmban t� gjitha parametrat e p�rgatitura p�r t� p�rdorur n� nj� k�rkes� HTTP.
        return params;
    }

export const fetchProductsAsync = createAsyncThunk<Product[], void, { state: RootState }>(
        'catalog/fetchProductsAsync',
    async (_, thunkAPI) => {
        // Merr parametrat e k�rkes�s HTTP duke p�rdorur funksionin getAxiosParams
            const params = getAxiosParams(thunkAPI.getState().catalog.productParams);
        try {   
            // Thirr metoden 'list' nga objekti agent.Catalog p�r t� marr� produkte nga serveri
            const response = await agent.Catalog.list(params);
            // Dispatch nj� aksion p�r t� vendosur metadata n� gjendjen e reduktorit
            thunkAPI.dispatch(setMetaData(response.metaData));
            // Kthen array e produkteve nga p�rgjigja e serverit
                return response.items;
        } catch (error: any) {
            // N� rast t� ndonj� gabimi, p�rdor thunkAPI p�r t� refuzuar me vler� (rejectWithValue)
            // Kthej nj� objekt q� p�rmban gabimin p�r t� p�rpunuar m� tej n� reduktor
                return thunkAPI.rejectWithValue({ error: error.data })
            }
        }
)
/**
* Thirrje asinkrone p�r t� marr� detajet e nj� produkti nga nj� server duke p�rdorur Axios.
* @param {number} productId - ID e produktit q� do t� marrim detajet p�r t�.
* @param {thunkAPI} thunkAPI - Objekti i siguruar nga middleware-i Thunk i Redux.
*/
export const fetchProductAsync = createAsyncThunk<Product, number>(
    'catalog/fetchProductAsync',
    async (productId, thunkAPI) => {
        try {
            // Thirr metoden 'details' nga objekti 'agent.Catalog' p�r t� marr� detajet e nj� produkti nga serveri
            const product = await agent.Catalog.details(productId);
            // Kthej detajet e produktit nga p�rgjigja e serverit
            return product;
        } catch (error: any) {
            // N� rast t� ndonj� gabimi, p�rdor thunkAPI p�r t� refuzuar me vler� (rejectWithValue)
            // Kthej nj� objekt q� p�rmban gabimin p�r t� p�rpunuar m� tej n� reduktor
            return thunkAPI.rejectWithValue({ error: error.data })
        }
    }
)

export const fetchFilters = createAsyncThunk(
    'catalog/fetchFilters',
    async (_, thunkAPI) => {
        try {
            return agent.Catalog.fetchFilters();
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message })
        }
    }
)

function initParams(): ProductParams {
    return {
        pageNumber: 1,
        pageSize: 6,
        orderBy: 'name',
        brands: [],
        types: []
    }
}

export const catalogSlice = createSlice({
    name: 'catalog',
        initialState: productsAdapter.getInitialState<CatalogState>({
            productsLoaded: false,
            filtersLoaded: false,
            status: 'idle',
            brands: [],
            types: [],
            productParams: initParams(),
            metaData: null
        }),
        reducers: {
            setProductParams: (state, action) => {
                state.productsLoaded = false;
                state.productParams = { ...state.productParams, ...action.payload, pageNumber: 1 }
            },
            setPageNumber: (state, action) => {
                state.productsLoaded = false;
                state.productParams = { ...state.productParams, ...action.payload }
            },
            setMetaData: (state, action) => {
                state.metaData = action.payload
            },
            resetProductParams: (state) => {
                state.productParams = initParams()
            },
            setProduct: (state, action) => {
                productsAdapter.upsertOne(state, action.payload);
                state.productsLoaded = false;
            },
            removeProduct: (state, action) => {
                productsAdapter.removeOne(state, action.payload);
                state.productsLoaded = false;
            }

        },
        extraReducers: (builder => {
            builder.addCase(fetchProductsAsync.pending, (state) => {
                state.status = 'pendingFetchProducts'
            });
            builder.addCase(fetchProductsAsync.fulfilled, (state, action) => {
                productsAdapter.setAll(state, action.payload);
                state.status = 'idle';
                state.productsLoaded = true;
            });
            builder.addCase(fetchProductsAsync.rejected, (state, action) => {
                console.log(action.payload);
                state.status = 'idle';
            });
            builder.addCase(fetchProductAsync.pending, (state) => {
                state.status = 'pendingFetchProduct'
            });
            builder.addCase(fetchProductAsync.fulfilled, (state, action) => {
                productsAdapter.upsertOne(state, action.payload);
                state.status = 'idle'
            });
            builder.addCase(fetchProductAsync.rejected, (state, action) => {
                console.log(action);
                state.status = 'idle'
            });
        builder.addCase(fetchFilters.pending, (state) => {
            state.status = 'pendingFetchFilters';
        });
        builder.addCase(fetchFilters.fulfilled, (state, action) => {
            state.brands = action.payload.brands;
            state.types = action.payload.types;
            state.status = 'idle';
            state.filtersLoaded = true;
        });
        builder.addCase(fetchFilters.rejected, (state) => {
            state.status = 'idle';
        });
    })
})

export const { setProductParams, resetProductParams, setMetaData, setPageNumber, setProduct, removeProduct } = catalogSlice.actions;

export const productSelectors = productsAdapter.getSelectors((state: RootState) => state.catalog);