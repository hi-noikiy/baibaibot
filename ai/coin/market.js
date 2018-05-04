const fs = require('fs'),
  path = require('path'),
  Canvas = require('canvas'),
  { sendImageMsgBuffer } = require(path.join(__dirname, '../../cq/sendImage.js'))
// const gm = require('gm')
// let imageMagick = gm.subClass({ imageMagick : true });

const checkMaxWidth = (ctx, str, maxWidth) => {
  let start = 0, splitArr = []
  for(let i = 1; i < str.length; i++){
    if(ctx.measureText(str.substring(start, i)).width > maxWidth){
      splitArr.push(str.substring(start, i - 1))
      start = i - 1
    }
  }
  splitArr.push(str.substring(start))
  return splitArr
}
const renderText = (ctx, textArr, topMargin, leftMargin, lineHeight,color) => {
  textArr.forEach((text, index) => {
    if(color){
      ctx.fillStyle = color[index]
    }else{
      ctx.fillStyle = 'rgba(255,255,0,1)'
    }
    ctx.fillText(text, leftMargin, topMargin + lineHeight * (index + 1))
  })
}

const renderTextBox = (ctx, left, top, width, height, radius, title) => {
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(204,204,204,1)'
  ctx.lineWidth = 1
  ctx.moveTo(left + radius, top)
  ctx.lineTo(left + width - radius, top)
  ctx.arcTo(left + width, top, left + width, top + radius, radius)
  ctx.lineTo(left + width, top + height - radius)
  ctx.arcTo(left + width, top + height, left + width - radius, top + height, radius)
  ctx.lineTo(left + radius, top + height)
  ctx.arcTo(left, top + height, left, top + height - radius, radius)
  ctx.lineTo(left, top + radius)
  ctx.arcTo(left, top, left + radius, top, radius)

  ctx.stroke()
  let titleWidth = ctx.measureText(title).width
  ctx.fillStyle = 'rgba(0,0,0,1)'
  ctx.fillRect(left + radius + 5, top - 14, titleWidth + 8, 28)
  ctx.fillStyle = 'rgba(238,78,7,1)'
  ctx.fillText(title, left + radius + 9, top + 6)
}

const MAX_WIDTH=350;

module.exports = function(callback){
  getCoinMarket(data => {
    if(data.length==0){
      callback('coinmarket BOOM!')
    }else{
      let canvasTmp = new Canvas(400, 2000)
        , ctxTmp = canvasTmp.getContext('2d');
      let fontFamily = 'STXIHEI'
      ctxTmp.font = `20px ${fontFamily}`;
      /* 预处理币种，美元，人民币 */
      let typeMaxWidth = 0, usdMaxWidth = 0, cnyMaxWidth = 0 ,c1hMaxWidth=0,c1dMaxWidth=0
      data.forEach(val => {
        if(ctxTmp.measureText(val.type).width > typeMaxWidth){
          typeMaxWidth = ctxTmp.measureText(val.type).width
        }
        if(ctxTmp.measureText(val.usd).width > usdMaxWidth){
          usdMaxWidth = ctxTmp.measureText(`$ ${val.usd}`).width
        }
        if(ctxTmp.measureText(val.cny).width > cnyMaxWidth){
          cnyMaxWidth = ctxTmp.measureText(`￥ ${val.cny}`).width
        }
        if(ctxTmp.measureText(val.c1h).width > c1hMaxWidth){
          c1hMaxWidth = ctxTmp.measureText(`￥ ${val.c1h}`).width
        }
        if(ctxTmp.measureText(val.c1d).width > c1dMaxWidth){
          c1dMaxWidth = ctxTmp.measureText(`￥ ${val.c1d}`).width
        }

      })
      let canvasWidth = typeMaxWidth + usdMaxWidth + cnyMaxWidth + c1hMaxWidth + 120
      console.log(canvasWidth)
      let cavasHeight = data.length * 25 + 80

      let canvas = new Canvas(canvasWidth, cavasHeight)
        , ctx = canvas.getContext('2d')

      ctx.font = `20px ${fontFamily}`
      ctx.fillStyle = 'rgba(0,0,20,0.9)'
      ctx.fillRect(0, 0, canvasWidth, cavasHeight)

      ctx.fillStyle = 'rgba(255,255,255,1)'
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'

      var colorArr = data.map(val => parseFloat(val.c1h)>0?'red':'aqua');


      renderTextBox(ctx, 15, 20, canvasWidth-30, cavasHeight-50, 10, new Date().toLocaleString()+"(CoinMarket)")
      renderText(ctx, data.map(val => val.type), 20, 20, 25)
      renderText(ctx, data.map(val => `$${val.usd}`), 20, 40 + typeMaxWidth, 25)
      renderText(ctx, data.map(val => `￥${val.cny}`), 20, 60 + typeMaxWidth + usdMaxWidth, 25)
      renderText(ctx, data.map(val => " "+(parseFloat(val.c1h)>0?"+":"")+`${val.c1h}%`),
        20, 80 + typeMaxWidth + usdMaxWidth + cnyMaxWidth, 25,colorArr)
      //renderText(ctx, data.map(val => ` ${val.c1d}%`), 20, 100 + typeMaxWidth + usdMaxWidth + cnyMaxWidth + c1dMaxWidth, 25)


      let imgData = canvas.toDataURL()
      let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "")
      let dataBuffer = new Buffer(base64Data, 'base64')


      if(true){
        sendImageMsgBuffer(dataBuffer, 'coin_'+new Date().getTime(), 'coin', msg => {
          callback(msg)
        })
      }else{
        fs.writeFile(path.join(__dirname, '../../test/image.png'), dataBuffer, function(err) {
          if(err){
            console.log(err)
          }else{
            console.log("保存成功！");
          }
        });
      }
    }

  }, false, true)


}












var https = require('https');
var HttpsProxyAgent = require('https-proxy-agent')
var proxy = 'http://192.168.17.62:3128';
var agent = new HttpsProxyAgent(proxy);
var failed = 0;

function getCoinMarket(callback,withproxy, isInterface = false){
  var now = new Date();
  console.log('will get conmarket:'+withproxy);
  var options = {
    hostname: "api.coinmarketcap.com",
    port: 443,
    path: '/v1/ticker/?convert=CNY&limit=30',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36'
    },
    method: 'GET'
  };
  if(withproxy){
    options.agent=agent;
  }
  //options.agent=agent;
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var code = res.statusCode;
    if(code==200){
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        failed = 0;
        var data = eval(resdata);
        var ret = "数字货币行情(CoinMarket)："+now.toLocaleString()+"\n";
        var n={"btc":1,"ltc":1,"eth":1,"etc":1,"xrp":1,"eos":1,"bch":1,"qtum":1,"dash":1,"neo":1,"ada":1}
        if(isInterface){
          ret = []
        }
        for(var i=0;i<data.length;i++){
          var pd = data[i];
          var symbol=pd.symbol;
          if(n[symbol.toLowerCase()]){
            var price_usd=parseFloat(pd.price_usd);
            var price_cny=parseFloat(pd.price_cny);
            //var rate = price_cny/price_usd;
            if(isInterface){
              ret.push({
                type: symbol,
                usd: price_usd.toFixed(2),
                cny: price_cny.toFixed(2),
                c1h: pd.percent_change_1h,
                c1d: pd.percent_change_24h
              })
            } else {
              ret = ret + symbol + ":$"+price_usd.toFixed(2)+"   \t￥"+price_cny.toFixed(2)+"\n";
            }
          }
        }
        callback(ret);
      });
      res.on('error',function(){

      })
    }
  });
  req.on('error', function(err) {
    console.log('req err:');
    console.log(err);
    failed = failed + 1;
    if(failed>2){
      if(isInterface){
        callback([])
      }else{
        callback('CoinMarket BOOM!');
      }
    }else{
      getCoinMarket(callback,true,isInterface);
    }
  });
  req.setTimeout(5000,function(){
    failed = failed + 1;
    if(failed>2){
      callback('CoinMarket BOOM!');
    }else{
      getCoinMarket(callback,true,isInterface);
    }
  });
  req.end();
}








