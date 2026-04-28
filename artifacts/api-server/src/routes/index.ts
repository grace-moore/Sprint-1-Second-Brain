import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sessionsRouter from "./sessions";
import analysisRouter from "./analysis";
import progressRouter from "./progress";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sessionsRouter);
router.use(analysisRouter);
router.use(progressRouter);

export default router;
