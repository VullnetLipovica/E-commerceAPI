import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { User } from "../../app/models/user";
import { FieldValues } from 'react-hook-form';
import agent from '../../app/api/agent';
import { router } from '../../app/router/Routes';
import { toast } from 'react-toastify';
import { setBasket } from "../features/basket/basketSlice";
interface AccountState {
    user: User | null
}

const initialState: AccountState = {
    user: null
}
// Thirrja asinkrone p�r t� identifikuar p�rdoruesin
export const signInUser = createAsyncThunk<User, FieldValues>(
    'account/signInUser',
    async (data, thunkAPI) => {
        try {
            const userDto = await agent.Account.login(data);
            const { basket, ...user } = userDto;
            if (basket) thunkAPI.dispatch(setBasket(basket));
            // Ruaj p�rdoruesin n� localStorage
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    }
)
// Thirrja asinkrone p�r t� marr� p�rdoruesin aktual
export const fetchCurrentUser = createAsyncThunk<User>(
    'account/fetchCurrentUser',
    async (_, thunkAPI) => {
        // Vendos p�rdoruesin e ruajtur n� localStorage n� gjendjen aktuale
        thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem('user')!)))
        try {
            // Merr p�rdoruesin aktual nga serveri
            const userDto = await agent.Account.currentUser();
            const { basket, ...user } = userDto;
            // N�se ka nj� shport�, vendos shport�n n� gjendjen globale t� aplikacionit
            if (basket) thunkAPI.dispatch(setBasket(basket));
            // Ruaj p�rdoruesin n� localStorage
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    },
    {
        // Kushti p�r t� vendosur n�se thirrja duhet t� b�het bazuar n� nj� kusht t� caktuar
        condition: () => {
            if (!localStorage.getItem('user')) return false;
        }
    }
)
// Krijimi i nj� slide t� reduksit p�r menaxhimin e gjendjes s� llogaris�
export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        // Veprimi p�r daljen nga llogaria
        signOut: (state) => {
            state.user = null;
            localStorage.removeItem('user');
            // Navigimi p�rs�ri n� faqen fillestare (mund t� jet� p�rdorur n� nj� sistem rrouter-i)
            router.navigate('/');
        },
        // Veprimi p�r vendosjen e p�rdoruesit aktual
        setUser: (state, action) => {
            // Shp�rndarja e informacioneve nga tokeni i p�rdoruesit
            const claims = JSON.parse(atob(action.payload.token.split('.')[1]));
            const roles = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            // Vendos p�rdoruesin n� gjendjen globale t� aplikacionit
            state.user = { ...action.payload, roles: typeof (roles) === 'string' ? [roles] : roles };
        }
    },
    // Rregullat e shtuara p�r trajtimin e veprimeve ekstra nga thirrjet asinkrone
    extraReducers: (builder => {
        builder.addCase(fetchCurrentUser.rejected, (state) => {
            // N� rastin e nj� gabimi nga thirrja p�r p�rdoruesin aktual
            state.user = null;
            localStorage.removeItem('user');
            // Paraqit nj� mesazh gabimi dhe kthehu n� faqen fillestare
            toast.error('Session expired - please login again');
            router.navigate('/');
        })
        builder.addMatcher(isAnyOf(signInUser.fulfilled, fetchCurrentUser.fulfilled), (state, action) => {
            const claims = JSON.parse(atob(action.payload.token.split('.')[1]));
            const roles = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            // Vendos p�rdoruesin n� gjendjen globale t� aplikacionit
            state.user = { ...action.payload, roles: typeof (roles) === 'string' ? [roles] : roles };
        });
        builder.addMatcher(isAnyOf(signInUser.rejected), (_state, action) => {
            // N� rastin e nj� gabimi nga thirrja p�r autentikim, ktheji gabimin
            throw action.payload;
        })
    })
})

export const { signOut, setUser } = accountSlice.actions;