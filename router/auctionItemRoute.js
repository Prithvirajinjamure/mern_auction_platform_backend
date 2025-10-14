import { addNewAuction, getAllItems, 
    getAuctionDetails,getMyAuctionItems, 
    removeFromAuction, republishItem } from "../controllers/auctionitemController.js"
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js"
import { trackCommissionStatus } from "../middlewares/trackCommissionStatus.js"
import express from "express"

const router = express.Router()

router.post("/create", isAuthenticated, isAuthorized("Auctioneer"),trackCommissionStatus,addNewAuction);

router.get("/allitems", getAllItems);

// Make auction details public to allow viewing without authentication
router.get("/auction/:id", getAuctionDetails);

router.get("/myitems", isAuthenticated, isAuthorized("Auctioneer"), getMyAuctionItems);

router.delete("/delete/:id", isAuthenticated, isAuthorized("Auctioneer"), removeFromAuction);

router.put("/item/republish/:id", isAuthenticated, isAuthorized("Auctioneer"), republishItem);
export default router;