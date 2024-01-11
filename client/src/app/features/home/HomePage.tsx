import React from "react";
import {
    Typography,
    Button,
    Container,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
} from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function HomePage() {
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h2" align="center" mt={3}>
                Home - Page
            </Typography>

            <Slider {...sliderSettings}>
                <div>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: "center" }}>
                        <img src="../images/photo2.jpg" alt="Slide 1" style={{ maxWidth: "100%" }} />
                        <Typography variant="h5">1.</Typography>
                        <Typography variant="body1">
                            Conquer the slopes in style and embrace the thrill of winter with our premium selection.
                        </Typography>
                    </Paper>
                </div>

                <div>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: "center" }}>
                        <img src="../images/photo1.png" alt="Slide 2" style={{ maxWidth: "100%" }} />
                        <Typography variant="h5">2.</Typography>
                        <Typography variant="body1">
                            Swiftly ship your favorite items to your doorstep.
                        </Typography>
                    </Paper>
                </div>

                
            </Slider>

            <Grid container spacing={3} mt={3}>
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                Skiing Adventure!
                            </Typography>
                            <Typography variant="body1">
                                The latest skiing feature is a game-changer! From advanced slope analytics to real-time weather updates, it's the perfect companion for any skiing enthusiast.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" color="primary">
                                Read More
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                Your Experience!
                            </Typography>
                            <Typography variant="body1">
                                Experience the thrill amplified. Our new skiing feature brings precision and excitement to every descent. Stay ahead, stay exhilarated.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" color="primary">
                                Explore
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}