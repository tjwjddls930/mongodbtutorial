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
const MONGO_URI = 'mongodb+srv://jungin09307:Fetgew5CzlxPvqsP@mongodbtutorial.6brvvqo.mongodb.net/?retryWrites=true&w=majority'
const server = async() => {
    try{
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
            console.log('server listening on port 3000');
            // console.time("insert time:");
            // await generateFakeData(10, 2, 10);
            // console.timeEnd("insert time:");
        })
      
    } catch(err) {
        console.log(err)
    }
}

server();
