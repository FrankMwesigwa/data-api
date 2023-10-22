import express from "express";
import axios from 'axios';
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';
import {
    getPhoneNumber, getEmail, getMaritalStatus, getAddressExtensionValue, getIdentifierValue, addMaritalStatus
} from "../utils/checks.js";

const router = express.Router();

const serverUrl = 'http://165.232.114.52:8080/fhir';
const resourceType = 'Patient';
const uniqueId = uuidv4()

/**
 * @swagger
 * /patient:
 *   post:
 *     description: Create a new patient
 *     tags:
 *       - patient
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: stock
 *         description: Stock object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: new patient
 */
router.post("/", async (req, res) => {

    const {
        nationalId,
        eAFYAId,
        passport,
        patientId,
        surname,
        givenname,
        othername,
        email,
        phoneNumber,
        address,
        village,
        parish,
        county,
        subCounty,
        country,
        city,
        district,
        postalCode,
        gender,
        deceasedBoolean,
        maritialStatus,
        birthDate
    } = req.body;

    const patientResource = {
        resourceType: "Bundle",
        type: "batch",
        entry: [
            {
                resource: {
                    fullUrl: `urn:uuid:${uniqueId}`,
                    resourceType: "Patient",
                    id: uniqueId,
                    identifier: [
                        {
                            system: 'http://clientregistry.org/nationalId',
                            value: nationalId,
                            type: {
                                coding: [
                                    {
                                        system: "http://clientregistry.org/nationalId",
                                        code: "05a29f94-c0ed-11e2-94be"
                                    }
                                ],
                                text: "National ID No."
                            },
                        },
                        {
                            system: 'http://clientregistry.org/passport',
                            value: passport,
                            type: {
                                coding: [
                                    {
                                        system: "http://clientregistry.org/passport",
                                        code: "c0ed-11e2-94be-8c13b969e334"
                                    }
                                ],
                                text: "Passport"
                            },
                        },
                        {
                            system: 'http://clientregistry.org/eAFYA',
                            value: eAFYAId,
                            type: {
                                coding: [
                                    {
                                        system: "http://clientregistry.org/eAFYA",
                                        code: "11e2-94be-8c13b969e334"
                                    }
                                ],
                                text: "eAFYA System ID"
                            },
                        },
                        {
                            system: 'http://clientregistry.org/patientId',
                            value: patientId,
                            type: {
                                coding: [
                                    {
                                        system: "http://clientregistry.org/patientId",
                                        code: "94be-8c13b969e334"
                                    }
                                ],
                                text: "eAFYA Patient ID"
                            },
                        },
                    ],
                    active: true,
                    name: [
                        {
                            use: 'official',
                            family: surname,
                            given: [givenname, othername]
                        }
                    ],
                    gender: gender,
                    deceasedBoolean: deceasedBoolean,
                    birthDate: birthDate,
                    maritalStatus: addMaritalStatus(maritialStatus),
                    telecom: [
                        {
                            system: 'phone',
                            value: phoneNumber,
                            use: 'home',
                        },
                        {
                            system: 'email',
                            value: email,
                            use: 'home',
                        },
                    ],
                    address: [
                        {
                            use: 'home',
                            line: [address],
                            city: city,
                            district: district,
                            postalCode: postalCode,
                            country: country,
                            extension: [
                                {
                                    url: null,
                                    extension: [
                                        {
                                            url: "http://fhir.openmrs.org/ext/address#county",
                                            valueString: county
                                        },
                                        {
                                            url: "http://fhir.openmrs.org/ext/address#subcounty",
                                            valueString: subCounty
                                        },
                                        {
                                            url: "http://fhir.openmrs.org/ext/address#parish",
                                            valueString: parish
                                        },
                                        {
                                            url: "http://fhir.openmrs.org/ext/address#village",
                                            valueString: village
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                },
                request: {
                    method: "POST",
                    url: "Patient"
                }
            }
        ]
    }

    try {
        const response = await axios.post(`${serverUrl}`, patientResource, {
            headers: {
                'Content-Type': 'application/fhir+json',
            },
        });
        res.json({"message": "Patient Resource Created Successfully", response: response.data })
    } catch (error) {
        res.json({ "message": "Error Creating Patient Resource:", "error": error.message })
    }
});

/**
 * @swagger
 * /fhir:
 *   get:
 *     description: Retrieve the full list of patients
 *     tags:
 *       - Get All Patients FHIR Model
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Get All Patients FHIR Model
 */
router.get("/fhir", async (req, res) => {
    try {
        const response = await axios.get(`${serverUrl}/${resourceType}`);
        const patients = response.data.entry.map(entry => entry.resource);
        res.json(patients);
    } catch (error) {
        res.json({ "message": "Error While Creating Patient", error });
    }
});

const getPatientByNames = async (familyName, givenName) => {

    try {
        const response = await axios.get(`${serverUrl}/${resourceType}`, {
            params: {
                family: familyName,
                given: givenName,
            }
        });

        const patients = response.data.entry.map(entry => entry.resource);
        return patients;
    } catch (error) {
        throw new Error('Patient doesnt exit:', error);
    }
};

/**
 * @swagger
 * /search:
 *   get:
 *     description: Search Patient by FamilyName and GivenName
 *     tags:
 *       - Search Patient by FamilyName and GivenName
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: familyname
 *         description: first name of the patient
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Search Patient by FamilyName and GivenName
 */
router.get("/search", async (req, res) => {
    const { familyName, givenName } = req.query;

    try {
        const patients = await getPatientByNames(familyName, givenName);

        const mappedPatients = patients.map(patient => ({
            ugandaEMRId: getIdentifierValue(patient, "OpenMRS ID"),
            eAFYAId: getIdentifierValue(patient, "eAFYA System ID"),
            uniquePatientId: getIdentifierValue(patient, "Patient Unique  ID Code (UIC)"),
            patientId: getIdentifierValue(patient, "eAFYA Patient ID"),
            nationalId: getIdentifierValue(patient, "National ID No."),
            passport: getIdentifierValue(patient, "Passport"),
            surname: patient.name[0].family,
            givenName: patient.name[0].given[0],
            othername: patient.name[0].given[1] ? patient.name[0].given[1] : "",
            phoneNumber: getPhoneNumber(patient),
            email: getEmail(patient),
            gender: patient.gender ? patient.gender : "",
            birthDate: moment(patient.birthDate).format('YYYY-MM-DD'),
            deceased: patient.deceasedBoolean,
            maritalStatus: getMaritalStatus(patient),
            address: patient.address[0].line ? patient.address[0].line[0] : "",
            postalCode: patient.address[0].postalCode ? patient.address[0].postalCode : "",
            country: patient.address[0].country ? patient.address[0].country : "",
            city: patient.address[0].city ? patient.address[0].city : "",
            district: patient.address[0].district ? patient.address[0].district : "",
            county: getAddressExtensionValue(patient, "http://fhir.openmrs.org/ext/address#county"),
            subcounty: getAddressExtensionValue(patient, "http://fhir.openmrs.org/ext/address#subcounty"),
            parish: getAddressExtensionValue(patient, "http://fhir.openmrs.org/ext/address#parish"),
            village: getAddressExtensionValue(patient, "http://fhir.openmrs.org/ext/address#village")
        }));

        res.json(mappedPatients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default router;
