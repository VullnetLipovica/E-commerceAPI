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
    product?: Product;            // Produkti që do të redaktohet (opsionale nëse po krijohet një produkt i ri)
    cancelEdit: () => void;        // Funksioni për të anuluar procesin e editimit
}

// Komponenti "ProductForm" përdoret për të shfaqur dhe menaxhuar formën e një produkti
export default function ProductForm({ product, cancelEdit }: Props) {
    // Përdorimi i "useForm" nga "react-hook-form" për menaxhimin e formës
    const { control, reset, handleSubmit, watch, formState: { isDirty, isSubmitting } } = useForm({
        mode: 'onTouched', // Modifikatori për momentin e aktivizimit të validimeve
        resolver: yupResolver<any>(validationSchema) // Përdorimi i Yup-schemas për validimin
    });

    // Përdorimi i "useProducts" për të marrë listat e brands edhe types 
    const { brands, types } = useProducts();

    // Përdorimi i "watch" për të vëzhguar vlerën e fajllit në formë
    const watchFile = watch('file', null);

    // Përdorimi i "useAppDispatch" për të marrë funksionin dispatch të Redux
    const dispatch = useAppDispatch();

    // Efekti për të filluar formën me vlerat e produktit nëse është në procesin e editimit
    useEffect(() => {
        if (product && !watchFile && !isDirty) reset(product);
        return () => {
            // Revokimi i URL-së nëse ka një fajll i ngarkuar me pare
            if (watchFile) URL.revokeObjectURL(watchFile.preview);
        }
    }, [product, reset, watchFile, isDirty]);

    // Funksioni për të paraqitur dhe menaxhuar dërgimin e të dhënave të formës
    async function handleSubmitData(data: FieldValues) {
        try {
            let response: Product;

            // Nëse ka një produkt, thirre metoden update, në të kundërt, thirre metoden e create
            if (product) {
                response = await agent.Admin.updateProduct(data);
            } else {
                response = await agent.Admin.createProduct(data);
            }

            dispatch(setProduct(response));

            // Thirrja e funksionit për të anuluar procesin e editimit
            cancelEdit();
        } catch (error) {
            // Kapja dhe shfaqja e ndonjë gabimi në konsolë nëse ka probleme me dërgimin e të dhënave
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