import express from "express";
import axios from 'axios';
import moment from "moment";

const router = express.Router();

const patientId = "A01053";
const serverUrl = 'https://hapi-dev.health.go.ug/fhir';

router.post("/", async (req, res) => {

    // Extract incoming data from request body
    const reportData = req.body;

    // Construct the FHIR DiagnosticReport Resource
    const fhirDiagnosticReport = {
        resourceType: "DiagnosticReport",
        id: reportData.id || null,
        status: reportData.status || "final",
        category: reportData.category ? {
            coding: [{
                system: "http://terminology.hl7.org/CodeSystem/report-category",
                code: reportData.category.code,
                display: reportData.category.display
            }]
        } : null,
        code: {
            coding: [{
                system: "http://loinc.org",
                code: reportData.code.code || "UNKNOWN",
                display: reportData.code.display || "Diagnostic Report"
            }]
        },
        subject: {
            reference: `Patient/${reportData.patientId}`
        },
        encounter: {
            reference: `Encounter/${reportData.encounterId}`
        },
        effectiveDateTime: reportData.effectiveDateTime || new Date().toISOString(),
        issued: reportData.issued || new Date().toISOString(),
        performer: reportData.performer ? reportData.performer.map(performer => ({
            reference: `Practitioner/${performer.id}`,
            display: performer.display
        })) : [],
        result: reportData.results ? reportData.results.map(result => ({
            reference: `Observation/${result.observationId}`,
            display: result.display
        })) : [],
        conclusion: reportData.conclusion || null,
        conclusionCode: reportData.conclusionCode ? [{
            coding: [{
                system: "http://snomed.info/sct",
                code: reportData.conclusionCode.code,
                display: reportData.conclusionCode.display
            }]
        }] : []
    };

    // Send the FHIR DiagnosticReport Resource as a response
    res.json(fhirDiagnosticReport);
});

export default router;