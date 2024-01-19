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
// Thirrja asinkrone për të identifikuar përdoruesin
export const signInUser = createAsyncThunk<User, FieldValues>(
    'account/signInUser',
    async (data, thunkAPI) => {
        try {
            const userDto = await agent.Account.login(data);
            const { basket, ...user } = userDto;
            if (basket) thunkAPI.dispatch(setBasket(basket));
            // Ruaj përdoruesin në localStorage
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    }
)
// Thirrja asinkrone për të marrë përdoruesin aktual
export const fetchCurrentUser = createAsyncThunk<User>(
    'account/fetchCurrentUser',
    async (_, thunkAPI) => {
        // Vendos përdoruesin e ruajtur në localStorage në gjendjen aktuale
        thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem('user')!)))
        try {
            // Merr përdoruesin aktual nga serveri
            const userDto = await agent.Account.currentUser();
            const { basket, ...user } = userDto;
            // Nëse ka një shportë, vendos shportën në gjendjen globale të aplikacionit
            if (basket) thunkAPI.dispatch(setBasket(basket));
            // Ruaj përdoruesin në localStorage
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    },
    {
        // Kushti për të vendosur nëse thirrja duhet të bëhet bazuar në një kusht të caktuar
        condition: () => {
            if (!localStorage.getItem('user')) return false;
        }
    }
)
// Krijimi i një slide të reduksit për menaxhimin e gjendjes së llogarisë
export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        // Veprimi për daljen nga llogaria
        signOut: (state) => {
            state.user = null;
            localStorage.removeItem('user');
            // Navigimi përsëri në faqen fillestare (mund të jetë përdorur në një sistem rrouter-i)
            router.navigate('/');
        },
        // Veprimi për vendosjen e përdoruesit aktual
        setUser: (state, action) => {
            // Shpërndarja e informacioneve nga tokeni i përdoruesit
            const claims = JSON.parse(atob(action.payload.token.split('.')[1]));
            const roles = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            // Vendos përdoruesin në gjendjen globale të aplikacionit
            state.user = { ...action.payload, roles: typeof (roles) === 'string' ? [roles] : roles };
        }
    },
    // Rregullat e shtuara për trajtimin e veprimeve ekstra nga thirrjet asinkrone
    extraReducers: (builder => {
        builder.addCase(fetchCurrentUser.rejected, (state) => {
            // Në rastin e një gabimi nga thirrja për përdoruesin aktual
            state.user = null;
            localStorage.removeItem('user');
            // Paraqit një mesazh gabimi dhe kthehu në faqen fillestare
            toast.error('Session expired - please login again');
            router.navigate('/');
        })
        builder.addMatcher(isAnyOf(signInUser.fulfilled, fetchCurrentUser.fulfilled), (state, action) => {
            const claims = JSON.parse(atob(action.payload.token.split('.')[1]));
            const roles = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            // Vendos përdoruesin në gjendjen globale të aplikacionit
            state.user = { ...action.payload, roles: typeof (roles) === 'string' ? [roles] : roles };
        });
        builder.addMatcher(isAnyOf(signInUser.rejected), (_state, action) => {
            // Në rastin e një gabimi nga thirrja për autentikim, ktheji gabimin
            throw action.payload;
        })
    })
})

export const { signOut, setUser } = accountSlice.actions;