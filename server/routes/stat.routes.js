const { Router } = require("express");
const Stat = require("../models/Stat");
const auth = require("../middleware/auth.middleware");
const router = Router();

router.post("/manipulate", auth, async (req, res) => {
    try {
        const { personMeals, water, timestamp } = req.body;

        if (personMeals.length === 0 && water === 0) {
            const deletedStat = await Stat.findOneAndDelete({
                timestamp: timestamp,
                owner: req.user.userId,
            });
            if (deletedStat) {
                return res.status(200).json({
                    message: "Успішно видалено",
                });
            } else {
                return res.status(404).json({
                    message: "Не знайдено записів для видалення",
                });
            }
        }

        let existStat = await Stat.findOne({
            timestamp: timestamp,
            owner: req.user.userId,
        });
        if (existStat) {
            await Stat.updateOne(
                { timestamp: req.body.timestamp },
                { personMeals: req.body.personMeals, meals: req.body.meals }
            );
            existStat.personMeals = req.body.personMeals;
            existStat.meals = req.body.meals;
            await existStat.save();
            return res
                .status(200)
                .json({ body: existStat, message: "Дані оновлено" });
        }

        const stat = new Stat({
            ...req.body,
            owner: req.user.userId,
        });
        await stat.save();
        res.status(201).json({ body: stat, message: "Дані додано" });
    } catch (e) {
        res.status(500).json({
            message: "Щось пішло не так, повторіть спробу",
        });
    }
});

router.get("/", auth, async (req, res) => {
    try {
        const stats = await Stat.find({ owner: req.user.userId });
        res.json(stats);
    } catch (e) {
        res.status(500).json({
            message: "Щось пішло не так, повторіть спробу",
        });
    }
});

module.exports = router;
