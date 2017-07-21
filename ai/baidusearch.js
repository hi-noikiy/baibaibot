var https=require('https');
var http = require('http');
function baiduSearch(userid,content,callback){
  var path = '/s?wd='+encodeURIComponent(content);
  httpsget('www.baidu.com',path,callback,0);
}




function httpsget(host,path,callback,depth){
  var options = {
    hostname: host,
    port: 443,
    path: path,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36'
    },
    method: 'GET'
  };
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var code = res.statusCode;
    if(depth<5&&(code==301||code==302)){
      var location = res.headers.location;
      httpget(host,location,callback,depth+1);
    }else{
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        var ret = handleBaiduRes(resdata);
        callback(ret);
      });
    }

  });
  req.end();
}

function handleBaiduRes(resdata){
  var n0 = resdata.indexOf('<div id="content_left');
  var s0 = resdata.substring(n0);
  var n1 = s0.indexOf('c-container');
  var s1 = s0.substring(n1+10);
  var n2 = s1.indexOf('c-container');
  var s = s1.substring(0,n2);
  var ret = '';
  var isinner=0;
  var rn = 0;
  for(var i=0;i<s.length;i++){
    if(isinner==0&&s[i]==">"){
      isinner=1;
    }else if(isinner==1&&s[i]=="<"){
      isinner=0;
    }else if(isinner){

      if(s[i]==" "||s[i]=="\n"){
        if(rn==0){
          ret=ret+s[i];
        }
        rn=1;
      }else{
        ret=ret+s[i];
        rn=0;
      }
    }
  }
  ret = ret.trim();
  ret = ret.replace(/&nbsp;/g,'').replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<');
  if(ret.length>250){
    ret = ret.substring(0,250)+'.......';
  }
  return ret;
}

function baikeReply(word,userId,callback){
  word = word.trim();
  if(word.length>20){
    callback(word+'是什么好吃的？');
    return;
  }
  httpget('baike.baidu.com','/item/'+encodeURIComponent(word),function(resdata){
    var n1 = resdata.indexOf('lemma-summary');
    var n2 = resdata.indexOf('basic-info');
    var s1 = resdata.substring(n1,n2);
    var ret = '';
    var isinner=0;
    for(var i=0;i<s1.length;i++){
      if(isinner==0&&s1[i]==">"){
        isinner=1;
      }else if(isinner==1&&s1[i]=="<"){
        isinner=0;
      }else if(isinner){
        ret=ret+s1[i];
      }
    }
    if(ret.length>250){
      ret = ret.substring(0,250)+'.......';
    }
    ret = ret.replace(/&nbsp;/g,'').replace(/\[[0-9]\]/g,'');
    callback(ret.trim());
  },0);
}


function httpget(host,path,callback,depth){
  var options = {
    hostname: host,
    port: 80,
    path: path,
    method: 'GET'
  };
  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    var code = res.statusCode;
    if(depth<5&&(code==301||code==302)){
      var location = res.headers.location;
      httpget(host,location,callback,depth+1);
    }else{
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        callback(resdata);
      });
    }

  });
  req.end();
}








module.exports={
  baiduSearch,
  baikeReply
}



