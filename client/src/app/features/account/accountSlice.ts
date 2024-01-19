import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { FieldValues } from 'react-hook-form';
import { toast } from 'react-toastify';
import { User } from "../../models/user";
import agent from "../../api/agent";
import { setBasket } from "../basket/basketSlice";
import { router } from "../../router/Routes";

//interface p�r t� p�rshkruar gjendjen e llogaris�
interface AccountState {
    user: User | null; // Informacioni i p�rdoruesit ose null n�se nuk ka nj� p�rdorues t� ky�ur
}
// Gjendja fillestare e llogaris�
const initialState: AccountState = {
    user: null,
};

// Krijimi i nj� thirrje asinkrone p�r ky�jen e nj� p�rdoruesi
export const signInUser = createAsyncThunk<User, FieldValues>(
    'account/signInUser',
    async (data, thunkAPI) => {
        try {
            // Thirrja e metodes signIn nga servisi "agent.Account"
            const userDto = await agent.Account.login(data);

            // Nxjerrja e "basket" nga p�rgjigja dhe dispatch-i i nj� veprimi p�r t� vendosur shport�n
            const { basket, ...user } = userDto;
            if (basket) thunkAPI.dispatch(setBasket(basket));

            // Ruajtja e informacionit t� p�rdoruesit n� lokal storage
            localStorage.setItem('user', JSON.stringify(user));

            // Kthimi i p�rdoruesit
            return user;
        } catch (error: any) {
           
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    }
);


export const fetchCurrentUser = createAsyncThunk<User>(
    'account/fetchCurrentUser',
    async (_, thunkAPI) => {
        // Merrja e p�rdoruesit nga lokal storage dhe dispatch-i i nj� veprimi p�r t� vendosur p�rdoruesin
        thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem('user')!)));

        try {
            // Thirrja e metodes currentUser nga servisi "agent.Account"
            const userDto = await agent.Account.currentUser();

            // Nxjerrja e "basket" nga p�rgjigja dhe dispatch-i i nj� veprimi p�r t� vendosur shport�n
            const { basket, ...user } = userDto;
            if (basket) thunkAPI.dispatch(setBasket(basket));

            // Ruajtja e informacionit t� p�rdoruesit n� lokal storage
            localStorage.setItem('user', JSON.stringify(user));

            // Kthimi i p�rdoruesit
            return user;
        } catch (error: any) {
            // Kthimi i nj� vler� t� refuzuar me mesazhin e gabimit n� rast t� ndonj� problemi
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    },
    {
        // Kushti p�r t� ekzekutuar thirrjen vet�m n�se ka nj� p�rdorues t� ruajtur n� lokal storage
        condition: () => {
            if (!localStorage.getItem('user')) return false;
        },
    }
);

// Krijimi i nj� "slice" t� reduktorit p�r menaxhimin e gjendjes s� llogaris�
export const accountSlice = createSlice({
    name: 'account', // Emri i slice
    initialState,   // Gjendja fillestare
    reducers: {
        // Veprimi p�r �ky�jen e nj� p�rdoruesi
        signOut: (state) => {
            state.user = null;
            localStorage.removeItem('user');
            router.navigate('/'); // Redirektimi pas �ky�jes
        },

        // Veprimi p�r vendosjen e p�rdoruesit n� gjendjen e llogaris�
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
    extraReducers: (builder => {
        // Menaxhimi i ndonj� gabimi gjat� marrjes s� p�rdoruesit aktual nga serveri
        builder.addCase(fetchCurrentUser.rejected, (state) => {
            state.user = null;
            localStorage.removeItem('user');
            toast.error('Session expired - please login again');
            router.navigate('/');
        });

        // Menaxhimi i suksesit p�r thirrjet asinkrone p�r �ky�jen dhe marrjen e p�rdoruesit aktual
        builder.addMatcher(isAnyOf(signInUser.fulfilled, fetchCurrentUser.fulfilled), (state, action) => {
            state.user = action.payload;
        });

        // Menaxhimi i ndonj� gabimi gjat� thirrjes asinkrone p�r �ky�jen e p�rdoruesit
        builder.addMatcher(isAnyOf(signInUser.rejected), (_state, action) => {
            throw action.payload; // Rr�zimi i gabimit p�r t� pasuar m� posht�
        });
    })
});

// Eksportimi i veprimeve t� reduktorit nga "accountSlice"
export const { signOut, setUser } = accountSlice.actions;






      