export interface CreateVandorInput{
    name: string;
    ownerName: string;
    foodType: [string];
    pincode: string;
    address: string;
    phone: string;
    email: string;
    password: string;
}


export interface EditVandorInputs{
    name: string;
    address: string;
    phone: string;
    foodTypes: [string];
}


export interface VandorLoginInputs {
    email: string;
    password: string;
}


export interface VandorPayload {
    _id: string;
    email: string;
    name: string;
    foodTypes: [string];
}


export interface CreateOfferInputs {

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