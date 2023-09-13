import express from "express";
import dotenv from "dotenv";
import stripe from "stripe";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Use a port from environment variables or default to 3000

app.use(express.static("public"));
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.sendFile("a.html", { root: "public" }); // Use "./public" instead of 'public'
});

// Success route
app.get("/success", (req, res) => {
    res.sendFile("success.html", { root: "public" });
});

// Cancel route
app.get("/cancel", (req, res) => {
    res.sendFile("cancel.html", { root: "./public" });
});

// Initialize Stripe with your API key
let stripeGateway = stripe(process.env.stripe_api);
let DOMAIN = process.env.DOMAIN;

app.post("/stripe-checkout", async (req, res) => {
        const lineItems = req.body.items.map((item) => {
            const unitAmount = parseInt(item.price.replace(/[^0-9.-]+/g, "")) * 100;
            console.log("item-price",item.price);
            console.log("unitAmount",unitAmount);
            return{
                price_data: {
                    currency: "usd", // Specify a supported currency code
                    product_data: {
                        name: item.title,
                        images: [item.productImg],
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        });
        console.log("lineItems", lineItems);

        // Create a Stripe Checkout session
        const session = await stripeGateway.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${DOMAIN}/success`,
            cancel_url: `${DOMAIN}/cancel`,
            line_items: lineItems,
            billing_address_collection: "required",
            // Specify any other session options as needed
        });

        res.json(session.url); 
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
