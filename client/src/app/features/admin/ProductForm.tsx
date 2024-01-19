import { Box, Paper, Typography, Grid, Button } from '@mui/material';
import { FieldValues, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Product } from '../../models/product';
import { validationSchema } from './productValidation';
import useProducts from '../../hooks/useProducts';
import { useAppDispatch } from '../../store/configureStore';
import agent from '../../api/agent';
import AppTextInput from '../../components/AppTextInput';
import AppSelectList from '../../components/AppSelectList';
import AppDropzone from '../../components/AppDropZone';
import { setProduct } from '../catalog/catalogSlice';

interface Props {
    product?: Product;            // Produkti q� do t� redaktohet (opsionale n�se po krijohet nj� produkt i ri)
    cancelEdit: () => void;        // Funksioni p�r t� anuluar procesin e editimit
}

// Komponenti "ProductForm" p�rdoret p�r t� shfaqur dhe menaxhuar form�n e nj� produkti
export default function ProductForm({ product, cancelEdit }: Props) {
    // P�rdorimi i "useForm" nga "react-hook-form" p�r menaxhimin e form�s
    const { control, reset, handleSubmit, watch, formState: { isDirty, isSubmitting } } = useForm({
        mode: 'onTouched', // Modifikatori p�r momentin e aktivizimit t� validimeve
        resolver: yupResolver<any>(validationSchema) // P�rdorimi i Yup-schemas p�r validimin
    });

    // P�rdorimi i "useProducts" p�r t� marr� listat e brands edhe types 
    const { brands, types } = useProducts();

    // P�rdorimi i "watch" p�r t� v�zhguar vler�n e fajllit n� form�
    const watchFile = watch('file', null);

    // P�rdorimi i "useAppDispatch" p�r t� marr� funksionin dispatch t� Redux
    const dispatch = useAppDispatch();

    // Efekti p�r t� filluar form�n me vlerat e produktit n�se �sht� n� procesin e editimit
    useEffect(() => {
        if (product && !watchFile && !isDirty) reset(product);
        return () => {
            // Revokimi i URL-s� n�se ka nj� fajll i ngarkuar me pare
            if (watchFile) URL.revokeObjectURL(watchFile.preview);
        }
    }, [product, reset, watchFile, isDirty]);

    // Funksioni p�r t� paraqitur dhe menaxhuar d�rgimin e t� dh�nave t� form�s
    async function handleSubmitData(data: FieldValues) {
        try {
            let response: Product;

            // N�se ka nj� produkt, thirre metoden update, n� t� kund�rt, thirre metoden e create
            if (product) {
                response = await agent.Admin.updateProduct(data);
            } else {
                response = await agent.Admin.createProduct(data);
            }

            dispatch(setProduct(response));

            // Thirrja e funksionit p�r t� anuluar procesin e editimit
            cancelEdit();
        } catch (error) {
            // Kapja dhe shfaqja e ndonj� gabimi n� konsol� n�se ka probleme me d�rgimin e t� dh�nave
            console.log(error);
        }
    }

    return (
        <Box component={Paper} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Product Details
            </Typography>
            <form onSubmit={handleSubmit(handleSubmitData)}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={12}>
                        <AppTextInput control={control} name='name' label='Product name' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AppSelectList items={brands} control={control} name='brand' label='Brand' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AppSelectList items={types} control={control} name='type' label='Type' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AppTextInput type='number' control={control} name='price' label='Price' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AppTextInput type='number' control={control} name='quantityInStock' label='Quantity in Stock' />
                    </Grid>
                    <Grid item xs={12}>
                        <AppTextInput
                            multiline={true}
                            rows={4}
                            control={control}
                            name='description'
                            label='Description'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box display='flex' justifyContent='space-between' alignItems='center'>
                            <AppDropzone control={control} name='file' />
                            {watchFile ? (
                                <img src={watchFile.preview} alt='preview' style={{ maxHeight: 200 }} />
                            ) : (
                                <img src={product?.pictureURL} alt={product?.name} style={{ maxHeight: 200 }} />
                            )}
                        </Box>
                    </Grid>
                </Grid>
                <Box display='flex' justifyContent='space-between' sx={{ mt: 3 }}>
                    <Button onClick={cancelEdit} variant='contained' color='inherit'>Cancel</Button>
                    <LoadingButton
                        loading={isSubmitting}
                        type='submit'
                        variant='contained'
                        color='success'>Submit</LoadingButton>
                </Box>
            </form>
        </Box>
    )
}