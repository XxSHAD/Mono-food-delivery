import { isEmail, isEmpty, Length } from "class-validator";

export class CreateCustomerInput{

    // @isEmail()
    //Validate Email
    email: string;

    @Length(7, 10)
    phone: string;

    @Length(6, 10)
    password: string;

}


export class UserLoginInput{

    // @isEmail()
    //Validate Email
    email: string;

    @Length(6, 10)
    password: string;

}


export class EditCustomerProfileInputs{

    @Length(3, 16)
    firstname: string;

    @Length(3, 16)
    lastname: string;

    @Length(6, 16)
    address: string;


}


export interface CustomerPayload{
    _id: string;
    email: string;
    verified: boolean;
}


export interface CartItem{
    _id: string;
    unit: number;
}


export class OrderInputs {

    txnId: string;
    amount: string;
    items: [CartItem];
    
}


export class CreateDeliveryUserInput{

    // @isEmail()
    //Validate Email
    email: string;

    @Length(7, 10)
    phone: string;

    @Length(6, 10)
    password: string;

    @Length(3, 12)
    firstName: string;

    @Length(3, 12)
    lastName: string;

    @Length(6, 24)
    address: string;

    @Length(4, 12)
    pincode: string;

}