import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { FieldValues } from 'react-hook-form';
import { toast } from 'react-toastify';
import { User } from "../../models/user";
import agent from "../../api/agent";
import { setBasket } from "../basket/basketSlice";
import { router } from "../../router/Routes";

//interface për të përshkruar gjendjen e llogarisë
interface AccountState {
    user: User | null; // Informacioni i përdoruesit ose null nëse nuk ka një përdorues të kyçur
}
// Gjendja fillestare e llogarisë
const initialState: AccountState = {
    user: null,
};

// Krijimi i një thirrje asinkrone për kyçjen e një përdoruesi
export const signInUser = createAsyncThunk<User, FieldValues>(
    'account/signInUser',
    async (data, thunkAPI) => {
        try {
            // Thirrja e metodes signIn nga servisi "agent.Account"
            const userDto = await agent.Account.login(data);

            // Nxjerrja e "basket" nga përgjigja dhe dispatch-i i një veprimi për të vendosur shportën
            const { basket, ...user } = userDto;
            if (basket) thunkAPI.dispatch(setBasket(basket));

            // Ruajtja e informacionit të përdoruesit në lokal storage
            localStorage.setItem('user', JSON.stringify(user));

            // Kthimi i përdoruesit
            return user;
        } catch (error: any) {
           
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    }
);


export const fetchCurrentUser = createAsyncThunk<User>(
    'account/fetchCurrentUser',
    async (_, thunkAPI) => {
        // Merrja e përdoruesit nga lokal storage dhe dispatch-i i një veprimi për të vendosur përdoruesin
        thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem('user')!)));

        try {
            // Thirrja e metodes currentUser nga servisi "agent.Account"
            const userDto = await agent.Account.currentUser();

            // Nxjerrja e "basket" nga përgjigja dhe dispatch-i i një veprimi për të vendosur shportën
            const { basket, ...user } = userDto;
            if (basket) thunkAPI.dispatch(setBasket(basket));

            // Ruajtja e informacionit të përdoruesit në lokal storage
            localStorage.setItem('user', JSON.stringify(user));

            // Kthimi i përdoruesit
            return user;
        } catch (error: any) {
            // Kthimi i një vlerë të refuzuar me mesazhin e gabimit në rast të ndonjë problemi
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    },
    {
        // Kushti për të ekzekutuar thirrjen vetëm nëse ka një përdorues të ruajtur në lokal storage
        condition: () => {
            if (!localStorage.getItem('user')) return false;
        },
    }
);

// Krijimi i një "slice" të reduktorit për menaxhimin e gjendjes së llogarisë
export const accountSlice = createSlice({
    name: 'account', // Emri i slice
    initialState,   // Gjendja fillestare
    reducers: {
        // Veprimi për çkyçjen e një përdoruesi
        signOut: (state) => {
            state.user = null;
            localStorage.removeItem('user');
            router.navigate('/'); // Redirektimi pas çkyçjes
        },

        // Veprimi për vendosjen e përdoruesit në gjendjen e llogarisë
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
    extraReducers: (builder => {
        // Menaxhimi i ndonjë gabimi gjatë marrjes së përdoruesit aktual nga serveri
        builder.addCase(fetchCurrentUser.rejected, (state) => {
            state.user = null;
            localStorage.removeItem('user');
            toast.error('Session expired - please login again');
            router.navigate('/');
        });

        // Menaxhimi i suksesit për thirrjet asinkrone për çkyçjen dhe marrjen e përdoruesit aktual
        builder.addMatcher(isAnyOf(signInUser.fulfilled, fetchCurrentUser.fulfilled), (state, action) => {
            state.user = action.payload;
        });

        // Menaxhimi i ndonjë gabimi gjatë thirrjes asinkrone për çkyçjen e përdoruesit
        builder.addMatcher(isAnyOf(signInUser.rejected), (_state, action) => {
            throw action.payload; // Rrëzimi i gabimit për të pasuar më poshtë
        });
    })
});

// Eksportimi i veprimeve të reduktorit nga "accountSlice"
export const { signOut, setUser } = accountSlice.actions;






      