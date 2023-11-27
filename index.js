const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@assignment12.0fsxszk.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// const verifyToken = async (req, res, next) =>{
//   const token = req.cookies?.token;
//   if(!token){
//     return res.status(401).send({message: 'unauthorized access'})
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if(err){
//       return res.status(401).send({message: 'unauthorized access'})
//     }
//     req.user = decoded;
//     next();
//   })
// }


// const signer = async (req, res, next) => {
//   console.log('call:', req.host, req.originalUrl)
//   next();
// }



async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7) await
        client.connect();

        // const addedJob = client.db('jobDb').collection('job');
        // const orderBid = client.db('jobDb').collection('bid');
        const addAdmin = client.db('adminDb').collection('admin');
        const addUser = client.db('usersDb').collection('user');
        const addTrainer = client.db('trainersDb').collection('trainer');
        const addForum = client.db('forumDb').collection('forum');
        const addClass = client.db('classDb').collection('class');

        // auth related api jwt 
        // app.post('/jwt', async (req, res) => {
        //     const user = req.body;
        //     console.log(user);
        //     const token = jwt.sign(user, 'process.env.ACCESS_TOKEN_SECRET', { expiresIn: '1h' })
        //     res
        //         .cookie('token', token, {
        //             httpOnly: true,
        //             secure: process.env.NODE_ENV === 'production',
        //             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        //         })
        //         .send({ success: true })
        // })

        // secure: process.env.NODE_ENV === 'production', 
        // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

        // app.post('/jwt', async (req, res) => {
        //     const signInUser = req.body;
        //     console.log(signInUser);
        //     const token = jwt.sign(signInUser, 'process.env.ACCESS_TOKEN_SECRET', { expiresIn: '1h' })
        //     res
        //         .cookie('token', token, {
        //             httpOnly: true,
        //             secure: process.env.NODE_ENV === 'production',
        //             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        //         })
        //         .send({ success: true })
        // })

        // app.get('/webCategory', async (req, res) => {
        //     const cursor = addedJob.find({ category: "Web Design and Development" });
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })
        // app.get('/graphicsCategory', async (req, res) => {
        //     const cursor = addedJob.find({ category: "Graphics Design" });
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })
        // app.get('/marketingCategory', async (req, res) => {
        //     const cursor = addedJob.find({ category: "Digital Marketing" });
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })

        // app.get('/Jobs', async (req, res) => {
        //     console.log(req.query.email)
        //     let query = {};
        //     if (req.query?.email) {
        //         query = { email: req.query.email }
        //     }
        //     const cursor = addedJob.find(query);
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })


        app.post('/users', async (req, res) => {
            const newUser =req.body;
            console.log(newUser)
            const result = await addUser.insertOne(newUser);
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const cursor = addUser.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) };
            const result = await addUser.deleteOne(query);
            res.send(result)
        })
        // Trainers 
        app.post('/trainers', async (req, res) => {
            const newTrainer =req.body;
            console.log(newTrainer)
            const result = await addTrainer.insertOne(newTrainer);
            res.send(result)
        })
        app.get('/trainers', async (req, res) => {
            const cursor = addTrainer.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // Blog section
        app.post('/forums', async (req, res) => {
            const newBlog =req.body;
            console.log(newBlog)
            const result = await addForum.insertOne(newBlog);
            res.send(result)
        })
        app.get('/forums', async (req, res) => {
            const cursor = addForum.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Class Section
        app.post('/classes', async (req, res) => {
            const newClass =req.body;
            console.log(newClass)
            const result = await addClass.insertOne(newClass);
            res.send(result)
        })
        app.get('/classes', async (req, res) => {
            const cursor = addClass.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // app.get('/jobs/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const result = await addedJob.findOne(query);
        //     res.send(result)
        // })

        // up to date jobs 

        // app.put('/jobs/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const options = { upsert: true };
        //     const updateJob = req.body;
        //     const job = {
        //         $set: {
        //             title: updateJob.title,
        //             photo: updateJob.photo,
        //             minimumPrice: updateJob.minimumPrice,
        //             maximumPrice: updateJob.maximumPrice,
        //             category: updateJob.category,
        //             deadline: updateJob.deadline,
        //             Description: updateJob.Description
        //         }
        //     }
        //     const result = await addedJob.updateOne(filter, job, options);
        //     res.send(result)
        // })

        // delete crud operation 

        // app.delete('/jobs/:id', async (req, res) => {
        //     const id = req.params.id;
        //     console.log(id)
        //     const query = { _id: new ObjectId(id) };
        //     const result = await addedJob.deleteOne(query);
        //     res.send(result)
        // })


        // app.get('/bids', async (req, res) => {
        //     console.log(req.query.email)
        //     console.log('got token from client site', req.cookies.token)
        //     let query = {};
        //     if (req.query?.email) {
        //         query = { email: req.query.email }
        //     }
        //     const cursor = orderBid.find(query);
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })

        // app.get('/bids/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const result = await orderBid.findOne(query);
        //     res.send(result)
        // })

        // app.patch('/bids/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const updateBid = req.body;
        //     console.log(updateBid);
        //     const updateDoc = {
        //         $set: {
        //             status: updateBid.status
        //         },
        //     };
        //     const result = await orderBid.updateOne(query, updateDoc);
        //     res.send(result)
        // })

        // app.patch('/bids/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const updateBidReject = req.body;
        //     console.log(updateBid);
        //     const updateDoc = {
        //         $set: {
        //             status: updateBidReject.reject
        //         },
        //     };
        //     const result = await orderBid.updateOne(query, updateDoc);
        //     res.send(result)
        // })

        // app.patch('/bids/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const updateComplete = req.body;
        //     console.log(updateBid);
        //     const updateDoc = {
        //         $set: {
        //             status: updateComplete.complete
        //         },
        //     };
        //     const result = await orderBid.updateOne(query, updateDoc);
        //     res.send(result)
        // })

        // app.delete('/bids/:id', async (req, res) => {
        //     const id = req.params.id;
        //     console.log(id)
        //     const query = { _id: new ObjectId(id) };
        //     const result = await orderBid.deleteOne(query);
        //     res.send(result)
        // })



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
    res.send("The assignment-12 server is running")
})

app.listen(port, () => {
    console.log(`The Port is : ${port}`)
})
