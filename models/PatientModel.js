import mongoose from "mongoose";

const schema = mongoose.Schema;

const patientSchema = new schema(
    {
        nationalId: { type: String },
        ugandaEMRId: { type: String },
        eAFYAId: { type: String },
        clinicMasterId: { type: String },
        uniqueId: { type: String },
        passport: { type: String },
        patientId: { type: String },
        systemId: { type: String },
        surname: { type: String },
        givenname: { type: String },
        othername: { type: String },
        email: { type: String },
        phoneNumber: { type: String },
        address: { type: String },
        village: { type: String },
        parish: { type: String },
        subCounty: { type: String },
        country: { type: String },
        city: { type: String },
        district: { type: String },
        postalCode: { type: String },
        gender: { type: String },
        deceased: { type: Boolean },
        maritialStatus: { type: String },
        birthDate: {type: String},
    },
    { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
