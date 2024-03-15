const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');
var mongodbINS = require('../../function/mongodbINS');
var mssql = require('../../function/mssql');
var request = require('request');

//----------------- date

const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
let day = d;

function evil(fn) {
  return new Function('return ' + fn)();
}

//----------------- SETUP

let NAME_INS = 'SUR-BAL-013'

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let GRAPH_TABLE = 'GRAPH_TABLE';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';
let UNIT = 'UNIT';
let CAL1 = 'CALCULATE';

//----------------- dynamic

let finddbbuffer = [{}];

let SURBAL013db = {
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
  "GAPname": '',
  "GAPnameList": [],
  "GAPnameListdata": ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
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
  "INTERSEC_ERR": 0,
  "K1b": '',
  "K1v": '',
  "FORMULA": '',
  "confirmdataCW": [{
    "VAL1": "",
    "VAL2": "",
    "Aear": "",
    "FORMULA": "",
  }],
  //----------------------
  "USER": '',
  "USERID": '',
}



router.get('/CHECK-SURBAL013', async (req, res) => {

  return res.json(SURBAL013db['PO']);
});


router.post('/SURBAL013db', async (req, res) => {
  //-------------------------------------
  // console.log('--SURBAL013db--');
  // console.log(req.body);
  //-------------------------------------
  let finddb = [{}];
  try {


    // console.log(SURBAL013db['inspectionItem'])
    if (SURBAL013db['RESULTFORMAT'] === 'CAL1') {
      let feedbackLast = await mongodb.find("BUFFERCAL", "SURBAL013", { "PO": SURBAL013db['PO'] });
      if (feedbackLast.length > 0) {
        SURBAL013db['confirmdataCW'][0]['VAL1'] = feedbackLast[0]['VAL1'];
        SURBAL013db['confirmdataCW'][0]['VAL2'] = feedbackLast[0]['VAL2'];
        SURBAL013db['confirmdataCW'][0]['Area'] = feedbackLast[0]['Area'];
        SURBAL013db['confirmdataCW'][0]['FORMULA'] = feedbackLast[0]['FORMULA'];

      }
    } else {
      SURBAL013db['confirmdataCW'][0]['VAL1'] = "";
      SURBAL013db['confirmdataCW'][0]['VAL2'] = "";
      SURBAL013db['confirmdataCW'][0]['Area'] = "";
      SURBAL013db['confirmdataCW'][0]['FORMULA'] = "";
    }


    finddb = SURBAL013db;
    finddbbuffer = finddb;
  }
  catch (err) {
    finddb = finddbbuffer;
  }
  //-------------------------------------
  return res.json(finddb);
});

router.post('/GETINtoSURBAL013', async (req, res) => {
  //-------------------------------------
  console.log('--GETINtoSURBAL013--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  check = SURBAL013db;
  if (input['PO'] !== undefined && input['CP'] !== undefined && check['PO'] === '' && input['USER'] !== undefined && input['USERID'] !== undefined) {
    // let dbsap = await mssql.qurey(`select * FROM [SAPData_GW_GAS].[dbo].[tblSAPDetail] where [PO] = ${input['PO']}`);

    let findPO = await mongodb.findSAP('mongodb://172.23.10.39:12010', "ORDER", "ORDER", {});

    let cuslot = '';

    if (findPO[0][`DATA`] != undefined && findPO[0][`DATA`].length > 0) {
      let dbsap = ''
      for (i = 0; i < findPO[0][`DATA`].length; i++) {
        if (findPO[0][`DATA`][i][`PO`] === input['PO']) {
          dbsap = findPO[0][`DATA`][i];
          // break;
          cuslot = cuslot + findPO[0][`DATA`][i][`CUSLOTNO`] + ','
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



        SURBAL013db = {
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
          "GAPname": '',
          "GAPnameList": [],
          "GAPnameListdata": ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
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
          "INTERSEC_ERR": 0,
          "K1b": '',
          "K1v": '',
          "FORMULA": '',
          "confirmdataCW": [{
            "VAL1": "",
            "VAL2": "",
            "Aear": "",
            "FORMULA": "",
          }],
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

router.post('/SURBAL013-geteachITEM', async (req, res) => {
  //-------------------------------------
  console.log('--SURBAL013-geteachITEM--');
  console.log(req.body);
  let inputB = req.body;

  let ITEMSS = '';
  let output = 'NOK';

  for (i = 0; i < SURBAL013db['ItemPickcode'].length; i++) {
    if (SURBAL013db['ItemPickcode'][i]['value'] === inputB['ITEMs']) {
      ITEMSS = SURBAL013db['ItemPickcode'][i]['key'];
    }
  }


  if (ITEMSS !== '') {

    //-------------------------------------
    SURBAL013db['inspectionItem'] = ITEMSS;
    SURBAL013db['inspectionItemNAME'] = inputB['ITEMs'];
    let input = { 'PO': SURBAL013db["PO"], 'CP': SURBAL013db["CP"], 'ITEMs': SURBAL013db['inspectionItem'] };
    //-------------------------------------
    if (input['PO'] !== undefined && input['CP'] !== undefined && input['ITEMs'] !== undefined) {
      let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
      let UNITdata = await mongodb.find(master_FN, UNIT, {});
      let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": SURBAL013db['inspectionItem'] });

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

            SURBAL013db["RESULTFORMAT"] = masterITEMs[0]['RESULTFORMAT']
            SURBAL013db["GRAPHTYPE"] = masterITEMs[0]['GRAPHTYPE']
            //------------------------------------

            let graph = await mongodb.find(PATTERN, GRAPH_TABLE, {});
            SURBAL013db['GAPnameList'] = [];
            for (k = 0; k < graph.length; k++) {
              SURBAL013db['GAPnameList'].push(graph[k]['NO']);
            }
          }

          for (j = 0; j < UNITdata.length; j++) {
            if (findcp[0]['FINAL'][i]['UNIT'] == UNITdata[j]['masterID']) {
              SURBAL013db["UNIT"] = UNITdata[j]['UNIT'];
            }
          }

          console.log(findcp[0]['FINAL'][i]['POINT']);
          console.log(findcp[0]['FINAL'][i])


          SURBAL013db["POINTs"] = findcp[0]['FINAL'][i]['POINT'];
          SURBAL013db["PCS"] = findcp[0]['FINAL'][i]['PCS'];
          SURBAL013db["PCSleft"] = findcp[0]['FINAL'][i]['PCS'];

          SURBAL013db["SPEC"]='';
          if (findcp[0]['FINAL'][i]['SPECIFICATIONve'] !== undefined) {
            if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'BTW') {
              SURBAL013db["SPEC"] =  `${findcp[0]['FINAL'][i]['SPECIFICATIONve']['BTW_LOW']}-${findcp[0]['FINAL'][i]['SPECIFICATIONve']['BTW_HI']}`;
            } else if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'HIM(>)') {
              SURBAL013db["SPEC"] =  `>${findcp[0]['FINAL'][i]['SPECIFICATIONve']['HIM_L']}`;
            } else if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'LOL(<)') {
              SURBAL013db["SPEC"] =  `<${findcp[0]['FINAL'][i]['SPECIFICATIONve']['LOL_H']}`;
            }else if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'Actual'){
              SURBAL013db["SPEC"] =  'Actual';
            }
          }

          SURBAL013db["K1b"] = findcp[0]['FINAL'][i]['K1b'];
          SURBAL013db["K1v"] = findcp[0]['FINAL'][i]['K1v'];

          SURBAL013db["INTERSEC"] = masterITEMs[0]['INTERSECTION'];

          let masterITEMsC = await mongodb.find(master_FN, ITEMs, { "masterID": SURBAL013db['inspectionItem'] });
          // console.log(masterITEMsC);
          if (masterITEMsC.length > 0) {

            if (masterITEMsC[0]['CALCULATE'] !== '') {

              let masterCALCULATE = await mongodb.find(master_FN, CAL1, { "masterID": masterITEMsC[0]['CALCULATE'] });
              if (masterCALCULATE.length > 0) {
                console.log(masterCALCULATE[0]["FORMULA"]);
                SURBAL013db["FORMULA"] = masterCALCULATE[0]["FORMULA"]
              }
            }
          }


          output = 'OK';
          let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
          if (findpo.length > 0) {
            request.post(
              'http://127.0.0.1:16070/SURBAL013-feedback',
              { json: { "PO": SURBAL013db['PO'], "ITEMs": SURBAL013db['inspectionItem'] } },
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
    SURBAL013db["POINTs"] = '';
    SURBAL013db["PCS"] = '';

    SURBAL013db["SPEC"] = '';

    SURBAL013db["PCSleft"] = '';
    SURBAL013db["UNIT"] = "";
    SURBAL013db["INTERSEC"] = "";
    SURBAL013db["RESULTFORMAT"] = "";
    SURBAL013db["K1b"] = "";
    SURBAL013db["K1v"] = "";
    SURBAL013db["FORMULA"] = "";
    output = 'NOK';
  }

  //-------------------------------------
  return res.json(output);
});

router.post('/SURBAL013-geteachGRAPH', async (req, res) => {
  //-------------------------------------
  console.log('--SURBAL013-geteachGRAPH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  try {
    let graph = await mongodb.find(PATTERN, GRAPH_TABLE, { "NO": input['GAPname'] });
    console.log(graph);
    SURBAL013db['GAPnameListdata'] = graph[0];//confirmdata
    SURBAL013db['GAP'] = SURBAL013db['GAPnameListdata'][`GT${SURBAL013db['confirmdata'].length + 1}`]
  }
  catch (err) {

  }
  //-------------------------------------
  return res.json('ok');
});

router.post('/SURBAL013-preview', async (req, res) => {
  //-------------------------------------
  console.log('--SURBAL013-preview--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  if (input.length > 0) {
    if (input[0]['V1'] !== undefined) {
      //-------------------------------------
      try {
        SURBAL013db['preview'] = input;
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
    SURBAL013db['preview'] = [];
    output = 'clear';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/SURBAL013-confirmdata', async (req, res) => {
  //-------------------------------------
  console.log('--SURBAL013-confirmdata--');
  console.log(req.body);
  // let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {
    let datapush = SURBAL013db['preview'][0]

    // if (SURBAL013db['RESULTFORMAT'] === 'Graph') {
    //   let pushdata = SURBAL013db['preview'][0]

    //   pushdata['V5'] = SURBAL013db['GAP'];
    //   pushdata['V1'] = `${SURBAL013db['confirmdata'].length + 1}:${pushdata['V1']}`;

    //   if(SURBAL013db['GAP'] !=''){

    //     SURBAL013db['confirmdata'].push(pushdata);
    //     SURBAL013db['preview'] = [];
    //     output = 'OK';
    //     SURBAL013db['GAP'] = SURBAL013db['GAPnameListdata'][`GT${SURBAL013db['confirmdata'].length + 1}`]
    //   }else{
    //     output = 'NOK';
    //   }


    // } else if (SURBAL013db['RESULTFORMAT'] === 'Number') {

    //   let pushdata = SURBAL013db['preview'][0]

    //   pushdata['V5'] = SURBAL013db['confirmdata'].length + 1
    //   pushdata['V1'] = `${SURBAL013db['confirmdata'].length + 1}:${pushdata['V1']}`

    //   SURBAL013db['confirmdata'].push(pushdata);
    //   SURBAL013db['preview'] = [];
    //   output = 'OK';
    // }

    if (SURBAL013db['RESULTFORMAT'] === 'CAL1') {

      let pushdata = SURBAL013db['preview'][0]
      // pushdata['V5'] = SURBAL013db['confirmdata'].length + 1
      // pushdata['V1'] = `${SURBAL013db['confirmdata'].length + 1}:${pushdata['V1']}`

      // SURBAL013db['confirmdata'].push(pushdata);
      // SURBAL013db['preview'] = [];
      console.log(pushdata);


      let feedback = await mongodb.find("BUFFERCAL", "SURBAL013", { "PO": SURBAL013db['PO'] });

      console.log(feedback);
      if (feedback.length > 0) {
        if (feedback[0]['VAL1'] != '' && feedback[0]['VAL2'] == '') {
          let feedbackupdate = await mongodb.update("BUFFERCAL", "SURBAL013", { "PO": SURBAL013db['PO'] }, { "$set": { 'VAL2': pushdata['V2'] } });
        }

      } else {
        let areadata = ''
        if (SURBAL013db['K1b'] === '1') {
          areadata = SURBAL013db['K1v']
        }
        var ins = await mongodb.insertMany("BUFFERCAL", "SURBAL013", [{ "PO": SURBAL013db['PO'], 'VAL1': pushdata['V2'], 'VAL2': "", 'VAL3': "", 'VAL4': "", 'Area': areadata, 'FORMULA': SURBAL013db["FORMULA"] }]);
      }

      SURBAL013db['preview'] = [];
      let feedbackLast = await mongodb.find("BUFFERCAL", "SURBAL013", { "PO": SURBAL013db['PO'] });
      if (feedbackLast.length > 0) {
        SURBAL013db['confirmdataCW'][0]['VAL1'] = feedbackLast[0]['VAL1'];
        SURBAL013db['confirmdataCW'][0]['VAL2'] = feedbackLast[0]['VAL2'];
        SURBAL013db['confirmdataCW'][0]['Area'] = feedbackLast[0]['Area'];

      }



      output = 'OK';
    }
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});



router.post('/SURBAL013-feedback', async (req, res) => {
  //-------------------------------------
  console.log('--SURBAL013-feedback--');
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
      SURBAL013db["PCSleft"] = `${parseInt(SURBAL013db["PCS"]) - oblist.length}`;
      if (SURBAL013db['RESULTFORMAT'] === 'Number' || SURBAL013db['RESULTFORMAT'] === 'Text' || SURBAL013db['RESULTFORMAT'] === 'Graph') {
        for (i = 0; i < LISTbuffer.length; i++) {
          if (LISTbuffer[i]['PO1'] === 'Mean') {
            ITEMleftVALUEout.push({ "V1": 'Mean', "V2": `${LISTbuffer[i]['PO3']}` })
          } else {
            ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO2']}`, "V2": `${LISTbuffer[i]['PO3']}` })
          }

        }



        SURBAL013db["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        SURBAL013db["ITEMleftVALUE"] = ITEMleftVALUEout;

      } else {

      }
      // output = 'OK';
      if ((parseInt(SURBAL013db["PCS"]) - oblist.length) == 0) {
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

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Graph') {

            if (SURBAL013db['GRAPHTYPE'] == 'CDE') {

              //
              let axis_data = [];
              for (i = 0; i < LISTbuffer.length; i++) {
                if (LISTbuffer[i]['PO1'] !== 'Mean') {
                  axis_data.push({ x: parseFloat(LISTbuffer[i].PO8), y: parseFloat(LISTbuffer[i].PO3) });
                }
              }
              //-----------------core

              let core = 0;
              if (SURBAL013db['INTERSEC'] !== '') {
                core = parseFloat(SURBAL013db['INTERSEC'])
              } else {
                core = parseFloat(axis_data[axis_data.length - 1]['y'])
              }

              //-----------------core
              let RawPoint = [];
              for (i = 0; i < axis_data.length - 1; i++) {
                if (core <= axis_data[i].y && core >= axis_data[i + 1].y) {
                  RawPoint.push({ Point1: axis_data[i], Point2: axis_data[i + 1] });
                  break
                }
              }

              try {
                let pointvalue = RawPoint[0].Point2.x - RawPoint[0].Point1.x;
                let data2 = RawPoint[0].Point1.y - core;
                let data3 = RawPoint[0].Point1.y - RawPoint[0].Point2.y;

                let RawData = RawPoint[0].Point1.x + (data2 / data3 * pointvalue);
                let graph_ans_X = parseFloat(RawData.toFixed(2));

                feedback[0]['FINAL_ANS'][input["ITEMs"]] = graph_ans_X;
                feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_point`] = { "x": graph_ans_X, "y": core };

                let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });
              }
              catch (err) {
                SURBAL013db[`INTERSEC_ERR`] = 1;
              }

              //
            } else if (SURBAL013db['GRAPHTYPE'] == 'CDT') {

              //
              let axis_data = [];
              for (i = 0; i < LISTbuffer.length; i++) {
                if (LISTbuffer[i]['PO1'] !== 'Mean') {
                  axis_data.push({ x: parseFloat(LISTbuffer[i].PO8), y: parseFloat(LISTbuffer[i].PO3) });
                }
              }
              //-----------------core

              let core = 0;
              if (SURBAL013db['INTERSEC'] !== '') {
                core = parseFloat(SURBAL013db['INTERSEC'])
              } else {
                // core = parseFloat(axis_data[axis_data.length - 1]['y']) 
                core = parseFloat(axis_data[axis_data.length - 1]['y']) + 50
              }

              //-----------------core
              let RawPoint = [];
              for (i = 0; i < axis_data.length - 1; i++) {
                if (core <= axis_data[i].y && core >= axis_data[i + 1].y) {
                  RawPoint.push({ Point1: axis_data[i], Point2: axis_data[i + 1] });
                  break
                }
              }

              try {
                let pointvalue = RawPoint[0].Point2.x - RawPoint[0].Point1.x;
                let data2 = RawPoint[0].Point1.y - core;
                let data3 = RawPoint[0].Point1.y - RawPoint[0].Point2.y;

                let RawData = RawPoint[0].Point1.x + (data2 / data3 * pointvalue);
                let graph_ans_X = parseFloat(RawData.toFixed(2));

                feedback[0]['FINAL_ANS'][input["ITEMs"]] = graph_ans_X;
                feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_point`] = { "x": graph_ans_X, "y": core };

                let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });
              }
              catch (err) {
                SURBAL013db[`INTERSEC_ERR`] = 1;
              }

              //
            } else if (SURBAL013db['GRAPHTYPE'] == 'CDT(S)') {

              //
              let axis_data = [];
              for (i = 0; i < LISTbuffer.length; i++) {
                if (LISTbuffer[i]['PO1'] !== 'Mean') {
                  axis_data.push({ x: parseFloat(LISTbuffer[i].PO8), y: parseFloat(LISTbuffer[i].PO3) });
                }
              }
              //-----------------core

              let core = 0;
              if (SURBAL013db['INTERSEC'] !== '') {
                core = parseFloat(SURBAL013db['INTERSEC'])
              } else {
                core = parseFloat(axis_data[axis_data.length - 1]['y']) + 50
              }

              //-----------------core
              let RawPoint = [];
              for (i = 0; i < axis_data.length - 1; i++) {
                if (core <= axis_data[i].y && core >= axis_data[i + 1].y) {
                  RawPoint.push({ Point1: axis_data[i], Point2: axis_data[i + 1] });
                  break
                }
              }

              try {
                let pointvalue = RawPoint[0].Point2.x - RawPoint[0].Point1.x;
                let data2 = RawPoint[0].Point1.y - core;
                let data3 = RawPoint[0].Point1.y - RawPoint[0].Point2.y;

                let RawData = RawPoint[0].Point1.x + (data2 / data3 * pointvalue);
                let graph_ans_X = parseFloat(RawData.toFixed(2));

                feedback[0]['FINAL_ANS'][input["ITEMs"]] = graph_ans_X;
                feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_point`] = { "x": graph_ans_X, "y": core };

                let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });
              }
              catch (err) {
                SURBAL013db[`INTERSEC_ERR`] = 1;
              }

              //
            } else {
              try {
                let axis_data = [];
                for (i = 0; i < LISTbuffer.length; i++) {
                  if (LISTbuffer[i]['PO1'] !== 'Mean') {
                    axis_data.push({ x: parseFloat(LISTbuffer[i].PO8), y: parseFloat(LISTbuffer[i].PO3) });
                  }
                }

                let d = []
                for (i = 0; i < axis_data.length - 1; i++) {
                  d.push((axis_data[i].y - axis_data[i + 1].y) / (axis_data[i + 1].x - axis_data[i].x));
                }

                let def = []

                for (i = 0; i < d.length - 1; i++) {
                  if (d[i] > d[i + 1]) {
                    def[i] = (d[i] - d[i + 1])
                  } else {
                    def[i] = (d[i + 1] - d[i])
                  }

                }

                for (j = 0; j < def.length; j++) {
                  if (def[j] === Math.max(...def)) {
                    pos = [j + 1, j + 2]
                  }
                }

                let d1 = -d[pos[0] - 1]
                let d2 = -d[pos[1]]


                let c1 = (axis_data[pos[0]].y - d1 * axis_data[pos[0]].x);
                let c2 = (axis_data[pos[1]].y - d2 * axis_data[pos[1]].x);


                let Xans = 0;
                let Yans = 0;
                let x = (c[1] - c[0]) / (d1 - d2);


                if (x >= 0) {
                  Xans = x
                } else {
                  Xans = -x
                }

                y = d1 * Xans + c[0]
                Yans = y

                let graph_ans_X = parseFloat(Xans.toFixed(2));
                let graph_ans_Y = parseFloat(Yans.toFixed(2));

                feedback[0]['FINAL_ANS'][input["ITEMs"]] = graph_ans_X;
                feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_point`] = { "x": graph_ans_X, "y": graph_ans_Y };

                let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });

              }
              catch (err) {
                SURBAL013db[`INTERSEC_ERR`] = 1;
              }
            }

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Picture') {
            //
          } else if (masterITEMs[0]['RESULTFORMAT'] === 'OCR') {
            //

          }
          else if (masterITEMs[0]['RESULTFORMAT'] === 'CAL1') {

            console.log("---CALCULATEDATA---")
            let feedback = await mongodb.find("BUFFERCAL", "SURBAL013", { "PO": input["PO"] });
            if (feedback.length > 0) {
              if (feedback[0]['VAL1'] !== '' && feedback[0]['VAL2'] !== '' && feedback[0]['Area'] !== '' && feedback[0]['FORMULA'] !== '') {

                // console.log( feedback[0]['VAL1'])
                // console.log( feedback[0]['VAL2'])
                // console.log( feedback[0]['Area'])
                // console.log( feedback[0]['FORMULA'])

                // console.log(evil(`12/5*9+9.4*2`));

                // let FORMULAdata = feedback[0]['FORMULA'];
                // let VAL1data = feedback[0]['VAL1'];
                // let VAL2data = feedback[0]['VAL2'];
                // let Areadata = feedback[0]['Area'];

                // //X1+Y1+K1

                // let FORMULAresult = FORMULAdata.replace("X", `${VAL1data}`).replace("Y", `${VAL2data}`).replace("K1", `${Areadata}`)
                // console.log(FORMULAresult)
                // let result = evil(FORMULAresult)
                // let finalresult = result;

                // if (result < 0) {
                //   finalresult = - finalresult;
                // }
                // console.log(finalresult)



                // let feedbackres = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
                // feedbackres[0]['FINAL_ANS'][input["ITEMs"]] = finalresult;
                // console.log(feedbackres)
                // let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedbackres[0]['FINAL_ANS'] } });

                let FORMULAdata = feedback[0]['FORMULA'];
                let VAL1data = feedback[0]['VAL1'];
                let VAL2data = feedback[0]['VAL2'];
                let Areadata = feedback[0]['Area'];

                let FORMULAresult = FORMULAdata.replace("X", `${VAL1data}`).replace("Y", `${VAL2data}`).replace("K1", `${Areadata}`)
                console.log(FORMULAresult)
                let result = evil(FORMULAresult)
                let finalresult = result;
                console.log(finalresult)
                if (result < 0) {
                  finalresult = - finalresult;
                }
                console.log(finalresult)



                let feedbackres = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
                console.log(feedbackres)
                if (feedbackres[0]['FINAL_ANS'] === undefined) {
                  feedbackres[0]['FINAL_ANS'] = {}
                  feedbackres[0]['FINAL_ANS'][input["ITEMs"]] = finalresult;
                  console.log(feedbackres)
                  let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedbackres[0]['FINAL_ANS'] } });
                } else {
                  feedbackres[0]['FINAL_ANS'][input["ITEMs"]] = finalresult;
                  console.log(feedbackres)
                  let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedbackres[0]['FINAL_ANS'] } });
                }

                output = 'OK'
              }
            }

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
      SURBAL013db["ITEMleftUNIT"] = '';
      SURBAL013db["ITEMleftVALUE"] = '';
    }

  }

  //-------------------------------------
  return res.json(output);
});

router.post('/SURBAL013-SETZERO', async (req, res) => {
  //-------------------------------------
  console.log('--SURBAL013fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    SURBAL013db = {
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
      "GAPname": '',
      "GAPnameList": [],
      "GAPnameListdata": ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
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
      "INTERSEC_ERR": 0,
      "K1b": '',
      "K1v": '',
      "FORMULA": '',
      "confirmdataCW": [{
        "VAL1": "",
        "VAL2": "",
        "Aear": "",
        "FORMULA": "",
      }],
    }
    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/SURBAL013-CLEAR', async (req, res) => {
  //-------------------------------------
  console.log('--SURBAL013fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    SURBAL013db['preview'] = [];
    SURBAL013db['confirmdata'] = [];

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/SURBAL013-RESETVALUE', async (req, res) => {
  //-------------------------------------
  console.log('--SURBAL013fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    let all = SURBAL013db['confirmdata'].length
    if (all > 0) {
      SURBAL013db['confirmdata'].pop();
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


router.post('/SURBAL013-FINISH', async (req, res) => {
  //-------------------------------------
  console.log('--SURBAL013-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  if (SURBAL013db['RESULTFORMAT'] === 'Number' || SURBAL013db['RESULTFORMAT'] === 'Text') {

    SURBAL013db["value"] = [];
    for (i = 0; i < SURBAL013db['confirmdata'].length; i++) {
      SURBAL013db["value"].push({
        "PO1": SURBAL013db["inspectionItemNAME"],
        "PO2": SURBAL013db['confirmdata'][i]['V1'],
        "PO3": SURBAL013db['confirmdata'][i]['V2'],
        "PO4": SURBAL013db['confirmdata'][i]['V3'],
        "PO5": SURBAL013db['confirmdata'][i]['V4'],
        "PO6": "-",
        "PO7": "-",
        "PO8": '-',
        "PO9": i + 1,
        "PO10": "AUTO",
      });
    }
    if (SURBAL013db["value"].length > 0) {
      let mean01 = [];
      let mean02 = [];
      for (i = 0; i < SURBAL013db["value"].length; i++) {
        mean01.push(parseFloat(SURBAL013db["value"][i]["PO3"]));
        mean02.push(parseFloat(SURBAL013db["value"][i]["PO5"]));
      }
      let sum1 = mean01.reduce((a, b) => a + b, 0);
      let avg1 = (sum1 / mean01.length) || 0;
      let sum2 = mean02.reduce((a, b) => a + b, 0);
      let avg2 = (sum2 / mean02.length) || 0;
      SURBAL013db["value"].push({
        "PO1": 'Mean',
        "PO2": SURBAL013db['confirmdata'][0]['V1'],
        "PO3": avg1,
        "PO4": SURBAL013db['confirmdata'][0]['V3'],
        "PO5": avg2,
      });
    }

  } else if (SURBAL013db['RESULTFORMAT'] === 'OCR' || SURBAL013db['RESULTFORMAT'] === 'Picture') {

  } else if (SURBAL013db['RESULTFORMAT'] === 'Graph') {

    SURBAL013db["value"] = [];
    for (i = 0; i < SURBAL013db['confirmdata'].length; i++) {
      SURBAL013db["value"].push({
        "PO1": SURBAL013db["inspectionItemNAME"],
        "PO2": SURBAL013db['confirmdata'][i]['V1'],
        "PO3": SURBAL013db['confirmdata'][i]['V2'],
        "PO4": SURBAL013db['confirmdata'][i]['V3'],
        "PO5": SURBAL013db['confirmdata'][i]['V4'],
        "PO6": "-",
        "PO7": "-",
        "PO8": SURBAL013db['confirmdata'][i]['V5'],
        "PO9": i + 1,
        "PO10": "AUTO",
      });
    }
    if (SURBAL013db["value"].length > 0) {
      let mean01 = [];
      let mean02 = [];
      for (i = 0; i < SURBAL013db["value"].length; i++) {
        mean01.push(parseFloat(SURBAL013db["value"][i]["PO3"]));
        mean02.push(parseFloat(SURBAL013db["value"][i]["PO5"]));
      }
      let sum1 = mean01.reduce((a, b) => a + b, 0);
      let avg1 = (sum1 / mean01.length) || 0;
      let sum2 = mean02.reduce((a, b) => a + b, 0);
      let avg2 = (sum2 / mean02.length) || 0;
      SURBAL013db["value"].push({
        "PO1": 'Mean',
        "PO2": SURBAL013db['confirmdata'][0]['V1'],
        "PO3": avg1,
        "PO4": SURBAL013db['confirmdata'][0]['V3'],
        "PO5": avg2,
      });
    }

  }

  if (SURBAL013db['RESULTFORMAT'] === 'Number' ||
    SURBAL013db['RESULTFORMAT'] === 'Text' ||
    SURBAL013db['RESULTFORMAT'] === 'OCR' ||
    SURBAL013db['RESULTFORMAT'] === 'Picture' || SURBAL013db['RESULTFORMAT'] === 'Graph') {
    request.post(
      'http://127.0.0.1:16070/FINISHtoDB',
      { json: SURBAL013db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          SURBAL013db['confirmdata'] = [];
          SURBAL013db["value"] = [];
          //------------------------------------------------------------------------------------

          request.post(
            'http://127.0.0.1:16070/SURBAL013-feedback',
            { json: { "PO": SURBAL013db['PO'], "ITEMs": SURBAL013db['inspectionItem'] } },
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
  return res.json(SURBAL013db);
});

router.post('/SURBAL013-FINISH-CAL1', async (req, res) => {
  //-------------------------------------
  console.log('--SURBAL013-FINISH-CAL1--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';
  if ((SURBAL013db['RESULTFORMAT'] === 'CAL1')) {



    SURBAL013db["value"] = [];
    let feedback = await mongodb.find("BUFFERCAL", "SURBAL013", { "PO": SURBAL013db['PO'] });
    if (feedback.length > 0) {
      if (feedback[0]['VAL1'] !== '' && feedback[0]['VAL2'] !== '' && feedback[0]['Area'] !== '') {
        SURBAL013db["value"].push({
          "VAL1": feedback[0]['VAL1'],
          "VAL2": feedback[0]['VAL2'],
          "Area": feedback[0]['Area'],
          "FORMULA": feedback[0]['FORMULA'],
        });

        if (SURBAL013db['RESULTFORMAT'] === 'CAL1') {
          request.post(
            'http://127.0.0.1:16070/FINISHtoDB',
            { json: SURBAL013db },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                // console.log(body);
                // if (body === 'OK') {
                SURBAL013db['confirmdata'] = [];
                SURBAL013db["value"] = [];
                //------------------------------------------------------------------------------------
                request.post(
                  'http://127.0.0.1:16070/SURBAL013-feedback',
                  { json: { "PO": SURBAL013db['PO'], "ITEMs": SURBAL013db['inspectionItem'] } },
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
    }



  }

  //-------------------------------------
  return res.json(SURBAL013db);
});

module.exports = router;


