import { Checkbox, FormControlLabel } from "@mui/material";
import { useController, UseControllerProps } from "react-hook-form";

// Një "interface" që specifikon tipat e të dhënave për "Props" të komponentit
interface Props extends UseControllerProps {
    label: string;     // Teksti që do shfaqet pranë checkbox-it
    disabled: boolean;  // Përcakton nëse checkbox-i është i deaktivizuar apo jo
}

// Komponent funksional për një checkbox, merrnjë set të ndryshueshëm dhe disa propsa
export default function AppCheckbox(props: Props) {
    // Përdorimi i hook-ut "useController" për të lidhur input-in e checkbox-it me logjikën e React Hook Form
    const { field } = useController({ ...props, defaultValue: false });

    // Kthimi i komponentit që përfshin një Checkbox nga Material-UI
    return (
        <FormControlLabel
            // Pjesa e kontrollit me një Checkbox nga Material-UI
            control={
                <Checkbox
                    {...field}          // Pasqyron gjendjen e checkbox-it përmes hook-ut "useController"
                    checked={field.value}  // Kontrollon nëse checkbox-i është i zgjedhur ose jo
                    color="secondary"   // Ngjyra e checkbox-it
                    disabled={props.disabled}  // Vendos nëse checkbox-i është i deaktivizuar bazuar në propertin "disabled"
                />
            }
            label={props.label}  // Teksti që shfaqet pranë checkbox-it
        />
    );
}