import express, { Request, Response, NextFunction} from "express";
import { GetAvailableOffers, GetFoodAvailability, GetFoodIn30Min, GetTopRestaurants, RestaurantById, SearchFood } from "../controllers";


const router = express.Router()


//Food Availability
router.get('/:pincode', GetFoodAvailability)

//Top Restaurants
router.get('/top-restaurants/:pincode', GetTopRestaurants)

//Food in 30 minuntes
router.get('/foods-in-30-min/:pincode', GetFoodIn30Min)

//Search Foods
router.get('/search/:pincode', SearchFood)

//Find Restaurant By ID
router.get('/restaurant/:id', RestaurantById)


router.get('/offers/:pincode', GetAvailableOffers)


export { router as ShoppingRoute };