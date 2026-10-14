const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const submissionSchema = new Schema({

    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required: true
    },

    

})