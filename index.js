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
    origin: ['https://harmonious-snickerdoodle-cc7afa.netlify.app'],
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
        // jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })

        // middlewares 
        const verifyToken = (req, res, next) => {
            // console.log('inside verify token', req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'unauthorized access' });
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'unauthorized access' })
                }
                req.decoded = decoded;
                next();
            })
        }

        // use verify admin after verifyToken
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await addUser.findOne(query);
            const isAdmin = user?.role === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            next();
        }

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
        // users related api
    // app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
    //     const result = await addUser.find().toArray();
    //     res.send(result);
    //   });
  
      app.get('/users/admin/:email', verifyToken, async (req, res) => {
        const email = req.params.email;
  
        if (email !== req.decoded.email) {
          return res.status(403).send({ message: 'forbidden access' })
        }
  
        const query = { email: email };
        const user = await addUser.findOne(query);
        let admin = false;
        if (user) {
          admin = user?.role === 'admin';
        }
        res.send({ admin });
      })
  
      app.post('/users', async (req, res) => {
        const user = req.body;
        // insert email if user doesnt exists: 
        // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
        const query = { email: user.email }
        const existingUser = await addUser.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await addUser.insertOne(user);
        res.send(result);
      });
  
      app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: 'admin'
          }
        }
        const result = await addUser.updateOne(filter, updatedDoc);
        res.send(result);
      })
  
      app.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await addUser.deleteOne(query);
        res.send(result);
      })

    //   amer 
    app.get('/trainers/trainer/:email', verifyToken, async (req, res) => {
        const email = req.params.email;
  
        if (email !== req.decoded.email) {
          return res.status(403).send({ message: 'forbidden access' })
        }
  
        const query = { email: email };
        const user = await addTrainer.findOne(query);
        let trainer = false;
        if (user) {
            trainer = user?.status === 'confirm';
        }
        res.send({ trainer });
      })
        // app.post('/users', async (req, res) => {
        //     const newUser = req.body;
        //     console.log(newUser)
        //     const result = await addUser.insertOne(newUser);
        //     res.send(result)
        // })
        app.get('/users', async (req, res) => {
            const cursor = addUser.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // app.delete('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     console.log(id)
        //     const query = { _id: new ObjectId(id) };
        //     const result = await addUser.deleteOne(query);
        //     res.send(result)
        // })
        // Trainers 
        app.post('/trainers', async (req, res) => {
            const newTrainer = req.body;
            console.log(newTrainer)
            const result = await addTrainer.insertOne(newTrainer);
            res.send(result)
        })
        app.get('/trainers', async (req, res) => {
            const cursor = addTrainer.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/trainers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await addTrainer.findOne(query);
            res.send(result)
        })
        app.patch('/trainers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateTrainer = req.body;
            console.log(updateTrainer);
            const updateDoc = {
                $set: {
                    status: updateTrainer.status
                },
            };
            const result = await addTrainer.updateOne(query, updateDoc);
            res.send(result)
        })
        app.patch('/trainers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateReject = req.body;
            console.log(updateReject);
            const updateDoc = {
                $set: {
                    status: updateReject.reject
                },
            };
            const result = await addTrainer.updateOne(query, updateDoc);
            res.send(result)
        })
        // Blog section
        app.post('/forums', async (req, res) => {
            const newBlog = req.body;
            console.log(newBlog)
            const result = await addForum.insertOne(newBlog);
            res.send(result)
        })
        app.get('/forums', async (req, res) => {
            const cursor = addForum.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/forums/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await addForum.findOne(query);
            res.send(result)
        })

        // Class Section
        app.post('/classes', async (req, res) => {
            const newClass = req.body;
            console.log(newClass)
            const result = await addClass.insertOne(newClass);
            res.send(result)
        })
        app.get('/classes', async (req, res) => {
            const cursor = addClass.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/classes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await addClass.findOne(query);
            res.send(result)
        })

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
