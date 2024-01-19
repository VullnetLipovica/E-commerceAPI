import { TableContainer, Paper, Table, TableBody, TableRow, TableCell } from '@mui/material';
import { currencyFormat } from '../../util/util';
import { useAppSelector } from '../../store/configureStore';


interface Props {
    subtotal?: number;
}

// Eksportojmë komponentin BasketSummary
export default function BasketSummary({ subtotal }: Props) {
    // Përdorim hook-un useAppSelector për të marrë gjendjen e koshit nga vargu i reduksit
    const { basket } = useAppSelector(state => state.basket);

    // Nëse prop-i subtotal është i papërcaktuar, llogarit atë nga artikujt e koshit
    if (subtotal === undefined)
        subtotal = basket?.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) ?? 0;

    // Caktojmë një tarifë për transportin bazuar në vlerën e subtotal-it
    const deliveryFee = subtotal > 10000 ? 0 : 500;

    return (
        <>
            <TableContainer component={Paper} variant={'outlined'}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={2}>Subtotal</TableCell>
                            <TableCell align="right">{currencyFormat(subtotal)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={2}>Delivery fee*</TableCell>
                            <TableCell align="right">{currencyFormat(deliveryFee)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={2}>Total</TableCell>
                            <TableCell align="right">{currencyFormat(subtotal + deliveryFee)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <span style={{ fontStyle: 'italic' }}>*Orders over $100 qualify for free delivery</span>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}