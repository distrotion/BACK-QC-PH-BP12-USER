const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');


router.post('/FINAL/upqcdata',async (req,res) => {
    //-------------------------------------
    console.log('--upqcdata--');
    console.log(req.body);
    //-------------------------------------
    
    
    //-------------------------------------
      return  res.json(output);
});

router.post('/FINAL/UNIX',async (req,res) => {
  //-------------------------------------
  console.log('--UNIX--');
  console.log(req.body);
  //-------------------------------------
  
  
  //-------------------------------------
    return  res.json(Date.now() + 2629743000*6);
});


module.exports = router;