import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import categoriesRouter from "./categories.js";
import productsRouter from "./products.js";
import ordersRouter from "./orders.js";
import usersRouter from "./users.js";
import branchesRouter from "./branches.js";
import notificationsRouter from "./notifications.js";
import couponsRouter from "./coupons.js";
import adminRouter from "./admin.js";
import riderRouter from "./rider.js";
import routeRouter from "./route.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/categories", categoriesRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/users", usersRouter);
router.use("/branches", branchesRouter);
router.use("/notifications", notificationsRouter);
router.use("/coupons", couponsRouter);
router.use("/admin", adminRouter);
router.use("/rider", riderRouter);
router.use("/route", routeRouter);

export default router;
