const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json())

const uri = "mongodb+srv://shop:3hbzJVdrRMVQ86oC@cluster0.spurzgo.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const dbCollection = client.db("shop").collection("products");
        const shipmentCollection = client.db("shop").collection("shipment");
        
        // read data
        app.get('/products', async(req, res)=>{
            const query = {};
            const cursor = dbCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        });

        //  pagination
        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            // console.log(page, size)
            const query = {};
            const cursor = dbCollection.find(query)
            const products = await cursor.skip(page * size).limit(size).toArray();
            const count = await dbCollection.estimatedDocumentCount();
            res.send( {count, products})
        })

        // pagination
        app.post('/productsByIds', async(req, res)=>{
            const ids = req.body;
            const objectIds = ids.map(id => new ObjectId(id) )
            console.log(ids);
            const query = {_id: {$in: objectIds} };
            const cursor = dbCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        // search
        app.get('/search/:name', async(req,res)=>{
            let regex =  new RegExp(req.params.name,"i")
            let result = await dbCollection.find({name: regex}).toArray()
            console.log(result)
            res.send(result)
        } ) // end

        // data insert for shipment 
        app.post('/shipment', async(req, res)=>{
            const data = req.body;
            const result = await shipmentCollection.insertOne(data);
            res.send(result);
            console.log(data);
        });

        // data load for shipment
        app.get('/shipment', async(req,res)=>{
            const squery = {};
            const scursor = shipmentCollection.find(squery);
            const shipment = await scursor.toArray();
            res.send(shipment);
        } );

        // update user from form
        app.put('/shipment/:id', async(req,res)=>{
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = {upsert: true};
            const updateDoc = {
                $set:{
                    name: updatedUser.name,
                    email: updatedUser.email ,
                    city: updatedUser.city ,
                    address: updatedUser.address,
                    phoneno: updatedUser.phoneno
                },
            };
            const result = await shipmentCollection.updateOne(filter, updateDoc, options)
            console.log('updating user', id);
            res.json(result);
        } )

        // delete
        app.delete('/shipment/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id)};
            const result = await shipmentCollection.deleteOne(query);
            console.log('deleting user with id', id);
            res.json(result);
        } );

        // after delete load data
        app.get('/shipment/:id' , async(req, res)=>{
            const id = req.params.id;
            const query = { _id : new ObjectId(id) };
            const result = await shipmentCollection.findOne(query);
            res.send(result);
            console.log(result);
        })

    }

    finally{

    }
}

app.get('/', (req, res)=>{
    res.send(" hi from mongo db");
})

app.listen(port, ()=>{
    console.log(`listen from port ${port}`);
})

run().catch(err => console.log(err));