import Navbar from "../components/Navbar";
import "../styles/About.css";

function About() {
    return (
        <div className="about-page">
            <Navbar />

            <main className="about-content">
                <section className="about-hero">
                    <h1>About Us</h1>
                    <p>
                        We're a small bakery passionate about crafting beautiful,
                        delicious cakes for every occasion — from birthdays and
                        weddings to corporate events and everyday treats.
                    </p>
                </section>

                <section className="about-details">
                    <div className="about-block">
                        <h2>Our Story</h2>
                        <p>
                            What started as a home kitchen hobby grew into a full
                            cake-making business, built on quality ingredients,
                            attention to detail, and a love for creating something
                            special for our customers.
                        </p>
                    </div>

                    <div className="about-block">
                        <h2>What We Offer</h2>
                        <p>
                            From custom-designed wedding cakes to fun kids' birthday
                            cakes, cupcakes, and everything in between — we bake it
                            fresh, just for you.
                        </p>
                    </div>

                    <div className="about-block">
                        <h2>Why Choose Us</h2>
                        <p>
                            Fresh ingredients, handmade craftsmanship, and a team that
                            genuinely cares about making your celebration sweeter.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default About;