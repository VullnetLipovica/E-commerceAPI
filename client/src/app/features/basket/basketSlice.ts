import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { Basket } from "../../models/basket";
import agent from "../../api/agent";
import { getCookie } from "../../util/util";


// Përcaktojmë gjendjen fillestare të pjesës basket
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
        // Kusht për të kërkuar koshin vetëm nëse është prezent "buyerId" në cookie
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

// Krijojmë një pjesë të Redux për menaxhimin e gjendjes së koshit
export const basketSlice = createSlice({
    name: 'basket',
    initialState,
    reducers: {
        // Caktojmë koshin në gjendjen aktuale me payload-in
        setBasket: (state, action) => {
            state.basket = action.payload
        },
        // Pastrojmë koshin në gjendjen aktuale
        clearBasket: (state) => {
            state.basket = null;
        }
    },
    extraReducers: builder => {
        // Traktojmë gjendjen pritëse kur shtohet një artikull në kosh
        builder.addCase(addBasketItemAsync.pending, (state, action) => {
            state.status = 'pendingAddItem' + action.meta.arg.productId;
        });
        // Traktojmë gjendjen pritëse kur hiqet një artikull nga koshi
        builder.addCase(removeBasketItemAsync.pending, (state, action) => {
            state.status = 'pendingRemoveItem' + action.meta.arg.productId + action.meta.arg.name;
        })
        // Traktojmë gjendjen e realizuar kur hiqet një artikull nga koshi
        builder.addCase(removeBasketItemAsync.fulfilled, (state, action) => {
            // Përditësojmë sasinë ose hiqim artikullin nga koshi bazuar në payload-in e veprimit
            const { productId, quantity } = action.meta.arg;
            const itemIndex = state.basket?.items.findIndex(i => i.productId === productId);
            if (itemIndex === -1 || itemIndex === undefined) return;
            state.basket!.items[itemIndex].quantity -= quantity;
            if (state.basket?.items[itemIndex].quantity === 0)
                state.basket.items.splice(itemIndex, 1);
            state.status = 'idle';
        });
        // Traktojmë gjendjen e rrefuzuar kur hiqet një artikull nga koshi
        builder.addCase(removeBasketItemAsync.rejected, (state, action) => {
            state.status = 'idle';
            console.log(action.payload);
        });
        // Traktojmë gjendjet e realizuara dhe të rrefuzuara kur shtohen ose marrin artikujt e koshit
        builder.addMatcher(isAnyOf(addBasketItemAsync.fulfilled, fetchBasketAsync.fulfilled), (state, action) => {
            // Përditësojmë koshin dhe caktojmë gjendjen në 'idle'
            state.basket = action.payload;
            state.status = 'idle';
        });
        builder.addMatcher(isAnyOf(addBasketItemAsync.rejected, fetchBasketAsync.rejected), (state, action) => {
            // Caktojmë gjendjen në 'idle' dhe regjistrojmë payload-in e rrefuzimit
            state.status = 'idle';
            console.log(action.payload);
        });
    }
})

// Eksportojmë veprimet nga pjesa e Redux
export const { setBasket, clearBasket } = basketSlice.actions;