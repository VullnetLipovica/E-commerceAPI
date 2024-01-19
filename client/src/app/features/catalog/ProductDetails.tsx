import { Divider, Grid, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from '@mui/material';
import { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import LoadingComponent from '../../layout/LoadingComponent';
import NotFound from '../../errors/NotFound';
import { LoadingButton } from '@mui/lab';
import { fetchProductAsync, productSelectors } from './catalogSlice';
import { useAppDispatch, useAppSelector } from '../../store/configureStore';
import { addBasketItemAsync, removeBasketItemAsync } from '../basket/basketSlice';



// Komponenti për shfaqjen e detajeve të një produkti
export default function ProductDetails() {
    // Përdorimi i hook-ut useParams për të marrë ID e produktit nga URL-ja
    const { id } = useParams<{ id: string }>();

    // Përdorimi i hook-ut useAppDispatch për të marrë funksionin dispatch nga Redux Toolkit
    const dispatch = useAppDispatch();

    // Përdorimi i hook-ut useAppSelector për të marrë gjendjen e katalogut dhe koshit nga reduksi
    const { basket, status } = useAppSelector(state => state.basket);
    const product = useAppSelector(state => productSelectors.selectById(state, Number(id!)));
    const { status: productStatus } = useAppSelector(state => state.catalog);

    // Përdorimi i hook-ut useState për të mbajtur gjendjen lokale të sasisë së produktit në kosh
    const [quantity, setQuantity] = useState(0);

    // Gjetja e artikullit e cila ka të bëjë me këtë produkt në kosh
    const item = basket?.items.find(i => i.productId === product?.id);

    // Efekti që ndodh kur ndryshon ID e produktit ose ndryshon gjendja e item-it në kosh
    useEffect(() => {
        // Nëse ka një artikull në kosh për këtë produkt, vendos sasinë lokale me vlerën e artikullit
        if (item) setQuantity(item.quantity);

        // Nëse produkti nuk është në gjendje dhe ka një ID, atëherë bëjmë një thirrje për të marrë produktin nga API
        if (!product && id) dispatch(fetchProductAsync(parseInt(id)));
    }, [id, item, product, dispatch]);

    // Funksion për menaxhimin e ndryshimeve në inputin e sasisë
    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        // Kontrollojmë që vlera e sasisë të jetë më e madhe ose e barabartë me zero
        if (parseInt(event.currentTarget.value) >= 0)
            setQuantity(parseInt(event.currentTarget.value));
    }

    // Funksion për përditësimin e koshit me sasinë aktuale të produktit
    function handleUpdateCart() {
        if (!product) return;

        // Nëse nuk ka një artikull për këtë produkt ose sasia e re është më e madhe se ajo ekzistuese, shto produktin në kosh
        if (!item || quantity > item?.quantity) {
            const updatedQuantity = item ? quantity - item.quantity : quantity;
            dispatch(addBasketItemAsync({ productId: product.id, quantity: updatedQuantity }))
        } else {
            // Në rast tjetër, heq produktin nga koshi
            const updatedQuantity = item.quantity - quantity;
            dispatch(removeBasketItemAsync({ productId: product.id, quantity: updatedQuantity }))
        }
    }

    // Nëse thirrja për të marrë produktin nga API është në pritje, shfaq komponentin e ngarkimit
    if (productStatus.includes('pending')) return <LoadingComponent message='Loading product...' />

    // Nëse produkti nuk ekziston, shfaq komponentin NotFound
    if (!product) return <NotFound />

    return (
        <Grid container spacing={6}>
            <Grid item xs={6}>
                <img src={product.pictureURL} alt={product.name} style={{ width: '100%' }} />
            </Grid>
            <Grid item xs={6}>
                <Typography variant='h3'>{product.name}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant='h4' color='secondary'>${(product.price / 100).toFixed(2)}</Typography>
                <TableContainer>
                    <Table>
                        <TableBody sx={{ fontSize: '1.1em' }}>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>{product.name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Description</TableCell>
                                <TableCell>{product.description}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>{product.type}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Brand</TableCell>
                                <TableCell>{product.brand}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Quantity in stock</TableCell>
                                <TableCell>{product.quantityInStock}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            onChange={handleInputChange}
                            variant={'outlined'}
                            type={'number'}
                            label={'Quantity in Cart'}
                            fullWidth
                            value={quantity}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <LoadingButton
                            disabled={item?.quantity === quantity || !item && quantity === 0}
                            loading={status.includes('pending')}
                            onClick={handleUpdateCart}
                            sx={{ height: '55px' }}
                            color={'primary'}
                            size={'large'}
                            variant={'contained'}
                            fullWidth>
                            {item ? 'Update Quantity' : 'Add to Cart'}
                        </LoadingButton>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}