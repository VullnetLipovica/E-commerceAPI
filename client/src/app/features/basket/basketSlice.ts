import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { Basket } from "../../models/basket";
import agent from "../../api/agent";
import { getCookie } from "../../util/util";


// P�rcaktojm� gjendjen fillestare t� pjes�s basket
interface BasketState {
    basket: Basket | null;
    status: string;
}

const initialState: BasketState = {
    basket: null,
    status: 'idle'
}


export const fetchBasketAsync = createAsyncThunk<Basket>(
    'basket/fetchBasketAsync',
    async (_, thunkAPI) => {
        try {
            return await agent.Basket.get(); //return await agent.Basket.getthirr metoden get nga objekti ndersa agent.basket per me marr te dhenat e shportes
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    },
    {
        // Kusht p�r t� k�rkuar koshin vet�m n�se �sht� prezent "buyerId" n� cookie
        condition: () => {
            if (!getCookie('buyerId')) return false;
        }
    }
)

//tregon se qfar type te data createasyncthunk pret qe te kthehet ne kete rast basket
export const addBasketItemAsync = createAsyncThunk<Basket, { productId: number, quantity?: number }>(
    //eshte emri i thunk perdoret per menagjimin e aksioneve ne redux
    'basket/addBasketItemAsync',
    //merr objekt te cilin e destrukturon per mi marr vlerat e productid dhe quantity
    async ({ productId, quantity = 1 }, thunkAPI) => {
        try {
            return await agent.Basket.addItem(productId, quantity);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data })
        }
    }
)

export const removeBasketItemAsync = createAsyncThunk<void,
    { productId: number, quantity: number, name?: string }>(
        'basket/removeBasketItemASync',
        async ({ productId, quantity }, thunkAPI) => {
            try {
                await agent.Basket.removeItem(productId, quantity);
            } catch (error: any) {
                return thunkAPI.rejectWithValue({ error: error.data })
            }
        }
    )

// Krijojm� nj� pjes� t� Redux p�r menaxhimin e gjendjes s� koshit
export const basketSlice = createSlice({
    name: 'basket',
    initialState,
    reducers: {
        // Caktojm� koshin n� gjendjen aktuale me payload-in
        setBasket: (state, action) => {
            state.basket = action.payload
        },
        // Pastrojm� koshin n� gjendjen aktuale
        clearBasket: (state) => {
            state.basket = null;
        }
    },
    extraReducers: builder => {
        // Traktojm� gjendjen prit�se kur shtohet nj� artikull n� kosh
        builder.addCase(addBasketItemAsync.pending, (state, action) => {
            state.status = 'pendingAddItem' + action.meta.arg.productId;
        });
        // Traktojm� gjendjen prit�se kur hiqet nj� artikull nga koshi
        builder.addCase(removeBasketItemAsync.pending, (state, action) => {
            state.status = 'pendingRemoveItem' + action.meta.arg.productId + action.meta.arg.name;
        })
        // Traktojm� gjendjen e realizuar kur hiqet nj� artikull nga koshi
        builder.addCase(removeBasketItemAsync.fulfilled, (state, action) => {
            // P�rdit�sojm� sasin� ose hiqim artikullin nga koshi bazuar n� payload-in e veprimit
            const { productId, quantity } = action.meta.arg;
            const itemIndex = state.basket?.items.findIndex(i => i.productId === productId);
            if (itemIndex === -1 || itemIndex === undefined) return;
            state.basket!.items[itemIndex].quantity -= quantity;
            if (state.basket?.items[itemIndex].quantity === 0)
                state.basket.items.splice(itemIndex, 1);
            state.status = 'idle';
        });
        // Traktojm� gjendjen e rrefuzuar kur hiqet nj� artikull nga koshi
        builder.addCase(removeBasketItemAsync.rejected, (state, action) => {
            state.status = 'idle';
            console.log(action.payload);
        });
        // Traktojm� gjendjet e realizuara dhe t� rrefuzuara kur shtohen ose marrin artikujt e koshit
        builder.addMatcher(isAnyOf(addBasketItemAsync.fulfilled, fetchBasketAsync.fulfilled), (state, action) => {
            // P�rdit�sojm� koshin dhe caktojm� gjendjen n� 'idle'
            state.basket = action.payload;
            state.status = 'idle';
        });
        builder.addMatcher(isAnyOf(addBasketItemAsync.rejected, fetchBasketAsync.rejected), (state, action) => {
            // Caktojm� gjendjen n� 'idle' dhe regjistrojm� payload-in e rrefuzimit
            state.status = 'idle';
            console.log(action.payload);
        });
    }
})

// Eksportojm� veprimet nga pjesa e Redux
export const { setBasket, clearBasket } = basketSlice.actions;