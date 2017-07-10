var http=require('http');
var https=require('https');
var tls = require('tls');


const { QQ, MsgHandler } = require('./qqlib');

const buddyHandler = new MsgHandler(
    (msg, qq) => {
        qq.sendBuddyMsg(msg.id, `Hello ${msg.name}`);
    },
    'buddy'
);

const groupHandler = new MsgHandler(
  (msg,qq) => {
    handleGroupMsg(msg,qq)
    }, 'group'
);

new QQ(buddyHandler, groupHandler).run();

function handleGroupMsg(msg,qq){
  var groupid = msg.groupId;
  var content = msg.content;
  var name = msg.name;
  var first = content.substring(0,1);
  if(first=='`'||first=='·'||first=='ˋ'){
    var callback = function(res){
      qq.sendGroupMsg(groupid," "+res);
    }
    var c1 = content.substring(1);
    if(c1==""){
      var ret = "翻译成中文：`+要翻译的内容\n翻译成日文：`2+要翻译的内容\n翻译成英文：`3+要翻译的内容\n天气预报：城市名+天气\n虾扯蛋：``+对话\n";
      callback(ret);
    }else{
      reply(c1,name,callback);
    }
    return;
  }
  var n = content.indexOf('天气');
  if(n>1&&n<5){
    var city = content.substring(0,n);
    var callback = function(res){
      qq.sendGroupMsg(groupid," "+res);
    }
    weatherReply(city,name,callback);
  }
}

function reply(content,userName,callback){
  var first = content.substring(0,1);
  if(first=='`'||first=='·'||first=='ˋ'){
    tulingMsg(userName,content.substring(1),callback);
  }else if(first==2){
    translateMsg(content.substring(1),'ja',callback);
  }else if(first==3){
    translateMsg(content.substring(1),'en',callback);
  }else{
    translateMsg(content,'zh-CHS',callback)
  }
}


const tulingApiKey = "9cca8707060f4432800730b2ddfb029b";
function tulingMsg(userid,content,callback){
  var body={};
  body.key=tulingApiKey;
  body.info=content;
  body.userid=userid;
  var options = {
    hostname: 'www.tuling123.com',
    port: 80,
    path: '/openapi/api',
    method: 'POST',
  };
  var req = http.request(options, function (res) {
    res.setEncoding('utf8');
    var resdata = '';
    res.on('data', function (chunk) {
      resdata = resdata + chunk;
    });

    res.on('end', function () {
      var ret = handleTulingResponse(resdata);
      callback(ret);
    });
  });
  req.write(JSON.stringify(body));
  req.end();
}

function handleTulingResponse(resdata){
  var data = eval("("+resdata+")");
  var code = data.code;
  var ret = '';
  if(code == 100000){
    ret = data.text;
  }else if(code == 200000){
    ret = data.text+""+data.url;
  }else{
    ret = '出错了喵';
  }
  return ret;
}

function translateMsg(content,tolan,callback){
  if(tolan=='zh-CHS'){
    if(content.indexOf(" ")<0){
      var options = {
        hostname: 'api.shanbay.com',
        port: 80,
        path: '/bdc/search/?word='+content,
        method: 'GET',
      };
      var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var resdata = '';
        res.on('data', function (chunk) {
          resdata = resdata + chunk;
        });
        res.on('end', function () {
          var data = eval("("+resdata+")");
          var ret = data.data?(data.data.definition?data.data.definition:''):'';
          if(ret!=''){
            callback(content+"\n"+ret);
          }else{
            googleTranslate(content,'zh',callback);
          }
        });
      });
      req.end();
    }
  }else if(tolan=='ja'||tolan=='en'){
    googleTranslate(content,tolan,callback);
  }else{
    ret = '出错了喵';
    callback(ret);
  }
}


var HttpsProxyAgent = require('https-proxy-agent')
var proxy = 'http://192.168.17.62:3128';
var agent = new HttpsProxyAgent(proxy);
var fs = require('fs');
var gkey = fs.readFileSync('./gkey.txt','utf-8');
zlib = require('zlib');

function googleTranslate(content,tolan,callback){
  var option = {
    host: 'www.googleapis.com',
    port: 443,
    method: 'GET',
    agent:agent,
    path: '/language/translate/v2?key='+gkey+'&q='+encodeURIComponent(content)+'&target='+tolan
  };
  var req = https.request(option, function(res) {
    res.setEncoding('utf8');
    var resdata = '';
    res.on('data', function (chunk) {
      resdata = resdata + chunk;
    });
    res.on('end', function () {
      var data=eval("("+resdata+")");
      var ret = '';
      try{
        ret = data.data.translations[0].translatedText;
      }catch(e){
        ret = '出错了喵';
      }
      callback(content+'\n          ↓\n'+ret);
    });
  })
  req.end();
}


function weatherReply(city,userId,callback){
  var options = {
    hostname: 'wthrcdn.etouch.cn',
    port: 80,
    path: '/weather_mini?city='+encodeURIComponent(city),
    method: 'GET'
  };
  var req = http.request(options, function (res) {
    var encoding = res.headers['content-encoding'];
    var chunks = [];
    res.on('data', function (chunk) {
      chunks.push(chunk);
    });
    res.on('end', function () {
      var buffer = Buffer.concat(chunks);
      zlib.gunzip(buffer, function(err, decoded) {
        var ret = '';
        var data = eval("("+decoded+")");
        if(data.data){
          var jd = data.data;
          if(jd.city){
            ret = ret + jd.city + " ";
          }
          if(jd.wendu){
            ret = ret + jd.wendu + "℃ ";
          }
          if(jd.aqi){
            ret = ret + "空气质量指数:"+jd.aqi+"\n";
          }
          if(jd.ganmao){
            ret = ret + jd.ganmao+"\n\n";
          }
          if(jd.forecast){
            var ja = jd.forecast;
            for(var i=0;i<ja.length;i++){
              var jdd = ja[i];
              ret = ret + jdd.date+" "+jdd.type+" "+jdd.low+" "+jdd.high+"\n";
            }
          }
          callback(ret);
        }else{
          ret = city + '是哪里？\n'+userId+' 带我去玩哇';
          callback(ret);
        }
      });
    });
  });
  req.end();
}


