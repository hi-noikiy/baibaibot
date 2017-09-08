const Axios = require('axios')
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36'
const TIME_OUT = 30000

const getMapDataFromWiki = map =>
  new Promise((resolve, reject) => {
    Axios.get('https://zh.moegirl.org/'+encodeURIComponent('舰队')+'Collection/'+map, {
      timeout: TIME_OUT,
      headers: {
        'User-Agent': USER_AGENT
      }
    })
      .then(response => resolve(response.data))
      .catch(error => {
        console.log(error)
      })
  })


var list = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
function getMapData(userName,mapid,callback){
  getMapDataFromWiki(mapid).then(function(response){
    var n1 = response.indexOf('id="5-2');
    var s1 = response.substring(n1+5);
    var n2 = s1.indexOf('路线分歧');
    var s2 = s1.substring(n2+5);
    var n3 = s1.indexOf('敌方配置');
    var s3 = s1.substring(n3+5);
    var n4 = s3.indexOf('/table>');
    var s4 = s3.substring(0,n4);
    var n5 = s4.indexOf('</th></tr>');
    var s5 = s4.substring(n5+100);
    var n = s5.indexOf('<tr');
    var ret = "";
    var prindex=0;
    var lastpr=0;
    while(n>0){
      var s = s5.substring(0,n);
      s5 = s5.substring(n+4);
      n = s5.indexOf('<tr>');
      var sa = s.split('/td>')
      var point = getinner(sa[0]);
      var pr = point.trim().substring(0,1);
      if(pr==list[prindex]){
        prindex++;
        lastpr=pr;
      }else{
        pr=lastpr;
      }
      var k1=sa[sa.length-4]
      var k2=sa[sa.length-3]
      var k3=sa[sa.length-2]
      if(k1&&k2&&k3){
        ret=ret+pr+" : "+getpolit(k1)+'/'+getpolit(k2)+'/'+getpolit(k3)+'\n';
      }
    }
    callback(ret);
  });
}

function getinner(s){
  var isinner=0;
  var rn = 0;
  var ret = "";
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
  return ret;
}

function getpolit(str){
  var n = str.indexOf('<td')
  var s1 = str.substring(n+3);
  var n2 = s1.indexOf('>');
  var s2 = s1.substring(n2+1);
  var n3 = s2.indexOf('<');
  var s3 = s2.substring(0,n3);
  return s3.trim();

}

module.exports={
  getMapData
}