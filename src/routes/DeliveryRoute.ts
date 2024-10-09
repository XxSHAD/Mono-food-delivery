import express, {Request, Response, NextFunction } from 'express';
import { AddToCart, CreateOrder, CreatePayment, CustomerLogin, CustomerSignUp, CustomerVerify, DeleteCart, DeliveryLogin, DeliverySignUp, EditCustomerProfile, EditDeliveryProfile, GetCart, GetCustomerProfile, GetDeliveryProfile, GetOrder, GetOrderById, RequestOTP, UpdateDeliveryUserStatus, VerifyOffer } from '../controllers';
import { Authenticate } from '../middlewares/CommonAuth';


const router = express.Router()


// Signup / Create Customer
router.post('/signup', DeliverySignUp)

// Login
router.post('/login', DeliveryLogin)


// authentication
router.use(Authenticate)


// Change Service Status
router.put('/change-status', UpdateDeliveryUserStatus)

// Profile
router.get('/profile', GetDeliveryProfile)
router.patch('/profile', EditDeliveryProfile)




export {router as DeliveryRoute }