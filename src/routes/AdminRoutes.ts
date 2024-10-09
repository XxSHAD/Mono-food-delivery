import express, { Request, Response, NextFunction} from "express";
import { CreateVandor, GetDeliveryUsers, GetTransactions, GetTransactionsById, GetVandorByID, GetVandors, VerifyDeliveryUser } from "../controllers";

const router = express.Router();

router.post("/vandor", CreateVandor)

router.get("/vandors", GetVandors)

router.get("/vandor/:id", GetVandorByID)


router.put('/delivery/verify', VerifyDeliveryUser)
router.get('/delivery/users', GetDeliveryUsers)

router.get("/transaction", GetTransactions)
router.get("/transaction/:id", GetTransactionsById)


router.get("/", (req: Request, res: Response, next: NextFunction) => {

    res.json({ message: "Hello From Admin Route"})

})


export { router as AdminRoute };