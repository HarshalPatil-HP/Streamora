import { healthcheck } from "../controllers/healthcheck.contrller.js";

import { Router } from "express";

let router=Router();

router.route("/").get(healthcheck);

export default router