import { useState } from "react";
import useProducts from "../../hooks/useProducts";
import { useAppDispatch } from "../../store/configureStore";
import { Product } from "../../models/product";
import agent from "../../api/agent";
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { currencyFormat } from "../../util/util";
import { Delete, Edit } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import AppPagination from "../../components/AppPagination";
import { removeProduct, setPageNumber } from "../catalog/catalogSlice";
import ProductForm from "./ProductForm";

export default function Inventory() {
    // Përdor funksionin 'useProducts' për të marrë të dhënat e produkteve dhe metadata
    const { products, metaData } = useProducts();
    // Përdor 'useState' për të ruajtur gjendjen e modalitetit të redaktimit (editMode)
    const [editMode, setEditMode] = useState(false);
    // Përdor 'useAppDispatch' për të marrë funksionin 'dispatch' nga Redux
    const dispatch = useAppDispatch();
    // Përdor 'useState' për të ruajtur gjendjen e produktit të zgjedhur për redaktim
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    // Përdor 'useState' për të ruajtur gjendjen e ngarkesës (loading)
    const [loading, setLoading] = useState(false);
    // Përdor 'useState' për të ruajtur gjendjen e elementit të synuar (target)
    const [target, setTarget] = useState(0);

    function handleSelectProduct(product: Product) {
        setSelectedProduct(product);
        setEditMode(true);
    }

    function cancelEdit() {
        if (selectedProduct) setSelectedProduct(undefined);
        setEditMode(false);
    }

    function handleDeleteProduct(id: number) {
        setLoading(true);
        setTarget(id)
        agent.Admin.deleteProduct(id)
            .then(() => dispatch(removeProduct(id)))
            .catch(error => console.log(error))
            .finally(() => setLoading(false))
    }

    if (editMode) return <ProductForm cancelEdit={cancelEdit} product={selectedProduct} />

    return (
        <>
            <Box display='flex' justifyContent='space-between'>
                <Typography sx={{ p: 2 }} variant='h4'>Inventory</Typography>
                <Button
                    sx={{ m: 2 }}
                    size='large' variant='contained'
                    onClick={() => setEditMode(true)}
                >
                    Create
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell align="left">Product</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="center">Type</TableCell>
                            <TableCell align="center">Brand</TableCell>
                            <TableCell align="center">Quantity</TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow
                                key={product.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {product.id}
                                </TableCell>
                                <TableCell align="left">
                                    <Box display='flex' alignItems='center'>
                                        <img src={product.pictureURL} alt={product.name} style={{ height: 50, marginRight: 20 }} />
                                        <span>{product.name}</span>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{currencyFormat(product.price)}</TableCell>
                                <TableCell align="center">{product.type}</TableCell>
                                <TableCell align="center">{product.brand}</TableCell>
                                <TableCell align="center">{product.quantityInStock}</TableCell>
                                <TableCell align="right">
                                    <Button
                                        startIcon={<Edit />}
                                        onClick={() => handleSelectProduct(product)}
                                    />
                                    <LoadingButton
                                        loading={loading && target === product.id}
                                        startIcon={<Delete />} color='error'
                                        onClick={() => handleDeleteProduct(product.id)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {metaData &&
                <Box sx={{ pt: 2 }}>
                    <AppPagination
                        metaData={metaData}
                        onPageChange={(page: number) => dispatch(setPageNumber({ pageNumber: page }))}
                    />
                </Box>
            }
        </>
    )
}