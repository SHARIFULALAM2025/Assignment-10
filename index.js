const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
app.use(cors());
app.use(express.json())
//
const admin = require("firebase-admin");

const serviceAccount = require("./adminSdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



//

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

// middleware

const middleware = async(req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(401).send({
            message: "token not found"
        })

    }
    const Token = authorization.split(" ")[1]

    try {
        const decodedUser = await admin.auth().verifyIdToken(Token)
        req.user = decodedUser


        next()

    } catch (error) {
        res.status(401).send({
            message:"unknown person"
        })


    }


}


async function run() {
    try {
        await client.connect();
        const database = client.db('property');// here , DATABASE MEANS NAME OF THE DATABASE.
        const dataCollection = database.collection("product");//here, Product means name of the collection.
        const ratingInfo =database.collection('rating')
        // write your function here
        // post method

        app.post('/product', middleware, async (req, res) => {
            const newProduct = req.body;
            const result = await dataCollection.insertOne(newProduct);
            res.send(result)
        });
        app.get("/product/unique", middleware, async (req, res) => {
            try {
                const uniqueEmail = req.user.email;
                if (!uniqueEmail) {
                    return res.status(401).send({ message: 'unauthorized access' })
                }
                const query = { UserEmail: uniqueEmail }

                const result = await dataCollection.find(query).toArray()
                res.send(result)
            } catch (error) {
                console.error(error)
                res.status(500).send({ message: 'server error' })

            }
        })











        app.get('/product/:id', middleware,async (req, res) => {
            const id = req.params.id

            const query = { _id: new ObjectId(id) }
            const result = await dataCollection.findOne(query)
            res.send(result)
        })


        app.post('/rating',middleware,async (req, res) => {
            const newProduct = req.body;
            const result = await ratingInfo.insertOne(newProduct);
            res.send(result)
        });
        app.get('/rating/data', middleware, async (req, res) => {
            try {
                const userEmail = req.user.email

                if (!userEmail) {
                    return res.status(401).send({ message: 'unauthorized access' })
                }
                const query = { reviewerEmail: userEmail }
                const result = await ratingInfo.find(query).toArray()
                res.send(result)
            } catch (error) {
                console.error(error)
                res.status(500).send({message:'server error'})

            }
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
        app.delete("/product/:id", middleware, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await dataCollection.deleteOne(query);
            res.send(result)
        })
        app.get("/product", async (req, res) => {
            const result = await dataCollection.find().sort({ "Price":-1}).toArray();
            res.send(result)
        })

        app.get("/home/date", async(req, res) => {
            const cursor = dataCollection.find().sort({ PostedDate :-1}).limit(6)
            const result= await cursor.toArray()
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

