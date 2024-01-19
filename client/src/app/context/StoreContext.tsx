import { PropsWithChildren, createContext, useContext, useState } from 'react';
import { Basket } from '../models/basket';

interface StoreContextValue {
    //funksioni per me hek nje artikull nga shporta
    removeItem: (productId: number, quantity: number) => void;
    //funksioni qe perdoret per me perditsu gjendjen e basket
    setBasket: (basket: Basket) => void;
    //vlera aktuale e basket
    basket: Basket | null;
}

export const StoreContext = createContext<StoreContextValue | undefined>(undefined);

// Krijon një funksion  'useStoreContext' për të përdorur kontekstin 'StoreContext'
export function useStoreContext() {
    // Merr vlerën aktuale të kontekstit 'StoreContext'
    const context = useContext(StoreContext);

    // Kontrollon nëse konteksti është 'undefined', dmth. nuk jemi brenda hierarkisë së 'StoreContext'
    if (context === undefined) {
        // Nëse jemi jashtë kontekstit, shfaq një gabim me mesazh informativ
        throw Error('Oops - we are not inside the app.tsx so we do not have access to the context');
    }

    // Kthej vlerën e kontekstit
    return context;
}

// Komponenti "StoreProvider" i cili ofron dhe menaxhon kontekstin e shpërndarjes së përbërësve
export function StoreProvider({ children }: PropsWithChildren<unknown>) {
    // Krijon dy variabla lokale 'basket' dhe 'setBasket' përmes 'useState' basket mban gjendjen aktuale te basket setBasket perdoret per me perditsu vleren e basketit
    const [basket, setBasket] = useState<Basket | null>(null);

    function removeItem(productId: number, quantity: number) {
        if (!basket) return;
        //krijohet nje kopje e re e artikujve te shportes 
        const items = [...basket.items]; // new array of items (...) krijon kopje
        // Gjej indeksin e artikullit në vargun 'items' bazuar në productId
        const itemIndex = items.findIndex(i => i.productId === productId);
        // Kontrollo nëse artikulli me productId të dhënë ekziston në vargun 'items'
        if (itemIndex >= 0) {
            // Nëse artikulli ekziston, zvogëlo sasine e tij me shumën e caktuar
            items[itemIndex].quantity -= quantity;
            // Nëse sasia bëhet 0 pas zvogëlimit, hiq artikullin nga vargu
            if (items[itemIndex].quantity === 0) items.splice(itemIndex, 1);
            // Përditso (state) 'Basket' duke përdorur funksionin 'setBasket'
            setBasket(prevState => {
                // Kthe një kopje të tillë të 'prevState', duke përdorur operatorin 'spread'
                // dhe zëvendëso vargun 'items' me vargun e përditësuar
                return { ...prevState!, items }
            })
        }
    }
    //returns
    // Përmbajtja e kontekstit përfshin vlerat e 'basket', 'setBasket', dhe 'removeItem'
    return (
        <StoreContext.Provider value={{ basket, setBasket, removeItem }}>
            {children}
        </StoreContext.Provider>
    )
}
