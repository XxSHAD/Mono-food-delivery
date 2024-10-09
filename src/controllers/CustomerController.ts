import express, { Request, Response, NextFunction } from 'express';

import { plainToClass } from "class-transformer"
import { CartItem, CreateCustomerInput, EditCustomerProfileInputs, OrderInputs, UserLoginInput } from '../dto/Customer.dto';
import {  validate } from 'class-validator';
import { GenerateOTP, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOTP } from '../utility';
import { Customer, DeliveryUser, Food, Offer, Transaction, Vandor } from '../models';
import { Order } from '../models/Order';


export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {


    const customerInput = plainToClass(CreateCustomerInput, req.body)

    const inputErrors = await validate(customerInput, { validationError: { target: true }})

    if(inputErrors.length > 0) {
        return res.status(400).json(inputErrors)
    }

    const { email, phone, password } = customerInput;

    const salt = await GenerateSalt()
    const userPassword = await GeneratePassword( password, salt)

    const { otp, expiry } = GenerateOTP()

    // console.log(otp, expiry)
    // return res.json("working...")

    const doesCustomerExist = await Customer.findOne({ email: email})

    if(doesCustomerExist !== null) {
        return res.status(409).json({ message: "Email already Exist" })
    }

    const result = await Customer.create({
        email: email,
        password: userPassword,
        salt: salt,
        firstname: 'abc',
        lastname: 'xyz',
        address: 'aabc',
        phone: phone,
        verified: false,
        otp: otp,
        otp_expiry: expiry,
        lat: 0,
        lng: 0,
        orders: []      //To be check
    })
        
    if(result) {

        //send the OTP to customer
        await onRequestOTP(otp, phone);

        //generate the signature
        const signature = GenerateSignature({
            _id: result._id,
            email: result.email,
            verified: result.verified
        })

        //send the result to client
        return res.status(201).json({ signature: signature, verified: result.verified, email: result.email});


    }

    return res.status(400).json({ message: 'Error with Signup'});

}


export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {
    

    const loginInputs = plainToClass( UserLoginInput, req.body)
    
    const loginError = await validate(loginInputs, { validationError: { target: false } })

    if(loginError.length > 0) {
        return res.status(400).json(loginError)
    }

    const { email, password } = loginInputs

    const customer = await Customer.findOne({ email: email })

    if(customer) {

        const validation = await ValidatePassword( password, customer.password, customer.salt);

        if(validation) {

            const signature = GenerateSignature({
                _id: customer._id,
                email: customer.email,
                verified: customer.verified
            })


            return res.status(201).json({ 
                signature: signature, 
                verified: customer.verified, 
                email: customer.email
            })

        } else{
            // password Doesnt Match
        }
    }

    return res.status(404).json({ message: "Login Error"})

}


export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
    
    const { otp } = req.body;
    const customer = req.user;

    if(customer) {

        const profile = await Customer.findById(customer._id)

        if(profile) {

            if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {

                profile.verified = true;

                const updatedCustomerResponse = await profile.save();

                const signature = GenerateSignature({
                    _id: updatedCustomerResponse._id,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                });

                return res.status(201).json({
                    signature: signature, verified: updatedCustomerResponse.verified, email: updatedCustomerResponse.email
                })


            }
        }
    }

    return res.status(400).json({ message: "Error with Otp Validation"})

}   


export const RequestOTP = async (req: Request, res: Response, next: NextFunction) => {
    
    const customer = req.user;

    if(customer) {
        
        const profile = await Customer.findById(customer._id)

        if(profile) {

            const { otp, expiry } = GenerateOTP()

            profile.otp = otp;
            profile.otp_expiry = expiry;

            await profile.save();
            await onRequestOTP(otp, profile.phone);

            res.status(200).json({ message: "OTP sent to your registered phone number" })

        }
    }

    return res.status(400).json({ message: "Error with Otp Validation"})

}


export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    
    const customer = req.user;

    if(customer) {
        
        const profile = await Customer.findById(customer._id);

        if(profile) {

            res.status(200).json(profile)

        }
    }

    return res.status(400).json({ message: "Error with Fetch Profile!" })
}


export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
   
    const customer = req.user;

    const profileInputs = plainToClass( EditCustomerProfileInputs, req.body)

    const profileError = await validate(profileInputs, { validationError: { target: false } })

    if(profileError.length > 0) {
        return res.status(400).json(profileError)
    }

    const { firstname, lastname, address } = profileInputs
    

    if(customer) {
        
        const profile = await Customer.findById(customer._id);

        if(profile) {

            profile.firstname = firstname;
            profile.lastname = lastname;
            profile.address = address;

            const result = await profile.save();
    
            res.status(200).json(result)

        }

    }

}


/**   Cart Section    **/



export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if(customer) {

        const profile = await Customer.findById(customer._id).populate('cart.food');
        let cartItems = Array();

        const { _id, unit } = <CartItem>req.body;

        const food = await Food.findById(_id);

        if(food) {

            if(profile != null) {
                //check for cart items
                cartItems = profile.cart;

                if(cartItems.length > 0) {

                    let existingFoodItem = cartItems.filter((item) => item.food._id.toString() === _id);

                    if(existingFoodItem.length > 0) {  
                        const index = cartItems.indexOf(existingFoodItem[0]);
                        if(unit > 0) {
                            cartItems[index] = { food, unit }
                        } else {
                            cartItems.splice(index, 1);
                        }

                    } else {
                        cartItems.push({ food, unit })
                    }

                } else {
                    cartItems.push({ food, unit })
                }

                if(cartItems) {
                    profile.cart = cartItems as any;
                    const cartresult = await profile.save();
                    return res.status(200).json(cartresult.cart);
                }
            }

        }

    } 

    return res.status(400).json({ message: "Unable to add to cart!" })
 
}


export const GetCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
    
    if(customer) {

        const profile = await Customer.findById(customer._id).populate('cart.food');
        if(profile) {
            return res.status(200).json(profile.cart);
        }

    }

    return res.status(400).json({ messsage: "cart is empty!" })

}


export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
    
    if(customer) {

        const profile = await Customer.findById(customer._id).populate('cart.food');

        if(profile != null) {

            profile.cart = [] as any;
            const cartResult = await profile.save();

            return res.status(200).json(profile.cart);
        }

    }

    return res.status(400).json({ messsage: "cart is already empty!" })

}



// Create Payment

export const CreatePayment = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    const { amount, paymentMode, offerId } = req.body;

    let payableAmount = Number(amount);

    if(offerId) {

        const appliedOffer = await Offer.findById(offerId);

        if(appliedOffer) {
            if(appliedOffer.isActive) {
                payableAmount = (payableAmount - appliedOffer.offerAmount);
            }
        }

    }

    //Perform Payment gateway charge API call


    //create record on Transaction
    const transaction = await Transaction.create({
        customer: customer._id,
        vandorId: '',
        orderId: '',
        orderValue: payableAmount,
        offerUsed: offerId || 'NA',
        status: "OPEN",
        paymentMode: paymentMode,
        paymentResponse: 'Payment is Cash on Delivery'
    })

    
    //return transaction ID
    return res.status(200).json(transaction);

}



// Delivery Notification

const assignOrderForDelivery = async (orderId: string, vandorId: string) => {
    console.log('orderId', orderId)
    //find the vendor
    const vandor = await Vandor.findById(vandorId);

    if(vandor) {
        const areaCode = vandor.pincode;
        const vandorLat = vandor.lat;
        const vandorLng = vandor.lng;

        //find the available Delivery Person
        const deliveryPerson = await DeliveryUser.find({ pincode: areaCode, verified: true, isAvailable: true })

        if(deliveryPerson) {
            
            //check the nearest delivery person and assign the order
            //can use different algorithms or google maps api
            
            
            const currentOrder = await Order.findById(orderId);

            if(currentOrder) {

                //update deliveryID
                currentOrder.deliveryId = deliveryPerson[0]._id;
                await currentOrder.save();

                //Notify to Vandor for received New Order using Firebase Push Notification
            }


        }
    
    }


    //update deliveryID


}




/**   Order Section   **/

const validateTransaction = async (txnId: string) => {

    const currentTransaction = await Transaction.findById(txnId);
    console.log('validateTransaction', txnId, currentTransaction)
    if(currentTransaction) {
        if(currentTransaction.status.toLowerCase() !== "failed") {
            return { status: true, currentTransaction }
        }
    }

    return { status: false, currentTransaction }

}


export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {

    //grab current login customer
    const customer = req.user;

    const  { txnId, amount, items } = <OrderInputs>req.body;

    if(customer) {
        console.log('Customer Exists')
        //validate transaction
        const { status, currentTransaction } = await validateTransaction(txnId);
        console.log(status, currentTransaction)

        if(!status) {
            return res.status(404).json({ message: 'Error with Create Order (transaction)!' })
        }


        const profile = await Customer.findById(customer._id);

        //create an order ID
        const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

        //Grab order items from request [{ id: XX, unit: XX}]
        // const cart = <[OrderInputs]>req.body;

        let cartItems = Array();
        let netAmmount = 0.0;

        let vandorId;

        //Calculate order amount
        const foods = await Food.find().where('_id').in(items.map(item => item._id)).exec()
        // console.log(foods)

    
        foods.map(food => {

            items.map(({ _id, unit}) => {

                if(food._id == _id) {
                    vandorId = food.vandorId;
                    netAmmount += (food.price * unit);
                    cartItems.push({ food, unit })
                } else {
                    console.log(`${food._id} / ${_id}`)
                }

            })

        })

        //Create Order with item description
        if(cartItems) {
            //create Order

            const currentOrder = await Order.create({
                orderID: orderId,
                vandorId: vandorId,
                items: cartItems,
                totalAmount: netAmmount,
                paidAmount: amount,
                OrderDate: new Date(),
                orderStatus: 'Waiting',
                remarks: '',
                deliveryId: '',
                readyTime: 45
            })

            // console.log('currentOrder', currentOrder)
            //could be done with if(currentOrder)
            profile.cart = [] as any;
            profile.orders.push(currentOrder);

            currentTransaction.vandorId = vandorId;
            currentTransaction.orderID = orderId;
            currentTransaction.status = 'CONFIRMED';

            await currentTransaction.save();


            await assignOrderForDelivery(currentOrder._id, vandorId);

            const profileSaveResponse = await profile.save();

            return res.status(200).json(currentOrder);
            
        }

        return res.status(400).json({ message: "Error with Create Order!"})

    }

    //Finally update orders to user account

}


export const GetOrder = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if(customer) {

        const profile = await Customer.findById(customer._id).populate("orders");

        if(profile) {
            return res.status(200).json(profile.orders);
        }

    }

    return res.status(400).json({ message: "Something went Wrong while getting orders!"})

}


export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    if(orderId) {

        const order = await Order.findById(orderId).populate("items.food");

        if(order) {
            return res.status(200).json(order);
        }

    }

    return res.status(400).json({ message: "Something went Wrong while getting order!"})

}


export const VerifyOffer = async (req: Request, res: Response, next: NextFunction) => {

    const offerId = req.params.id;
    const customer = req.user;

    if(customer) {

        const appliedOffer = await Offer.findById(offerId);

        if(appliedOffer) {

            if(appliedOffer.promoType == "USER") {

                // only can apply once per user

            } else{
                if(appliedOffer.isActive) {
                    return res.status(200).json({ message: "Offer is Valid", offer: appliedOffer});
                }
            }


        }

    }

    return res.status(400).json({ message: "Offer is not valid!"})

}

