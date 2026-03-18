const mongoose = require('mongoose');

const shopMasterSchema = new mongoose.Schema({
    appName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        addressLine1: {
            type: String
        },
        city: {
            type: String
        },
        post: {
            type: String
        },
        block: {
            type: String
        },
        dist: {
            type: String
        },
        state: {
            type: String
        },
        pincode: {
            type: String
        },
        Latitude: {
            type: String
        },
        Longitude: {
            type: String
        }
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    gst: {
        set: {
            type: Boolean,
            default: false
        },
        gstNo: {
            type: String,
            trim: true
        }
    },
    prefix: {
        type: String,
        trim: true
    },
    theme: [
        {
            type: String,
            trim: true
        }
    ],
    whatsappApi: {
        set: {
            type: Boolean,
            default: false
        },
        apiKey: {
            type: String,
            trim: true
        },
        customerReg:{
            set:{
                type: Boolean,
                default: false
            },
            template:{
                type: String,
                trim: true
            }
        },
        orderConfirm:{
            set:{
                type: Boolean,
                default: false
            },
            template:{
                type: String,
                trim: true
            }
        },
        orderShiped:{
            set:{
                type: Boolean,
                default: false
            },
            template:{
                type: String,
                trim: true
            }
        },
        orderDelivered:{
            set:{
                type: Boolean,
                default: false
            },
            template:{
                type: String,
                trim: true
            }
        },
        orderCancel:{
            set:{
                type: Boolean,
                default: false
            },
            template:{
                type: String,
                trim: true
            }
        },
        otp:{
            set:{
                type: Boolean,
                default: false
            },
            template:{
                type: String,
                trim: true
            }
        }
    },
    logo: {
        type: String,
        trim: true
    },
    fevicon: {
        type: String,
        trim: true
    },
    CopyrightMsg: {
        type: String,
        trim: true
    },
    smtp: {
        set: {
            type: Boolean,
            default: false
        },
        host: {
            type: String,
            trim: true
        },
        port: {
            type: String,
            trim: true
        },
        user: {
            type: String,
            trim: true
        },
        pass: {
            type: String,
            trim: true
        },
        from: {
            type: String,
            trim: true
        },
        fromName: {
            type: String,
            trim: true
        },
        apiKey: {
            type: String,
            trim: true
        }
    },

    gmapapi: {
        set: {
            type: Boolean,
            default: false
        },
        apiKey: {
            type: String,
            trim: true
        }
    },
    paymentMethod: {
        razorpay: {
            set: {
                type: Boolean,
                default: false
            },
            apiKey: {
                type: String,
                trim: true
            },
            secretKey: {
                type: String,
                trim: true
            }
        },
        cashOnDelivery: {
            set: {
                type: Boolean,
                default: false
            }
        },
        nodelivery: {
            set: {
                type: Boolean,
                default: false
            }
        },
        paytm: {
            set: {
                type: Boolean,
                default: false
            },
            apiKey: {
                type: String,
                trim: true
            },
            secretKey: {
                type: String,
                trim: true
            }
        }
    },
    miniFreeDelivery: {
        set: {
            type: Boolean,
            default: false
        },
        amount: {
            type: String,
            trim: true
        }
    },
    availablePincode: [
        {
            type: String,
            trim: true
        }
    ]


}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('ShopMaster', shopMasterSchema);
