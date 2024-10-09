import express, { Request, Response, NextFunction } from 'express';

import { plainToClass } from "class-transformer"
import { CartItem, CreateCustomerInput, CreateDeliveryUserInput, EditCustomerProfileInputs, OrderInputs, UserLoginInput } from '../dto/Customer.dto';
import {  validate } from 'class-validator';
import { GenerateOTP, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOTP } from '../utility';
import { Customer, DeliveryUser, Food, Offer, Transaction, Vandor } from '../models';
import { Order } from '../models/Order';


export const DeliverySignUp = async (req: Request, res: Response, next: NextFunction) => {


    const DeliveryUserInput = plainToClass(CreateDeliveryUserInput, req.body)

    const inputErrors = await validate(DeliveryUserInput, { validationError: { target: true }})

    if(inputErrors.length > 0) {
        return res.status(400).json(inputErrors)
    }

    const { email, phone, password, address, firstName, lastName, pincode } = DeliveryUserInput;

    const salt = await GenerateSalt()
    const userPassword = await GeneratePassword( password, salt)

    // console.log(otp, expiry)
    // return res.json("working...")

    const doesDeliveryUserExist = await DeliveryUser.findOne({ email: email})

    if(doesDeliveryUserExist !== null) {
        return res.status(409).json({ message: "A Delivery User already Exist" })
    }


    const result = await DeliveryUser.create({
        email: email,
        password: userPassword,
        salt: salt,
        firstname: firstName,
        lastname: lastName,
        address: address,
        phone: phone,
        verified: false,
        pincode: pincode,
        lat: 0,
        lng: 0,
        isAvailable: false
    })
        
    if(result) {

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


export const DeliveryLogin = async (req: Request, res: Response, next: NextFunction) => {
    

    const loginInputs = plainToClass( UserLoginInput, req.body)
    
    const loginError = await validate(loginInputs, { validationError: { target: false } })

    if(loginError.length > 0) {
        return res.status(400).json(loginError)
    }

    const { email, password } = loginInputs;

    const deliveryUser = await DeliveryUser.findOne({ email: email })

    if(deliveryUser) {

        const validation = await ValidatePassword( password, deliveryUser.password, deliveryUser.salt);

        if(validation) {

            const signature = GenerateSignature({
                _id: deliveryUser._id,
                email: deliveryUser.email,
                verified: deliveryUser.verified
            })


            return res.status(201).json({ 
                signature: signature, 
                verified: deliveryUser.verified, 
                email: deliveryUser.email
            })

        } else{
            // password Doesnt Match
        }
    }

    return res.status(404).json({ message: "Login Error"})

}


export const GetDeliveryProfile = async (req: Request, res: Response, next: NextFunction) => {
    
    const deliveryUser = req.user;

    if(deliveryUser) {
        
        const profile = await DeliveryUser.findById(deliveryUser._id);

        if(profile) {

            res.status(200).json(profile)

        }
    }

    return res.status(400).json({ message: "Error with Fetch Profile!" })
}


export const EditDeliveryProfile = async (req: Request, res: Response, next: NextFunction) => {
   
    const deliveryUser = req.user;

    const profileInputs = plainToClass( EditCustomerProfileInputs, req.body)

    const profileError = await validate(profileInputs, { validationError: { target: false } })

    if(profileError.length > 0) {
        return res.status(400).json(profileError)
    }

    const { firstname, lastname, address } = profileInputs
    

    if(deliveryUser) {
        
        const profile = await DeliveryUser.findById(deliveryUser._id);

        if(profile) {

            profile.firstname = firstname;
            profile.lastname = lastname;
            profile.address = address;

            const result = await profile.save();
    
            res.status(200).json(result)

        }

    }

    return res.status(400).json({ message: "Error while Editing Profile!" })

}


export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user;

    if(deliveryUser) {
        
        const { lat, lng } = req.body;

        const profile = await DeliveryUser.findById(deliveryUser._id);

        if(profile) {

            if(lat & lng) {
                profile.lat = lat;
                profile.lng = lng;
            }

        }

        profile.isAvailable = !profile.isAvailable;

        const result = await profile.save();

        return res.status(200).json(result)

    }

    return res.status(400).json({ message: "Error while Updating Status!"})

}