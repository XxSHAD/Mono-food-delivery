import { Request, Response, NextFunction } from "express";
import { CreateOfferInputs, EditVandorInputs, VandorLoginInputs } from "../dto";
import { FindVandor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utility";
import { CreateFoodInput } from "../dto/Food.dto";
import { Food } from "../models/Food";
import { Order } from "../models/Order";
import { Offer } from "../models";

export const VandorLogin = async (req: Request, res: Response, next: NextFunction) => {
    
    const { email, password } = <VandorLoginInputs>req.body;

    const existingVandor = await FindVandor('', email);

    if(existingVandor != null) {
        
        const validation = await ValidatePassword(password, existingVandor.password, existingVandor.salt);
        
        if(validation) {

            const signature = GenerateSignature({
                _id: existingVandor.id,
                email: existingVandor.email,
                foodTypes: existingVandor.foodType,
                name: existingVandor.name
            })

            return res.json(signature)
        } else{
            return res.json({"message": "Password is not valid"})
        }

    }

    return res.json({"message": "Login credentials not valid"})
}


export const GetVandorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    
    if(user) {

        const existingVandor = await FindVandor(user._id)

        return res.json(existingVandor)
    }

    return res.json({"message": "Vandor information Not found"})

}


export const UpdateVandorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const { foodTypes, name, address, phone} = <EditVandorInputs>req.body;
    console.log(foodTypes, name, address, phone)

    const user = req.user;
    
    if(user) {
        const existingVandor = await FindVandor(user._id)

        if(existingVandor != null) {
            existingVandor.name = name;
            existingVandor.address = address;
            existingVandor.phone = phone;
            existingVandor.foodType = foodTypes;

            const savedResult = await existingVandor?.save()
            return res.json(savedResult)
        }

        return existingVandor
        
    }

    return res.json({"message": "Vandor information Not found"})
}


export const UpdateVandorCoverImage = async (req: Request, res: Response, next: NextFunction) => {


    const user = req.user;
    
    if(user) {
       

        const vandor = await FindVandor(user._id)

        if(vandor != null) {

            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename)
            
            vandor.coverImages.push(...images);
           
            const result = await vandor.save();

            return res.json(result);
        }

    }

    return res.json({"message": "Something Wrong while Updating Vandor Cover Image Not found"})

}


export const UpdateVandorService = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const { lat, lng } = req.body;
    console.log(lat, lng)
    
    if(user) {
        const existingVandor = await FindVandor(user._id)

        if(existingVandor != null) {

            existingVandor.serviceAvailable = !existingVandor.serviceAvailable;

            if(lat && lng) {
                existingVandor.lat = lat;
                existingVandor.lng = lng;
            }

            const savedResult = await existingVandor.save()
            
            return res.json(savedResult);     
        }

        return res.json(existingVandor)
    }

    return res.json({"message": "Vandor information Not found"})


}


export const AddFood = async (req: Request, res: Response, next: NextFunction) => {


    const user = req.user;
    
    if(user) {
       
        const { name, description, category, foodType, readyTime, price} = <CreateFoodInput>req.body;

        const vandor = await FindVandor(user._id)

        if(vandor != null) {

            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename)
            
            const createdFood = await Food.create({
                vandorId: vandor._id,
                name: name,
                description: description,
                category: category,
                foodType: foodType,
                images: images,
                readyTime: readyTime,
                price: price,
                rating: 0
            })

            vandor.foods.push(createdFood);
            const result = await vandor.save();

            return res.json(result);
        }


    }

    return res.json({"message": "Something went wrong with add food"})


}


export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {


    const user = req.user;
    
    if(user) {

        const foods = await Food.find({ vandorId: user._id})

        if(foods != null) {
            return res.json(foods);
        }

    }

    return res.json({"message": "Foods information Not found"})


}


export const GetCurrentOrders = async ( req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if(user) {

        const orders = await Order.find({ vandorId: user._id }).populate('items.food');

        if(orders != null) {
            return res.status(200).json(orders)
        }

    }

    return res.json({"message": "Order Not found"})

}


export const GetOrderDetails = async ( req: Request, res: Response, next: NextFunction) => {    
    
    const orderId = req.params.id;

    if(orderId) {

        const order = await Order.findById(orderId).populate('items.food');

        if(order != null) {
            return res.status(200).json(order)
        }

    }

    return res.json({"message": "Order Not found"})

}


export const ProcessOrders = async ( req: Request, res: Response, next: NextFunction) => {
    
    const orderId = req.params.id;

    const { status, remarks, time } = req.body;     //ACCEPT //REJECT //UNDER-PROCESS //READY

    if(orderId) {

        const order = await Order.findById(orderId).populate('items.food');

        order.orderStatus = status;
        order.remarks = remarks;
        if(time) {
            order.readyTime = time;
        }

        const orderResult = await order.save();
        if(orderResult !== null) {
            return res.status(200).json(orderResult)
        }

    }

    return res.json({ message: "Unable to process Order!" })

}


export const GetOffers = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if(user) {

        let currentOffers = Array();

        const offers = await Offer.find().populate('vandors');

        if(offers) {

            offers.map(item => {
                if(item.vandors){
                    item.vandors.map(vandor => {
                        if(vandor._id.toString() === user._id) {
                            currentOffers.push(item);
                        }
                    })
                }

                if(item.offerType === "GENERIC") {
                    currentOffers.push(item);
                }
            })

        }

        return res.json(currentOffers)

    }

    return res.json({"message": "Offers not available!"})

}


export const AddOffer = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if(user) {

        const { title, description, offerType, offerAmount, pincode,
            promoCode, promoType, startValidity, endValidity, bank, bins,
            minValue, isActive
        } = <CreateOfferInputs>req.body

        const vandor = await FindVandor(user._id);

        if(vandor) {

            const offer = await Offer.create({
                title, 
                description, 
                offerType, 
                offerAmount, 
                pincode,
                promoCode, 
                promoType, 
                startValidity, 
                endValidity, 
                bank, 
                bins,
                minValue, 
                isActive,
                vandors: [vandor]
            })

            return res.status(200).json(offer)

        }

    }

    return res.json({"message": "Unable to Add Order!"})

}


export const EditOffer = async (req: Request, res: Response, next: NextFunction) => {
    
    const user = req.user;
    const offerId = req.params.id;

    if(user) {

        const { title, description, offerType, offerAmount, pincode,
            promoCode, promoType, startValidity, endValidity, bank, bins,
            minValue, isActive
        } = <CreateOfferInputs>req.body

        const currentOffer = await Offer.findById(offerId);
        console.log('cuurentoffers', currentOffer)

        if(currentOffer) {

            const vandor = await FindVandor(user._id);

            if(vandor) {
                currentOffer.title = title, 
                currentOffer.description = description, 
                currentOffer.offerType = offerType, 
                currentOffer.offerAmount = offerAmount, 
                currentOffer.pincode = pincode,
                currentOffer.promoCode = promoCode, 
                currentOffer.promoType = promoType, 
                currentOffer.startValidity = startValidity, 
                currentOffer.endValidity = endValidity, 
                currentOffer.bank = bank, 
                currentOffer.bins = bins,
                currentOffer.minValue = minValue, 
                currentOffer.isActive = isActive

                const result = await currentOffer.save();
    
                return res.json(result)
            }
        
        }


    }

    return res.json({"message": "Unable to Add Order!"})

}

