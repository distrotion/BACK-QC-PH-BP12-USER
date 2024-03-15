const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');
var mongodbINS = require('../../function/mongodbINS');
var mssql = require('../../function/mssql');
var request = require('request');

//----------------- date

const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
let day = d;

//----------------- SETUP

let NAME_INS = 'SUR-MCS-001'

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';
let UNIT = 'UNIT';

//----------------- dynamic

let finddbbuffer = [{}];

let SURMCS001db = {
  "INS": NAME_INS,
  "PO": "",
  "CP": "",
  "MATCP": '',
  "QTY": "",
  "PROCESS": "",
  "CUSLOT": "",
  "TPKLOT": "",
  "FG": "",
  "CUSTOMER": "",
  "PART": "",
  "PARTNAME": "",
  "MATERIAL": "",
  //---new
  "QUANTITY": '',
  // "PROCESS": '',
  "CUSLOTNO": '',
  "FG_CHARG": '',
  "PARTNAME_PO": '',
  "PART_PO": '',
  "CUSTNAME": '',
  //-------
  "ItemPick": [],
  "ItemPickcode": [],
  "POINTs": "",
  "PCS": "",
  "PCSleft": "",
      
  "SPEC":"",

  "UNIT": "",
  "INTERSEC": "",
  "RESULTFORMAT": "",
  "GRAPHTYPE": "",
  "GAP": "",
  //---------
  "preview": [],
  "confirmdata": [],
  "ITEMleftUNIT": [],
  "ITEMleftVALUE": [],
  //
  "MeasurmentFOR": "FINAL",
  "inspectionItem": "", //ITEMpice
  "inspectionItemNAME": "",
  "tool": NAME_INS,
  "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
  "dateupdatevalue": day,
   //----------------------
   "USER": '',
   "USERID": '',
}

router.get('/CHECK-SURMCS001', async (req, res) => {

  return res.json(SURMCS001db['PO']);
});


router.post('/SURMCS001db', async (req, res) => {
  //-------------------------------------
  // console.log('--SURMCS001db--');
  // console.log(req.body);
  //-------------------------------------
  let finddb = [{}];
  try {

    finddb = SURMCS001db;
    finddbbuffer = finddb;
  }
  catch (err) {
    finddb = finddbbuffer;
  }
  //-------------------------------------
  return res.json(finddb);
});

router.post('/GETINtoSURMCS001', async (req, res) => {
  //-------------------------------------
  console.log('--GETINtoSURMCS001--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  check = SURMCS001db;
  if (input['PO'] !== undefined && input['CP'] !== undefined && check['PO'] === ''&& input['USER'] !== undefined && input['USERID'] !== undefined) {
    // let dbsap = await mssql.qurey(`select * FROM [SAPData_GW_GAS].[dbo].[tblSAPDetail] where [PO] = ${input['PO']}`);

    let findPO = await mongodb.findSAP('mongodb://172.23.10.39:12010', "ORDER", "ORDER", {});

    let cuslot = '';

    if (findPO[0][`DATA`] != undefined && findPO[0][`DATA`].length > 0) {
      let dbsap = ''
      for (i = 0; i < findPO[0][`DATA`].length; i++) {
        if (findPO[0][`DATA`][i][`PO`] === input['PO']) {
          dbsap = findPO[0][`DATA`][i];
          // break;
          cuslot = cuslot+ findPO[0][`DATA`][i][`CUSLOTNO`]+ ','
        }
      }


      if (dbsap !== '') {

        let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
        let masterITEMs = await mongodb.find(master_FN, ITEMs, {});
        let MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

        let ItemPickout = [];
        let ItemPickcodeout = [];

        for (i = 0; i < findcp[0]['FINAL'].length; i++) {
          for (j = 0; j < masterITEMs.length; j++) {
            if (findcp[0]['FINAL'][i]['ITEMs'] === masterITEMs[j]['masterID']) {
              ItemPickout.push(masterITEMs[j]['ITEMs']);
              ItemPickcodeout.push({ "key": masterITEMs[j]['masterID'], "value": masterITEMs[j]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] });
            }
          }
        }

        let ItemPickoutP2 = []
        let ItemPickcodeoutP2 = [];
        for (i = 0; i < ItemPickcodeout.length; i++) {
          for (j = 0; j < MACHINEmaster.length; j++) {
            if (ItemPickcodeout[i]['METHOD'] === MACHINEmaster[j]['masterID']) {
              if (MACHINEmaster[j]['MACHINE'].includes(NAME_INS)) {
                ItemPickoutP2.push(ItemPickout[i]);
                ItemPickcodeoutP2.push(ItemPickcodeout[i]);
              }
            }
          }
        }
        console.log(NAME_INS)




        SURMCS001db = {
          "INS": NAME_INS,
          "PO": input['PO'] || '',
          "CP": input['CP'] || '',
          "MATCP": input['CP'] || '',
          "QTY": dbsap ['QUANTITY'] || '',
          "PROCESS": dbsap ['PROCESS'] || '',
          // "CUSLOT": dbsap ['CUSLOTNO'] || '',
          "CUSLOT": cuslot,
          "TPKLOT": dbsap ['FG_CHARG'] || '',
          "FG": dbsap ['FG'] || '',
          "CUSTOMER": dbsap ['CUSTOMER'] || '',
          "PART": dbsap ['PART'] || '',
          "PARTNAME": dbsap ['PARTNAME'] || '',
          "MATERIAL": dbsap ['MATERIAL'] || '',
          //---new
          "QUANTITY": dbsap ['QUANTITY'] || '',
          // "PROCESS":dbsap ['PROCESS'] || '',
          // "CUSLOTNO": dbsap ['CUSLOTNO'] || '',
          "CUSLOTNO":  cuslot,
          "FG_CHARG": dbsap ['FG_CHARG'] || '',
          "PARTNAME_PO": dbsap ['PARTNAME_PO'] || '',
          "PART_PO": dbsap ['PART_PO'] || '',
          "CUSTNAME": dbsap ['CUSTNAME'] || '',
          //----------------------
          "ItemPick": ItemPickoutP2, //---->
          "ItemPickcode": ItemPickcodeoutP2, //---->
          "POINTs": "",
          "PCS": "",
          "PCSleft": "",
      
          "SPEC":"",
        
          "UNIT": "",
          "INTERSEC": "",
          "RESULTFORMAT": "",
          "GRAPHTYPE": "",
          "GAP": "",
          //----------------------
          "preview": [],
          "confirmdata": [],
          "ITEMleftUNIT": [],
          "ITEMleftVALUE": [],
          //
          "MeasurmentFOR": "FINAL",
          "inspectionItem": "", //ITEMpice
          "inspectionItemNAME": "",
          "tool": NAME_INS,
          "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
          "dateupdatevalue": day,
           //----------------------
           "USER":input['USER'],
           "USERID":input['USERID'],
        }

        output = 'OK';


      } else {
        output = 'NOK';
      }
    } else {
      output = 'NOK';
    }
  } else {
    output = 'NOK';
  }


  //-------------------------------------
  return res.json(output);
});

router.post('/SURMCS001-geteachITEM', async (req, res) => {
  //-------------------------------------
  console.log('--SURMCS001-geteachITEM--');
  console.log(req.body);
  let inputB = req.body;

  let ITEMSS = '';
  let output = 'NOK';

  for (i = 0; i < SURMCS001db['ItemPickcode'].length; i++) {
    if (SURMCS001db['ItemPickcode'][i]['value'] === inputB['ITEMs']) {
      ITEMSS = SURMCS001db['ItemPickcode'][i]['key'];
    }
  }


  if (ITEMSS !== '') {

    //-------------------------------------
    SURMCS001db['inspectionItem'] = ITEMSS;
    SURMCS001db['inspectionItemNAME'] = inputB['ITEMs'];
    let input = { 'PO': SURMCS001db["PO"], 'CP': SURMCS001db["CP"], 'ITEMs': SURMCS001db['inspectionItem'] };
    //-------------------------------------
    if (input['PO'] !== undefined && input['CP'] !== undefined && input['ITEMs'] !== undefined) {
      let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
      let UNITdata = await mongodb.find(master_FN, UNIT, {});
      let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": SURMCS001db['inspectionItem'] });

      for (i = 0; i < findcp[0]['FINAL'].length; i++) {
        if (findcp[0]['FINAL'][i]['ITEMs'] === input['ITEMs']) {

          // output = [{
          //   "RESULTFORMAT": findcp[0]['FINAL'][i]['RESULTFORMAT'],
          //   "GRAPHTYPE": findcp[0]['FINAL'][i]['GRAPHTYPE'],
          //   "INTERSECTION": findcp[0]['FINAL'][i]['INTERSECTION'],
          //   "DOCUMENT": findcp[0]['FINAL'][i]['DOCUMENT'],
          //   "SPECIFICATION": findcp[0]['FINAL'][i]['SPECIFICATION'],
          //   "POINTPCS": findcp[0]['FINAL'][i]['POINTPCS'],
          //   "POINT": findcp[0]['FINAL'][i]['POINT'],
          //   "PCS": findcp[0]['FINAL'][i]['PCS'],
          //   "FREQUENCY": findcp[0]['FINAL'][i]['FREQUENCY'],
          //   "MODE": findcp[0]['FINAL'][i]['MODE'],
          //   "REMARK": findcp[0]['FINAL'][i]['REMARK'],
          //   "LOAD": findcp[0]['FINAL'][i]['LOAD'],
          //   "CONVERSE": findcp[0]['FINAL'][i]['CONVERSE'],
          // }]

          if (masterITEMs.length > 0) {
            //
            SURMCS001db["RESULTFORMAT"] = masterITEMs[0]['RESULTFORMAT']
            SURMCS001db["GRAPHTYPE"] = masterITEMs[0]['GRAPHTYPE']
          }

          for (j = 0; j < UNITdata.length; j++) {
            if (findcp[0]['FINAL'][i]['UNIT'] == UNITdata[j]['masterID']) {
              SURMCS001db["UNIT"] = UNITdata[j]['UNIT'];
            }
          }

          SURMCS001db["POINTs"] = findcp[0]['FINAL'][i]['POINT'];
          SURMCS001db["PCS"] = findcp[0]['FINAL'][i]['PCS'];
          if (SURMCS001db["PCSleft"] === '') {
            SURMCS001db["PCSleft"] = findcp[0]['FINAL'][i]['PCS'];
          }
          SURMCS001db["SPEC"]='';
          if (findcp[0]['FINAL'][i]['SPECIFICATIONve'] !== undefined) {
            if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'BTW') {
              SURMCS001db["SPEC"] =  `${findcp[0]['FINAL'][i]['SPECIFICATIONve']['BTW_LOW']}-${findcp[0]['FINAL'][i]['SPECIFICATIONve']['BTW_HI']}`;
            } else if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'HIM(>)') {
              SURMCS001db["SPEC"] =  `>${findcp[0]['FINAL'][i]['SPECIFICATIONve']['HIM_L']}`;
            } else if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'LOL(<)') {
              SURMCS001db["SPEC"] =  `<${findcp[0]['FINAL'][i]['SPECIFICATIONve']['LOL_H']}`;
            }else if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'Actual'){
              SURMCS001db["SPEC"] =  'Actual';
            }
          }

          SURMCS001db["INTERSEC"] = "";
          output = 'OK';
          let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
          if (findpo.length > 0) {
            request.post(
              'http://127.0.0.1:16070/SURMCS001-feedback',
              { json: { "PO": SURMCS001db['PO'], "ITEMs": SURMCS001db['inspectionItem'] } },
              function (error, response, body2) {
                if (!error && response.statusCode == 200) {
                  // console.log(body2);
                  if (body2 === 'OK') {
                    // output = 'OK';
                  }
                }
              }
            );
          }
          break;
        }
      }
    }

  } else {
    SURMCS001db["POINTs"] = '',
      SURMCS001db["PCS"] = '',
      SURBAL013db["SPEC"] = '';
      SURMCS001db["PCSleft"] = '',
      SURMCS001db["UNIT"] = "",
      SURMCS001db["INTERSEC"] = "",
      output = 'NOK';
  }

  //-------------------------------------
  return res.json(output);
});

router.post('/SURMCS001-preview', async (req, res) => {
  //-------------------------------------
  console.log('--SURMCS001-preview--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  if (input.length > 0) {
    if (input[0]['V1'] !== undefined) {
      //-------------------------------------
      try {
        SURMCS001db['preview'] = input;
        output = 'OK';
      }
      catch (err) {
        output = 'NOK';
      }
      //-------------------------------------
    } else {
      output = 'NOK';
    }
  } else {
    SURMCS001db['preview'] = [];
    output = 'clear';
  }


  //-------------------------------------
  return res.json(output);
});

router.post('/SURMCS001-confirmdata', async (req, res) => {
  //-------------------------------------
  console.log('--SURMCS001-confirmdata--');
  console.log(req.body);
  // let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {
    let datapush = SURMCS001db['preview'][0]

    if (SURMCS001db['RESULTFORMAT'] === 'Graph') {

    } else if (SURMCS001db['RESULTFORMAT'] === 'Number') {

      let pushdata = SURMCS001db['preview'][0]

      pushdata['V5'] = SURMCS001db['confirmdata'].length + 1
      pushdata['V1'] = `${SURMCS001db['confirmdata'].length + 1}:${pushdata['V1']}`

      SURMCS001db['confirmdata'].push(pushdata);
      SURMCS001db['preview'] = [];
      output = 'OK';
    }
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});



router.post('/SURMCS001-feedback', async (req, res) => {
  //-------------------------------------
  console.log('--SURMCS001-feedback--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  //-------------------------------------
  if (input["PO"] !== undefined && input["ITEMs"] !== undefined) {
    let feedback = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
    if (feedback.length > 0 && feedback[0]['FINAL'] != undefined && feedback[0]['FINAL'][NAME_INS] != undefined && feedback[0]['FINAL'][NAME_INS][input["ITEMs"]] != undefined) {
      // console.log(Object.keys(feedback[0]['FINAL'][NAME_INS][input["ITEMs"]]));
      let oblist = Object.keys(feedback[0]['FINAL'][NAME_INS][input["ITEMs"]]);
      let ob = feedback[0]['FINAL'][NAME_INS][input["ITEMs"]];


      let LISTbuffer = [];
      let ITEMleftVALUEout = [];
      for (i = 0; i < oblist.length; i++) {
        LISTbuffer.push(...ob[oblist[i]])
      }
      SURMCS001db["PCSleft"] = `${parseInt(SURMCS001db["PCS"]) - oblist.length}`;
      if (SURMCS001db['RESULTFORMAT'] === 'Number') {
        for (i = 0; i < LISTbuffer.length; i++) {
          if (LISTbuffer[i]['PO1'] === 'Mean') {
            ITEMleftVALUEout.push({ "V1": 'Mean', "V2": `${LISTbuffer[i]['PO3']}` })
          } else {
            ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO2']}`, "V2": `${LISTbuffer[i]['PO3']}` })
          }

        }

        SURMCS001db["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        SURMCS001db["ITEMleftVALUE"] = ITEMleftVALUEout;

      } else if (SURMCS001db['RESULTFORMAT'] === 'Text') { //add

        for (i = 0; i < LISTbuffer.length; i++) {
          ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO1']}`, "V2": `${LISTbuffer[i]['PO2']}` })
        }

        SURMCS001db["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        SURMCS001db["ITEMleftVALUE"] = ITEMleftVALUEout;

      }
      // output = 'OK';
      if ((parseInt(SURMCS001db["PCS"]) - oblist.length) == 0) {
        //CHECKlist
        for (i = 0; i < feedback[0]['CHECKlist'].length; i++) {
          if (input["ITEMs"] === feedback[0]['CHECKlist'][i]['key']) {
            feedback[0]['CHECKlist'][i]['FINISH'] = 'OK';
            // console.log(feedback[0]['CHECKlist']);
            let feedbackupdate = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'CHECKlist': feedback[0]['CHECKlist'] } });
            break;
          }
        }
        //input["ITEMs"] 
        let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": input["ITEMs"] });


        if (feedback[0]['FINAL_ANS'] === undefined) {
          feedback[0]['FINAL_ANS'] = {}
        }
        if (masterITEMs.length > 0) {
          let anslist = [];
          let anslist_con = [];


          if (masterITEMs[0]['RESULTFORMAT'] === 'Number') {
            for (i = 0; i < LISTbuffer.length; i++) {
              if (LISTbuffer[i]['PO1'] === 'Mean') {
                anslist.push(LISTbuffer[i]['PO3'])
                anslist_con.push(LISTbuffer[i]['PO5'])
              }
            }

            let sum1 = anslist.reduce((a, b) => a + b, 0);
            let avg1 = (sum1 / anslist.length) || 0;
            let sum2 = anslist_con.reduce((a, b) => a + b, 0);
            let avg2 = (sum2 / anslist_con.length) || 0;

            feedback[0]['FINAL_ANS'][input["ITEMs"]] = avg1;
            feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_c`] = avg2;

            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });


          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Text') {

            feedback[0]['FINAL_ANS'][input["ITEMs"]] = LISTbuffer[0]['PO2'];
            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });


          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Graph') {

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Picture') {
            feedback[0]['FINAL_ANS'][input["ITEMs"]] = 'Good';
            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'OCR') {
            feedback[0]['FINAL_ANS'][input["ITEMs"]] = LISTbuffer[0]['PIC1data'];
            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });

          } else {

          }
        }

        let CHECKlistdataFINISH = [];

        for (i = 0; i < feedback[0]['CHECKlist'].length; i++) {
          if (feedback[0]['CHECKlist'][i]['FINISH'] !== undefined) {
            if (feedback[0]['CHECKlist'][i]['FINISH'] === 'OK') {
              CHECKlistdataFINISH.push(feedback[0]['CHECKlist'][i]['key'])
            } else {
            }
          }
        }

        if (CHECKlistdataFINISH.length === feedback[0]['CHECKlist'].length) {
          // feedback[0]['FINAL_ANS']["ALL_DONE"] = "DONE";
          // feedback[0]['FINAL_ANS']["PO_judgment"] ="pass";
          let feedbackupdateFINISH = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { "ALL_DONE": "DONE", "PO_judgment": "pass", } });
        }

      }
    } else {
      SURMCS001db["ITEMleftUNIT"] = '';
      SURMCS001db["ITEMleftVALUE"] = '';
    }

  }

  //-------------------------------------
  return res.json(output);
});

router.post('/SURMCS001-SETZERO', async (req, res) => {
  //-------------------------------------
  console.log('--SURMCS001fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    SURMCS001db = {
      "INS": NAME_INS,
      "PO": "",
      "CP": "",
      "MATCP": '',
      "QTY": "",
      "PROCESS": "",
      "CUSLOT": "",
      "TPKLOT": "",
      "FG": "",
      "CUSTOMER": "",
      "POINTs": "",
      "PART": "",
      "PARTNAME": "",
      "MATERIAL": "",
      //---new
      "QUANTITY": '',
      // "PROCESS": '',
      "CUSLOTNO": '',
      "FG_CHARG": '',
      "PARTNAME_PO": '',
      "PART_PO": '',
      "CUSTNAME": '',
      //-----
      "ItemPick": [],
      "ItemPickcode": [],
      "PCS": "",
      "PCSleft": "",
      
      "SPEC":"",
    
      "UNIT": "",
      "INTERSEC": "",
      "RESULTFORMAT": "",
      "GRAPHTYPE": "",
      "GAP": "",
      //---------
      "preview": [],
      "confirmdata": [],
      "ITEMleftUNIT": [],
      "ITEMleftVALUE": [],
      //
      "MeasurmentFOR": "FINAL",
      "inspectionItem": "", //ITEMpice
      "inspectionItemNAME": "",
      "tool": NAME_INS,
      "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
      "dateupdatevalue": day,
    }
    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/SURMCS001-CLEAR', async (req, res) => {
  //-------------------------------------
  console.log('--SURMCS001fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    SURMCS001db['preview'] = [];
    SURMCS001db['confirmdata'] = [];

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/SURMCS001-RESETVALUE', async (req, res) => {
  //-------------------------------------
  console.log('--SURMCS001fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    let all = SURMCS001db['confirmdata'].length
    if (all > 0) {
      SURMCS001db['confirmdata'].pop();
    }

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

//"value":[],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN


router.post('/SURMCS001-FINISH', async (req, res) => {
  //-------------------------------------
  console.log('--SURMCS001-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  if (SURMCS001db['RESULTFORMAT'] === 'Number' || SURMCS001db['RESULTFORMAT'] === 'Text') {

    SURMCS001db["value"] = [];
    for (i = 0; i < SURMCS001db['confirmdata'].length; i++) {
      SURMCS001db["value"].push({
        "PO1": SURMCS001db["inspectionItemNAME"],
        "PO2": SURMCS001db['confirmdata'][i]['V1'],
        "PO3": SURMCS001db['confirmdata'][i]['V2'],
        "PO4": SURMCS001db['confirmdata'][i]['V3'],
        "PO5": SURMCS001db['confirmdata'][i]['V4'],
        "PO6": "-",
        "PO7": "-",
        "PO8": "-",
        "PO9": i + 1,
        "PO10": "AUTO",
      });
    }
    if (SURMCS001db["value"].length > 0) {
      let mean01 = [];
      let mean02 = [];
      for (i = 0; i < SURMCS001db["value"].length; i++) {
        mean01.push(parseFloat(SURMCS001db["value"][i]["PO3"]));
        mean02.push(parseFloat(SURMCS001db["value"][i]["PO5"]));
      }
      let sum1 = mean01.reduce((a, b) => a + b, 0);
      let avg1 = (sum1 / mean01.length) || 0;
      let sum2 = mean02.reduce((a, b) => a + b, 0);
      let avg2 = (sum2 / mean02.length) || 0;
      SURMCS001db["value"].push({
        "PO1": 'Mean',
        "PO2": SURMCS001db['confirmdata'][0]['V1'],
        "PO3": avg1,
        "PO4": SURMCS001db['confirmdata'][0]['V3'],
        "PO5": avg2,
      });
    }

  } else if (SURMCS001db['RESULTFORMAT'] === 'OCR' || SURMCS001db['RESULTFORMAT'] === 'Picture') {

  } else if (SURMCS001db['RESULTFORMAT'] === 'Graph') {

  }

  if (SURMCS001db['RESULTFORMAT'] === 'Number') {
    request.post(
      'http://127.0.0.1:16070/FINISHtoDB',
      { json: SURMCS001db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          SURMCS001db['confirmdata'] = [];
          SURMCS001db["value"] = [];
          //------------------------------------------------------------------------------------

          request.post(
            'http://127.0.0.1:16070/SURMCS001-feedback',
            { json: { "PO": SURMCS001db['PO'], "ITEMs": SURMCS001db['inspectionItem'] } },
            function (error, response, body2) {
              if (!error && response.statusCode == 200) {
                // console.log(body2);
                // if (body2 === 'OK') {
                output = 'OK';
                // }
              }
            }
          );

          //------------------------------------------------------------------------------------
          // }

        }
      }
    );

  }

  //-------------------------------------
  return res.json(SURMCS001db);
});


router.post('/SURMCS001-FINISH-APR', async (req, res) => {
  //-------------------------------------
  console.log('--SURMCS001-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  // for (i = 0; i < parseInt(SURMCS001db['PCS']); i++) {

  if (SURMCS001db['RESULTFORMAT'] === 'Text' && input["APRitem"] !== undefined && input["APRre"] !== undefined) {

    SURMCS001db["value"] = [];

    SURMCS001db["value"].push({
      "PO1": input["APRitem"],
      "PO2": input["APRre"],
      "PO3": "-",
      "PO4": "-",
      "PO5": "-",
      "PO6": "-",
      "PO7": "-",
      "PO8": "-",
      "PO9": i + 1,
      "PO10": "AUTO",
    });


  }

  if (SURMCS001db['RESULTFORMAT'] === 'Text') {
    request.post(
      'http://127.0.0.1:16070/FINISHtoDB',
      { json: SURMCS001db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          SURMCS001db['confirmdata'] = [];
          SURMCS001db["value"] = [];
          //------------------------------------------------------------------------------------
          request.post(
            'http://127.0.0.1:16070/SURMCS001-feedback',
            { json: { "PO": SURMCS001db['PO'], "ITEMs": SURMCS001db['inspectionItem'] } },
            function (error, response, body2) {
              if (!error && response.statusCode == 200) {
                // console.log(body2);
                // if (body2 === 'OK') {
                output = 'OK';
                // }
              }
            }
          );
          //------------------------------------------------------------------------------------
          // }

        }
      }
    );

  }
  // }


  //-------------------------------------
  return res.json(output);
});

router.post('/SURMCS001-FINISH-APR', async (req, res) => {
  //-------------------------------------
  console.log('--SURMCS001-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  // for (i = 0; i < parseInt(SURMCS001db['PCS']); i++) {

  if (SURMCS001db['RESULTFORMAT'] === 'Text' && input["APRitem"] !== undefined && input["APRre"] !== undefined) {

    SURMCS001db["value"] = [];

    SURMCS001db["value"].push({
      "PO1": input["APRitem"],
      "PO2": input["APRre"],
      "PO3": "-",
      "PO4": "-",
      "PO5": "-",
      "PO6": "-",
      "PO7": "-",
      "PO8": "-",
      "PO9": i + 1,
      "PO10": "AUTO",
    });


  }

  if (SURMCS001db['RESULTFORMAT'] === 'Text') {
    request.post(
      'http://127.0.0.1:16070/FINISHtoDB',
      { json: SURMCS001db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          SURMCS001db['confirmdata'] = [];
          SURMCS001db["value"] = [];
          //------------------------------------------------------------------------------------
          request.post(
            'http://127.0.0.1:16070/SURMCS001-feedback',
            { json: { "PO": SURMCS001db['PO'], "ITEMs": SURMCS001db['inspectionItem'] } },
            function (error, response, body2) {
              if (!error && response.statusCode == 200) {
                // console.log(body2);
                // if (body2 === 'OK') {
                output = 'OK';
                // }
              }
            }
          );
          //------------------------------------------------------------------------------------
          // }

        }
      }
    );

  }
  // }




  //-------------------------------------
  return res.json(output);
});


router.post('/SURMCS001-FINISH-IMG', async (req, res) => {
  //-------------------------------------
  console.log('--SURMCS001-FINISH--');
  // console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  // for (i = 0; i < parseInt(SURMCS001db['PCS']); i++) {

  if ((SURMCS001db['RESULTFORMAT'] === 'OCR' || SURMCS001db['RESULTFORMAT'] === 'Picture') && input["IMG01"] !== undefined && input["IMG02"] !== undefined && input["IMG03"] !== undefined && input["IMG04"] !== undefined) {

    SURMCS001db["value"] = [];

    SURMCS001db["value"].push({
      "PIC1": input["IMG01"],
      "PIC2": input["IMG02"],
      "PIC3": input["IMG03"],
      "PIC4": input["IMG04"],
      "PIC1data": input["IMG01data"] || 0,
      "PIC2data": input["IMG02data"] || 0,
      "PIC3data": input["IMG03data"] || 0,
      "PIC4data": input["IMG04data"] || 0,
    });


  }

  if (SURMCS001db['RESULTFORMAT'] === 'OCR' ||
    SURMCS001db['RESULTFORMAT'] === 'Picture') {
    request.post(
      'http://127.0.0.1:16070/FINISHtoDB',
      { json: SURMCS001db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          SURMCS001db['confirmdata'] = [];
          SURMCS001db["value"] = [];
          //------------------------------------------------------------------------------------
          request.post(
            'http://127.0.0.1:16070/SURMCS001-feedback',
            { json: { "PO": SURMCS001db['PO'], "ITEMs": SURMCS001db['inspectionItem'] } },
            function (error, response, body2) {
              if (!error && response.statusCode == 200) {
                // console.log(body2);
                // if (body2 === 'OK') {
                output = 'OK';
                // }
              }
            }
          );
          //------------------------------------------------------------------------------------
          // }

        }
      }
    );

  }


  if ((SURMCS001db['RESULTFORMAT'] === 'Number' ) && input["IMG01"] !== undefined && input["IMG02"] !== undefined && input["IMG03"] !== undefined && input["IMG04"] !== undefined) {

    SURMCS001db["value"] = [];

    SURMCS001db["value"].push({
      "PIC1": input["IMG01"],
      "PIC2": input["IMG02"],
      "PIC3": input["IMG03"],
      "PIC4": input["IMG04"],
      "PIC1data": input["IMG01data"] || 0,
      "PIC2data": input["IMG02data"] || 0,
      "PIC3data": input["IMG03data"] || 0,
      "PIC4data": input["IMG04data"] || 0,
    });

    if (SURMCS001db['RESULTFORMAT'] === 'Number' ) {
    request.post(
      'http://127.0.0.1:16070/FINISHtoDB',
      { json: SURMCS001db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          SURMCS001db['confirmdata'] = [];
          SURMCS001db["value"] = [];
          //------------------------------------------------------------------------------------
          request.post(
            'http://127.0.0.1:16070/SURMCS001-feedback',
            { json: { "PO": SURMCS001db['PO'], "ITEMs": SURMCS001db['inspectionItem'] } },
            function (error, response, body2) {
              if (!error && response.statusCode == 200) {
                // console.log(body2);
                // if (body2 === 'OK') {
                output = 'OK';
                // }
              }
            }
          );
          //------------------------------------------------------------------------------------
          // }

        }
      }
    );

  }


  }

  //-------------------------------------
  return res.json(output);
});

module.exports = router;


