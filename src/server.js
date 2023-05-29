// import express from 'express';
// import * as express from './node_modules/express/lib/express';
// import { User } from './models/User';
const express = require('express');
const app = express();
const {userRouter, blogRouter, commentRouter} = require('./routes');
const mongoose = require('mongoose');
const { generateFakeData } = require('../faker2');
// import mongoose from 'mongoose';

// const users = [];

const server = async() => {
    try{
        const { MONGO_URI, PORT } = process.env;
        if(!MONGO_URI) throw new Error("MONGO_URI is required");
        if(!PORT) throw new Error("Port is required")
        await mongoose.connect(MONGO_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        // mongoose.set('debug', true)
        console.log('successfully connected to MongoDB!')
        app.use(express.json());
    
        app.use('/user', userRouter);
        app.use('/blog', blogRouter);
        app.use('/blog/:blogId/comment', commentRouter);

        app.listen(3000, async () => {
            console.log(`server listening on port ${PORT}`);
            // console.time("insert time:");
            // await generateFakeData(10, 2, 10);
            // console.timeEnd("insert time:");
        })
      
    } catch(err) {
        console.log(err)
    }
}

server();
