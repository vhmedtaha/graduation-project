require("dotenv").config()

// import SendUserValueToBack from '../FrontEnd/src/components/SendUserValueToBack';
// if(SendUserValueToBack)
// console.log(SendUserValueToBack)
// else{
//   console.log("error")
// }
const express = require("express")
const app = express()
const cors = require("cors")
app.use(express.json())
app.use(
  cors()
)


const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Learn React Today" }],
  [2, { priceInCents: 20000, name: "Learn CSS Today" }],
])

// Update the price of Product ID 1 to $120.00
// storeItems.set(1, { priceInCents: 12000, name: "Learn React Today" });

// // Update the price of Product ID 2 to $220.00
// storeItems.set(2, { priceInCents: 22000, name: "Learn CSS Today" });

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id)
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        }
      }),
      success_url: `${process.env.CLIENT_URL}/successfullpayment`,
      cancel_url: `${process.env.CLIENT_URL}/failedpayment`,
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(4000)
