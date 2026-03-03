const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    permissionId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }]
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('RolePermission', rolePermissionSchema);
