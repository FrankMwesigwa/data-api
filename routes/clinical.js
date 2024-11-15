import express from "express";
import axios from 'axios';
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const patientId = "A01053";

const serverUrl = 'https://hapi-dev.health.go.ug/fhir';
const resourceType = 'Patient';
const uniqueId = uuidv4()

// 1. Create Patient resource
const patientResource = {
    resourceType: "Patient",
    id: patientId,
    identifier: [{ system: "http://health.go.ug/patients", value: patientId }],
    name: [{ family: "Frank", given: ["John"] }],
    gender: "male",
    birthDate: "1980-01-01",
    address: [{ line: ["123 Main St"], city: "Kampala", country: "Uganda" }]
};

// 2. Create AllergyIntolerance resource
const allergyResource = {
    resourceType: "AllergyIntolerance",
    patient: { reference: `Patient/${patientId}` },
    substance: { text: "Penicillin" },
    criticality: "high",
    reaction: [{ manifestation: [{ text: "Rash" }] }]
};

// 3. Create MedicationStatement resource 
const medicationResource = {
    resourceType: "MedicationStatement",
    patient: { reference: `Patient/${patientId}` },
    medicationCodeableConcept: { text: "ART - Efavirenz/Emtricitabine/Tenofovir" },
    status: "active",
    dosage: [{ text: "1 tablet daily" }]
};


// 4. Create Condition resource for HIV diagnosis
const conditionResource = {
    resourceType: "Condition",
    patient: { reference: `Patient/${patientId}` },
    code: { text: "HIV positive" },
    clinicalStatus: { text: "active" },
    onsetDateTime: "2005-06-15"
};

// 5. Create Observation resource for CD4 count
const observationResource = {
    resourceType: "Observation",
    patient: { reference: `Patient/${patientId}` },
    code: { text: "CD4 Count" },
    valueQuantity: { value: 350, unit: "cells/µL" },
    status: "final",
    effectiveDateTime: "2024-10-01"
};

router.post("/", async (req, res) => {

    const {
        nationalId,
        eAFYAId,
        passport,
        patientId,

    } = req.body

    try {
        const response = await axios.post(`${serverUrl}`, patientResource);
        res.json({ "message": "Patient Resource Created Successfully", response: response.data })
    } catch (error) {
        res.json({ "message": "Error Creating Patient Resource:", "error": error.message })
    }
});

// Function to send the FHIR resource to SHR Server
async function sendFHIRResource(resource, resourceType) {
    try {
        const response = await axios.post(`${FHIR_BASE_URL}/${resourceType}`, resource, {
            headers: { 'Content-Type': 'application/fhir+json' }
        });
        console.log(`${resourceType} sent:`, response.data);
    } catch (error) {
        console.error(`Error sending ${resourceType}:`, error.response ? error.response.data : error.message);
    }
}

// POST send all FHIR resources for the Sharable Health Record use case
router.post('/patient/shr', async (req, res) => {
    try {
        // Send each resource to the FHIR server
        await sendFHIRResource(patientResource, 'Patient');
        await sendFHIRResource(allergyResource, 'AllergyIntolerance');
        await sendFHIRResource(medicationResource, 'MedicationStatement');
        await sendFHIRResource(conditionResource, 'Condition');
        await sendFHIRResource(observationResource, 'Observation');

        res.status(200).json({ message: "All resources sent successfully for SHR" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send FHIR resources", details: error.message });
    }
});

export default router;
