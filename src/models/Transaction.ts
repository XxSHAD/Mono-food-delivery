import mongoose, { Schema, Document } from "mongoose"


export interface TransactionDoc extends Document{
    customer: string;
    vandorId: string;
    orderID: string;
    orderValue: string;
    offerUsed: string;
    status: string;
    paymentMode: string;
    paymentResponse: string;
}


const TransactionSchema = new Schema({
    customer: String,
    vandorId: String,
    orderID: String,
    orderValue: String,
    offerUsed: String,
    status: String,
    paymentMode: String,
    paymentResponse: String
}, {
    toJSON: {
        transform(doc, ret){
            delete ret.__v,
            delete ret.createdAt,
            delete ret.updatedAt
        }
    },
    timestamps: true
})


const Transaction = mongoose.model<TransactionDoc>('Transaction', TransactionSchema);

export { Transaction };