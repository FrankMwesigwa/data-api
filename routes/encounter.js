import express from "express";
import axios from "axios";

const router = express.Router();
const hapiFhirServerUrl = "https://hapi.devearea.com/hapi-fhir-jpaserver/fhir/Encounter";

router.post("/", async (req, res) => {
    try {
        const data = req.body;

        const fhirEncounterData = {
            resourceType: "Encounter",
            meta: {
                profile: [data.profileUrl]
            },
            status: data.status,
            class: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: data.classCode,
                display: data.classDisplay
            },
            type: [
                {
                    coding: [
                        {
                            system: "http://snomed.info/sct",
                            code: data.encounterTypeCode,
                            display: data.encounterTypeDisplay
                        }
                    ],
                    text: data.encounterTypeText
                }
            ],
            subject: {
                reference: `Patient/${data.patientId}`,
                display: data.patientName
            },
            participant: [
                {
                    type: [
                        {
                            coding: [
                                {
                                    system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                                    code: data.participantTypeCode,
                                    display: data.participantTypeDisplay
                                }
                            ],
                            text: data.participantTypeText
                        }
                    ],
                    individual: {
                        reference: `Practitioner/${data.practitionerId}`,
                        display: data.practitionerName
                    }
                }
            ],
            period: {
                start: data.periodStart,
                end: data.periodEnd
            },
            location: [
                {
                    location: {
                        reference: `Location/${data.locationId}`,
                        display: data.locationName
                    },
                    status: data.locationStatus
                }
            ],
            reasonCode: [
                {
                    coding: [
                        {
                            system: "http://snomed.info/sct",
                            code: data.reasonCodeCode,
                            display: data.reasonCodeDisplay
                        }
                    ],
                    text: data.reasonCodeText
                }
            ],
            diagnosis: [
                {
                    condition: {
                        reference: `Condition/${data.diagnosisConditionId}`,
                        display: data.diagnosisConditionName
                    },
                    use: {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/diagnosis-role",
                                code: data.diagnosisUseCode,
                                display: data.diagnosisUseDisplay
                            }
                        ],
                        text: data.diagnosisUseText
                    },
                    rank: data.diagnosisRank
                }
            ],
            serviceProvider: {
                reference: `Organization/${data.serviceProviderId}`,
                display: data.serviceProviderName
            },
            hospitalization: {
                admitSource: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/admit-source",
                            code: data.admitSourceCode,
                            display: data.admitSourceDisplay
                        }
                    ],
                    text: data.admitSourceText
                },
                dischargeDisposition: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/discharge-disposition",
                            code: data.dischargeDispositionCode,
                            display: data.dischargeDispositionDisplay
                        }
                    ],
                    text: data.dischargeDispositionText
                }
            }
        };

        const response = await axios.post(hapiFhirServerUrl, fhirEncounterData, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error posting to HAPI FHIR server:", error.message);
        res.status(500).json({ error: "Failed to post encounter data to HAPI FHIR server" });
    }
});

export default router;
