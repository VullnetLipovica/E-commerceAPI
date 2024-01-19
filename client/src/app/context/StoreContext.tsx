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

// Krijon nj� funksion  'useStoreContext' p�r t� p�rdorur kontekstin 'StoreContext'
export function useStoreContext() {
    // Merr vler�n aktuale t� kontekstit 'StoreContext'
    const context = useContext(StoreContext);

    // Kontrollon n�se konteksti �sht� 'undefined', dmth. nuk jemi brenda hierarkis� s� 'StoreContext'
    if (context === undefined) {
        // N�se jemi jasht� kontekstit, shfaq nj� gabim me mesazh informativ
        throw Error('Oops - we are not inside the app.tsx so we do not have access to the context');
    }

    // Kthej vler�n e kontekstit
    return context;
}

// Komponenti "StoreProvider" i cili ofron dhe menaxhon kontekstin e shp�rndarjes s� p�rb�r�sve
export function StoreProvider({ children }: PropsWithChildren<unknown>) {
    // Krijon dy variabla lokale 'basket' dhe 'setBasket' p�rmes 'useState' basket mban gjendjen aktuale te basket setBasket perdoret per me perditsu vleren e basketit
    const [basket, setBasket] = useState<Basket | null>(null);

    function removeItem(productId: number, quantity: number) {
        if (!basket) return;
        //krijohet nje kopje e re e artikujve te shportes 
        const items = [...basket.items]; // new array of items (...) krijon kopje
        // Gjej indeksin e artikullit n� vargun 'items' bazuar n� productId
        const itemIndex = items.findIndex(i => i.productId === productId);
        // Kontrollo n�se artikulli me productId t� dh�n� ekziston n� vargun 'items'
        if (itemIndex >= 0) {
            // N�se artikulli ekziston, zvog�lo sasine e tij me shum�n e caktuar
            items[itemIndex].quantity -= quantity;
            // N�se sasia b�het 0 pas zvog�limit, hiq artikullin nga vargu
            if (items[itemIndex].quantity === 0) items.splice(itemIndex, 1);
            // P�rditso (state) 'Basket' duke p�rdorur funksionin 'setBasket'
            setBasket(prevState => {
                // Kthe nj� kopje t� till� t� 'prevState', duke p�rdorur operatorin 'spread'
                // dhe z�vend�so vargun 'items' me vargun e p�rdit�suar
                return { ...prevState!, items }
            })
        }
    }
    //returns
    // P�rmbajtja e kontekstit p�rfshin vlerat e 'basket', 'setBasket', dhe 'removeItem'
    return (
        <StoreContext.Provider value={{ basket, setBasket, removeItem }}>
            {children}
        </StoreContext.Provider>
    )
}
