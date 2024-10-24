const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');
var mongodbINS = require('../../function/mongodbINS');
var mssql = require('../../function/mssql');
var request = require('request');
const axios = require("../../function/axios");

//----------------- date

const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
let day = d;

//----------------- SETUP

let NAME_INS = 'APP-PHBP12'

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

let APPPHBP12db = {
  "INS": NAME_INS,
  "PO": "",
  "CP": "",
  "MATCP": "",
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
  //
  "PIC": "",
  //----------------------
  "USER": '',
  "USERID": '',
}

router.get('/FINAL/CHECK-APPPHBP12', async (req, res) => {

  return res.json(APPPHBP12db['PO']);
});


router.post('/FINAL/APPPHBP12db', async (req, res) => {
  //-------------------------------------
  console.log('--APPPHBP12db--');
  // console.log(req.body);
  //-------------------------------------
  let finddb = [{}];
  try {

    finddb = APPPHBP12db;
    finddbbuffer = finddb;
  }
  catch (err) {
    finddb = finddbbuffer;
  }
  //-------------------------------------
  return res.json(finddb);
});

router.post('/FINAL/GETINtoAPPPHBP12', async (req, res) => {
  //-------------------------------------
  console.log('--GETINtoAPPPHBP12--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  check = APPPHBP12db;
  console.log("-------->>>>");
  if (input['PO'] !== undefined && input['CP'] !== undefined && check['PO'] === '' && input['USER'] !== undefined && input['USERID'] !== undefined) {
    // let dbsap = await mssql.qurey(`select * FROM [SAPData_HES_ISN].[dbo].[tblSAPDetail] where [PO] = ${input['PO']}`);
    console.log("-------->>>>");
    let findPO = await mongodb.findSAP('mongodb://172.23.10.75:27017', "ORDER", "ORDER", {});

    let cuslot = '';


    //&& findPO[0][`DATA`].length > 0
    if (findPO[0][`DATA`] != undefined) {


      let dbsap = ''
      for (i = 0; i < findPO[0][`DATA`].length; i++) {
        if (findPO[0][`DATA`][i][`PO`] === input['PO']) {
          dbsap = findPO[0][`DATA`][i];
          // break;
          cuslot = cuslot + findPO[0][`DATA`][i][`CUSLOTNO`] + ','
        }
      }

      //http://172.23.10.40:16700/RAWDATA/sapget


      if (dbsap === '') {

        // try {
        //   let resp = await axios.post('http://tp-portal.thaiparker.co.th/API_QcReport/ZBAPI_QC_INTERFACE', {
        //     "BAPI_NAME": "ZPPIN011_OUT",
        //     "IMP_TEXT02": input['PO'],
        //     "TABLE_NAME": "PPORDER"
        //   });

        //   // if (resp.status == 200) {
        //   let returnDATA = resp;
        //   // output = returnDATA["Records"] || []
        //   console.log(returnDATA["Records"])
        //   if (returnDATA["Records"].length > 0) {


        //     dataout = {
        //       'PO': `${parseInt(returnDATA["Records"][0]['PO'])}`,
        //       'SEQUENCE': returnDATA["Records"][0]['SEQ'],
        //       'CP': `${parseInt(returnDATA["Records"][0]['CPMAT'])}`,
        //       'FG': `${parseInt(returnDATA["Records"][0]['FGMAT'])}`,
        //       'STATUS': returnDATA["Records"][0]['STA'],
        //       'QUANTITY': returnDATA["Records"][0]['QTYT'],
        //       'UNIT': returnDATA["Records"][0]['UNIT'],
        //       'COSTCENTER': returnDATA["Records"][0]['CUSTNA'],

        //       'PART': returnDATA["Records"][0]['PARTNO'],
        //       'PARTNAME': returnDATA["Records"][0]['PARTNA'],
        //       'MATERIAL': returnDATA["Records"][0]['MATNA'],
        //       'CUSTOMER': returnDATA["Records"][0]['CUSLOTNO'],
        //       'PROCESS': returnDATA["Records"][0]['PROC'],
        //       'WGT_PC': returnDATA["Records"][0]['WEIGHT_PC'],
        //       'WGT_JIG': returnDATA["Records"][0]['WEIGHT_JIG'],
        //       'ACTQTY': returnDATA["Records"][0]['ACT_QTY'],
        //       'CUSLOTNO': returnDATA["Records"][0]['CUSLOTNO'],
        //       'FG_CHARG': returnDATA["Records"][0]['FG_CHARG'],
        //       'CUSTNAME': returnDATA["Records"][0]['CUST_FULLNM'],
        //     };


        //     dbsap = dataout
        //   }
        //   // }
        // } catch (err) {
        //   output = [];
        // }

        try {
          let resp = await axios.post('http://172.23.10.40:16700/RAWDATA/sapget', {
            "ORDER": input['PO'],
          });
          let returnDATA = resp;
          // output = returnDATA["Records"] || []
          if (returnDATA.length > 0) {


            dataout = {
              'PO': `${parseInt(returnDATA[0]['PO'])}`,
              'SEQUENCE': returnDATA[0]['SEQ'],
              'CP': `${parseInt(returnDATA[0]['CPMAT'])}`,
              'FG': `${parseInt(returnDATA[0]['FGMAT'])}`,
              'STATUS': returnDATA[0]['STA'],
              'QUANTITY': returnDATA[0]['QTYT'],
              'UNIT': returnDATA[0]['UNIT'],
              'COSTCENTER': returnDATA[0]['CUSTNA'],

              'PART': returnDATA[0]['PARTNO'],
              'PARTNAME': returnDATA[0]['PARTNA'],
              'MATERIAL': returnDATA[0]['MATNA'],
              'CUSTOMER': returnDATA[0]['CUSLOTNO'],
              'PROCESS': returnDATA[0]['PROC'],
              'WGT_PC': returnDATA[0]['WEIGHT_PC'],
              'WGT_JIG': returnDATA[0]['WEIGHT_JIG'],
              'ACTQTY': returnDATA[0]['ACT_QTY'],
              'CUSLOTNO': returnDATA[0]['CUSLOTNO'],
              'FG_CHARG': returnDATA[0]['FG_CHARG'],
              'CUSTNAME': returnDATA[0]['CUST_FULLNM'],
            };

            dbsap = dataout
          }
        } catch (err) {
          output = [];
        }
      }

      console.log(dbsap)



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
        var picS = "";
        // console.log(findcp[0]['Pimg'])
        if (findcp.length > 0) {
          if (findcp[0]['Pimg'] !== undefined) {
            picS = `${findcp[0]['Pimg'][`P1`]}`
          }

        }

        APPPHBP12db = {
          "INS": NAME_INS,
          "PO": input['PO'] || '',
          "CP": input['CP'] || '',
          "MATCP": input['CP'] || '',
          "QTY": dbsap['QUANTITY'] || '',
          "PROCESS": dbsap['PROCESS'] || '',
          // "CUSLOT": dbsap['CUSLOTNO'] || '',
          "CUSLOT": cuslot,
          "TPKLOT": dbsap['FG_CHARG'] || '',
          "FG": dbsap['FG'] || '',
          "CUSTOMER": dbsap['CUSTOMER'] || '',
          "PART": dbsap['PART'] || '',
          "PARTNAME": dbsap['PARTNAME'] || '',
          "MATERIAL": dbsap['MATERIAL'] || '',
          //---new
          "QUANTITY": dbsap['QUANTITY'] || '',
          // "PROCESS":dbsap ['PROCESS'] || '',
          // "CUSLOTNO": dbsap['CUSLOTNO'] || '',
          "CUSLOTNO": cuslot,
          "FG_CHARG": dbsap['FG_CHARG'] || '',
          "PARTNAME_PO": dbsap['PARTNAME_PO'] || '',
          "PART_PO": dbsap['PART_PO'] || '',
          "CUSTNAME": dbsap['CUSTNAME'] || '',
          "UNITSAP": dbsap['UNIT'] || '',
          //----------------------
          "ItemPick": ItemPickoutP2, //---->
          "ItemPickcode": ItemPickcodeoutP2, //---->
          "POINTs": "",
          "PCS": "",
          "PCSleft": "",
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
          //
          "PIC": picS,
          //----------------------
          "USER": input['USER'],
          "USERID": input['USERID'],
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

router.post('/FINAL/APPPHBP12-geteachITEM', async (req, res) => {
  //-------------------------------------
  console.log('--APPPHBP12-geteachITEM--');
  console.log(req.body);
  let inputB = req.body;

  let ITEMSS = '';
  let output = 'NOK';

  for (i = 0; i < APPPHBP12db['ItemPickcode'].length; i++) {
    if (APPPHBP12db['ItemPickcode'][i]['value'] === inputB['ITEMs']) {
      ITEMSS = APPPHBP12db['ItemPickcode'][i]['key'];
    }
  }


  if (ITEMSS !== '') {

    //-------------------------------------
    APPPHBP12db['inspectionItem'] = ITEMSS;
    APPPHBP12db['inspectionItemNAME'] = inputB['ITEMs'];
    let input = { 'PO': APPPHBP12db["PO"], 'CP': APPPHBP12db["CP"], 'ITEMs': APPPHBP12db['inspectionItem'] };
    //-------------------------------------
    if (input['PO'] !== undefined && input['CP'] !== undefined && input['ITEMs'] !== undefined) {
      let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
      let UNITdata = await mongodb.find(master_FN, UNIT, {});
      let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": APPPHBP12db['inspectionItem'] });

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
            APPPHBP12db["RESULTFORMAT"] = masterITEMs[0]['RESULTFORMAT']
            APPPHBP12db["GRAPHTYPE"] = masterITEMs[0]['GRAPHTYPE']
          }

          for (j = 0; j < UNITdata.length; j++) {
            if (findcp[0]['FINAL'][i]['UNIT'] == UNITdata[j]['masterID']) {
              APPPHBP12db["UNIT"] = UNITdata[j]['UNIT'];
            }
          }

          APPPHBP12db["POINTs"] = findcp[0]['FINAL'][i]['POINT'];
          APPPHBP12db["PCS"] = findcp[0]['FINAL'][i]['PCS'];


          APPPHBP12db["PCSleft"] = findcp[0]['FINAL'][i]['PCS'];



          APPPHBP12db["INTERSEC"] = "";
          output = 'OK';
          let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
          if (findpo.length > 0) {
            request.post(
              'http://127.0.0.1:16070/FINAL/APPPHBP12-feedback',
              { json: { "PO": APPPHBP12db['PO'], "ITEMs": APPPHBP12db['inspectionItem'] } },
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
    APPPHBP12db["POINTs"] = '',
      APPPHBP12db["PCS"] = '',
      APPPHBP12db["PCSleft"] = '',
      APPPHBP12db["UNIT"] = "",
      APPPHBP12db["INTERSEC"] = "",
      output = 'NOK';
  }

  //-------------------------------------
  return res.json(output);
});

router.post('/FINAL/APPPHBP12-preview', async (req, res) => {
  //-------------------------------------
  console.log('--APPPHBP12-preview--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  if (input.length > 0) {
    if (input[0]['V1'] !== undefined) {
      //-------------------------------------
      try {
        APPPHBP12db['preview'] = input;
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
    APPPHBP12db['preview'] = [];
    output = 'clear';
  }


  //-------------------------------------
  return res.json(output);
});

router.post('/FINAL/APPPHBP12-confirmdata', async (req, res) => {
  //-------------------------------------
  console.log('--APPPHBP12-confirmdata--');
  console.log(req.body);
  // let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {
    let datapush = APPPHBP12db['preview'][0]

    if (APPPHBP12db['RESULTFORMAT'] === 'Graph') {

    } else if (APPPHBP12db['RESULTFORMAT'] === 'Number') {

      let pushdata = APPPHBP12db['preview'][0]

      pushdata['V5'] = APPPHBP12db['confirmdata'].length + 1
      pushdata['V1'] = `${APPPHBP12db['confirmdata'].length + 1}:${pushdata['V1']}`

      APPPHBP12db['confirmdata'].push(pushdata);
      APPPHBP12db['preview'] = [];
      output = 'OK';
    }
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});



router.post('/FINAL/APPPHBP12-feedback', async (req, res) => {
  //-------------------------------------
  console.log('--APPPHBP12-feedback--');
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

      if (ob[0] !== undefined) {
        for (i = 0; i < oblist.length; i++) {
          LISTbuffer.push(...ob[oblist[i]])
        }
      } else {
        for (i = 0; i < oblist.length; i++) {
          LISTbuffer.push(ob[oblist[i]])
        }
      }


      APPPHBP12db["PCSleft"] = `${parseInt(APPPHBP12db["PCS"]) - oblist.length}`;
      if (APPPHBP12db['RESULTFORMAT'] === 'Number') {
        for (i = 0; i < LISTbuffer.length; i++) {
          if (LISTbuffer[i]['PO1'] === 'Mean') {
            ITEMleftVALUEout.push({ "V1": 'Mean', "V2": `${LISTbuffer[i]['PO3']}` })
          } else {
            ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO2']}`, "V2": `${LISTbuffer[i]['PO3']}` })
          }

        }

        APPPHBP12db["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        APPPHBP12db["ITEMleftVALUE"] = ITEMleftVALUEout;

      } else if (APPPHBP12db['RESULTFORMAT'] === 'Text') { //add

        for (i = 0; i < LISTbuffer.length; i++) {
          ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO1']}`, "V2": `${LISTbuffer[i]['PO2']}` })
        }

        APPPHBP12db["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        APPPHBP12db["ITEMleftVALUE"] = ITEMleftVALUEout;

      }
      // output = 'OK';
      if ((parseInt(APPPHBP12db["PCS"]) - oblist.length) == 0) {
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

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'OCR') {

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
      APPPHBP12db["ITEMleftUNIT"] = '';
      APPPHBP12db["ITEMleftVALUE"] = '';
    }

  }

  //-------------------------------------
  return res.json(output);
});

router.post('/FINAL/APPPHBP12-SETZERO', async (req, res) => {
  //-------------------------------------
  console.log('--APPPHBP12fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    APPPHBP12db = {
      "INS": NAME_INS,
      "PO": "",
      "CP": "",
      "MATCP": "",
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
      //
      "PIC": "",
      //----------------------
      "USER": '',
      "USERID": '',
    }
    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/FINAL/APPPHBP12-CLEAR', async (req, res) => {
  //-------------------------------------
  console.log('--APPPHBP12fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    APPPHBP12db['preview'] = [];
    APPPHBP12db['confirmdata'] = [];

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/FINAL/APPPHBP12-RESETVALUE', async (req, res) => {
  //-------------------------------------
  console.log('--APPPHBP12fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    let all = APPPHBP12db['confirmdata'].length
    if (all > 0) {
      APPPHBP12db['confirmdata'].pop();
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


router.post('/FINAL/APPPHBP12-FINISH', async (req, res) => {
  //-------------------------------------
  console.log('--APPPHBP12-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  if (APPPHBP12db['RESULTFORMAT'] === 'Number' || APPPHBP12db['RESULTFORMAT'] === 'Text') {

    APPPHBP12db["value"] = [];
    for (i = 0; i < APPPHBP12db['confirmdata'].length; i++) {
      APPPHBP12db["value"].push({
        "PO1": APPPHBP12db["inspectionItemNAME"],
        "PO2": APPPHBP12db['confirmdata'][i]['V1'],
        "PO3": APPPHBP12db['confirmdata'][i]['V2'],
        "PO4": APPPHBP12db['confirmdata'][i]['V3'],
        "PO5": APPPHBP12db['confirmdata'][i]['V4'],
        "PO6": "-",
        "PO7": "-",
        "PO8": "-",
        "PO9": i + 1,
        "PO10": "AUTO",
      });
    }
    if (APPPHBP12db["value"].length > 0) {
      let mean01 = [];
      let mean02 = [];
      for (i = 0; i < APPPHBP12db["value"].length; i++) {
        mean01.push(parseFloat(APPPHBP12db["value"][i]["PO3"]));
        mean02.push(parseFloat(APPPHBP12db["value"][i]["PO5"]));
      }
      let sum1 = mean01.reduce((a, b) => a + b, 0);
      let avg1 = (sum1 / mean01.length) || 0;
      let sum2 = mean02.reduce((a, b) => a + b, 0);
      let avg2 = (sum2 / mean02.length) || 0;
      APPPHBP12db["value"].push({
        "PO1": 'Mean',
        "PO2": APPPHBP12db['confirmdata'][0]['V1'],
        "PO3": avg1,
        "PO4": APPPHBP12db['confirmdata'][0]['V3'],
        "PO5": avg2,
      });
    }

  } else if (APPPHBP12db['RESULTFORMAT'] === 'OCR' || APPPHBP12db['RESULTFORMAT'] === 'Picture') {

  } else if (APPPHBP12db['RESULTFORMAT'] === 'Graph') {

  }

  if (APPPHBP12db['RESULTFORMAT'] === 'Number' ||
    APPPHBP12db['RESULTFORMAT'] === 'Text' ||
    APPPHBP12db['RESULTFORMAT'] === 'OCR' ||
    APPPHBP12db['RESULTFORMAT'] === 'Picture') {
    request.post(
      'http://127.0.0.1:16070/FINAL/FINISHtoDB',
      { json: APPPHBP12db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          APPPHBP12db['confirmdata'] = [];
          APPPHBP12db["value"] = [];
          //------------------------------------------------------------------------------------

          request.post(
            'http://127.0.0.1:16070/FINAL/APPPHBP12-feedback',
            { json: { "PO": APPPHBP12db['PO'], "ITEMs": APPPHBP12db['inspectionItem'] } },
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
  return res.json(APPPHBP12db);
});


router.post('/FINAL/APPPHBP12-FINISH-APR', async (req, res) => {
  //-------------------------------------
  console.log('--APPPHBP12-FINISH-APR--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  // for (i = 0; i < parseInt(APPPHBP12db['PCS']); i++) {

  if (APPPHBP12db['RESULTFORMAT'] === 'Text' && input["APRitem"] !== undefined && input["APRre"] !== undefined) {

    APPPHBP12db["value"] = {
      "PO1": input["APRitem"],
      "PO2": input["APRre"],
      "PO3": "-",
      "PO4": "-",
      "PO5": "-",
      "PO6": "-",
      "PO7": "-",
      "PO8": "-",
      "PO9": 1,
      "PO10": "AUTO",
    };


  }

  if (APPPHBP12db['RESULTFORMAT'] === 'Text') {
    request.post(
      'http://127.0.0.1:16070/FINAL/FINISHtoDB-apr',
      { json: APPPHBP12db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          APPPHBP12db['confirmdata'] = [];
          APPPHBP12db["value"] = [];
          //------------------------------------------------------------------------------------
          request.post(
            'http://127.0.0.1:16070/FINAL/APPPHBP12-feedback',
            { json: { "PO": APPPHBP12db['PO'], "ITEMs": APPPHBP12db['inspectionItem'], "PIC": APPPHBP12db['PIC'] } },
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


module.exports = router;


