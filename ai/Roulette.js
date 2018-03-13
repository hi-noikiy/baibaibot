var MongoClient = require('mongodb').MongoClient;
var mongourl = 'mongodb://192.168.17.52:27050/db_bot';

let rouletteTimer
let rouletteObj = {
  gameStart: false,
  gameAction: false,
  gamers: {},
  gameActionCount: 0,
  gamersArr: [],
  callback:function(){},
  magazineArr: []
}
let death={};
let skip = {};
const {banUserbyName} = require('./banuser');
module.exports = function(nickname, content, callback){
  // console.log('=== in game ===')
  /* roulette system */
  if(content === '俄罗斯轮盘' || content === '俄羅斯輪盤'){
    if(!rouletteObj.gameStart){
      skip = {};
      rouletteObj.gameStart = true
      rouletteObj.gamers = []
      rouletteTimer = setTimeout(() => {checkRouletteGammers()}, 60000)
      rouletteObj.callback=callback
      callback('生死有命，富贵在天！\n俄罗斯轮盘将在 60 秒后开始。\n参加：加入/参加/join\n退出：退出/quit/escape/逃跑\n开枪：开枪/开火/fire')
    }else{
      callback('请稍后再试');
      return;
    }
  }
  if(rouletteObj.gameStart && !rouletteObj.gameAction ){
    switch(content){
      case '加入':
      case '加入':
      case 'join':
      case '參加':
      case '参加':
        var can=true
        if(death[nickname]) {
          var now = new Date().getTime();
          var then = death[nickname];
          if (now < then) {
            can = false;
            rouletteObj.callback(`【${nickname}】已经死亡,无法坐上赌桌,复活时间：【${new Date(then).toLocaleString()}】`)
          }
        }
        if(can){
          if (rouletteObj.gamers[nickname]) {
            rouletteObj.callback(`【${nickname}】已经坐上赌桌`)
          } else {
            rouletteObj.callback(`【${nickname}】坐上了赌桌`)
            rouletteObj.gamers[nickname] = 1
            if (Object.keys(rouletteObj.gamers).length === 6) {
              clearTimeout(rouletteTimer)
              rouletteGameAction()
            }
          }
        }
        break;
      case '退出':
      case '退出':
      case 'quit':
      case 'escape':
      case '逃跑':
      case '逃跑':
        if (rouletteObj.gamers[nickname]){
          delete rouletteObj.gamers[nickname]
          rouletteObj.callback(`lowb【${nickname}】逃跑了`)
        } else {
          rouletteObj.callback(`lowb【${nickname}】没坐上赌桌还要凑个热闹`)
        }
        break;
    }
  }

  checkRouletteGammers = () => {
    if(Object.keys(rouletteObj.gamers).length < 2){
      rouletteObj.callback('参加人数不足')
      rouletteGameOver()
    } else {
      rouletteGameAction()
    }
  }

  rouletteGameOver = () => {
    rouletteObj.gameStart = false
    rouletteObj.gameAction = false
    rouletteObj.gamers = {}
    rouletteObj.gameActionCount = 0
    rouletteObj.gamersArr = []
    rouletteObj.magazineArr = []
    setTimeout(() => {
      rouletteObj.callback('游戏结束')
    }, 500)
  }

  rouletteGameAction = () => {
    rouletteObj.gameAction = true
    for(let i = 0; i < 6; i++){
      rouletteObj.magazineArr.push(Math.random() < 0.5? 0: 1)
      rouletteObj.gamersArr = Object.keys(rouletteObj.gamers).sort(() => Math.random() < 0.5 ? -1: 1)
    }
    rouletteObj.callback(`赌局开始！\n弹匣为空，重新上膛`)
    checkAliveGamer()
  }

  if(rouletteObj.gameStart && rouletteObj.gameAction &&
    (content === '开枪' || content === '开火' || content === 'fire' || content === '開火' || content === '開槍'
    || content === '跳过' || content == 'skip' || content === 'pass')
    && rouletteObj.now === nickname){
    let skipped=0;
    if(content === '跳过' || content == 'skip' || content === 'pass'){
      if(skip[nickname]){
        rouletteObj.callback(`【${rouletteObj.now}】还想在逃避，被吃惯群众摁回了赌桌上。`)
      }else{
        skipped=1;
        skip[nickname]=1;
        rouletteObj.callback(`【${rouletteObj.now}】机智的把枪传递给下个人`);
        rouletteObj.gamersArr.push(rouletteObj.now)
        rouletteObj.gameActionCount = rouletteObj.gameActionCount + 1
        checkAliveGamer()
      }
    }
    if(skipped){
      clearTimeout(rouletteTimer)
      if(rouletteObj.magazineArr[rouletteObj.gameActionCount]){
        rouletteObj.gameActionCount = rouletteObj.gameActionCount + 1
        killGamer(2)
      } else {
        switch (Math.ceil(3 * Math.random())){
          case 1:
            rouletteObj.callback(`【${rouletteObj.now}】生无可恋地把扣动扳机，然而什么都没有发生。`)
            break
          case 2:
            rouletteObj.callback(`【${rouletteObj.now}】毫无茫然地把扣动扳机，然而什么都没有发生。`)
            break
          case 3:
            rouletteObj.callback(`【${rouletteObj.now}】毫不犹豫地把扣动扳机，然而什么都没有发生。`)
            break

        }
        rouletteObj.gamersArr.push(rouletteObj.now)
        rouletteObj.gameActionCount = rouletteObj.gameActionCount + 1
        checkAliveGamer()
      }
    }
  }

  getNextGamer = () => {
    rouletteObj.now = rouletteObj.gamersArr.shift()
    rouletteObj.callback(`下一个【${rouletteObj.now}】`)
    rouletteTimer = setTimeout(() => {killGamer(1)}, 15000)
  }

  killGamer = type => {
    saveDeath(rouletteObj.now,1,function(ret) {
      switch (type) {
        case 1:
          banUserbyName(rouletteObj.now, 300);
          death[rouletteObj.now] = new Date(new Date().getTime() + 1000000).getTime();
          rouletteObj.callback(`【${rouletteObj.now}】犹豫不决，吃瓜群众一枪崩了他的狗命。\n${ret}`)
          break
        case 2:
          banUserbyName(rouletteObj.now, 300);
          death[rouletteObj.now] = new Date(new Date().getTime() + 1000000).getTime();
          switch (Math.ceil(3 * Math.random())) {
            case 1:
              rouletteObj.callback(`砰！一声枪声响起，【${rouletteObj.now}】倒在了赌桌上。\n${ret}`)
              break
            case 2:
              rouletteObj.callback(`砰！一声枪声响起，【${rouletteObj.now}】倒在了吃瓜群众的怀中。\n${ret}`)
              break
            case 3:
              rouletteObj.callback(`砰的一声，【${rouletteObj.now}】倒在了血泊中。\n${ret}`)
              break
          }
          break
      }
      checkAliveGamer();
    });
  }

  checkAliveGamer = () => {
    setTimeout(() => {
      if(rouletteObj.gamersArr.length > 1 && rouletteObj.gameActionCount < 6){
        getNextGamer()
      } else {
        rouletteObj.gamersArr.forEach(function(name){
          saveDeath(name,0,function(ret){

          });
        });
        rouletteObj.callback(`赌局结束！幸存者：【${rouletteObj.gamersArr.join('】、【')}】,枪内子弹(${rouletteObj.magazineArr.reduce((p, c) => p + c)}/6)`)
        rouletteGameOver()
      }
    }, 500)
  }
}


function saveDeath(userName,IsDeath,callback){
  MongoClient.connect(mongourl, function(err, db) {
    var query = {'_id':userName};
    var cl_roulette_game = db.collection('cl_roulette_game');
    cl_roulette_game.findOne(query, function(err, data) {
      if(data){
        data.d=data.d+1;
        data.death=data.death+IsDeath;
      }else{
        data = {'_id':userName,d:1,death:IsDeath}
      }
      cl_roulette_game.save(data);
      callback(data.death+"/"+data.d);
    });
  });
}

