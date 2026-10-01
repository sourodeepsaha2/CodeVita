const validator = require("validator");



const validator =(data)=>{ 
    const mandatoryField = ['firstName',"emailId",'password'];

    const IsAllowed = mandatoryField.every((k)=>Object.keys(data).includes(k));

    if(!IsAllowed)
        throw new Error("Some Field Missing");

    if(validator.isEmail(data.emailId))
        throw new Error("Invalid email");

    if(!validator.isStrongPassword(data.pasword))
        throw new Error("Weak Password");
}
module.exports=validate;