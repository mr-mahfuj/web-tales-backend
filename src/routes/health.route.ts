import { Router } from "express";

import { StatusCode } from "../enums/status-code.enum.js";

const router = Router();

router.get("/", (_req, res) => {
    res.status(StatusCode.Ok).json({
        status: "UP",
        timeStamp : new Date().toISOString(),
    })
})


export default router;