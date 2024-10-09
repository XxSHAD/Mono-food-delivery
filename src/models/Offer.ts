import mongoose, { Schema, Document } from "mongoose"


export interface OfferDoc extends Document{
    offerType: string;       // VANDOR  //  GENERIC
    vandors: [any];          // ['675436466']
    title: string;           // INR 200 off on week days
    description: string;      // any desc with terms and condition
    minValue: number;       //  on order of min 200 rupees
    offerAmount: number;    //200
    startValidity: Date;
    endValidity: Date;
    promoCode: string;      //WEEK200
    promoType: string;      // USER //ALL //BANK //CARD
    bank: [any];
    bins: [any];
    pincode: string;
    isActive: boolean;
}


const OfferSchema = new Schema({
    offerType: { type: String, required: true },       
    vandors: [
        {
            type: Schema.Types.ObjectId, ref: 'vandor'
        }
    ],         
    title: { type: String, required: true },           
    description: { type: String },      
    minValue: { type: Number, required: true },      
    offerAmount: { type: Number, required: true },    
    startValidity: { type: Date },
    endValidity: { type: Date },
    promoCode: { type: String, required: true },      
    promoType: { type: String, required: true },      
    bank: [
        { type: String }
    ],
    bins: [
        { type: Number}
    ],
    pincode: { type: String, required: true },
    isActive: { type: Boolean }
}, {
    toJSON: {
        transform(doc, ret){
            delete ret.__v
        }
    },
    timestamps: true
})


const Offer = mongoose.model<OfferDoc>('offer', OfferSchema);

export { Offer };