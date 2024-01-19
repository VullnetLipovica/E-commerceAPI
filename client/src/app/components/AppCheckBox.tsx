import { Checkbox, FormControlLabel } from "@mui/material";
import { useController, UseControllerProps } from "react-hook-form";

// Nj� "interface" q� specifikon tipat e t� dh�nave p�r "Props" t� komponentit
interface Props extends UseControllerProps {
    label: string;     // Teksti q� do shfaqet pran� checkbox-it
    disabled: boolean;  // P�rcakton n�se checkbox-i �sht� i deaktivizuar apo jo
}

// Komponent funksional p�r nj� checkbox, merrnj� set t� ndryshuesh�m dhe disa propsa
export default function AppCheckbox(props: Props) {
    // P�rdorimi i hook-ut "useController" p�r t� lidhur input-in e checkbox-it me logjik�n e React Hook Form
    const { field } = useController({ ...props, defaultValue: false });

    // Kthimi i komponentit q� p�rfshin nj� Checkbox nga Material-UI
    return (
        <FormControlLabel
            // Pjesa e kontrollit me nj� Checkbox nga Material-UI
            control={
                <Checkbox
                    {...field}          // Pasqyron gjendjen e checkbox-it p�rmes hook-ut "useController"
                    checked={field.value}  // Kontrollon n�se checkbox-i �sht� i zgjedhur ose jo
                    color="secondary"   // Ngjyra e checkbox-it
                    disabled={props.disabled}  // Vendos n�se checkbox-i �sht� i deaktivizuar bazuar n� propertin "disabled"
                />
            }
            label={props.label}  // Teksti q� shfaqet pran� checkbox-it
        />
    );
}