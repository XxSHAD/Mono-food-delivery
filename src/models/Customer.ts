import mongoose, { Schema, Document, model} from "mongoose";
import { OrderDoc } from "./Order";


interface CustomerDoc extends Document {
    email: string;
    password: string;
    salt: string;
    firstname: string;
    lastname: string;
    address: string;
    phone: string;
    verified: boolean;
    otp: number;
    otp_expiry: Date;
    lat: number;
    lng: number;
    cart: [any];
    orders: [OrderDoc]
}

const CustomerSchema = new Schema({
    firstname: { type: String, required: true},
    lastname: { type: String, required: true},
    address: { type: String},
    phone: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    salt: { type: String, required: true},
    verified: { type: Boolean, required: true},
    otp: { type: Number, required: true},
    otp_expiry: { type: Date, required: true},
    lat: { type: Number },
    lng: { type: Number },
    cart: [
        {
            food: { type: Schema.Types.ObjectId, ref: 'food', required: true},
            unit: { type: Number, required: true},
        }
    ],
    orders: [
        {
            type: Schema.Types.ObjectId,
            ref: 'order'
        }
    ]
}, {
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamps: true
});


const Customer = mongoose.model<CustomerDoc>('customer', CustomerSchema);

export {Customer}