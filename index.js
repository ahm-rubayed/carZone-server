const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qyvbyje.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        const categoriesCollection = client.db('carZone').collection('categories')
        const bookingCollection = client.db('carZone').collection('booking')
        const productsCollection = client.db('carZone').collection('products')
        const paymentsCollection = client.db('carZone').collection('payments');
        const sellersCollection = client.db('carZone').collection('seller');
        const buyersCollection = client.db('carZone').collection('buyer');

        app.get('/seller', async (req, res) => {
            const query = {};
            const sellers = await sellersCollection.find(query).toArray();
            res.send(sellers);
        });

        app.post('/seller', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await sellersCollection.insertOne(user);
            res.send(result);
        })

        app.get('/buyer', async (req, res) => {
            const query = {};
            const buyers = await buyersCollection.find(query).toArray();
            res.send(buyers);
        });

        app.post('/buyer', async (req, res) => {
            const user = req.body;
            const result = await buyersCollection.insertOne(user);
            res.send(result);
        })

        app.get('/categories', async(req, res) => {
            const query = {}
            const result = await categoriesCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const category = await categoriesCollection.findOne(query);
            res.send(category);
        })

        app.get('/bookings', async (req, res) => {
            const query = {};
            const booking = await bookingCollection.find(query).toArray();
            res.send(booking);
        });

        app.post('/bookings', async (req, res) => {
            const product = req.body;
            const result = await bookingCollection.insertOne(product);
            res.send(result);
        });

        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        app.post('/products', async (req, res) => {
            const doctor = req.body;
            const result = await productsCollection.insertOne(doctor);
            res.send(result);
        });

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(filter);
            res.send(result);
        })

        app.post('/create-payment-intent', async (req, res) => {
            const product = req.body;
            const price = product.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) =>{
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.productId
            const filter = {_id: ObjectId(id)}
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await productsCollection.updateOne(filter, updatedDoc)
            res.send(updatedResult);
        }) 
        
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await sellersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await buyersCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'buyer' });
        })
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) }
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: {
        //             role: 'admin'
        //         }
        //     }
        //     const result = await usersCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // });

        app.delete('/seller/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await sellersCollection.deleteOne(filter);
            res.send(result);
        })

        app.delete('/buyer/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await buyersCollection.deleteOne(filter);
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(err => console.error(err))

app.get('/', async (req, res) => {
    res.send('carZone server is running');
})

app.listen(port, () => console.log(`Doctors portal running on ${port}`))