import { Router, type IRouter } from "express";
import healthRouter from "./health";
import vaultsRouter from "./vaults";
import itemsRouter from "./items";
import generatorRouter from "./generator";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(vaultsRouter);
router.use(itemsRouter);
router.use(generatorRouter);
router.use(statsRouter);

export default router;
