const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
app.use(cors());
app.use(express.json())

//mongodb start
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mr2482e.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        await client.connect();
        const database = client.db('property');// here , DATABASE MEANS NAME OF THE DATABASE.
        const dataCollection = database.collection("product");//here, Product means name of the collection.
        const ratingInfo =database.collection('rating')
        // write your function here
        // post method

        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await dataCollection.insertOne(newProduct);
            res.send(result)
        });
        app.get("/product/unique", async (req, res) => {
            const UserEmail = req.query.UserEmail;
            const query = {};
            if (UserEmail) {
                query.UserEmail = UserEmail
            }
            const cursor = dataCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })



        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await dataCollection.findOne(query)
            res.send(result)
        })


        app.post('/rating', async (req, res) => {
            const newProduct = req.body;
            const result = await ratingInfo.insertOne(newProduct);
            res.send(result)
        });
        app.get('/rating', async (req, res) => {
            const result = await ratingInfo.find().toArray()
            res.send(result)
        })
        app.get('/search', async (req, res) => {
            const searchText = req.query.search
            const result = await dataCollection.find({ PropertyName: { $regex: searchText ,$options:"i"} }).toArray()
          res.send(result)
        })

        //  update database
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const Data = req.body;
            const query = { _id: new ObjectId(id) };
            const updateData = {
                $set: Data
            }
            const result = await dataCollection.updateOne(query, updateData);
            res.send(result)
        });
        // delete data
        app.delete("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await dataCollection.deleteOne(query);
            res.send(result)
        })
        app.get("/product", async (req, res) => {
            const result = await dataCollection.find().sort({ "Price":-1}).toArray();
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);
//mongodb end

app.get('/', (req, res) => {
    res.send("hello world assignment 10 when start")
});
app.listen(port, () => {
    console.log(`the server running port is :${port}`);

})

