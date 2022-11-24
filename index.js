const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qyvbyje.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        const categoriesCollection = client.db('carZone').collection('categories')

        app.get('/categories', async(req, res) => {
            const query = {}
            const result = await categoriesCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/cateogry/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const category = await bookingsCollection.findOne(query);
            res.send(category);
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