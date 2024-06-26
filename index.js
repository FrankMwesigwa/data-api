import express from 'express';
import cors from "cors";
import logger from 'morgan';
import bodyParser from 'body-parser';

import dotenv from "dotenv";

dotenv.config();

import patientRoutes from './routes/PatientRoutes.js';
import tokenRoutes from './routes/ughub.js'
const app = express()
//connection();

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/patient", patientRoutes);
app.use("/api/token", tokenRoutes);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is connected on port ${process.env.PORT} in ${process.env.NODE_ENV}`);
});

process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.message}`)
    console.log('Shutting down the server due to unhandled promise rejection')
    server.close(() => {
        process.exit(1)
    })
})