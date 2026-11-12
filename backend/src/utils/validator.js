const validatorLibrary = require("validator");

const validateRegistration = (data, { requireUsername = true } = {}) => {
    const identityFields = requireUsername ? ["username"] : ["firstName", "lastName"];
    const mandatoryFields = [...identityFields, "emailId", "password"];
    const hasRequiredFields = data && mandatoryFields.every((field) =>
        typeof data[field] === "string" && data[field].trim().length > 0
    );

    if (!hasRequiredFields) {
        throw new Error(requireUsername
            ? "Username, email, and password are required."
            : "First name, last name, email, and password are required.");
    }

    if (!validatorLibrary.isEmail(data.emailId)) {
        throw new Error("Invalid email.");
    }

    if (requireUsername && !/^[a-zA-Z0-9_]{3,20}$/.test(data.username.trim())) {
        throw new Error("Username must be 3–20 letters, numbers, or underscores.");
    }

    if (!validatorLibrary.isStrongPassword(data.password)) {
        throw new Error("Password does not meet the strength requirements.");
    }
};

module.exports = validateRegistration;
