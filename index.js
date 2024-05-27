const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//MIDDLEWARE
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174','https://coffee-store-b0499.web.app'],
    credentials: true,
    optionSuccessStatus: 200,
  }
  app.use(cors(corsOptions))
app.use(express.json());


// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ppdndxv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

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
   // await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    const userCollection = client.db("coffeeDB").collection("user");
    const viewCollection = client.db("coffeeDB").collection('view');

    app.get('/coffee', async(req, res)=>{
        const cursor = coffeeCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/coffee/:id', async(req , res) =>{
        const id =req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await coffeeCollection.findOne(query);
        res.send(result);
    })

    app.post('/coffee' , async(req, res)=>{
        const newCoffee = req.body;
        console.log(newCoffee);
        const result = await coffeeCollection.insertOne(newCoffee);
        res.send(result);
    })

    app.put('/coffee/:id', async(req , res) =>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = {upsert : true};
        const updatedCoffee = req.body;
        const coffee ={
            $set: {
                name: updatedCoffee.name,
                supplier: updatedCoffee.supplier,
                category: updatedCoffee.category,
                shaf: updatedCoffee.shaf,
                taste: updatedCoffee.taste,
                details: updatedCoffee.details,
                photo: updatedCoffee.photo,
            }
        }
        const result = await coffeeCollection.updateOne(filter, coffee, options)
        res.send(result);
    })

    app.delete('/coffee/:id', async(req, res)=>{
        const id =req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await coffeeCollection.deleteOne(query);
        res.send(result);
    })
    
    //user related apis

    app.get('/users', async(req, res) =>{
        const cursor = userCollection.find();
        const users = await cursor.toArray();
        res.send(users);
    })

    app.post('/user', async(req, res)=>{
        const user = req.body;
        console.log(user);
        const result = await userCollection.insertOne(user);
        res.send(result);
    })
    

    app.patch('/users', async(req, res) =>{
        const user = req.body;
        console.log(user);
        const filter = {email: user.email}
        const updateDoc = {
            $set: {
                lastLoggedAt: user.lastLoggedAt
            }
        }
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
    })

    app.delete('/user/:id', async(req, res)=>{
        const id =req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
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




app.get('/', (req, res)=>{
    res.send('Coffee making server is running')
})

app.listen(port, () =>{
    console.log(`Coffee server is running on port:${port}`);
})