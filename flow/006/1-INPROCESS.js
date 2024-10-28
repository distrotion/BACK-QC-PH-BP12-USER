const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');

let masterDB = "master_IP";
let PATTERN = "PATTERN";
//
let GRAPH_TABLE = "GRAPH_TABLE";
let TYPE = "TYPE";
let UNIT = "UNIT";
let ITEMs = "ITEMs";
let MACHINE = "MACHINE";
let METHOD = "METHOD";
let INSTRUMENTS = "INSTRUMENTS";
let RESULTFORMAT = "RESULTFORMAT";
let SPECIFICATION = "SPECIFICATION";
let TOLERANCE = "TOLERANCE";
let GRAPHTYPE = "GRAPHTYPE";
let CALCULATE = "CALCULATE";
let LOAD = "LOAD";
let CORETYPE = "CORETYPE";
let FREQUENCY = "FREQUENCY";
let PATTERN_01 = "PATTERN_01";

let MAININP = "MAIN_INPROCESS";
let MAIN = "MAIN";


router.post('/INPROCESS/GETDATA', async (req, res) => {
  //-------------------------------------
  console.log('--INPROCESS/GETDATA--');
  console.log(req.body);
  //-------------------------------------

  let input = req.body;
  let find1 = [];
  let find2 = [];
  let find3 = [];
  let find4 = [];
  let find5 = [];
  let find6 = [];
  let find7 = [];
  let find8 = [];
  let find9 = [];

  let DATA = [];
  let PATTERNs = [];
  //-------------------------------------
  if (input['MATNR'] != undefined) {

    find1 = await mongodb.find(masterDB, TYPE, { "activeid": "active_id" });
    find2 = await mongodb.find(masterDB, ITEMs, { "activeid": "active_id" });
    find3 = await mongodb.find(masterDB, MACHINE, { "activeid": "active_id" });
    find4 = await mongodb.find(masterDB, RESULTFORMAT, {});
    find5 = await mongodb.find(masterDB, GRAPHTYPE, {});
    find6 = await mongodb.find(masterDB, INSTRUMENTS, {});
    find7 = await mongodb.find(masterDB, CALCULATE, { "activeid": "active_id" });
    find8 = await mongodb.find(masterDB, SPECIFICATION, { "activeid": "active_id" });
    find9 = await mongodb.find(masterDB, UNIT, { "activeid": "active_id" });

    PATTERNs = await mongodb.find(PATTERN, PATTERN_01, { "CP": `${input['MATNR']}` });
    // console.log(PATTERNs)
    // DATA = await mongodb.find(MAININP, MAIN, { "MATNR": `${input['MATNR']}` });


  }


  return res.json({ "PATTERN": PATTERNs, "TYPE": find1, "ITEMS": find2, "METHOD": find3, "RESULTFORMAT": find4, "GRAPHTYPE": find5, "INSTRUMENTS": find6, "CALCULATE": find7, "SPECIFICATION": find8, "UNIT": find9 });


});

router.post('/INPROCESS/SETgoodandDATA', async (req, res) => {
  //-------------------------------------
  console.log("----03BP12PH/SETgood----");
  console.log(req.body);
  let input = req.body;

  let DATA = [];

  //-------------------------------------
  let output = {
    "status": "NOK",
  }
  //input['CHARG'] != undefined && input['CUST_LOT'] != undefined && 
  if (input['MATNR'] != undefined& input['DATASET'] != undefined& input['PO'] != undefined& input['ITEMcode'] != undefined) {

    DATA = await mongodb.find(MAININP, MAIN, { "PO": `${input['PO']}`});
    if (DATA.length === 0) {
      let datainside = {
        "ITEMcode": input['ITEMcode'],
        "status": input['ITEMstatus'],
        "DATAINPUT":input['DATAINPUT'],
        // "specialAccStatus": input['ITEMspecialAccStatus'],
        // "specialAccCOMMENT": input['ITEMspecialAccCOMMENT'],
        // "specialAccPiecesSelected": input['ITEMsPiecesSelected'],
        // "specialAccPic01": input['ITEMspecialAccPic01'],
        // "specialAccPic02": input['ITEMspecialAccPic02'],
        // "specialAccPic03": input['ITEMspecialAccPic03'],
        // "specialAccPic04": input['ITEMspecialAccPic04'],
        // "specialAccPic05": input['ITEMspecialAccPic05'],
        "DATASET":input['DATASET'],
        "TS": Date.now()
      }
      let dataset =
      {
        "PO": input['PO'],
        "MATNR": input['MATNR'],
        "CHARG": input['CHARG'],
        "MBLNR": input['MBLNR'],
        "BWART": input['BWART'],
        "MENGE": input['MENGE'],
        "MEINS": input['MEINS'],
        "MAT_FG": input['MAT_FG'],
        "KUNNR": input['KUNNR'],
        "SORTL": input['SORTL'],
        "NAME1": input['NAME1'],
        "CUST_LOT": input['CUST_LOT'],
        "PART_NM": input['PART_NM'],
        "PART_NO": input['PART_NO'],
        "PROCESS": input['PROCESS'],
        "OLDMAT_CP": input['OLDMAT_CP'],
        "STATUS": input['STATUS'],
        "UserNO": input['UserNO'],
        "ListITEM": input['ListITEM'],
        "TS": Date.now()
      }
      dataset[input['ITEMcode']] = datainside;
     

      let SET = await mongodb.insertMany(MAININP, MAIN, [dataset]);
    output['status']= 'OK'
    } else {

      let datainside = {
        "ITEMcode": input['ITEMcode'],
        "status": input['ITEMstatus'],
        "DATAINPUT":input['DATAINPUT'],
        // "specialAccStatus": input['ITEMspecialAccStatus'],
        // "specialAccCOMMENT": input['ITEMspecialAccCOMMENT'],
        // "specialAccPiecesSelected": input['ITEMsPiecesSelected'],
        // "specialAccPic01": input['ITEMspecialAccPic01'],
        // "specialAccPic02": input['ITEMspecialAccPic02'],
        // "specialAccPic03": input['ITEMspecialAccPic03'],
        // "specialAccPic04": input['ITEMspecialAccPic04'],
        // "specialAccPic05": input['ITEMspecialAccPic05'],
        "DATASET":input['DATASET'],
        "TS": Date.now()
      }
      let dataset =
      {
        "TS": Date.now()
      }
      dataset[input['ITEMcode']] = datainside;
     


      let SET = await mongodb.update(MAININP, MAIN, { "PO": `${input['PO']}`}, { $set: dataset });
      output['status']= 'OK'
    }


  }


  return res.json(output);
});


router.post('/INPROCESS/GETDATATOSEE', async (req, res) => {
  //-------------------------------------
  console.log('--INPROCESS/GETDATATOSEE--');
  console.log(req.body);
  //-------------------------------------

  let input = req.body;
  let find1 = [];
  let find2 = [];
  let find3 = [];
  let find4 = [];
  let find5 = [];
  let find6 = [];
  let find7 = [];
  let find8 = [];
  let find9 = [];

  let DATA = [];
  let PATTERNs = [];
  //-------------------------------------
  if (input['MATNR'] != undefined && input['PO'] != undefined) {

    find1 = await mongodb.find(masterDB, TYPE, { "activeid": "active_id" });
    find2 = await mongodb.find(masterDB, ITEMs, { "activeid": "active_id" });
    find3 = await mongodb.find(masterDB, MACHINE, { "activeid": "active_id" });
    find4 = await mongodb.find(masterDB, RESULTFORMAT, {});
    find5 = await mongodb.find(masterDB, GRAPHTYPE, {});
    find6 = await mongodb.find(masterDB, INSTRUMENTS, {});
    find7 = await mongodb.find(masterDB, CALCULATE, { "activeid": "active_id" });
    find8 = await mongodb.find(masterDB, SPECIFICATION, { "activeid": "active_id" });
    find9 = await mongodb.find(masterDB, UNIT, { "activeid": "active_id" });

    PATTERNs = await mongodb.find(PATTERN, PATTERN_01, { "CP": `${input['MATNR']}` });
    // console.log(PATTERNs)
  DATA = await mongodb.find(MAININP, MAIN, { "PO": `${input['PO']}`});


  }


  return res.json({ "PATTERN": PATTERNs, "TYPE": find1, "ITEMS": find2, "METHOD": find3, "RESULTFORMAT": find4, "GRAPHTYPE": find5, "INSTRUMENTS": find6, "CALCULATE": find7, "SPECIFICATION": find8, "UNIT": find9, "DATA": DATA });


});


module.exports = router;