import express from "express";
import axios from "axios";

const router = express.Router();
const hapiFhirServerUrl = "https://hapi.devearea.com/hapi-fhir-jpaserver/fhir/Patient";

router.post("/", async (req, res) => {
    try {
        const data = req.body;

        const fhirPatient = {
            resourceType: "Patient",
            meta: {
                profile: [data.profileUrl]
            },
            identifier: [
                {
                    system: 'http://clientregistry.org/nationalId',
                    type: {
                        coding: [{
                            system: "http://clientregistry.org/nationalId",
                            code: "05a29f94-c0ed-11e2-94be"
                        }],
                        text: "National ID No."
                    },
                    value: data.nationalId
                },
                {
                    system: 'http://clientregistry.org/passport',
                    type: {
                        coding: [{
                            system: "http://clientregistry.org/passport",
                            code: "c0ed-11e2-94be-8c13b969e334"
                        }],
                        text: "Passport"
                    },
                    value: data.passport
                },
                {
                    system: 'http://clientregistry.org/eAFYA',
                    type: {
                        coding: [{
                            system: "http://clientregistry.org/eAFYA",
                            code: "11e2-94be-8c13b969e334"
                        }],
                        text: "eAFYA System ID"
                    },
                    value: data.eAFYAId
                },
                {
                    system: 'http://clientregistry.org/patientId',
                    type: {
                        coding: [{
                            system: "http://clientregistry.org/patientId",
                            code: "94be-8c13b969e334"
                        }],
                        text: "eAFYA Patient ID"
                    },
                    value: data.patientId
                },
            ],
            active: data.active,
            name: [
                {
                    given: data.nameGiven,
                    family: data.nameFamily,
                    suffix: data.nameSuffix
                }
            ],
            telecom: [
                {
                    system: data.telecomSystem,
                    value: data.telecomValue,
                    use: data.telecomUse
                }
            ],
            gender: data.gender,
            birthDate: data.birthDate,
            address: [
                {
                    line: data.addressLine,
                    city: data.addressCity,
                    state: data.addressState,
                    postalCode: data.addressPostalCode,
                    country: data.addressCountry,
                    extension: [
                        {
                            url: "http://example.org/fhir/StructureDefinition/address-county",
                            valueString: data.addressCounty
                        },
                        {
                            url: "http://example.org/fhir/StructureDefinition/address-subCounty",
                            valueString: data.addressSubCounty
                        },
                        {
                            url: "http://example.org/fhir/StructureDefinition/address-parish",
                            valueString: data.addressParish
                        },
                        {
                            url: "http://example.org/fhir/StructureDefinition/address-village",
                            valueString: data.addressVillage
                        }
                    ]
                }
            ],
            maritalStatus: {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
                        code: data.maritalStatusCode,
                        display: data.maritalStatusDisplay
                    }
                ]
            },
        };

        const response = await axios.post(hapiFhirServerUrl, fhirPatient, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error posting to HAPI FHIR server:", error.message);
        res.status(500).json({ error: "Failed to post patient data to HAPI FHIR server" });
    }
});

export default router;