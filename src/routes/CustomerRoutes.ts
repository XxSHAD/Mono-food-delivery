import express, {Request, Response, NextFunction } from 'express';
import { AddToCart, CreateOrder, CreatePayment, CustomerLogin, CustomerSignUp, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrder, GetOrderById, RequestOTP, VerifyOffer } from '../controllers';
import { Authenticate } from '../middlewares/CommonAuth';


const router = express.Router()


//Signup / Create Customer
router.post('/signup', CustomerSignUp)

//Login
router.post('/login', CustomerLogin)


//authentication
router.use(Authenticate)


//Verify Customer Account
router.patch('/verify', CustomerVerify)

//OTP / Requesting OTP
router.get('/otp', RequestOTP)

//Profile
router.get('/profile', GetCustomerProfile)
router.patch('/profile', EditCustomerProfile)


//Cart
router.post('/cart', AddToCart)
router.get('/cart', GetCart)
router.delete('/cart', DeleteCart)


//Apply Offers
router.get('/offer/verify/:id', VerifyOffer)


//Payment
router.post('/create-payment', CreatePayment)


//Order
router.post('/create-order', CreateOrder)
router.get('/orders', GetOrder)
router.get('/order/:id', GetOrderById)


export {router as CustomerRoute }