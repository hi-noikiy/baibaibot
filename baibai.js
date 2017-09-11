var http=require('http');
var https=require('https');
var tls = require('tls');


const { QQ, MsgHandler } = require('./qqlib');

const{saveTxt,answer} = require('./lib/mongo');
const xchange = require('./ai/xchange')
const {cal} = require('./ai/calculator');
const {baiduSearch,baikeReply} = require('./ai/baidusearch');
const {weatherReply,getWeatherByCity} = require('./ai/weather');
const {tulingMsg} = require('./ai/tuling');
const {translateMsg}=require('./ai/translate');
const {money} = require('./ai/money');
const {getloc,route} = require('./ai/map');
const {searchSongByName} = require('./ai/song');
const kce = require('./ai/kanColleEquip')
const {getMapData} = require('./ai/kancolle/kancollemap')
const {searchsenka} = require('./ai/kancolle/senka');
const {fight} = require('./ai/favour/battle');
const buddyHandler = new MsgHandler(
    (msg, qq) => {
      handleBuddyMsg(msg,qq);
    },
    'buddy'
);

const groupHandler = new MsgHandler(
  (msg,qq) => {
    handleMsg(msg,qq,'group')
  }, 'group'
);

const discuHandler = new MsgHandler(
  (msg,qq) => {
    handleMsg(msg,qq,'discu')
  }, 'discu'
);

var qqq = new QQ(buddyHandler, groupHandler,discuHandler);
qqq.run();

function handleBuddyMsg(msg,qq){
  var name = msg.name;
  var content = msg.content;
  var id = msg.id;
  var callback = function(res){
    setTimeout(function(){
      if(Math.random()<0.2){
        res = res + "喵~";
      }
      qq.sendBuddyMsg(id,res);
    },1000);
  }
  if(content.trim().length>0){
    tulingMsg(name,content,callback);
  }
}


function handleMsg(msg,qq,type){
  try{
    handleMsg_D(msg,qq,type);
  }catch(e){
    console.log(e);
  }
}




function handleMsg_D(msg,qq,type){
  var groupid = msg.groupId;
  if(type=='discu'){
    groupid = msg.discuId;
  }
  var content = msg.content;
  var name = msg.name;
  var groupName = msg.groupName;
  var callback = function(res){
    console.log(name,content,groupName,res);
    if(res.trim().length>0){
      if(res.length>250){
        res = res.substring(0,250)+'.......';
      }
      setTimeout(function(){
        if(type=='discu'){
          qq.sendDiscuMsg(groupid," "+res);
        }else{
          qq.sendGroupMsg(groupid," "+res);
        }

      },1000);
    }
  }
  var first = content.substring(0,1);
  if(first=='.'||first=='。'){
    var c = content.substring(1);
    var f1 = c.substring(0,1);
    if(f1==""){
      ret = '舰队collection知识库\n';
      ret = ret + '.e:改修查询';
      callback(ret);
    }else if(f1=="e"){
      kce(name,c.substring(1),callback);
    }
    return;
  }
  if(first=='`'||first=='·'||first=='ˋ'||first=="'"||first=="‘"||first=="，"){

    var c1 = content.substring(1);
    if(c1==""){
      var ret = "`1+名词：百科查询\n翻译成中文：`+要翻译的内容\n翻译成日文：`2+要翻译的内容\n翻译成英文：`3+要翻译的内容\n";
      ret = ret + "`4+内容：百度查询\n`c汇率转换\n`0+数字：大写数字转换\n`8+地点A-地点B：公交查询\n";
      ret = ret + '`r+数字：ROLL一个小于该数字的随机整数\n';
      ret = ret + "天气预报：城市名+天气\n教百百说话：问题|答案\n计算器：直接输入算式\n虾扯蛋：``+对话";
      callback(ret);
    }else{
      reply(c1,name,callback);
    }
    return;
  }
  if(content.trim()=='天气'){
    if(msg.user){
      var city = msg.user.city;
      if(city.length>0&&city.length<5){
        getWeatherByCity(city,name,callback);
      }
    }
    return;
  }

  var n = content.indexOf('天气');
  if(n>1&&n<10){
    var city = content.substring(0,n).trim();
    try{
      getWeatherByCity(city,name,callback);
    }catch(e){
      console.log(e);
    }
    return;

  }
  var ca = content.split('|');
  if(ca.length==2){
    if(ca[0].length<50){
      saveTxt(ca[0],ca[1],name,groupName,callback);
      return;
    }
  }

  var calret = cal(content);
  if(calret){
    callback(content+"="+calret);
    return;
  }
  if(content.indexOf('百百')>-1){
    tulingMsg(name,content,callback);
    return;
  }
  answer(content,name,groupName,callback);

}

function reply(content,userName,callback){
  var first = content.substring(0,1);
  if(first=='`'||first=='·'||first=='ˋ'||first=="'"||first=="‘"||first=="，"){
    tulingMsg(userName,content.substring(1),callback);
  }else if(first==2){
    translateMsg(content.substring(1),'ja',callback);
  }else if(first==3){
    translateMsg(content.substring(1),'en',callback);
  }else if(first==1){
    baikeReply(content.substring(1),userName,callback);
  }else if(first==4){
    baiduSearch(userName,content.substring(1),callback);
  }else if(first==0){
    callback(money(content.substring(1)));
  }else if(first=='c'||first=='C'){
    xchange(userName,content.substring(1),callback);
  }else if(first=="e"||first=='E'){
    kce(userName,content.substring(1),callback);
  }else if(first=="k"||first=='K'){
    getMapData(userName,content.substring(1),callback);
  }else if(first=="z"||first=='Z'){
    searchsenka(userName,content.substring(1),callback);
  }else if(first=='s'||first=='S'){
    searchSongByName(userName,content.substring(1),callback);
  }else if(first=='r'||first=='R'){
    callback(Math.floor(Math.random()*parseInt(content.substring(1))));
  }else if(first=='f'||first=='F'){
    fight(userName,content,qqq.getMemberListInGroup(),callback);
  }else if(first==8){
    var ca = content.substring(1).split('-');
    if(ca.length==2){
      route(0,ca[0],ca[1],callback);
    }
  }else{
    translateMsg(content,'zh-CHS',callback)
  }
}

const replyBySwitch = (content, userName, callback) => {
  switch(content.substring(0, 1)){
    case '`':
    case '·':
    case 'ˋ':
    case "'":
    case "‘":
    case "，":
      tulingMsg(userName,content.substring(1),callback);
      break;
    case 0:
      callback(money(content.substring(1)));
      break;
    case 1:
      baikeReply(content.substring(1),userName,callback);
      break;
    case 2:
      translateMsg(content.substring(1),'ja',callback);
      break;
    case 3:
      translateMsg(content.substring(1),'en',callback);
      break;
    case 4:
      baiduSearch(userName,content,callback);
      break;
    case 8:
      if(content.substring(1).split('-') == 2)
        route(0,ca[0],ca[1],callback);
      break;
    default:
      translateMsg(content,'zh-CHS',callback);
  }
}











var relogin = function(){
  if(qqq){
    qqq.destroy();
  }
  qqq=new QQ(buddyHandler, groupHandler,discuHandler);
  qqq.run();
}

module.exports={
  relogin
}


