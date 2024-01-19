import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/configureStore";
import { FieldValues, useForm } from "react-hook-form";
import { Avatar, Box, Container, Grid, Paper, TextField, Typography } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { signInUser } from "../features/account/accountSlice";

export default function Login() {
    // P�rdorimi i hooks p�r t� naviguar midis faqeve
    const navigate = useNavigate();
    // P�rdorimi i hooks p�r t� marr� informacionin e vendndodhjes
    const location = useLocation();
    // P�rdorimi i hooks t� aplikacionit p�r menaxhimin e gjendjes
    const dispatch = useAppDispatch();

    // P�rdorimi i hooks nga React Hook Form p�r menaxhimin e form�s
    const { register, handleSubmit, formState: { isSubmitting, errors, isValid } } = useForm({
        mode: 'onTouched'
    });


    async function submitForm(data: FieldValues) {
        try {
           
            await dispatch(signInUser(data));
            // Navigo p�rdoruesin n� faqen e d�rguar (n�se ka nj� faqe e d�rguar), ose n� faqen e katalogut
            navigate(location.state?.from || '/catalog');
        } catch (error) {
            // N� rast t� ndonj� gabimi, shfaq gabimin n� konsol� 
            console.log(error);
        }
    }


    return (
        <Container
            component={Paper}
            maxWidth='sm'
            sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
                Sign in
            </Typography>
            <Box component="form"
                onSubmit={handleSubmit(submitForm)}
                noValidate sx={{ mt: 1 }}
            >
                <TextField
                    margin="normal"
                    fullWidth
                    label="Username"
                    autoComplete="username"
                    autoFocus
                    {...register('username', { required: 'Username is required' })}
                    error={!!errors.username}
                    helperText={errors?.username?.message as string}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password', { required: 'Password is required' })}
                    error={!!errors.password}
                    helperText={errors.password?.message as string}
                />
                <LoadingButton
                    loading={isSubmitting}
                    disabled={!isValid}
                    type="submit"
                    fullWidth
                    variant="contained" sx={{ mt: 3, mb: 2 }}
                >
                    Sign In
                </LoadingButton>
                <Grid container>
                    <Grid item>
                        <Link to='/register' style={{ textDecoration: 'none' }}>
                            {"Don't have an account? Sign Up"}
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    )
}