import { Router } from "express";
import { timeStamp } from "node:console";
import { stat } from "node:fs";

const router = Router();

router.get("/", (_req, res) => {
    res.status(200).json({
        status: "UP",
        timeStamp : new Date().toISOString(),
    })
})


export default router;