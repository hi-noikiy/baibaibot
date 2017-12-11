var https=require('https');
var http = require('http');

var timer = 0;
function pushTask(){
  var left = 1800000 - new Date().getTime()%1800000;
  console.log('left:'+left);
  if(timer==0){
    timer = 1;
    setTimeout(function(){
      pushToGroup();
      setTimeout(function () {
        timer = 0;
        pushTask();
      },10000);
    },left)
  }
}



function pushToGroup(){
  const {getQQQ,getGroupList} = require('../baibai');
  var groups = getGroupList();
  var qqq = getQQQ();
  if(groups){
    for(var i=0;i<groups.length;i++){
      var group = groups[i];
      handleGroupPush(group,qqq);
    }
  }
}



function handleGroupPush(group,qqq){
  var gn = group.name;
  var gid = group.gid;
  if(gn.indexOf('光与暗的')>=0){
    console.log(gn,gid);
    var callback = function(ret){
      qqq.sendGroupMsg(gid,ret);
    }
    getPrice(callback);
    setTimeout(function(){
      getBitFlyer(callback);
    },500);
  }
}

function getBitFlyer(callback){
  var options = {
    hostname: "api.bitflyer.jp",
    port: 443,
    path: '/v1/ticker?product_code=BTC_JPY',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36'
    },
    method: 'GET'
  };
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var code = res.statusCode;
    if(code==200){
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        parseBitFlyerRes(resdata,callback);
      });
    }else{

    }
  });
  req.end();
}

function parseBitFlyerRes(resdata,callback){
  var data = eval('('+resdata+')');
  var btc_jpy = data.best_bid;
  var now = new Date();
  var ret = "比特币行情(Bitflyer)："+now.toLocaleString()+"\n";
  ret = ret + "BTC:"+btc_jpy+"円";
  callback(ret);
}


function getPrice(callback){
  var options = {
    hostname: "api.bitfinex.com",
    port: 443,
    path: '/v2/tickers?symbols=tBTCUSD,tLTCUSD,tETHUSD,tETCUSD,tBCHUSD,tEOSUSD',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36'
    },
    method: 'GET'
  };
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var code = res.statusCode;
    if(code==200){
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        parseBitFinexRes(resdata,callback);
      });
    }else{

    }
  });
  req.end();
}

function parseBitFinexRes(resdata,callback){
  var list = eval('('+resdata+')');
  var now = new Date();
  var ret = "数字货币行情(Bitfinex)："+now.toLocaleString()+"\n";
  for(var i=0;i<list.length;i++){
    var p = list[i];
    var name = p[0].substring(1,4);
    var price = p[7];
    ret = ret + name + ":$"+price+"\n";
  }
  callback(ret.trim());
}


module.exports={
  pushToGroup,
  pushTask
}