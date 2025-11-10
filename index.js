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
         const database = client.db('DATABASE');// here , DATABASE MEANS NAME OF THE DATABASE.
        const dataCollection = database.collection("Product");//here, Product means name of the collection.
        const details=database.collection("information")
        // write your function here
        // post method

        app.post('/Product', async (req, res) => {
            const newProduct = req.body;
            const result = await dataCollection.insertOne(newProduct);
            res.send(result)
        });












        //  update database
        app.put('/Product/:id', async (req, res) => {
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
        app.delete("/Product/:id", async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await dataCollection.deleteOne(query);
            res.send(result)
        })
        app.get("/Product", async (req, res) => {
            const result = await dataCollection.find().toArray();
            res.send(result)
        })

        //http://localhost:5000/Product/unique?category=category_Nanme/email_name
        app.get("/Product/unique",async (req, res) => {
            const Category = req.query.Category;
            const query = {};
            if (Category) {
                query.Category = Category
            }
            const cursor = dataCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })


        // information
        app.post('/information', async (req, res) => {
            const data = req.body;
            const result = await details.insertOne(data)
            res.send(result)
        })

        app.get('/productInfo', async (req, res) => {
            // const id = req.params.id;
            try {
                const result = await details.aggregate([

                    {
                        $addFields: {
                            product_id: {
                                $toObjectId:"$product_id"
                            }

                        }

                    },
                    // {
                    //     $match: { product_id: new ObjectId(id) }

                    // },
                    {
                        $lookup: {
                            from: "Product",
                            localField: "product_id",
                            foreignField: "_id",
                            as:"productDetails"
                        }
                    }, {
                        $unwind:"$productDetails"
                    }
                ]).toArray()
                res.send(result)
            } catch (error) {
                res.status(500).send({ message: "error fetching join data", error })

            }

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

