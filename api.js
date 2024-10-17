const express = require("express");
const router = express.Router();

router.use(require("./flow/001/sap"));
router.use(require("./flow/001/getmaster"));
router.use(require("./flow/001/upqcdata"));
router.use(require("./flow/001/INSFINISH"));
router.use(require("./flow/001/cleardata"));
router.use(require("./flow/001/GRAPHMASTER"));
router.use(require("./flow/001/1-APPPHBP12"));
router.use(require("./flow/001/2-SUR-BAL-001"));
router.use(require("./flow/001/3-SUR-THI-001"));
router.use(require("./flow/001/4-SUR-RGH-001"));
router.use(require("./flow/001/5-1-SUR-MIC-001"));
router.use(require("./flow/001/6-SUR-MCS-001"));
router.use(require("./flow/001/7-CTC-SEM-001"));
router.use(require("./flow/001/reportlist"));


router.use(require("./flow/003/getmasterIP"));

router.use(require("./flow/006/1-INPROCESS"));




// router.use(require("./flow/002/01TOBEREPORT"));
//INSFINISH
// router.use(require("./flow/004/flow004"))
router.use(require("./flow/login/login"))
router.use(require("./flow/testflow/testflow"));

module.exports = router;

