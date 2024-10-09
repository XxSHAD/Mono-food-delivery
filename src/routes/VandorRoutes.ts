import express, { Request, Response, NextFunction} from "express";
import { UpdateVandorCoverImage, AddFood, GetFoods, GetVandorProfile, UpdateVandorProfile, UpdateVandorService, VandorLogin, GetCurrentOrders, ProcessOrders, GetOrderDetails, AddOffer, GetOffers, EditOffer } from "../controllers";
import { Authenticate } from "../middlewares/CommonAuth";
import multer from "multer";


const router = express.Router();


const imageStorage = multer.diskStorage({

    destination: function(req, file, cb) {
        cb(null, 'images')
    },
    filename:function(req, file, cb) {
        cb(null, new Date().toISOString()+'_'+file.originalname)
    },

})

const images = multer({ storage: imageStorage}).array('images', 10)


router.post('/login', VandorLogin)

router.use(Authenticate)
router.get('/profile', GetVandorProfile)
router.patch('/profile', UpdateVandorProfile)
router.patch('/coverimage', images, UpdateVandorCoverImage)
router.patch('/service', UpdateVandorService)


router.post('/food', images, AddFood)
router.get('/foods', GetFoods)


//orders
router.get('/orders', GetCurrentOrders)
router.put('/order/:id/process', ProcessOrders)
router.get('/order/:id', GetOrderDetails)


//offers
router.get('/offers', GetOffers)
router.post('/offer', AddOffer)
router.put('/offer/:id', EditOffer)

//Delete Offers



router.get("/", (req: Request, res: Response, next: NextFunction) => {

    res.json({ message: "Hello From Vandor Route"})

})

export { router as VandorRoute };