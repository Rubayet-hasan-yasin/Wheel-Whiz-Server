const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());

// const corsConfig = {
//   origin: '*',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE']
//   }
//   app.use(cors(corsConfig))

app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oajesmx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const wheelWhizDB = client.db("wheelWhizDB");
    const wheelWhizCollection = wheelWhizDB.collection("wheels")


    app.get('/category', async (req, res) => {
      const category = req.query.category;
      const query = { subCategory: { $eq: category } }
      const result = await wheelWhizCollection.find(query).limit(10).toArray();
      res.send(result)
    })

    app.get('/allToys', async (req, res) => {
      const result = await wheelWhizCollection.find().limit(20).toArray();
      res.send(result)
    })

    app.get('/myToys', async (req, res) => {
      const email = req.query.email;
      const quary = { sellerEmail: { $eq: email } };
      const result = await wheelWhizCollection.find(quary).toArray();
      res.send(result)
    })

    app.get('/updateToy/:id', async (req, res) => {
      const id = req.params.id;
      if (ObjectId.isValid(id)) {
        const query = { _id: new ObjectId(String(id)) };
        const result = await wheelWhizCollection.findOne(query);
        res.send(result)
      }
    })

    app.get('/details/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await wheelWhizCollection.findOne(query);
      res.send(result)
    })

    app.post('/addToy', async (req, res) => {
      const toydata = req.body;
      const result = await wheelWhizCollection.insertOne(toydata);
      res.send(result)
    })

    app.put('/updateToy/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const option = {upsert: true};
      const updatedToy = req.body;
      const toy = {
        $set: {
          toyName: updatedToy.toyName,
          price: updatedToy.price,
          availableQuantity: updatedToy.availableQuantity,
          description: updatedToy.description
        }
      };

      const result = await wheelWhizCollection.updateOne(filter, toy, option)

      res.send(result)
    })

    app.delete('/deleteToy/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await wheelWhizCollection.deleteOne(query);
      res.send(result)
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Wheel-whiz')
})


app.listen(port, () => {
  console.log('Wheel-whiz server running on port:', port)
})