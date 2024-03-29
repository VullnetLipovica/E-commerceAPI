import { TableContainer, Paper, Table, TableBody, TableRow, TableCell } from '@mui/material';
import { currencyFormat } from '../../util/util';
import { useAppSelector } from '../../store/configureStore';


interface Props {
    subtotal?: number;
}

// Eksportojm� komponentin BasketSummary
export default function BasketSummary({ subtotal }: Props) {
    // P�rdorim hook-un useAppSelector p�r t� marr� gjendjen e koshit nga vargu i reduksit
    const { basket } = useAppSelector(state => state.basket);

    // N�se prop-i subtotal �sht� i pap�rcaktuar, llogarit at� nga artikujt e koshit
    if (subtotal === undefined)
        subtotal = basket?.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) ?? 0;

    // Caktojm� nj� tarif� p�r transportin bazuar n� vler�n e subtotal-it
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