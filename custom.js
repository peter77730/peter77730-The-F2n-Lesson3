// navbar單一資訊顯示
const busInfo = document.querySelector('.busInfo');
const busSearch = document.querySelector('.busSearch');
const nearbyBus = document.querySelector('.nearbyBus');
const busInfoId = document.querySelector('#busInfo');
const busSearchId = document.querySelector('#busSearch');
const nearbyBusId = document.querySelector('#nearbyBus');
const citySearch = document.querySelector('.citySearch');
const nearbyBusTitle = document.querySelector('.nearbyBusTitle');

    busInfo.addEventListener('click', function(){
        citySearch.classList.remove('d-none');
        locolBusStation.classList.add('d-none')
        if(busInfo.getAttribute('aria-expanded') == 'true'){
        busSearch.setAttribute('aria-expanded',"false"); 
        busSearch.classList.add('collapsed');
        busSearchId.setAttribute('class',"collapse"); 
        nearbyBus.setAttribute('aria-expanded',"false"); 
        nearbyBus.classList.add('collapsed');
        nearbyBusId.setAttribute('class',"collapse"); 
        }
    })
    busSearch.addEventListener('click', function(){
        if(busSearch.getAttribute('aria-expanded') == 'true'){
            busInfo.setAttribute('aria-expanded',"false"); 
            busInfo.classList.add('collapsed');
            busInfoId.setAttribute('class',"collapse"); 
            nearbyBus.setAttribute('aria-expanded',"false"); 
            nearbyBus.classList.add('collapsed');
            nearbyBusId.setAttribute('class',"collapse"); 
        }
    })
    nearbyBus.addEventListener('click', function(){
        locolBusStation.classList.remove('d-none')
        citySearch.classList.add('d-none');
        getLocalBusStation();
        if(nearbyBus.getAttribute('aria-expanded') == 'true'){
            busInfo.setAttribute('aria-expanded',"false"); 
            busInfo.classList.add('collapsed');
            busInfoId.setAttribute('class',"collapse"); 
            busSearch.setAttribute('aria-expanded',"false"); 
            busSearch.classList.add('collapsed');
            busSearchId.setAttribute('class',"collapse"); 
        }
        nearbyBusTitle.innerHTML = `<h1 class="pe-4 text-center h4">附近站牌</h1>
        <h4 class="text-center h6">距離 200m</h4>`
    })

//擷取公車全部按鈕
const citySelect = document.querySelectorAll('.citySelect');
const cityName = document.querySelector('.cityName');
citySelect.forEach((item) => {
    item.addEventListener('click', () => {
        let city = item.getAttribute('value');
        let cName =  item.getAttribute('name');
        cityName.innerHTML = `<h1 class="pe-3 text-center cityName">${cName}</h1>
        <h4 class="text-center h5">全部路線</h4>`
        // console.log(cName);
        getBusAllData(city);
  })
})

// 串接各城市所有公車路線資料
let busAllData = [];
function getBusAllData(city) {
  axios({
    method: 'get',
    url: `https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${city}?$top=500&$format=JSON`,
    headers: GetAuthorizationHeader()
  })
    .then((response) => {
        busAllData = response.data;
        console.log(busAllData);
    //   console.log(data[0].RouteName['Zh_tw']);
      getBusData();
    })
    .catch((error) => console.log('error', error))
}

//渲染公車畫面
const formInit = document.querySelector('.formInit');
function getBusData(){
    let str = "";
    busAllData.forEach(function(item,index){
        let data = item.RouteName['Zh_tw']
        str +=`<div"><a class="btn btn-success border-3 btn-lg m-2 shadow-sm" href="#" role="button">${data}</a></div>`;
    })
    formInit.innerHTML = str;
}

const BusKeyWord = document.querySelector('.BusKeyWord');
const locolBusStation = document.querySelector('.locolBusStation');
BusKeyWord.addEventListener('change',function(){
    let str = ""
    console.log(BusKeyWord.value);
    busAllData.forEach(function(item){
        let patt = new RegExp(BusKeyWord.value);
        console.log(item);
        if(patt.test(item.RouteName['Zh_tw']) == true){
            str += `<div"><a class="btn btn-info btn-lg  m-2  shadow-sm" href="#" role="button">${item.RouteName['Zh_tw']}</a></div>`;
        }
    })
    formInit.innerHTML = str;
})

//獲取當前座標公車站牌

const mymap = L.map('mapid').setView([0, 0], 18);
let coordinate = {};

    // Mapbox   
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoicGV0ZXI3NzczMCIsImEiOiJja3Vwa3A0OXUwMjY4Mm5vNnhwdnZhdTlyIn0.Dg3LQDPYUDWXLN1-sIohMA'
  }).addTo(mymap);
  
  // 使用 navigator web api 獲取當下位置(經緯度)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        coordinate.longitude = position.coords.longitude;  // 經度
        coordinate.latitude = position.coords.latitude;  // 緯度
        // console.log(longitude)
        // console.log(latitude)
        // console.log(coordinate);
  
        // 重新設定 view 的位置
        mymap.setView([coordinate.latitude, coordinate.longitude], 13);
        // 將經緯度當作參數傳給 getData 執行
        // getStationData(coordinate.longitude, coordinate.latitude);
      },
      // 錯誤訊息
      function (e) {
        const msg = e.code;
        const dd = e.message;
         console.error(msg)
         console.error(dd)
      }
    )
  }

// 串接當前車站資訊
let StationAllData = [];
function getLocalBusStation() {
  axios({
    method: 'get',
    url: `https://ptx.transportdata.tw/MOTC/v2/Bus/Station/NearBy?$top=30&$spatialFilter=nearby(${coordinate.latitude}%2C%20${coordinate.longitude}%2C%20200)&$format=JSON`,
    headers: GetAuthorizationHeader()
  })
    .then((response) => {
        StationAllData = response.data;
        console.log(StationAllData);
        setMarker();
        setNearbyBus();
    })
    .catch((error) => console.log('error', error))
}

// 標記 icon
function setMarker() {
    StationAllData.forEach((item) => {
        let busStr = "";
        item.Stops.forEach(function(el){
            console.log(el.RouteName['Zh_tw']);
            busStr += `${el.RouteName['Zh_tw']};`;
        })
        console.log(busStr);
      console.log(item.StationPosition.PositionLon, item.StationPosition.PositionLat)
      L.marker([item.StationPosition.PositionLat, item.StationPosition.PositionLon]).addTo(mymap).bindPopup(
        `<div class="card-body">
            <a href="#" class="text-decoration-none">
                <h2 class="card-title h3 text-secondary">${item.StationName['Zh_tw']}</h2>
                <h5 class="card-text h6 text-secondary"><span class="text-primary">${item['Stops'].length} </span>個公車路線</h5>
                <h5 class="card-text h6 text-secondary"><span class="text-primary">公車資訊：${busStr}</span></h5>
            </a>  
        </div>                        
    </div>`
      )
    })
  }

//   附近站牌渲染畫面
  const nearbyBusCard = document.querySelector('.nearbyBusCard');
function setNearbyBus(){
    let str = "";
    StationAllData.forEach(function(item){
        // console.log(item);
        let el = item.StationAddress
        if(item.StationAddress == undefined){
            el = "無資料"
        }
        str += `<div class="card w-100">
        <div class="card-body">
            <a href="#" class="text-decoration-none">
                <h2 class="card-title h3 text-secondary">${item.StationName['Zh_tw']}</h2>
                <h5 class="card-text h6 text-secondary"><span class="text-primary">${item['Stops'].length} </span>個公車路線</h5>
                <h5 class="card-text h6 text-secondary"><span class="text-primary">${el}</span></h5>
            </a>  
        </div>                        
    </div>`
    })
    // nearbyBusTitle.innerHTML = "<div class='col-12 d-flex align-items-end'><h1 class='pe-4 text-center h4'>附近站牌</h1><h4 class='text-center h6'>距離 200m</h4></div>";
    nearbyBusCard.innerHTML = str;
}

    //載入交通部API金鑰
function GetAuthorizationHeader() {
    var AppID = '5f26e8783f97436e95dd2706ae3e476c';//Peter Chen擁有
    var AppKey = 'KckLmAGtZVRJyvvMA7aQoFg4XP0';//Peter Chen擁有
  
    var GMTString = new Date().toGMTString();
    var ShaObj = new jsSHA('SHA-1', 'TEXT');
    ShaObj.setHMACKey(AppKey, 'TEXT');
    ShaObj.update('x-date: ' + GMTString);
    var HMAC = ShaObj.getHMAC('B64');
    var Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';
  
    return { 'Authorization': Authorization, 'X-Date': GMTString /*,'Accept-Encoding': 'gzip'*/}; //如果要將js運行在伺服器，可額外加入 'Accept-Encoding': 'gzip'，要求壓縮以減少網路傳輸資料量
  }
    

