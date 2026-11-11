const validatorLibrary = require("validator");

const validateRegistration = (data) => {
    const mandatoryFields = ["firstName", "lastName", "emailId", "password"];
    const hasRequiredFields = data && mandatoryFields.every((field) =>
        typeof data[field] === "string" && data[field].trim().length > 0
    );

    if (!hasRequiredFields) {
        throw new Error("First name, last name, email, and password are required.");
    }

    if (!validatorLibrary.isEmail(data.emailId)) {
        throw new Error("Invalid email.");
    }

    if (!validatorLibrary.isStrongPassword(data.password)) {
        throw new Error("Password does not meet the strength requirements.");
    }
};

module.exports = validateRegistration;
