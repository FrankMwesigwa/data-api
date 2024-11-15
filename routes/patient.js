import express from 'express';
import axios from 'axios';
import mediatorUtils from 'openhim-mediator-utils';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// OpenHIM instance
const openhimConfig = {
    apiURL: process.env.OPENHIM_API_URL,
    username: process.env.OPENHIM_USERNAME,
    password: process.env.OPENHIM_PASSWORD,
    trustSelfSigned: true,
};

// Convert normal patient JSON to FHIR Patient resource
function convertToFhirPatient(normalPatient) {
    return {
        resourceType: 'Patient',
        id: normalPatient.id,
        name: [
            {
                use: 'official',
                family: normalPatient.lastName,
                given: [normalPatient.firstName]
            }
        ],
        gender: normalPatient.gender,
        birthDate: normalPatient.birthDate,
        address: [
            {
                use: 'home',
                line: [normalPatient.address],
                city: normalPatient.city,
                state: normalPatient.state,
                postalCode: normalPatient.postalCode,
                country: normalPatient.country
            }
        ],
        telecom: [
            {
                system: 'phone',
                value: normalPatient.phoneNumber,
                use: 'mobile'
            }
        ]
    };
}

router.post("/t", async (req, res) => {
    console.log(req.body)

});

router.post('/med', async (req, res) => {
    // const normalPatient = req.body;

    console.log(req.body)

    // const fhirPatient = convertToFhirPatient(normalPatient);
    // console.log('Converted FHIR Patient:', JSON.stringify(fhirPatient, null, 2));

    // try {
    //     const response = await axios.post(`process.env.OPENHIM_API_URL/${echo}`, fhirPatient, {
    //         headers: { 'Content-Type': 'application/fhir+json' }
    //     });

    //     // Update OpenHIM with a successful status
    //     await mediatorUtils.authenticate(openhimConfig, async () => {
    //         await mediatorUtils.log(openhimConfig, {
    //             message: 'Patient FHIR conversion successful',
    //             status: 'Successful',
    //             response: response.data,
    //         });
    //     });

    //     // Respond to the client
    //     res.status(201).json({ message: 'FHIR Patient Resource Created', data: response.data });

    // } catch (error) {
    //     console.error('Error converting Patient to FHIR:', error.message);

    //     // Log error to OpenHIM
    //     await mediatorUtils.authenticate(openhimConfig, async () => {
    //         await mediatorUtils.log(openhimConfig, {
    //             message: 'Patient FHIR conversion failed',
    //             status: 'Failed',
    //             response: error.message,
    //         });
    //     });

    //     res.status(500).json({ error: 'Failed to create FHIR Patient resource', details: error.message });
    // }
});

export default router;