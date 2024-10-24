const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');
var mssql = require('./../../function/mssql');


//----------------- date

// const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
// let day = d;

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';


function evil(fn) {
  return new Function('return ' + fn)();
}

Number.prototype.pad = function (n) {
  if (n === undefined)
    n = 2;

  return (new Array(n).join('0') + this).slice(-n);
}


router.post('/FINAL/FINISHtoDB', async (req, res) => {
  //-------------------------------------
  console.log('--FINISHtoDB--');
  console.log(req.body);
  let input = req.body;
  const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
  let day = d;
  //-------------------------------------
  let output = input;

  //-------------------------------------
  let outputs = '';
  let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
  if (findpo.length === 0) {
    let nameFOR = input['MeasurmentFOR'];
    let nameTool = input['tool'];
    let nameItem = input['inspectionItem'];
    let value = input['value'];
    let Item = {};
    let Tool = {};

    Item[nameItem] = { "PSC1": value };
    Tool[nameTool] = Item;

    output[nameFOR] = Tool;
    output['dateG'] = new Date();
    output['dateGSTR'] = day;

    delete output['MeasurmentFOR'];
    delete output['tool'];
    delete output['inspectionItem'];
    delete output['value'];
    delete output['pieces'];
    //----new
    delete output['INS'];
    delete output['inspectionItemNAME'];
    delete output['ItemPick'];
    delete output['ItemPickcode'];
    delete output['POINTs'];
    delete output['PCS'];
    delete output['PCSleft'];
    delete output['UNIT'];
    delete output['INTERSEC'];
    delete output['preview'];
    delete output['confirmdata'];
    delete output['ITEMleftUNIT'];
    delete output['ITEMleftVALUE'];


    let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
    let masterITEMs = await mongodb.find(master_FN, ITEMs, {});
    let MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

    let ItemPickcodeout = [];
    for (i = 0; i < findcp[0]['FINAL'].length; i++) {
      for (j = 0; j < masterITEMs.length; j++) {
        if (findcp[0]['FINAL'][i]['ITEMs'] === masterITEMs[j]['masterID']) {
          ItemPickcodeout.push({ "key": masterITEMs[j]['masterID'], "value": masterITEMs[j]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] });
        }
      }
    }

    output['CHECKlist'] = ItemPickcodeout;

    let insertdb = await mongodb.insertMany(MAIN_DATA, MAIN, [output]);

    outputs = 'OK';
  } else {


    let input_S2_1 = findpo[0]; //input1
    let input_S2_2 = output;     //input2
    let objectR = Object.getOwnPropertyNames(input_S2_1)
    let findMF = false;

    for (i = 0; i < objectR.length; i++) {
      if (objectR[i] === input_S2_2['MeasurmentFOR']) {
        findMF = true;
      }
    }
    if (findMF === false) {
      let nameFOR = input_S2_2['MeasurmentFOR'];
      let nameTool = input_S2_2['tool'];
      let nameItem = input_S2_2['inspectionItem'];
      let value = input_S2_2['value'];
      let Item = {};
      let Tool = {};
      let FOR = {};
      Tool[nameTool] = Item;
      FOR[nameFOR] = Tool;
      let out_S2_1 = { "PO": input_S2_2.PO };
      let out_S2_2 = { $set: FOR }
      Item[nameItem] = { PSC1: value };
      // outputs=[out_S2_1,out_S2_2]
      outputs = 'OK'
      let upd = await mongodb.update(MAIN_DATA, MAIN, out_S2_1, out_S2_2);

      //no use
    } else {
      let input_S3_1 = findpo[0]; //input1
      let input_S3_2 = output;    //input2
      // let objectR = Object.getOwnPropertyNames(nput_S3_1)
      let nameMF = "FINAL";


      let nameTool = "";
      let buff = input_S3_1[nameMF];
      let objectB = Object.getOwnPropertyNames(buff)
      for (j = 0; j < objectB.length; j++) {
        if (objectB[j] === input_S3_2['tool']) {
          nameTool = objectB[j];
        }
      }
      if (nameTool !== input_S3_2.tool) {
        let nameFOR = input_S3_2['MeasurmentFOR'];
        let nameTool = input_S3_2['tool'];
        let nameItem = input_S3_2['inspectionItem'];
        let value = input_S3_2['value'];
        let Item = {};
        let Tool = {};
        let FOR = input_S3_1[nameFOR];

        Item[nameItem] = { PSC1: value };
        input_S3_1[nameFOR][nameTool] = Item;
        let out_S3_1 = { PO: input_S3_2.PO };
        let out_S3_2 = { $set: input_S3_1 }

        outputs = 'OK'
        let upd = await mongodb.update(MAIN_DATA, MAIN, out_S3_1, out_S3_2);

      } else {
        let input_S4_1 = findpo[0]; //input1
        let input_S4_2 = output;    //input2
        let nameMF = "FINAL";

        let buff = input_S4_1[nameMF];
        let objectB = Object.getOwnPropertyNames(buff)
        for (j = 0; j < objectB.length; j++) {
          if (objectB[j] === input_S4_2.tool) {
            nameTool = objectB[j];
          }
        }

        let nameItem = "";
        let buff21 = input_S4_1[nameMF];
        let buff2 = buff21[nameTool];
        let objectI = Object.getOwnPropertyNames(buff2)
        for (k = 0; k < objectI.length; k++) {
          if (objectI[k] === input_S4_2.inspectionItem) {
            nameItem = objectI[k];
          }
        }
        console.log("---->1");
        if (input_S4_2.inspectionItem !== nameItem) {
          let nameFOR = input_S4_2['MeasurmentFOR'];
          let nameTool = input_S4_2['tool'];
          let nameItem = input_S4_2['inspectionItem'];
          let value = input_S4_2['value'];
          let FOR = input_S4_1[nameFOR];
          let Tool = FOR[nameTool];
          let Item = Tool
          Item[nameItem] = { PSC1: value };
          let out_S4_1 = { PO: input_S4_2.PO };
          let out_S4_2 = { $set: input_S4_1 }

          outputs = 'OK'
          let upd = await mongodb.update(MAIN_DATA, MAIN, out_S4_1, out_S4_2);

        } else {
          console.log("---->2");

          let nameFOR = input_S4_2.MeasurmentFOR;
          let nameTool = input_S4_2.tool;
          let nameItem = input_S4_2.inspectionItem;
          let value = input_S4_2.value;

          let FOR = input_S4_1[nameFOR];
          let Tool = FOR[nameTool];
          let Item = Tool

          let nItem = Object.getOwnPropertyNames(Item[nameItem]).length
          let timeStamp = `PSC${nItem + 1}`
          let buff = Item[nameItem];
          buff[timeStamp] = value;
          let out_S4_1 = { PO: input_S4_2.PO };
          let out_S4_2 = { $set: input_S4_1 }
          outputs = 'OK'
          let upd = await mongodb.update(MAIN_DATA, MAIN, out_S4_1, out_S4_2);

        }

      }

    }

  }
  //-------------------------------------
  return res.json(outputs);
});

router.post('/FINAL/FINISHtoDB-apr', async (req, res) => {
  //-------------------------------------
  console.log('--FINISHtoDB-apr--');
  console.log(req.body);
  let input = req.body;
  const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
  let day = d;
  //-------------------------------------
  let output = input;
  //-------------------------------------
  console.log(output)
  let outputs = '';

  let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
  console.log("findpo.length")
  console.log(findpo.length)
  if (findpo.length === 0) {
    let nameFOR = input['MeasurmentFOR'];
    let nameTool = input['tool'];
    let nameItem = input['inspectionItem'];
    let value = input['value'];

    let Item = {};
    let Tool = {};


    let PIC = parseInt(input['PCS']);
    let PICs = 1;
    if (PIC != NaN || PIC != "NaN") {
      PICs = PIC;
    }

    // Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value, "PSC6": value, "PSC7": value, "PSC8": value, "PSC9": value, "PSC10": value };
    Item[nameItem] = {};
    for (let l = 0; l < PICs; l++) {
      Item[nameItem][`PSC${l + 1}`] = value

    }

    console.log(Item[nameItem])

    Tool[nameTool] = Item;

    output[nameFOR] = Tool;
    output['dateG'] = new Date();
    output['dateGSTR'] = day;

    delete output['MeasurmentFOR'];
    delete output['tool'];
    delete output['inspectionItem'];
    delete output['value'];
    delete output['pieces'];
    //----new
    delete output['INS'];
    delete output['inspectionItemNAME'];
    delete output['ItemPick'];
    delete output['ItemPickcode'];
    delete output['POINTs'];
    delete output['PCS'];
    delete output['PCSleft'];
    delete output['UNIT'];
    delete output['INTERSEC'];
    delete output['preview'];
    delete output['confirmdata'];
    delete output['ITEMleftUNIT'];
    delete output['ITEMleftVALUE'];


    let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
    let masterITEMs = await mongodb.find(master_FN, ITEMs, {});
    let MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

    let ItemPickcodeout = [];
    for (i = 0; i < findcp[0]['FINAL'].length; i++) {
      for (j = 0; j < masterITEMs.length; j++) {
        if (findcp[0]['FINAL'][i]['ITEMs'] === masterITEMs[j]['masterID']) {
          ItemPickcodeout.push({ "key": masterITEMs[j]['masterID'], "value": masterITEMs[j]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] });
        }
      }
    }

    output['CHECKlist'] = ItemPickcodeout;

    let insertdb = await mongodb.insertMany(MAIN_DATA, MAIN, [output]);

    outputs = 'OK';
  } else {

    console.log("---->");
    let input_S2_1 = findpo[0]; //input1
    let input_S2_2 = output;     //input2
    let objectR = Object.getOwnPropertyNames(input_S2_1)
    let findMF = false;

    for (i = 0; i < objectR.length; i++) {
      if (objectR[i] === input_S2_2['MeasurmentFOR']) {
        findMF = true;
      }
    }

    console.log(findMF);
    if (findMF === false) {
      let nameFOR = input_S2_2['MeasurmentFOR'];
      let nameTool = input_S2_2['tool'];
      let nameItem = input_S2_2['inspectionItem'];
      let value = input_S2_2['value'];
      let Item = {};
      let Tool = {};
      let FOR = {};
      Tool[nameTool] = Item;
      FOR[nameFOR] = Tool;
      let out_S2_1 = { "PO": input_S2_2.PO };
      let out_S2_2 = { $set: FOR }
      let PIC = parseInt(input_S2_2['PCS']);
      let PICs = 1;
      if (PIC != NaN || PIC != "NaN") {
        PICs = PIC;
      }

      // Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value, "PSC6": value, "PSC7": value, "PSC8": value, "PSC9": value, "PSC10": value };
      Item[nameItem] = {};
      for (let l = 0; l < PICs; l++) {
        Item[nameItem][`PSC${l + 1}`] = value

      }
      // outputs=[out_S2_1,out_S2_2]
      outputs = 'OK'
      let upd = await mongodb.update(MAIN_DATA, MAIN, out_S2_1, out_S2_2);

      //no use
    } else {
      let input_S3_1 = findpo[0]; //input1
      let input_S3_2 = output;    //input2
      // let objectR = Object.getOwnPropertyNames(nput_S3_1)
      let nameMF = "FINAL";


      let nameTool = "";
      let buff = input_S3_1[nameMF];
      let objectB = Object.getOwnPropertyNames(buff)
      for (j = 0; j < objectB.length; j++) {
        if (objectB[j] === input_S3_2['tool']) {
          nameTool = objectB[j];
        }
      }



      if (nameTool !== input_S3_2.tool) {
        let nameFOR = input_S3_2['MeasurmentFOR'];
        let nameTool = input_S3_2['tool'];
        let nameItem = input_S3_2['inspectionItem'];
        let value = input_S3_2['value'];
        let Item = {};
        let Tool = {};
        let FOR = input_S3_1[nameFOR];

        let PIC = parseInt(input_S3_2['PCS']);
        let PICs = 1;
        if (PIC != NaN || PIC != "NaN") {
          PICs = PIC;
        }

        // Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value, "PSC6": value, "PSC7": value, "PSC8": value, "PSC9": value, "PSC10": value };
        Item[nameItem] = {};
        for (let l = 0; l < PICs; l++) {
          Item[nameItem][`PSC${l + 1}`] = value

        }
        input_S3_1[nameFOR][nameTool] = Item;
        let out_S3_1 = { PO: input_S3_2.PO };
        let out_S3_2 = { $set: input_S3_1 }

        outputs = 'OK'
        let upd = await mongodb.update(MAIN_DATA, MAIN, out_S3_1, out_S3_2);

      } else {
        let input_S4_1 = findpo[0]; //input1
        let input_S4_2 = output;    //input2
        let nameMF = "FINAL";

        let buff = input_S4_1[nameMF];
        let objectB = Object.getOwnPropertyNames(buff)
        for (j = 0; j < objectB.length; j++) {
          if (objectB[j] === input_S4_2.tool) {
            nameTool = objectB[j];
          }
        }

        let nameItem = "";
        let buff21 = input_S4_1[nameMF];
        let buff2 = buff21[nameTool];
        let objectI = Object.getOwnPropertyNames(buff2)
        for (k = 0; k < objectI.length; k++) {
          if (objectI[k] === input_S4_2.inspectionItem) {
            nameItem = objectI[k];
          }
        }

        if (input_S4_2.inspectionItem !== nameItem) {
          let nameFOR = input_S4_2['MeasurmentFOR'];
          let nameTool = input_S4_2['tool'];
          let nameItem = input_S4_2['inspectionItem'];
          let value = input_S4_2['value'];
          let FOR = input_S4_1[nameFOR];
          let Tool = FOR[nameTool];
          let Item = Tool
          let PIC = parseInt(input_S4_2['PCS']);
          let PICs = 1;
          if (PIC != NaN || PIC != "NaN") {
            PICs = PIC;
          }

          // Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value, "PSC6": value, "PSC7": value, "PSC8": value, "PSC9": value, "PSC10": value };
          Item[nameItem] = {};
          for (let l = 0; l < PICs; l++) {
            Item[nameItem][`PSC${l + 1}`] = value

          }
          let out_S4_1 = { PO: input_S4_2.PO };
          let out_S4_2 = { $set: input_S4_1 }

          outputs = 'OK'




          let upd = await mongodb.update(MAIN_DATA, MAIN, out_S4_1, out_S4_2);

        } else {

          let nameFOR = input_S4_2.MeasurmentFOR;
          let nameTool = input_S4_2.tool;
          let nameItem = input_S4_2.inspectionItem;
          let value = input_S4_2.value;

          let FOR = input_S4_1[nameFOR];
          let Tool = FOR[nameTool];
          let Item = Tool



          let nItem = Object.getOwnPropertyNames(Item[nameItem]).length
          let timeStamp = `PSC${nItem + 1}`
          let buff = Item[nameItem];
          buff[timeStamp] = value;
          let out_S4_1 = { PO: input_S4_2.PO };
          let out_S4_2 = { $set: input_S4_1 }
          outputs = 'OK'
          let upd = await mongodb.update(MAIN_DATA, MAIN, out_S4_1, out_S4_2);

        }

      }

    }

  }
  //-------------------------------------
  return res.json(outputs);
});

router.post('/FINAL/GRAPH-recal', async (req, res) => {
  //-------------------------------------
  console.log('--GRAPH-recal--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  //-------------------------------------
  if (input["PO"] !== undefined && input["ITEMs"] !== undefined) {
    let feedback = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });

    if (feedback.length > 0 && feedback[0]['FINAL'] != undefined && feedback[0]['FINAL'][input["NAME_INS"]] != undefined && feedback[0]['FINAL'][input["NAME_INS"]][input["ITEMs"]] != undefined) {
      // console.log(Object.keys(feedback[0]['FINAL'][NAME_INS][input["ITEMs"]]));
      let oblist = Object.keys(feedback[0]['FINAL'][input["NAME_INS"]][input["ITEMs"]]);
      let ob = feedback[0]['FINAL'][input["NAME_INS"]][input["ITEMs"]];

      let LISTbuffer = [];
      let ITEMleftVALUEout = [];

      for (i = 0; i < oblist.length; i++) {
        LISTbuffer.push(...ob[oblist[i]])
      }


      if (input["MODE"] == 'CDE') {

        //
        let axis_data = [];
        for (i = 0; i < LISTbuffer.length; i++) {
          if (LISTbuffer[i]['PO1'] !== 'Mean') {
            axis_data.push({ x: parseFloat(LISTbuffer[i].PO8), y: parseFloat(LISTbuffer[i].PO3) });
          }
        }
        //-----------------core

        let core = 0;
        if (input['INTERSEC'] !== '') {
          core = parseFloat(input['INTERSEC'])
        } else {
          core = parseFloat(axis_data[axis_data.length - 1]['y']) + 50
        }
        console.log(axis_data[axis_data.length - 1]['y']);
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
          console.log("-----------")
          feedback[0]['FINAL_ANS'][input["ITEMs"]] = graph_ans_X;
          feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_point`] = { "x": graph_ans_X, "y": core };

          let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });
        }
        catch (err) {
          // TPGHMV002db[`INTERSEC_ERR`] = 1;
        }
        output = 'OK1';
        //
        // } else if (input["MODE"] == 'CDE') {
      } else {
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
        output = 'OK2';

      }

    }

  }

  //-------------------------------------
  return res.json(output);
});


router.post('/FINAL/CAL1-recal', async (req, res) => {
  //-------------------------------------
  console.log('--CAL1-recal--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  //-------------------------------------
  if (input["PO"] !== undefined && input["ITEMs"] !== undefined) {
    let feedback = await mongodb.find("BUFFERCAL", "SURBAL013", { "PO": input["PO"] });
    if (feedback.length > 0) {
      if (feedback[0]['VAL1'] !== '' && feedback[0]['VAL2'] !== '' && feedback[0]['Area'] !== '' && feedback[0]['FORMULA'] !== '') {

        // console.log( feedback[0]['VAL1'])
        // console.log( feedback[0]['VAL2'])
        // console.log( feedback[0]['Area'])
        // console.log( feedback[0]['FORMULA'])

        // console.log(evil(`12/5*9+9.4*2`));

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


  //-------------------------------------
  return res.json(output);
});


router.post('/FINAL/PHBP12report', async (req, res) => {
  //-------------------------------------
  console.log('--PHBP12report--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = [];
  //-------------------------------------
  var d = new Date();
  d.setFullYear(d.getFullYear(), d.getMonth(), d.getDate() - 30);

  var dc = new Date();
  dc.setFullYear(dc.getFullYear(), dc.getMonth(), dc.getDate());

  // let day = `${d.getFullYear()}-${(d.getMonth() + 1).pad(2)}-${(d.getDate()).pad(2)}`
  // let dayC = `${dc.getFullYear()}-${(dc.getMonth() + 1).pad(2)}-${(dc.getDate()).pad(2)}`
  // let tim = `${(d.getHours()).pad(2)}:${(d.getMinutes()).pad(2)}:${(d.getSeconds()).pad(2)}`

  let out = {
    "ALL_DONE": 'DONE',
    "dateG":
    {
      "$gte": d,
      "$lt": dc
    }
  }

  // output = await mongodb.find(MAIN_DATA, MAIN, out);
  output = await mongodb.findproject(MAIN_DATA, MAIN, out, { "PO": 1, "CP": 1, "MATCP": 1, "CUSTOMER": 1, "PART": 1, "PARTNAME": 1, "MATERIAL": 1, "CUSLOTNO": 1 });


  //-------------------------------------
  return res.json(output);
});


router.post('/FINAL/REFLOT', async (req, res) => {
  //-------------------------------------
  console.log('--SURBAL013-REFLOT--');
  console.log(req.body);
  let input = req.body;
  const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
  let day = d;
  //-------------------------------------
  // let input = SURBAL013db;
  let output = input;

  //-------------------------------------
  let outputs = '';
  let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
  if (findpo.length === 0) {


    // let nameFOR = input['MeasurmentFOR'];
    // let nameTool = input['tool'];
    // let nameItem = input['inspectionItem'];
    // let value = input['value'];
    // let Item = {};
    // let Tool = {};
    // Item[nameItem] = { "PSC1": value };
    // Tool[nameTool] = Item;
    // output[nameFOR] = Tool;


    output['dateG'] = new Date();
    output['dateGSTR'] = day;

    let REFLOT = await mongodb.find(PATTERN, "referdata", { "MATCP": output['MATCP'], "ITEMS": output['inspectionItem'] });

    console.log(REFLOT)

    if (REFLOT.length > 0) {

      output['FINAL'] = {}
      output['FINAL'][`${output['INS']}`] = {}
      output['FINAL'][`${output['INS']}`][`${output['inspectionItem']}`] = REFLOT[0]['DATA']

      // output['FINAL_ANS'][]
      output['FINAL_ANS'] = {}

      for (let lsf = 0; lsf < REFLOT[0]['LISTANS'].length; lsf++) {
        output['FINAL_ANS'][`${REFLOT[0]['LISTANS'][lsf]['FINAL_ANS']}`] = REFLOT[0]['LISTANS'][lsf]['ANS']
        // console.log(REFLOT[0]['LISTANS'][lsf])

      }
      output['REFLOT'] = REFLOT[0]['TPKLOT']

    }

    delete output['MeasurmentFOR'];
    delete output['tool'];
    delete output['inspectionItem'];
    delete output['value'];
    delete output['pieces'];
    //----new
    delete output['INS'];
    delete output['inspectionItemNAME'];
    delete output['ItemPick'];
    delete output['ItemPickcode'];
    delete output['POINTs'];
    delete output['PCS'];
    delete output['PCSleft'];
    delete output['UNIT'];
    delete output['INTERSEC'];
    delete output['preview'];
    delete output['confirmdata'];
    delete output['ITEMleftUNIT'];
    delete output['ITEMleftVALUE'];





    let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
    let masterITEMs = await mongodb.find(master_FN, ITEMs, {});
    let MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

    let ItemPickcodeout = [];

    if (findcp.length > 0) {
      for (i = 0; i < findcp[0]['FINAL'].length; i++) {
        for (j = 0; j < masterITEMs.length; j++) {
          if (findcp[0]['FINAL'][i]['ITEMs'] === masterITEMs[j]['masterID']) {
            ItemPickcodeout.push({ "key": masterITEMs[j]['masterID'], "value": masterITEMs[j]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] });
          }
        }
      }
      output['CHECKlist'] = ItemPickcodeout;

      //TPKLOT

      let insertdb = await mongodb.insertMany(MAIN_DATA, MAIN, [output]);

      outputs = 'OK';
    }


  } else {


    let input_S2_1 = findpo[0]; //input1
    let input_S2_2 = output;     //input2
    let objectR = Object.getOwnPropertyNames(input_S2_1)
    let findMF = false;

    for (i = 0; i < objectR.length; i++) {
      if (objectR[i] === input_S2_2['MeasurmentFOR']) {
        findMF = true;
      }
    }
    // if (findMF === false) {


    //   let nameFOR = input_S2_2['MeasurmentFOR'];
    //   let nameTool = input_S2_2['tool'];
    //   let nameItem = input_S2_2['inspectionItem'];
    //   let value = input_S2_2['value'];
    //   let Item = {};
    //   let Tool = {};
    //   let FOR = {};
    //   Tool[nameTool] = Item;
    //   FOR[nameFOR] = Tool;
    //   let out_S2_1 = { "PO": input_S2_2.PO };
    //   let out_S2_2 = { $set: FOR }
    //   let REFLOT = await mongodb.find(PATTERN, "referdata", { "MATCP": output['MATCP'], "ITEMS": output['inspectionItem'] });

    //   console.log(REFLOT)

    //   if (REFLOT.length > 0) {

    //     output['FINAL'] = input_S2_1['FINAL']
    //     output['FINAL'][`${output['INS']}`] = {}
    //     output['FINAL'][`${output['INS']}`][`${output['inspectionItem']}`] = REFLOT[0]['DATA']

    //     output['FINAL_ANS'] = input_S2_1['FINAL_ANS'] ?? {}

    //     for (let lsf = 0; lsf < REFLOT[0]['LISTANS'].length; lsf++) {
    //       output['FINAL_ANS'][`${REFLOT[0]['LISTANS'][lsf]['FINAL_ANS']}`]= REFLOT[0]['LISTANS'][lsf]['ANS']
    //       // console.log(REFLOT[0]['LISTANS'][lsf])

    //     }

    //     output['FINAL_ANS'] = input_S2_1['FINAL_ANS'] ??[]

    //     for (let lsf = 0; lsf < REFLOT[0]['LISTANS'].length; lsf++) {
    //       output['FINAL_ANS'][`${REFLOT[0]['LISTANS'][lsf]['FINAL_ANS']}`]= REFLOT[0]['LISTANS'][lsf]['ANS']
    //       // console.log(REFLOT[0]['LISTANS'][lsf])

    //     }

    //     let out_S2_2 = { $set: {"FINAL":output['FINAL'],  'FINAL_ANS': output['FINAL_ANS']} }

    //     // output['FINAL_ANS'][]
    //     Item[nameItem] = REFLOT[0]['DATA'];
    //     outputs = 'OK'
    //     let upd = await mongodb.update(MAIN_DATA, MAIN, out_S2_1, out_S2_2);

    //   }



    //   // outputs=[out_S2_1,out_S2_2]


    //   //no use
    // } else {
    let nameFOR = input_S2_2['MeasurmentFOR'];
    let nameTool = input_S2_2['tool'];
    let nameItem = input_S2_2['inspectionItem'];
    let value = input_S2_2['value'];
    let Item = {};
    let Tool = {};
    let FOR = {};
    Tool[nameTool] = Item;
    FOR[nameFOR] = Tool;
    let out_S2_1 = { "PO": input_S2_2.PO };

    let REFLOT = await mongodb.find(PATTERN, "referdata", { "MATCP": output['MATCP'], "ITEMS": output['inspectionItem'] });

    console.log(REFLOT)

    if (REFLOT.length > 0) {

      output['FINAL'] = input_S2_1['FINAL']

      //
      if (output['FINAL'][`${output['INS']}`] != undefined) {
        output['FINAL'][`${output['INS']}`][`${output['inspectionItem']}`] = REFLOT[0]['DATA']
      } else {
        output['FINAL'][`${output['INS']}`] = {}
        output['FINAL'][`${output['INS']}`][`${output['inspectionItem']}`] = REFLOT[0]['DATA']

      }


      output['FINAL_ANS'] = input_S2_1['FINAL_ANS'] ?? []

      for (let lsf = 0; lsf < REFLOT[0]['LISTANS'].length; lsf++) {
        output['FINAL_ANS'][`${REFLOT[0]['LISTANS'][lsf]['FINAL_ANS']}`] = REFLOT[0]['LISTANS'][lsf]['ANS']
        // console.log(REFLOT[0]['LISTANS'][lsf])

      }

      output['REFLOT'] = REFLOT[0]['TPKLOT']

      let out_S2_2 = { $set: { "FINAL": output['FINAL'], 'FINAL_ANS': output['FINAL_ANS'], 'REFLOT': output['REFLOT'] } }




      Item[nameItem] = REFLOT[0]['DATA'];
      outputs = 'OK'
      let upd = await mongodb.update(MAIN_DATA, MAIN, out_S2_1, out_S2_2);

    }

    // }

  }
  //-------------------------------------
  return res.json(outputs);
});


//let objectR = Object.getOwnPropertyNames(input_S2_1)

module.exports = router;