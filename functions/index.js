const crypto = require('crypto');
const express = require("express");
const cors = require("cors");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// app -scaffolding :
const app = express();

app.use(cors({origin:true}));

app.use(express.json())
// admin creadantial :

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// create database :

const db = admin.firestore();

// root api

app.get("/", (req, res) => {
  res.status(200).send({ success: true, msg: "successfully api" });
});

// ####    ####
// business api 
// ####    ####

// post todo to firebase database :

app.post("/todo",async(req,res)=>{
    try {
        await db.collection("todos").doc(`/${crypto.randomBytes(16).toString("hex")}/`).create({
            id:crypto.randomBytes(16).toString("hex"),
            title:req.body.title,
            description:req.body.description,
            priority:req.body.priority,
            completed:false,
            date:`${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`
        });
        res.status(200).send({success:true,msg:'todo save successfully'})
    } catch (err) {
        console.log(err);
        res.status(500).send({success:false,msg:err.message})        
    }
})

// get sepecific todo from firebase : 

app.get("/todo/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        const todo = (await db.collection("todos").doc(id).get()).data();
        res.status(200).send({success:true,data:todo})
    } catch (err) {
        console.log(err.messsage);
        res.status(500).send({success:true,msg:err.message});
    }
})

// get all todo from firebase :


app.get("/todo", async (req, res) => {
    try {
      const query = db.collection("todos");
      const response = [];
      await query.get().then((data) => {
        const docs = data.docs;
        docs.map((doc) => {
          const seletedDoc = {
            id:doc.data().id,
            title:doc.data().title,
            description:doc.data().description,
            priority:doc.data().priority,
            date:doc.data().date,
            completed:doc.data().completed
          };
          response.push(seletedDoc);
        });
        return response;
      });
      res.status(200).send({ success: true, data: response });
    } catch (err) {
      console.log(err);
      res.status(500).send({ success: false, msg:err.message });
    }
});

// update a pecific data 

app.put("/todo/:id",async(req,res)=>{

    try {
        const id = req.params.id;
        await db.collection("todos").doc(id).update({
          completed:true
        });
        res.status(200).send({success:true,msg:"update is successfull"});

    } catch (err) {
        console.log(err.message);
        res.status(500).send({success:false,msg:err.message})
    }
});

// delete a specifc data : 

app.delete("/todo/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        await db.collection("todos").doc(id).delete();

        res.status(200).send({success:true,msg:"delete is successfull"});

    } catch (err) {
        console.log(err.message);
        res.status(500).send({success:false,msg:err.message})
    }
})

exports.app = functions.https.onRequest(app);