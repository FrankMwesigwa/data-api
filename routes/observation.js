import express from "express";
import axios from "axios";

const router = express.Router();
const hapiFhirServerUrl = "https://hapi.devearea.com/hapi-fhir-jpaserver/fhir/Observation";

router.post("/", async (req, res) => {
    try {
        const data = req.body;

        const fhirObservation = {
            resourceType: "Observation",
            meta: {
                profile: [data.profileUrl]
            },
            status: data.status,
            category: [
                {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/observation-category",
                            code: data.categoryCode,
                            display: data.categoryDisplay
                        }
                    ],
                    text: data.categoryText
                }
            ],
            code: {
                coding: [
                    {
                        system: data.codeSystem,
                        code: data.codeCode,
                        display: data.codeDisplay
                    }
                ],
                text: data.codeText
            },
            subject: {
                reference: `Patient/${data.patientId}`,
                display: data.patientName
            },
            encounter: {
                reference: `Encounter/${data.encounterId}`,
                display: data.encounterDisplay
            },
            effectiveDateTime: data.effectiveDateTime,
            issued: data.issued,
            performer: [
                {
                    reference: `Practitioner/${data.performerId}`,
                    display: data.performerName
                }
            ],
            valueQuantity: {
                value: data.valueQuantityValue,
                unit: data.valueQuantityUnit,
                system: "http://unitsofmeasure.org",
                code: data.valueQuantityCode
            },
            interpretation: [
                {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                            code: data.interpretationCode,
                            display: data.interpretationDisplay
                        }
                    ],
                    text: data.interpretationText
                }
            ],
            referenceRange: [
                {
                    low: {
                        value: data.referenceRangeLowValue,
                        unit: data.referenceRangeLowUnit,
                        system: "http://unitsofmeasure.org",
                        code: data.referenceRangeLowCode
                    },
                    high: {
                        value: data.referenceRangeHighValue,
                        unit: data.referenceRangeHighUnit,
                        system: "http://unitsofmeasure.org",
                        code: data.referenceRangeHighCode
                    },
                    text: data.referenceRangeText
                }
            ],
            component: data.components.map(component => ({
                code: {
                    coding: [
                        {
                            system: component.componentCodeSystem,
                            code: component.componentCodeCode,
                            display: component.componentCodeDisplay
                        }
                    ],
                    text: component.componentCodeText
                },
                valueQuantity: {
                    value: component.componentValueQuantityValue,
                    unit: component.componentValueQuantityUnit,
                    system: "http://unitsofmeasure.org",
                    code: component.componentValueQuantityCode
                }
            }))
        };

        const response = await axios.post(hapiFhirServerUrl, fhirObservation, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error posting to HAPI FHIR server:", error.message);
        res.status(500).json({ error: "Failed to post observation data to HAPI FHIR server" });
    }
});

export default router;