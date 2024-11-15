import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import bodyParser from 'body-parser';
// import { registerMediator, activateHeartbeat } from 'openhim-mediator-utils';
// import mediatorConfig, { urn } from './mediatorConfig.json'
import dotenv from 'dotenv';

dotenv.config();

import tokenRoutes from './routes/ughub.js';
import patientRoutes from './routes/patients.js';
import encounterRoutes from './routes/encounter.js';
import observationRoutes from './routes/observation.js';
// import practitionerRoutes from './routes/practitioner.js';
// import patientConvertRoutes from './routes/patient.js';

const app = express();

// const openhimConfig = {
//     apiURL: process.env.OPENHIM_CORE_URL,
//     username: process.env.OPENHIM_USERNAME,
//     password: process.env.OPENHIM_PASSWORD,
//     trustSelfSigned: true,
//     urn
// };

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Route setup
app.use('/api/token', tokenRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/encounter', encounterRoutes);
app.use('/api/observation', observationRoutes);

// app.use('/api/patientcov', patientConvertRoutes);
// app.use('/api/practitioner', practitionerRoutes);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'}`);
    // activateHeartbeat(openhimConfig)
});

//Register the mediator with OpenHIM
// registerMediator(openhimConfig, mediatorConfig, (err) => {
//     if (err) {
//         console.error(`Failed to register mediator. Check your configuration. Error: ${err.message}`);
//         process.exit(1);
//     } else {
//         console.log('Successfully registered mediator with OpenHIM');
//     }
// });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled rejection: ${err.message}`);
    console.log('Shutting down the server due to unhandled promise rejection');
    server.close(() => {
        process.exit(1);
    });
});
