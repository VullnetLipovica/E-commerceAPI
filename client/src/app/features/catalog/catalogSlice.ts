import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { Product, ProductParams } from "../../models/product";
import agent from "../../api/agent";
import { RootState } from "../../store/configureStore";
import { MetaData } from "../../models/pagination";

// Përshkrimi i njësie për gjendjen e seksionit të Katalogut në aplikacion
interface CatalogState {
    // Tregon nëse produktet janë ngarkuar apo jo
    productsLoaded: boolean;
    // Tregon nëse informacioni i filtrave është ngarkuar apo jo
    filtersLoaded: boolean;
    // Reprezenton statusin aktual të gjendjes së katalogut, mund të përdoret për mesazhe apo reagim në ndonjë status të caktuar
    status: string;
    // Listë e emrave të markave të disponueshme për produktet në katalog
    brands: string[];
    // Listë e llojeve të produkteve në katalog
    types: string[];
    // Struktura që mban parametrat e produkteve
    productParams: ProductParams;
    // Informacion shtesë mbi katalogun, mund të jetë null nëse nuk ka informacion të disponueshëm
    metaData: MetaData | null;
}

// Krijon një adapter të entiteteve për produktet në Redux. 
const productsAdapter = createEntityAdapter<Product>();

// Kjo është një funksion që merr një objekt ProductParams dhe kthen një objekt të tipit URLSearchParams.
function getAxiosParams(productParams: ProductParams) {
    // Ky funksion përgatit parametrat për një kërkesë HTTP, duke i shtuar ato në një objekt të tipit URLSearchParams.
    const params = new URLSearchParams();
    //shton numrin e faqes në parametrat e kërkesës.
    params.append('pageNumber', productParams.pageNumber.toString());
    //shton madhësinë e faqes në parametrat e kërkesës.
    params.append('pageSize', productParams.pageSize.toString());
    //Shton rregullimin e renditjes në parametrat e kërkesës.
    params.append('orderBy', productParams.orderBy);
    //Nëse ka një termë kërkimi, shton atë në parametrat e kërkesës.
    if (productParams.searchTerm) params.append('searchTerm', productParams.searchTerm);
         //Nëse ka lloje të specifikuara, shton ato në parametrat e kërkesës.
    if (productParams.types.length > 0) params.append('types', productParams.types.toString());
        // Nëse ka marka të specifikuara, shton ato në parametrat e kërkesës.
    if (productParams.brands.length > 0) params.append('brands', productParams.brands.toString());
    //Kthen objektin e tipit URLSearchParams që përmban të gjitha parametrat e përgatitura për të përdorur në një kërkesë HTTP.
        return params;
    }

export const fetchProductsAsync = createAsyncThunk<Product[], void, { state: RootState }>(
        'catalog/fetchProductsAsync',
    async (_, thunkAPI) => {
        // Merr parametrat e kërkesës HTTP duke përdorur funksionin getAxiosParams
            const params = getAxiosParams(thunkAPI.getState().catalog.productParams);
        try {   
            // Thirr metoden 'list' nga objekti agent.Catalog për të marrë produkte nga serveri
            const response = await agent.Catalog.list(params);
            // Dispatch një aksion për të vendosur metadata në gjendjen e reduktorit
            thunkAPI.dispatch(setMetaData(response.metaData));
            // Kthen array e produkteve nga përgjigja e serverit
                return response.items;
        } catch (error: any) {
            // Në rast të ndonjë gabimi, përdor thunkAPI për të refuzuar me vlerë (rejectWithValue)
            // Kthej një objekt që përmban gabimin për të përpunuar më tej në reduktor
                return thunkAPI.rejectWithValue({ error: error.data })
            }
        }
)
/**
* Thirrje asinkrone për të marrë detajet e një produkti nga një server duke përdorur Axios.
* @param {number} productId - ID e produktit që do të marrim detajet për të.
* @param {thunkAPI} thunkAPI - Objekti i siguruar nga middleware-i Thunk i Redux.
*/
export const fetchProductAsync = createAsyncThunk<Product, number>(
    'catalog/fetchProductAsync',
    async (productId, thunkAPI) => {
        try {
            // Thirr metoden 'details' nga objekti 'agent.Catalog' për të marrë detajet e një produkti nga serveri
            const product = await agent.Catalog.details(productId);
            // Kthej detajet e produktit nga përgjigja e serverit
            return product;
        } catch (error: any) {
            // Në rast të ndonjë gabimi, përdor thunkAPI për të refuzuar me vlerë (rejectWithValue)
            // Kthej një objekt që përmban gabimin për të përpunuar më tej në reduktor
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