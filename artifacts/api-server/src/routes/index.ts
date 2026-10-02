import { Router, type IRouter } from "express";
import healthRouter from "./health";
import remindersRouter from "./reminders";
import familyRouter from "./family";
import alertsRouter from "./alerts";
import devicesRouter from "./devices";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use("/reminders", remindersRouter);
router.use("/family", familyRouter);
router.use("/alerts", alertsRouter);
router.use("/devices", devicesRouter);

export default router;
