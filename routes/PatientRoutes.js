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
    } = req.body

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
                            type: {
                                coding: [
                                    {
                                        system: "http://clientregistry.org/nationalId",
                                        code: "05a29f94-c0ed-11e2-94be"
                                    }
                                ],
                                text: "National ID No."
                            },
                            value: nationalId
                        },
                        {
                            system: 'http://clientregistry.org/passport',
                            type: {
                                coding: [
                                    {
                                        system: "http://clientregistry.org/passport",
                                        code: "c0ed-11e2-94be-8c13b969e334"
                                    }
                                ],
                                text: "Passport"
                            },
                            value: passport
                        },
                        {
                            system: 'http://clientregistry.org/eAFYA',
                            type: {
                                coding: [
                                    {
                                        system: "http://clientregistry.org/eAFYA",
                                        code: "11e2-94be-8c13b969e334"
                                    }
                                ],
                                text: "eAFYA System ID"
                            },
                            value: eAFYAId
                        },
                        {
                            system: 'http://clientregistry.org/patientId',
                            type: {
                                coding: [
                                    {
                                        system: "http://clientregistry.org/patientId",
                                        code: "94be-8c13b969e334"
                                    }
                                ],
                                text: "eAFYA Patient ID"
                            },
                            value: patientId
                        },
                    ],
                    active: true,
                    name: [
                        {
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
                            value: phoneNumber
                        },
                        {
                            system: 'email',
                            value: email
                        },
                    ],
                    address: [
                        {
                            line: [address],
                            city: city,
                            district: district,
                            postalCode: postalCode,
                            country: country,
                            extension: [
                                {
                                    url: '',
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
        const response = await axios.post(`${serverUrl}`, patientResource);
        res.json({ "message": "Patient Resource Created Successfully", response: response.data })
    } catch (error) {
        res.json({ "message": "Error Creating Patient Resource:", "error": error.message })
    }
});

router.get("/fhir", async (req, res) => {
    try {
        const response = await axios.get(`${serverUrl}/${resourceType}`);
        const patients = response.data.entry.map(entry => entry.resource);
        res.json(patients);
    } catch (error) {
        res.json({ "message": "Error While Creating Patient", error });
    }
});

const getPatientByNames = async (familyName, givenName, birthDate, phoneNumber, id, NationalID, PatientId, uniquePatientId) => {

    try {
        const params = {};

        if (familyName) {
            params.family = familyName;
        }

        if (givenName) {
            params.given = givenName;
        }

        if (birthDate) {
            params.birthdate = birthDate;
        }

        if (phoneNumber) {
            params.telecom = phoneNumber;
        }

        if (id) {
            params._id = id;
        }

        if (PatientId) {
            params.identifier = `http://clientregistry.org/patientId|${PatientId}`
        }

        if (uniquePatientId) {
            params.identifier = `UgandaEMR|${uniquePatientId}`
        }

        const response = await axios.get(`${serverUrl}/${resourceType}`, {
            params: params
        });

        const patients = response.data.entry.map(entry => entry.resource);
        return patients;
    } catch (error) {
        throw new Error('Patient doesnt exit:', error);
    }
};

router.get("/search", async (req, res) => {
    const { familyName, givenName, birthDate, phoneNumber, id, NationalID, PatientId, uniquePatientId } = req.query;

    try {
        const patients = await getPatientByNames(familyName, givenName, birthDate, phoneNumber, id,
            NationalID, PatientId, uniquePatientId);

        const mappedPatients = patients.map(patient => ({
            id: patient._id,
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
