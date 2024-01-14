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
                            Welcome to Re-Store, your one-stop destination for premium protein supplements designed to fuel your fitness journey and optimize your health.
                        </Typography>
                    </Paper>
                </div>

                <div>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: "center" }}>
                        <img src="../images/photo1.png" alt="Slide 2" style={{ maxWidth: "100%" }} />
                        <Typography variant="h5">2.</Typography>
                        <Typography variant="body1">
                            We take pride in offering a diverse range of high-quality products that cater to all your nutritional needs. Explore our selection and elevate your wellness with these exceptional protein supplements.
                        </Typography>
                    </Paper>
                </div>

                
            </Slider>

            <Grid container spacing={3} mt={3}>
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                Pure Performance Proteins
                            </Typography>
                            <Typography variant="body1">
                                Unleash your full potential with our selection of pure performance proteins. Whether you're an athlete, fitness enthusiast, or just starting your health journey, our protein supplements are crafted to support muscle growth, aid in recovery, and boost overall performance.
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
                                Clean and Transparent Ingredients
                            </Typography>
                            <Typography variant="body1">
                                We prioritize your health by providing products with clean and transparent ingredient lists. Our commitment to quality ensures that you get the nutrients your body needs without unnecessary additives. Trust us to deliver supplements that contribute to your well-being without compromise.
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