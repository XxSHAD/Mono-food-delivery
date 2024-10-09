import mongoose, { Schema, Document, model} from "mongoose";
import { OrderDoc } from "./Order";


interface DeliveryUserDoc extends Document {
    email: string;
    password: string;
    salt: string;
    firstname: string;
    lastname: string;
    address: string;
    pincode: string;
    verified: boolean;
    phone: string;   
    lat: number;
    lng: number;
    isAvailable: boolean;
}

const DeliveryUserSchema = new Schema({
    firstname: { type: String, required: true},
    lastname: { type: String, required: true},
    address: { type: String},
    pincode: { type: String},
    phone: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    salt: { type: String, required: true},
    verified: { type: Boolean, required: true},
    lat: { type: Number },
    lng: { type: Number },
    isAvailable: { type: Boolean }
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


const DeliveryUser = mongoose.model<DeliveryUserDoc>('DeliveryUser', DeliveryUserSchema);

export {DeliveryUser}