import express from "express";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const HAPI_FHIR_SERVER_URL = 'http://hapi.fhir.org/baseR4';
const serverUrl = 'https://hris5.health.go.ug/hapi/fhir';
const uniqueId = uuidv4()

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
    const normalPatient = req.body;

    console.log(req.body)

    const fhirPatient = convertToFhirPatient(normalPatient);
    console.log('Converted FHIR Patient:', JSON.stringify(fhirPatient, null, 2));

    try {
        const response = await axios.post('https://mediator-api-staging.health.go.ug/json', fhirPatient, {
            headers: { 'Content-Type': 'application/fhir+json' }
        });

        res.status(201).json({ message: 'FHIR Patient Resource Created', data: response.data });

    } catch (error) {
        console.error('Error converting Patient to FHIR:', error.message);

        res.status(500).json({ error: 'Failed to create FHIR Patient resource', details: error.message });
    }

});

// Function to convert health worker JSON to Practitioner FHIR resource
function convertToFhirPractitioner(healthWorker) {
    return {
        resourceType: 'Practitioner',
        id: healthWorker.id,
        active: true,
        name: [{
            use: 'official',
            family: healthWorker.lastName,
            given: [healthWorker.firstName]
        }],
        telecom: [
            {
                system: 'phone',
                value: healthWorker.phoneNumber,
                use: 'work'
            },
            {
                system: 'email',
                value: healthWorker.email,
                use: 'work'
            }
        ],
        address: [{
            use: 'home',
            line: [healthWorker.address],
            city: healthWorker.city,
            state: healthWorker.state,
            postalCode: healthWorker.postalCode,
            country: healthWorker.country
        }],
        gender: healthWorker.gender,
        birthDate: healthWorker.birthDate
    };
}

// Function to convert Practitioner FHIR resource to simplified JSON
function convertToSimpleJson(practitioner) {
    const name = practitioner.name && practitioner.name.length > 0 ? practitioner.name[0] : {};
    const telecom = practitioner.telecom || [];
    const address = practitioner.address && practitioner.address.length > 0 ? practitioner.address[0] : {};

    let phoneNumber = '';
    let email = '';

    telecom.forEach(t => {
        if (t.system === 'phone') {
            phoneNumber = t.value;
        } else if (t.system === 'email') {
            email = t.value;
        }
    });

    return {
        id: practitioner.id,
        firstName: name.given ? name.given.join(' ') : '',
        lastName: name.family || '',
        phoneNumber: phoneNumber || '',
        email: email || '',
        address: address.line ? address.line.join(' ') : '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || '',
        gender: practitioner.gender || '',
        birthDate: practitioner.birthDate || ''
    };
}

// API endpoint to receive health worker data and post to HAPI FHIR
router.post('/', async (req, res) => {
    try {
        const healthWorker = req.body;

        // Convert to FHIR Practitioner resource
        const fhirPractitioner = convertToFhirPractitioner(healthWorker);

        // Post the Practitioner resource to HAPI FHIR server
        const response = await axios.post(`${HAPI_FHIR_SERVER_URL}/Practitioner`, fhirPractitioner, {
            headers: {
                'Content-Type': 'application/fhir+json'
            }
        });

        res.status(201).json({ message: 'Practitioner created successfully', data: response.data });
    } catch (error) {
        res.status(500).json({ message: 'Error creating Practitioner', error: error.message });
    }
});

// API Endpoint to fetch and convert Practitioner resources from HAPI FHIR
router.get('/worker', async (req, res) => {
    try {
        // Fetch Practitioner resources from HAPI FHIR server
        const response = await axios.get(`${HAPI_FHIR_SERVER_URL}/Practitioner`, {
            headers: {
                'Accept': 'application/fhir+json'
            }
        });

        // Convert each Practitioner resource to simplified JSON
        const practitioners = response.data.entry.map(entry => convertToSimpleJson(entry.resource));

        res.status(200).json(practitioners);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Practitioners', error: error.message });
    }
});

export default router;