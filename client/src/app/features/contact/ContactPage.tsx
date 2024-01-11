import React from 'react';
import { Typography, Button, ButtonGroup, Grid, Paper } from '@mui/material';

export default function ContactPage() {
    return (
        <Grid container justifyContent="center" alignItems="center" style={{ height: '80vh' }}>
            <Paper elevation={3} style={{ padding: '20px', maxWidth: '400px' }}>
                <Typography variant='h4' gutterBottom>
                    Contact Us
                </Typography>

                <Typography paragraph>
                    We'd love to hear from you! If you have any questions, suggestions, or just want to say hello, feel free to reach out to us.
                </Typography>

                <Typography paragraph>
                    You can contact us via email at <strong>ReStore@gmail.com</strong>.
                </Typography>

                <Typography paragraph>
                    Follow us on social media for the latest updates and news:
                </Typography>

                <ButtonGroup fullWidth>
                    <Button variant="contained" color="primary" href="https://facebook.com" target="_blank">
                        Facebook
                    </Button>
                    <Button variant="contained" color="secondary" href="https://twitter.com" target="_blank">
                        Twitter
                    </Button>
                   
                </ButtonGroup>
            </Paper>
        </Grid>
    );
}
