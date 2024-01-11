import React from 'react';
import { Container, Typography, Grid, Paper, List, ListItem, ListItemText } from '@mui/material';

export default function AboutPage() {
    return (
        <Container maxWidth="md" style={{ marginTop: '20px' }}>
            <Typography variant="h2" gutterBottom>
                About Us
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '20px' }}>
                        <Typography variant="h4" gutterBottom>
                            Our Story
                        </Typography>
                        <Typography paragraph>
                            Welcome to Re-Store, where passion meets quality. Our story began with a group of individuals driven by a common goal  to redefine the online shopping experience.
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: '20px' }}>
                        <Typography variant="h4" gutterBottom>
                            Mission
                        </Typography>
                        <Typography paragraph>
                            Our mission is to provide high-quality products and excellent service to our customers. We aim to create a seamless shopping experience for everyone.
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: '20px' }}>
                        <Typography variant="h4" gutterBottom>
                            Vision
                        </Typography>
                        <Typography paragraph>
                            Our vision is to become a leading e-commerce platform, offering a diverse range of products and maintaining strong relationships with our customers.
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '20px' }}>
                        <Typography variant="h4" gutterBottom>
                            Our Team
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="Vullnet Lipovica - CEO" secondary="" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Erza Boshnjaku - Software Engineer" secondary="" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Ardit Hoxha - CTO" secondary="" />
                            </ListItem>
                          
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
