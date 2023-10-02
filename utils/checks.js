
export const getPhoneNumber = (patient) => {
    const phoneContact = patient.telecom ? patient.telecom.find(contact => contact.system === "phone") : "";
    return phoneContact ? phoneContact.value : '';
}

export const getEmail = (patient) => {
    const emailContact = patient.telecom ? patient.telecom.find(contact => contact.system === "email") : "";
    return emailContact ? emailContact.value : '';
}

export const getPassport = (patient) => {
    const passport = patient.identifier.find(p => p.system === "http://clientregistry/passport-identifier");
    return passport ? passport.value : '';
}

export const getNationalId = (patient) => {
    const nationalId = patient.identifier.find(p => p.system === "http://clientregistry/nationalId-identifier");
    return nationalId ? nationalId.value : '';
}

export const getPatientId = (patient) => {
    const patientId = patient.identifier.find(p => p.system === "http://clientregistry/patientId-identifier");
    return patientId ? patientId.value : '';
}

export const getUniqueId = (patient) => {
    const uniqueId = patient.identifier.find(p => p.system === "http://clientregistry/uniqueId-identifier");
    return uniqueId ? uniqueId.value : '';
}

export const getSystemId = (patient) => {
    const systemId = patient.identifier.find(p => p.system === "http://clientregistry/systemId-identifier");
    return systemId ? systemId.value : '';
}

export const getValueFromExtension = (patient, extensionUrl) => {
    const extension = patient.extension.find(ext => ext.url === extensionUrl);
    return extension && extension.valueString;
}

export const getMaritalStatus = (patient) => {
    const maritalStatus = patient.maritalStatus;
    if (maritalStatus && maritalStatus.coding && maritalStatus.coding.length > 0) {
        return maritalStatus.coding[0].display;
    }
    return "";
}

export const getAddressExtensionValue = (patient, extensionUrl) => {
    const address = patient.address &&
        patient.address[0] &&
        patient.address[0].extension &&
        patient.address[0].extension[0] &&
        patient.address[0].extension[0].extension &&
        patient.address[0].extension[0].extension.find(ext => ext.url === extensionUrl);

    return address ? address.valueString : "";
}

export const getIdentifierValue = (patient, text) => {
    const ids = patient.identifier;
    const identifier = ids.find(d => d.type && d.type.text === text);
    return identifier ? identifier.value : "";
}

export const addMaritalStatus = (status) => {
    let maritalStatus = {};

    switch (status) {
        case 'married':
            maritalStatus = {
                coding: [
                    {
                        system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
                        code: 'M',
                        display: 'Married'
                    }
                ]
            };
            break;
        case 'single':
            maritalStatus = {
                coding: [
                    {
                        system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
                        code: 'S',
                        display: 'Single'
                    }
                ]
            };
            break;
        case 'divorced':
            maritalStatus = {
                coding: [
                    {
                        system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
                        code: 'D',
                        display: 'Divorced'
                    }
                ]
            };
            break;
        default:
            console.error('Invalid marital status provided.');
    }

    return maritalStatus;
}





