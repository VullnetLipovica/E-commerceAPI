import { Divider, Grid, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from '@mui/material';
import { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import LoadingComponent from '../../layout/LoadingComponent';
import NotFound from '../../errors/NotFound';
import { LoadingButton } from '@mui/lab';
import { fetchProductAsync, productSelectors } from './catalogSlice';
import { useAppDispatch, useAppSelector } from '../../store/configureStore';
import { addBasketItemAsync, removeBasketItemAsync } from '../basket/basketSlice';



// Komponenti p�r shfaqjen e detajeve t� nj� produkti
export default function ProductDetails() {
    // P�rdorimi i hook-ut useParams p�r t� marr� ID e produktit nga URL-ja
    const { id } = useParams<{ id: string }>();

    // P�rdorimi i hook-ut useAppDispatch p�r t� marr� funksionin dispatch nga Redux Toolkit
    const dispatch = useAppDispatch();

    // P�rdorimi i hook-ut useAppSelector p�r t� marr� gjendjen e katalogut dhe koshit nga reduksi
    const { basket, status } = useAppSelector(state => state.basket);
    const product = useAppSelector(state => productSelectors.selectById(state, Number(id!)));
    const { status: productStatus } = useAppSelector(state => state.catalog);

    // P�rdorimi i hook-ut useState p�r t� mbajtur gjendjen lokale t� sasis� s� produktit n� kosh
    const [quantity, setQuantity] = useState(0);

    // Gjetja e artikullit e cila ka t� b�j� me k�t� produkt n� kosh
    const item = basket?.items.find(i => i.productId === product?.id);

    // Efekti q� ndodh kur ndryshon ID e produktit ose ndryshon gjendja e item-it n� kosh
    useEffect(() => {
        // N�se ka nj� artikull n� kosh p�r k�t� produkt, vendos sasin� lokale me vler�n e artikullit
        if (item) setQuantity(item.quantity);

        // N�se produkti nuk �sht� n� gjendje dhe ka nj� ID, at�her� b�jm� nj� thirrje p�r t� marr� produktin nga API
        if (!product && id) dispatch(fetchProductAsync(parseInt(id)));
    }, [id, item, product, dispatch]);

    // Funksion p�r menaxhimin e ndryshimeve n� inputin e sasis�
    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        // Kontrollojm� q� vlera e sasis� t� jet� m� e madhe ose e barabart� me zero
        if (parseInt(event.currentTarget.value) >= 0)
            setQuantity(parseInt(event.currentTarget.value));
    }

    // Funksion p�r p�rdit�simin e koshit me sasin� aktuale t� produktit
    function handleUpdateCart() {
        if (!product) return;

        // N�se nuk ka nj� artikull p�r k�t� produkt ose sasia e re �sht� m� e madhe se ajo ekzistuese, shto produktin n� kosh
        if (!item || quantity > item?.quantity) {
            const updatedQuantity = item ? quantity - item.quantity : quantity;
            dispatch(addBasketItemAsync({ productId: product.id, quantity: updatedQuantity }))
        } else {
            // N� rast tjet�r, heq produktin nga koshi
            const updatedQuantity = item.quantity - quantity;
            dispatch(removeBasketItemAsync({ productId: product.id, quantity: updatedQuantity }))
        }
    }

    // N�se thirrja p�r t� marr� produktin nga API �sht� n� pritje, shfaq komponentin e ngarkimit
    if (productStatus.includes('pending')) return <LoadingComponent message='Loading product...' />

    // N�se produkti nuk ekziston, shfaq komponentin NotFound
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