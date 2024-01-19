import { UploadFile } from "@mui/icons-material";
import { FormControl, FormHelperText, Typography } from "@mui/material";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UseControllerProps, useController } from "react-hook-form";

// Nj� "interface" q� p�rcakton tipat e t� dh�nave p�r "Props" t� komponentit
interface Props extends UseControllerProps { }

// Komponenti p�r nj� zona ku p�rdoruesi mund t� laj� imazhe (Dropzone)
export default function AppDropzone(props: Props) {
    // P�rdorimi i hook-ut "useController" p�r lidhjen e input-it me logjik�n e React Hook Form
    const { fieldState, field } = useController({ ...props, defaultValue: null });

    // Stilet p�r komponentin e Dropzone
    const dzStyles = {
        display: 'flex',
        border: 'dashed 3px #eee',
        borderColor: '#eee',
        borderRadius: '5px',
        paddingTop: '30px',
        alignItems: 'center',
        height: 200,
        width: 500
    };

    // Stilet kur nj� element �sht� aktiv
    const dzActive = {
        borderColor: 'green'
    };

    // Funksion q� thirret kur nj� ose m� shum� skedar� hiqen n� zon�n e lajmit t� imazheve
    const onDrop = useCallback((acceptedFiles: any) => {
        // Modifikon informacionin p�r skedarin e pranuar p�r t� shtuar nj� pamje paraprake
        acceptedFiles[0] = Object.assign(acceptedFiles[0], { preview: URL.createObjectURL(acceptedFiles[0]) });
        // P�rdor onChange p�r t� azhurnuar vler�n e input-it n� React Hook Form
        field.onChange(acceptedFiles[0]);
    }, [field]);

    // P�rdorimi i hook-ut "useDropzone" p�r t� sh�nuar propsat dhe ngjarjet e Dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    // Kthimi i komponentit t� Dropzone
    return (
        <div {...getRootProps()}>
            <FormControl style={isDragActive ? { ...dzStyles, ...dzActive } : dzStyles} error={!!fieldState.error} >
                <input {...getInputProps()} />
                {/* Ikona e ngarkimit ose pamja tjeter p�r ngarkimin e skedar�ve */}
                <UploadFile sx={{ fontSize: '100px' }} />
                <Typography variant='h4'>Drop image here</Typography>
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
            </FormControl>
        </div>
    );
}