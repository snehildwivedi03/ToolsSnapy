import { Router } from "express";
import * as textCtrl from "../controllers/text.controller.js";

const router = Router();

router.post("/word-counter", textCtrl.wordCounter);
router.post("/character-counter", textCtrl.characterCounter);
router.post("/case-converter", textCtrl.caseConverter);
router.post("/json-formatter", textCtrl.jsonFormatter);
router.post("/json-validator", textCtrl.jsonValidator);
router.post("/random-paragraph", textCtrl.randomParagraph);

export default router;
