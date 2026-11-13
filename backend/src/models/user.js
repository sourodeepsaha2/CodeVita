const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    username:{
        type:String,
        trim:true,
        lowercase:true,
        minLength:3,
        maxLength:20,
        unique:true,
        sparse:true
    },
    firstName:{
        type: String,
        minLength: 3,
        maxLength: 20
    },
    lastName:{
        type:String,
        minLength: 3,
        maxLength: 20
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase:true,
        immutable:true
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }]
    },
    password:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

userSchema.post('findOneAndDelete', async function (userInfo){
    if (userInfo){
        const cleanup = [mongoose.model('submission').deleteMany({userId: userInfo._id})];
        if (mongoose.models.reflection) cleanup.push(mongoose.model('reflection').deleteMany({userId: userInfo._id}));
        await Promise.all(cleanup);
    }
})

const User = mongoose.model("user",userSchema);

module.exports = User;

