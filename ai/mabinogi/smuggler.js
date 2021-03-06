const http = require('http');
const _ = require('lodash')

module.exports = function (callback) {
  http.get('http://weather.erinn.biz/smuggler.php', res => {
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', chunk => {
      rawData += chunk;
    });
    res.on('end', () => {
      try {
        let str = rawData, list = []
        let fixArea = {
          "アブネアネア湖の北西": {name: "内尔湖西北", imgNum: 1},
          "アブネアネア湖の南東": {name: "内尔湖东南", imgNum: 2},
          "アブネアネア湖西": {name: "内尔湖西", imgNum: 3},
          "アブネアネア湖の南西": {name: "内尔湖西南", imgNum: 4},
          "ブラゴ平原レザール醸造場": {name: "列扎尔酿酒厂", imgNum: 5},
          "ブラゴ平原東": {name: "布拉格平原东", imgNum: 6},
          "ブラゴ平原の北西": {name: "布拉格平原西北", imgNum: 7},
          "ブラゴ平原北": {name: "布拉格平原北", imgNum: 8},
          "ガイレフの丘ラインアルトの南東": {name: "盖尔茨丘陵东南", imgNum: 9},
          "ガイレフの丘ラインアルトの南": {name: "盖尔茨丘陵南", imgNum: 10},
          "ガイレフの丘フィアードダンジョン": {name: "盖尔茨丘陵 菲奥娜地下城", imgNum: 11},
          "トゥガルドアイル伐採キャンプ東": {name: "杜加德伐木场东", imgNum: 12},
          "コリブ渓谷北": {name: "考利芙峡谷北", imgNum: 13},
          "コリブ渓谷南": {name: "考利芙峡谷南", imgNum: 14},
          "スリアブクィリンの岩石地帯東": {name: "斯利比岩石地带东", imgNum: 15},
          "スリアブクィリンの岩石地帯":{name: "斯利比岩石地带", imgNum: 16},
          "スリアブクィリン西": {name: "斯利比西", imgNum: 17},
          "スリアブクィリンの岩石地帯西": {name: "斯利比岩石地带西南", imgNum: 18},
          "タルティーン南": {name: "塔汀南", imgNum: 19},
          "タルティーンの南西": {name: "塔汀西南", imgNum: 20},
          "タルティーンストーンヘンジ西": {name: "塔汀巨石群西", imgNum: 21},
          "タルティーン墓地": {name: "塔汀墓地", imgNum: 22},
          "センマイ平原北": {name: "仙魔平原北", imgNum: 23},
          "センマイ平原ペッカダンジョン": {name: "皮卡地下城边", imgNum: 24},
          "センマイ平原の南東": {name: "仙魔平原东南", imgNum: 25},
          "センマイ平原南": {name: "仙魔平原南", imgNum: 26},
          "センマイ平原の北西": {name: "仙魔平原西北", imgNum: 27},
          "トゥガルドアイルの東": {name: "杜加德走廊东", imgNum: 28},
          "トゥガルドアイルの南東": {name: "杜加德走廊东南", imgNum: 29},
          "トゥガルドアイルの南": {name: "杜加德走廊南", imgNum: 30}
        }
        let fixProduct = {
          "ベビーポーション": {name: "婴儿药水(迪尔科内尔)", imgNum: 1},
          "ダイエットポーション": {name: "减肥药水(迪尔科内尔)", imgNum: 2},
          "いびき防止ポーション": {name: "预防打鼾药(迪尔科内尔)", imgNum: 3},
          "人参ポーション": {name: "人参药水(迪尔科内尔)", imgNum: 4},
          "蜘蛛の糸グローブ": {name: "蜘蛛丝手套(敦巴伦)", imgNum: 5},
          "羊毛ブーツ": {name: "羊毛靴(敦巴伦)", imgNum: 6},
          "オーガキラーの仮面": {name: "食人魔屠夫假面(敦巴伦)", imgNum: 7},
          "インキュバススーツ": {name: "男妖正装(敦巴伦)", imgNum: 8},
          "バンホール産石炭": {name: "班格的煤炭(班格)", imgNum: 9},
          "大理石": {name: "大理石(班格)", imgNum: 10},
          "黄水晶": {name: "黄水晶(班格)", imgNum: 11},
          "ハイランダー鉱石": {name: "苏格兰高地矿石(班格)", imgNum: 12},
          "ベリーグラノーラ": {name: "威化(艾明码恰)", imgNum: 13},
          "バタービール": {name: "啤酒(艾明码恰)", imgNum: 14},
          "野生動物の燻製": {name: "熏制的野味(艾明码恰)", imgNum: 15},
          "トリュフパスタ": {name: "蘑菇意大利面(艾明码恰)", imgNum: 16},
          "熱気の結晶": {name: "热气结晶(塔汀)", imgNum: 17},
          "オルゴール保存石": {name: "音乐盒保存石(塔汀)", imgNum: 18},
          "パララの結晶": {name: "帕拉鲁结晶(塔汀)", imgNum: 19},
          "円形防護壁の結晶": {name: "环形栅栏结晶(塔汀)", imgNum: 20},
          "ミニ化粧台": {name: "迷你梳妆台(塔拉)", imgNum: 21},
          "ティーテーブル": {name: "茶几(塔拉)", imgNum: 22},
          "ロッキングチェア": {name: "摇椅(塔拉)", imgNum: 23},
          "子供用2段ベッド": {name: "儿童双层床(塔拉)", imgNum: 24},
          "カブ産海苔": {name: "卡普海苔(卡普港口)", imgNum: 25},
          "カブ産カキ": {name: "卡普海贝(卡普港口)", imgNum: 26},
          "フカヒレ": {name: "鲨鱼翅(卡普港口)", imgNum: 27},
          "ゼリークラゲ": {name: "海蜇(卡普港口)", imgNum: 28},
          "鉄鞭": {name: "铁鞭(贝尔法斯特)", imgNum: 29},
          "ダークソード": {name: "黑光剑(贝尔法斯特)", imgNum: 30},
          "金庫": {name: "金库(贝尔法斯特)", imgNum: 31},
          "スケルトンオーガアーマー": {name: "骷髅食人魔铠甲(贝尔法斯特)", imgNum: 32}
        }
        while (true) {
          let index = str.indexOf('<TD class="tblname" width="150">')
          if (index + 1) {
            str = str.substr(index)
            let thumbStr = str.substring(0, str.indexOf('</TR>'))
              , time = thumbStr.substring(32, 40)
              , now = new Date()
              , timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...(time.split(':'))).getTime()
              , area = thumbStr.substring(thumbStr.indexOf('target="_blank">') + 16, thumbStr.indexOf('</a></TD>')).trim()
              , product = thumbStr.substring(thumbStr.indexOf('<TD bgcolor="#ffffff"><font style="') + 51, thumbStr.indexOf('</font>')).trim()
            str = str.substr(str.indexOf('</TR>'))
            list.push({
              time: time,
              timeStamp: timestamp,
              startTime: timestamp + 300000,
              endTime: timestamp + 1020000,
              area: fixArea[area] ? fixArea[area].name : area,
              product: fixProduct[product] ? fixProduct[product].name : product
            })
          } else {
            break
          }
        }
        let nowObj, nextObj, isShow = false
        list.forEach((ele, i) => {
          if(Date.now() > ele.endTime){
            nowObj = nowObj || list[i - 1]
            nextObj = nextObj || list[i - 2]
          }
        })
        let now = new Date()
        if(now.getTime() > nowObj.startTime && now.getTime() < nowObj.endTime){
          isShow = true
        }
        let callbackStr = ''
        if(nowObj.endTime < now.getTime()){
          callbackStr = '服务器维护中'
        } else {
          callbackStr = `【走私查询】拜伦${isShow ? '出现中': '未出现'}\n`
          if(isShow){
            callbackStr += `消失时间：${formatTime(nowObj.endTime)}（${formatTimeOffset(nowObj.endTime - now.getTime())}后消失）\n`
          } else {
            callbackStr += `本次出现时间：${formatTime(nowObj.startTime)} - ${formatTime(nowObj.endTime)}（${formatTimeOffset(nowObj.startTime - now.getTime())}后出现）\n`
          }
          callbackStr += `【交易物品】：${nowObj.product}\n【交易地点】：${nowObj.area}\n`
          if(nextObj){
            callbackStr += `\n下次出现时间：${formatTime(nextObj.startTime)} - ${formatTime(nextObj.endTime)}\n【交易物品】：${nextObj.product}\n【交易地点】：${nextObj.area}`
          }
        }
        callback(callbackStr)
      } catch (e) {
        console.error(e);
      }
    })
    res.on('error', e => {
      console.log(e.message)
    })
  })
}
const formatTime = ts => `${new Date(ts).getHours()}:${addZero(new Date(ts).getMinutes())}:${addZero(new Date(ts).getSeconds())}`
const addZero = n => n < 10 ? ('0' + n) : n
const formatTimeOffset = ts => `${~~(ts / 1000 / 60)}分${addZero(~~(ts / 1000 % 60))}秒`