import { UploadFile } from "@mui/icons-material";
import { FormControl, FormHelperText, Typography } from "@mui/material";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UseControllerProps, useController } from "react-hook-form";

// Një "interface" që përcakton tipat e të dhënave për "Props" të komponentit
interface Props extends UseControllerProps { }

// Komponenti për një zona ku përdoruesi mund të lajë imazhe (Dropzone)
export default function AppDropzone(props: Props) {
    // Përdorimi i hook-ut "useController" për lidhjen e input-it me logjikën e React Hook Form
    const { fieldState, field } = useController({ ...props, defaultValue: null });

    // Stilet për komponentin e Dropzone
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

    // Stilet kur një element është aktiv
    const dzActive = {
        borderColor: 'green'
    };

    // Funksion që thirret kur një ose më shumë skedarë hiqen në zonën e lajmit të imazheve
    const onDrop = useCallback((acceptedFiles: any) => {
        // Modifikon informacionin për skedarin e pranuar për të shtuar një pamje paraprake
        acceptedFiles[0] = Object.assign(acceptedFiles[0], { preview: URL.createObjectURL(acceptedFiles[0]) });
        // Përdor onChange për të azhurnuar vlerën e input-it në React Hook Form
        field.onChange(acceptedFiles[0]);
    }, [field]);

    // Përdorimi i hook-ut "useDropzone" për të shënuar propsat dhe ngjarjet e Dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    // Kthimi i komponentit të Dropzone
    return (
        <div {...getRootProps()}>
            <FormControl style={isDragActive ? { ...dzStyles, ...dzActive } : dzStyles} error={!!fieldState.error} >
                <input {...getInputProps()} />
                {/* Ikona e ngarkimit ose pamja tjeter për ngarkimin e skedarëve */}
                <UploadFile sx={{ fontSize: '100px' }} />
                <Typography variant='h4'>Drop image here</Typography>
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
            </FormControl>
        </div>
    );
}