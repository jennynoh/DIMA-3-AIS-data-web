"use strict";

let map;
var lockImages;

async function initMap() {

  let ports = [];
  $(function () {
    $.ajax({
      url: "/fun/portLatLng"
      , method: "GET"
      , success: function (resp) {
        for (let i = 0; i < resp.length; ++i) {
          let portCd = resp[i].portCd;
          let portNameKo = resp[i].portNameKo;
          let portNameEng = resp[i].portNameEng;
          let lat = resp[i].lat;
          let lon = resp[i].lon;
          let avgVslCnt = resp[i].avgVslCnt

          ports.push([portCd, portNameKo, portNameEng, lat, lon, avgVslCnt]);
        }
      }
    })
  })

  const focus_map = { // 페이지 출력 시 포커스되는 좌표 위치
    lat: 25.0671234,
    lng: 126.6256103515625
  };

  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");



  // 검색창을 생성합니다.
  let input = document.createElement('input');
  input.id = "searchInput";
  input.setAttribute('type', 'text');
  input.setAttribute('placeholder', 'Search');

  let searchIcon = document.createElement('img');
  searchIcon.src = `img/search_icon.png`;
  searchIcon.id = "searchIcon"

  map = new Map(document.getElementById("map"), { // 좌표로 포커스를 맞춘다 
    zoom: 4,
    center: focus_map,
    mapId: "DEMO_MAP_ID",	// 없으면 지도 로드를 못하고 유효한 지도 ID 없이 초기화되어 지도에서 고급 마커를 사용할 수 없음 
    disableDefaultUI: true   // Ui 숨기기  
  });



  // 검색창 변화를 위해서 div 컨테이너에 넣음
  var searchContainer = document.createElement('div');
  searchContainer.appendChild(input);
  searchContainer.appendChild(searchIcon);

  // 구글맵 상단 왼쪽에 검색창을 표시
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(searchContainer);
  searchContainer.style.marginTop = '5%';
  searchContainer.style.marginLeft = '10%';
  searchContainer.style.display = "flex";
  searchContainer.style.flexDirection = "row";
  searchContainer.style.justifyContent = "flex-end";
  searchContainer.style.alignItems = "center";
  input.style.border = '0px';
  input.style.height = '40px';
  input.style.margin = '10px';
  input.style.fontFamily = 'Inter';
  input.style.boxShadow = 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px';
  searchIcon.style.height = '18px';
  searchIcon.style.width = '18px';
  searchIcon.style.top = '18px';


  /*
    지도 상에서 마커를 표시 
  */
  ports.forEach((port, index) => {
    var lat = port[3]; // 위도 : 1증가 위로 이동, 1 하락 시 아래로 이동
    var lng = port[4]; // 경도 : 1증가 오른쪽으로 이동, 1 하락 시 왼쪽으로 이동

    var focus_lng = lng + 0.1; // 경도 값이 변하는 것 확인 //

    var click_focus_map = { // 항구 클릭 시 포커스되는 좌표 위치
      lat: lat,
      lng: focus_lng
    };

    var marker = new AdvancedMarkerElement({ // 각 항구마다 표시되는 마크
      position: { lat: lat, lng: lng },
      map: map,
      title: port[1]
    });

    /* 
      마커 클릭시 이벤트
    */
    function markerClickEvent() {

      map.setZoom(13);
      map.setCenter(click_focus_map);

      // AJAX 요청만을 보내는 코드
      sendAjaxRequest(port[0]);

      // 마커 클릭 시 팝업창이 보여짐
      modal.style.display = 'block';
      lockImages = document.getElementsByClassName('lock-img');
      console.log(lockImages);
      const lockImagesArray = Array.from(lockImages);
      lockImagesArray.forEach(function (element) {
        element.addEventListener('click', getSubscriptionPage);
      });


      // 항구 정보
      document.querySelector('#portTitle').textContent = port[1];
      document.querySelector('#portCode').textContent = "(" + port[0] + ")";

    };

    marker.addListener("click", markerClickEvent);

    /* 
      항구 검색 시 이벤트
    */
    function SearchEvent(searchPortName) {
      map.setZoom(13);
      map.setCenter(click_focus_map);

      sendAjaxRequest(searchPortName);

      modal.style.display = 'block';

      document.querySelector('#portTitle').textContent = port[1];
      document.querySelector('#portCode').textContent = "(" + port[0] + ")";

      input.value = ''; // 검색 후 팝업창이 띄워지면 입력한 검색어 초기화
    };



    // 검색 이벤트
    let searchPort;

    searchIcon.addEventListener('click', handleSearch);

    function handleSearch() {
      searchPort = input.value;
      if (searchPort.trim().toUpperCase() == port[0]) { // 항구 코드 검색
        SearchEvent(port[0])

      }
      else if (searchPort.trim() == port[1]) { // 항구명(한글) 검색
        SearchEvent(port[0])

      }
      else if (searchPort.trim().toUpperCase() == port[2]) { // 영문 검색
        SearchEvent(port[0])
      }
    }


  });


  // 구글 맵의 마커가 클릭 시 해당 항구의 port 선박 수용량 차트를 가져옴
  function sendAjaxRequest(port_code) {

    // 현재 시간을 구하고 ISO 형식으로 변환
    let now = new Date();
    // 년, 월, 일, 시간, 분, 초 추출
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    let day = String(now.getDate()).padStart(2, '0');
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');

    // "YYYY-MM-DD HH:MM:SS" 형식의 문자열 생성
    let clickTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // 24시간 전 시간 구하기
    now.setHours(now.getHours() - 24);
    year = now.getFullYear();
    month = String(now.getMonth() + 1).padStart(2, '0');
    day = String(now.getDate()).padStart(2, '0');
    hours = String(now.getHours()).padStart(2, '0');
    minutes = String(now.getMinutes()).padStart(2, '0');
    seconds = String(now.getSeconds()).padStart(2, '0');

    let before24clickTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    let sendData = { "searchPort": port_code, "clickTime": clickTime, 'before24clickTime': before24clickTime }
    testCheck(sendData);

  }

  /*
    팝업창 관련 파트
  */
  const modal = document.querySelector('.modal');
  const modalClose = document.querySelector('.close_btn');

  //닫기 버튼을 눌렀을 때 모달팝업이 닫힘
  modalClose.addEventListener('click', function () {
    //display 속성을 none으로 변경
    modal.style.display = 'none';

    // 팝업창 닫기 버튼을 누르면 chartChoose의 value를 다시 지난 7일로 바꾼다.
    document.getElementById('chartChoose').value = 'lastWeek';

    map.setCenter(focus_map); // 원래 형태로 이동
    map.setZoom(4); // 원래 줌으로 변경

    // 채팅창 메세지 reset
    document.querySelector('.chat-message-window').innerHTML = null;

    // 항구 채팅 channel 연결 끊기 at liveChat.js

  });

}


/****************************************************** */
const icon = ["icon1.png", "icon2.png", "icon3.png", "tooltip.png"];
const portCogIcon = document.createElement("img"); // 확인 시점에서 항구의 혼잡도

/*
  지난 항구 혼잡도 통계
*/
let colorList = ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0", "#3F51B5", "#03A9F4", "#4CAF50", "#F9CE1D", "#FF9800", "#546E7A", "#A5978B"]

/*
  툴팁관련
*/
document.addEventListener("DOMContentLoaded", function () {
  // 이미지 요소를 선택합니다.
  var tooltipImg = document.querySelector(".tooltip-container img");
  // 툴팁 텍스트 요소를 선택합니다.
  var tooltipText = document.getElementById("tooltip-text");

  if (tooltipImg) { // 웹이 시작될때 항구 선택전에는 tooltipImg가 없기에 오류 메세지를 뜨지 않게 하기
    // 이미지에 마우스 오버 이벤트를 추가합니다.
    tooltipImg.addEventListener("mouseover", function () {
      // 툴팁 텍스트를 보이도록 설정합니다.
      tooltipText.style.visibility = "visible";
      tooltipText.style.opacity = "1";
    });

    // 이미지에서 마우스가 벗어날 때 이벤트를 추가합니다.
    tooltipImg.addEventListener("mouseleave", function () {
      // 툴팁 텍스트를 숨깁니다.
      tooltipText.style.visibility = "hidden";
      tooltipText.style.opacity = "0";
    });

    tooltipText.style.visibility = 'hidden';
  }
});

/*
  차트 초기화를 위해 미리 선언
*/
let LastWeekChart;
let LastMonthChart;
let WaitingShipListChart;
let WorkingShipListChart;
let AvgWaitingChart;

$(function () {
  $('#searchBtn').on('click', function () {
    let searchPort = $('#searchPort').val();

    // 현재 시간을 구하고 ISO 형식으로 변환
    let now = new Date();
    // 년, 월, 일, 시간, 분, 초 추출
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    let day = String(now.getDate()).padStart(2, '0');
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');

    // "YYYY-MM-DD HH:MM:SS" 형식의 문자열 생성
    let clickTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // 24시간 전 시간 구하기
    now.setHours(now.getHours() - 24);
    year = now.getFullYear();
    month = String(now.getMonth() + 1).padStart(2, '0');
    day = String(now.getDate()).padStart(2, '0');
    hours = String(now.getHours()).padStart(2, '0');
    minutes = String(now.getMinutes()).padStart(2, '0');
    seconds = String(now.getSeconds()).padStart(2, '0');

    let before24clickTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    let sendData = { "searchPort": searchPort, "clickTime": clickTime, 'before24clickTime': before24clickTime }


    testCheck(sendData);
    // 대기선박, 작업선박, 평균 수용량 가져오기


  });
})

/**
 * 모달창에 데이터를 뿌리는 함수 
 * @param {*} sendData 
 */
function testCheck(sendData) {
  $.ajax({
    url: "/fun/working",
    method: "GET",
    async: false,
    data: sendData,
    success: function (resp) {
      let waitingVessels = resp.waitingVessels; // 확인 시점에서 대기중인 선박들
      let workingVessels = resp.workingVessels; // 확인 시점에서 작업중인 선박들

      let portAvgCnt = resp.portAvgCnt;// 항구 평균 수용량 List<ChartEntity>으로 받음

      let waitingShipList = {}; // 선박타입: 선박 대수 순으로 딕셔너리 저장
      let waitingCntList = [];
      let waitingTypeList = []; // 선박 타입이 들어감
      let waitingHtml = ""; // 테이블로 들어감

      let workingShipList = {};
      let workingCntList = [];
      let workingTypeList = [];
      let workingHtml = "";


      /* 
        대기 선박
      */
      for (let i = 0; i < waitingVessels.length; i++) { // 선박타입 유니크 구하기

        let waitingShipType = waitingVessels[i].shipType;

        if (!waitingShipList[waitingShipType]) {
          waitingShipList[waitingShipType] = 0;
          waitingTypeList.push(waitingShipType);
        }

        // shipList의 shipType 수량 증가
        waitingShipList[waitingShipType]++;

      }


      for (let j = 0; j < waitingTypeList.length; j++) { // 선박 종류 별로 테이블 만들기
        let waitingShipType = waitingTypeList[j];
        let waitingShipCnt = waitingShipList[waitingShipType];
        waitingCntList.push(waitingShipCnt);
      }
      waitingHtml = waitingVessels.length // 전체 선박 대수 

      /*
        대기선박 도넛 차트
      */
      let waitingShipListChart;

      if (waitingCntList.length == 0) { // 대기중인 선박이 없을 시 나오는 차트
        waitingShipListChart = {
          chart: {
            type: 'donut',
            zoom: { enabled: false } // 줌 메뉴 히든
            , height: '70%'
            , sparkline: { enabled: true }
          },
          series: [1],
          labels: ['대기중인 선박 없음'],
          dataLabels: { enabled: false },
          tooltip: { enabled: false },
          fill: { colors: ['#808080'] }
        }
        let nonwaitingShipTypeHtml = "";

        nonwaitingShipTypeHtml += `
					<span style='color: #808080; font-size: 13px;'>●</span><span style='font-size: 13px;'>대기중인 선박 없음</sapn><br>
					`
        $('#waitingShipListChartContent2').empty();
        $('#waitingShipListChartContent2').prepend(nonwaitingShipTypeHtml);
      }

      else {
        waitingShipListChart = {
          chart: {
            type: 'donut',
            zoom: { enabled: false } // 줌 메뉴 히든
            , height: '70%'
            , sparkline: { enabled: true }
          },
          series: waitingCntList,
          labels: waitingTypeList,
          dataLabels: { enabled: false },
        };
        // 데이터 라벨만
        let waitingShipTypeHtml = "";
        for (let waitcolor = 0; waitcolor < waitingTypeList.length; waitcolor++) {
          waitingShipTypeHtml += `
					<span style='color: ${colorList[waitcolor]}; font-size: 13px;'>●</span><span style='font-size: 13px;'>${waitingTypeList[waitcolor]}</sapn><br>
					`
        }
        $('#waitingShipListChartContent2').empty();
        $('#waitingShipListChartContent2').prepend(waitingShipTypeHtml);
      }


      /* 
        작업 선박
      */
      for (let i = 0; i < workingVessels.length; i++) {

        let workingShipType = workingVessels[i].shipType;

        if (!workingShipList[workingShipType]) {
          workingShipList[workingShipType] = 0;
          workingTypeList.push(workingShipType);

        }

        // shipList의 shipType 수량 증가
        workingShipList[workingShipType]++;

      }


      for (let j = 0; j < workingTypeList.length; j++) { // 선박 종류 별로 테이블 만들기
        let workingShipType = workingTypeList[j];
        let workingShipCnt = workingShipList[workingShipType];
        workingCntList.push(workingShipCnt);
      }
      workingHtml = workingVessels.length // 전체 선박 대수 추가



      /*
        작업선박 도넛 차트
      */
      let workingShipListChart;

      if (workingCntList.length == 0) { // 작업 선박이 없을 때 나오는 차트
        workingShipListChart = {
          chart: {
            type: 'donut',
            zoom: { enabled: false } // 줌 메뉴 히든
            , height: '70%'
            , sparkline: { enabled: true }
          },
          series: [1],
          labels: ['작업중인 선박 없음'],
          dataLabels: { enabled: false },
          tooltip: { enabled: false },
          fill: { colors: ['#808080'] }
        }
        let nonworkingShipTypeHtml = "";

        nonworkingShipTypeHtml += `
					<span style='color: #808080; font-size: 13px;'>●</span><span style='font-size: 13px;'>대기중인 선박 없음</sapn><br>
					`
        $('#waitingShipListChartContent2').empty();
        $('#waitingShipListChartContent2').prepend(nonworkingShipTypeHtml);
      }

      else {
        workingShipListChart = {
          chart: {
            type: 'donut',
            zoom: { enabled: false } // 줌 메뉴 히든
            , height: '70%'
            , sparkline: { enabled: true }
          },
          series: workingCntList,
          labels: workingTypeList,
          dataLabels: { enabled: false },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: false,
                  name: { // 도넛 가운데의 선박 타입
                    show: true
                  },
                  value: { // 도넛 가운데의 선박 대수
                    show: true
                  }
                }
              }
            }
          }

        };

        let workingShipTypeHtml = "";
        for (let workcolor = 0; workcolor < workingTypeList.length; workcolor++) {
          workingShipTypeHtml += `
					<span style='color: ${colorList[workcolor]}; font-size: 13px;'>●</span><span style='font-size: 13px;'>${workingTypeList[workcolor]}</sapn><br>
					`
        }
        $('#workingShipListChartContent2').empty();
        $('#workingShipListChartContent2').prepend(workingShipTypeHtml);

      }

      /* 
        평균과 비교
      */
      let compareAvg = workingVessels.length - portAvgCnt;

      let message = "";
      if (compareAvg >= 1) { message += `현재 평균보다 <span style="color: #E16A93;, font-size: 1.5em; font-weight: bold;">${compareAvg.toFixed(0)}대</span> 많은 선박이 작업중입니다.`; }
      else if ((compareAvg >= 0 && compareAvg < 1) || compareAvg == -0 || (-0 > compareAvg && compareAvg > -1)) { message += `현재 <span style="color: #FFD232;, font-size: 1.5em; font-weight: bold;">평균 대수</span>의 선박이 작업중입니다.`; }
      else { message += `현재 평균보다 <span style="color: #5EC75E;, font-size: 1.5em; font-weight: bold;">${Math.abs(compareAvg).toFixed(0)}대</span> 적은 선박이 작업중입니다.`; }

      /*
        항만 혼잡도 지표화
      */
      let roh = Number(resp.calcRoh.roh); // 작업 효율
      let avgWorkingTime = resp.calcRoh.avgWorkingTime; // 선박 1대 평균 작업시간


      let effMessage = `지난 24시간 동안 선박 1대당 평균 작업 시간은 <span style="color: #8C8CF5;, font-size: 1.5em; font-weight: bold;">${avgWorkingTime}</span> 입니다.`
      // 항구 혼잡도 아이콘이 들어가는 곳

      setTimeout(() => {
        const portIcon = document.querySelector('#portCogIconPlace');
        portIcon.prepend(portCogIcon);
        document.querySelector('#portCogIconPlace > img').style.width = "200px";


      })

      if (roh < 0.75) { portCogIcon.src = `img/${icon[2]}`; }
      else if (roh >= 0.75 && roh < 1.25) { portCogIcon.src = `img/${icon[1]}`; }
      else { portCogIcon.src = `img/${icon[0]}`; }

      let portCog = "";

      if (roh < 0.25) { portCog += `<span style="color: #5EC75E;">매우 여유</span>` }
      else if (roh >= 0.25 && roh < 0.75) { portCog += `<span style="color: #5EC75E;">여유</span>` }
      else if (roh >= 0.75 && roh < 1.25) { portCog += `<span style="color: #FFD232;">보통</span>` }
      else if (roh >= 1.25 && roh < 1.75) { portCog += `<span style="color: #E16A93;">혼잡</span>` }
      else { portCog += `<span style="color: #E16A93;">매우 혼잡</span>` }


      // 선박별 평균대기 시간 구하기
      let shipAvgWaiting = resp.shipAvgwaiting; // 리스트 형태

      let shipAvgWaitingHtml = ""; // 테이블

      let AvgwaitingTypeList = []; // x축에 쓸 선박 타입 리스트
      let AvgwaitingTimeList = [[], []]; // 대기시간 리스트

      for (let shipType in shipAvgWaiting) { // 키는 선박 타입, 값은 평균 대기 시간(문자열)
        shipAvgWaitingHtml += `<tr><td>${shipType}</td><td>${shipAvgWaiting[shipType][0]}</td></tr>`
        AvgwaitingTypeList.push(shipType);
        AvgwaitingTimeList[0].push(shipAvgWaiting[shipType][1]);
        AvgwaitingTimeList[1].push(shipAvgWaiting[shipType][0]);
      }

      var avgWaitingChart = {
        chart: {
          type: 'bar',
          zoom: {
            enabled: false // 줌 메뉴 히든
          },
          toolbar: { show: false }
          , height: '100%'
        },
        plotOptions: {
          bar: {
            horizontal: true, // 수평 여부
            barHeight: '30%', // 막대 그래프 높이
            dataLabels: { position: 'bottom' }
          },

        },
        dataLabels: { enabled: false },
        series: [{ data: AvgwaitingTimeList[0] }], // 대기시간 초단위
        xaxis: {
          categories: AvgwaitingTypeList,
          show: false,
          labels: { show: false },
          max: 100000,
          forceNiceScale: true
        },
        tooltip: {
          enabled: true,
          custom: function ({ dataPointIndex }) {
            let tooltip = "대기시간: " + AvgwaitingTimeList[1][dataPointIndex];
            return tooltip
          }
        }

      };



      /*
        차트: 지난 7일간 평균 대기 시간
      */
      let selectOption = document.getElementById('chartChoose');
      let chooseOption;

      let lastWeekChart

      lastWeekChart = {
        chart: {
          type: 'line',
          zoom: { enabled: false } // 줌 메뉴 히든
          , toolbar: { show: false }
          , height: '85%'
        },
        series: [{ // y축의 값
          name: '평균 대기 시간',

          data: [resp.sevenDays[0].avgWaitingTime, resp.sevenDays[1].avgWaitingTime, resp.sevenDays[2].avgWaitingTime,
          resp.sevenDays[3].avgWaitingTime, resp.sevenDays[4].avgWaitingTime, resp.sevenDays[5].avgWaitingTime,
          resp.sevenDays[6].avgWaitingTime
          ]
        }],
        xaxis: { // 날짜들
          categories: [resp.sevenDays[0].date, resp.sevenDays[1].date, resp.sevenDays[2].date, resp.sevenDays[3].date,
          resp.sevenDays[4].date, resp.sevenDays[5].date, resp.sevenDays[6].date]
          , tooltip: { enabled: false }
        },
        yaxis: { // y축의 값을 안보이게 함
          show: false
        },
        markers: {
          size: 3 // 0이면 안보임
        },
        tooltip: {
          custom: function ({ dataPointIndex }) {
            // 각 날짜마다 작업효율에 따라 조건에 맞는 아이콘을 출력
            let CogText;

            if (resp.sevenDays.at(dataPointIndex).roh < 0.25) { CogText = "매우 여유" }
            else if (resp.sevenDays.at(dataPointIndex).roh >= 0.25 && resp.sevenDays.at(dataPointIndex).roh < 0.75) {
              CogText = "여유"
            }
            else if (resp.sevenDays.at(dataPointIndex).roh >= 0.75 && resp.sevenDays.at(dataPointIndex).roh < 1.25) {
              CogText = "보통"
            }
            else if (resp.sevenDays.at(dataPointIndex).roh >= 1.25 && resp.sevenDays.at(dataPointIndex).roh < 1.75) {
              CogText = "혼잡"
            }
            else { CogText = "매우 혼잡" }



            // 툴팁 내부 HTML을 생성
            const tooltipHTML = `
								<div class="arrow_box">
									<span>평균 대기 시간: ${resp.sevenDays.at(dataPointIndex).avgWaitingTimeString}</span><br>
									<span>항구 혼잡: ${CogText}<br>
								</div>
							`;

            return tooltipHTML;
          }
        }
      }


      selectOption.addEventListener('change', function () {
        chooseOption = selectOption.value;
        if (chooseOption == 'lastWeek') {
          lastWeekChart = {
            chart: {
              type: 'line',
              zoom: { enabled: false }// 줌 메뉴 히든
              , toolbar: { show: false }
              , height: '85%'
            },
            series: [{ // y축의 값
              name: '평균 대기 시간',

              data: [resp.sevenDays[0].avgWaitingTime, resp.sevenDays[1].avgWaitingTime, resp.sevenDays[2].avgWaitingTime,
              resp.sevenDays[3].avgWaitingTime, resp.sevenDays[4].avgWaitingTime, resp.sevenDays[5].avgWaitingTime,
              resp.sevenDays[6].avgWaitingTime
              ]
            }],
            xaxis: { // 날짜들
              categories: [resp.sevenDays[0].date, resp.sevenDays[1].date, resp.sevenDays[2].date, resp.sevenDays[3].date,
              resp.sevenDays[4].date, resp.sevenDays[5].date, resp.sevenDays[6].date]
              , tooltip: { enabled: false }
            },
            yaxis: { // y축의 값을 안보이게 함
              show: false
            },
            markers: {
              size: 3 // 0이면 안보임
            },
            tooltip: {
              custom: function ({ dataPointIndex }) {
                // 각 날짜마다 작업효율에 따라 조건에 맞는 아이콘을 출력
                let CogText;

                if (resp.sevenDays.at(dataPointIndex).roh < 0.25) {
                  CogText = "매우 여유"
                }
                else if (resp.sevenDays.at(dataPointIndex).roh >= 0.25 && resp.sevenDays.at(dataPointIndex).roh < 0.75) {
                  CogText = "여유"
                }
                else if (resp.sevenDays.at(dataPointIndex).roh >= 0.75 && resp.sevenDays.at(dataPointIndex).roh < 1.25) {
                  CogText = "보통"
                }
                else if (resp.sevenDays.at(dataPointIndex).roh >= 1.25 && resp.sevenDays.at(dataPointIndex).roh < 1.75) {
                  CogText = "혼잡"
                }
                else { CogText = "매우 혼잡" }



                // 툴팁 내부 HTML을 생성
                const tooltipHTML = `
								<div class="arrow_box">
									<span>평균 대기 시간: ${resp.sevenDays.at(dataPointIndex).avgWaitingTimeString}</span><br>
									<span>항구 혼잡: ${CogText}<br>
								</div>
							`;

                return tooltipHTML;
              }
            }
          }
          if (LastWeekChart) {
            LastWeekChart.destroy();
          }
          LastWeekChart = new ApexCharts(document.querySelector("#lastWeekChartContent"), lastWeekChart);

          LastWeekChart.render();
        }
        else if (chooseOption == 'lastMonth') {
          lastWeekChart = {
            chart: {
              type: 'line',
              zoom: { enabled: false } // 줌 메뉴 히든
              , toolbar: { show: false }
              , height: '95%'
            },
            series: [{ // y축의 값
              name: '평균 대기 시간',

              data: [resp.fourWeeks[0].avgWaitingTime, resp.fourWeeks[1].avgWaitingTime, resp.fourWeeks[2].avgWaitingTime,
              resp.fourWeeks[3].avgWaitingTime]
            }],
            xaxis: { // 날짜들
              categories: [resp.fourWeeks[0].weeks, resp.fourWeeks[1].weeks, resp.fourWeeks[2].weeks, resp.fourWeeks[3].weeks]
              , tooltip: { enabled: false }
            },
            yaxis: {
              show: true,
              labels: {
                formatter: function (val) { // y축의 값을 안보이게 함
                  return []
                }
              }
            },
            markers: {
              size: 3 // 0이면 안보임
            },
            tooltip: {
              custom: function ({ dataPointIndex }) {
                // 각 날짜마다 작업효율에 따라 조건에 맞는 아이콘을 출력
                let CogText;

                if (resp.fourWeeks.at(dataPointIndex).roh < 0.25) { CogText = "매우 여유" }
                else if (resp.fourWeeks.at(dataPointIndex).roh >= 0.25 && resp.fourWeeks.at(dataPointIndex).roh < 0.75) {
                  CogText = "여유"
                }
                else if (resp.fourWeeks.at(dataPointIndex).roh >= 0.75 && resp.fourWeeks.at(dataPointIndex).roh < 1.25) {
                  CogText = "보통"
                }
                else if (resp.fourWeeks.at(dataPointIndex).roh >= 1.25 && resp.fourWeeks.at(dataPointIndex).roh < 1.75) {
                  CogText = "혼잡"
                }
                else { CogText = "매우 혼잡" }

                // 툴팁 내부 HTML을 생성
                const tooltipHTML = `
								<div class="arrow_box">
									<span>평균 대기 시간: ${resp.fourWeeks.at(dataPointIndex).avgWaitingTimeString}</span><br>
									<span>항구 혼잡: ${CogText}<br>
								</div>
							`;

                return tooltipHTML;
              }
            }
          }
          if (LastWeekChart) {
            LastWeekChart.destroy();
          }
          LastWeekChart = new ApexCharts(document.querySelector("#lastWeekChartContent"), lastWeekChart);

          LastWeekChart.render();
        }
      })

      if (LastWeekChart) {
        LastWeekChart.destroy();
      }
      LastWeekChart = new ApexCharts(document.querySelector("#lastWeekChartContent"), lastWeekChart);

      LastWeekChart.render();





      // 차트 객체 생성 전에 이전 차트 객체가 존재하는지 확인하고 destroy() 호출

      if (WaitingShipListChart) {
        WaitingShipListChart.destroy();
      }
      if (WorkingShipListChart) {
        WorkingShipListChart.destroy();
      }
      if (AvgWaitingChart) {
        AvgWaitingChart.destroy();
      }




      WaitingShipListChart = new ApexCharts(document.querySelector("#waitingShipListChartContent1"), waitingShipListChart);

      WorkingShipListChart = new ApexCharts(document.querySelector("#workingShipListChartContent1"), workingShipListChart);

      AvgWaitingChart = new ApexCharts(document.querySelector("#avgWaitingChartContent"), avgWaitingChart);

      // 차트 구현 	

      WaitingShipListChart.render();
      WorkingShipListChart.render();
      AvgWaitingChart.render();


      // 마커 클릭 시 기존에 있던 내용을 지움
      $('#portCog').empty();
      $('#vesselMessage').empty();
      $('#efficiencyMessage').empty();


      // 웹으로 구현
      document.getElementById("waitingShipTotal").innerHTML = waitingHtml;
      document.getElementById("workingShipTotal").innerHTML = workingHtml;
      $('#portCog').prepend(portCog);
      $('#vesselMessage').append(message);
      $('#efficiencyMessage').append(effMessage);
      $('#avgWaiting').append(shipAvgWaitingHtml);

      /****** 채팅창 생성 ******/
      let chattingPortName = "";
      switch (resp.portCD) {
        case "HKHKG": chattingPortName = "🇭🇰 Hongkong Port"; break;
        case "SGSIN": chattingPortName = "🇸🇬 Singpapore Port"; break;
        case "KRINC": chattingPortName = "🇰🇷 Incheon Port"; break;
        case "KRPUS": chattingPortName = "🇰🇷 Busan Port"; break;
        case "JPTYO": chattingPortName = "🇯🇵 Tokyo Port"; break;
        case "JPOSA": chattingPortName = "🇯🇵 Osaka Port"; break;
        case "CNSHA": chattingPortName = "🇨🇳 Shanghai Port"; break;
      }
      // 채팅창 display=none -> display=block으로 변경
      document.getElementsByClassName("chat-window")[0].style.display = 'block';
      // 채팅방 header 제목 항구이름으로 변경
      document.getElementsByClassName("port-name")[0].innerHTML = chattingPortName;

      // WebSocket 연결을 위한 channelId 값 뿌리기
      document.getElementById("portId").value = resp.portCD;

      // WebSocket 연결
      connectWebSocket();


      /***** 날씨 *****/
      getWeather(resp.portCD);


    }

  });
}

/**
 * 위도, 경도 받아서 날씨 정보 api로 불러오기
 * @param {*} lat 
 * @param {*} lon 
 */
async function getWeather(portCD) {
  const API_KEY = '344247e109b01440aa280a21472fcf98';
  // const lat = '35.1028';
  // const lon = '129.0403';
  let lat;
  let lon;
  switch (portCD) {
    case "HKHKG":
      lat = 22.3453; lon = 114.1372; break;
    case "SGSIN":
      lat = 1.264; lon = 103.84; break;
    case "KRINC":
      lat = 37.4595069; lon = 126.6256103; break;
    case "KRPUS":
      lat = 35.1036224; lon = 129.0423278; break;
    case "JPTYO":
      lat = 35.616944; lon = 139.795556; break;
    case "JPOSA":
      lat = 34.641944; lon = 135.422778; break;
    case "CNSHA":
      lat = 30.626389; lon = 122.064722; break;
  }


  try {
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`);
    let data = await response.json();
    weatherOutput(data);
  } catch (error) {
    console.error("Weather API error:", error);
    alert("날씨 정보를 불러오는데 실패했습니다.");
  }
}

/**
 * 받아온 날씨 정보 화면에 출력
 * @param {} resp 
 */
function weatherOutput(resp) {
  console.log("getWeather 결과: ", resp);
  let temperature = resp.main.temp;
  let temp_min = resp.main.temp_min;
  let temp_max = resp.main.temp_max;
  let weather = resp.weather[0].main;
  let icon = resp.weather[0].icon;

  console.log(temperature, temp_min, temp_max); // 로그로 값 확인
  console.log(typeof temperature); // 타입 확인

  $(".temperature").text(temperature.toFixed(1));
  $(".temp_min").text(temp_min.toFixed(1));
  $(".temp_max").text(temp_max.toFixed(1));
  $(".weather").text(weather);
  $(".icon").html(`<img src="http://openweathermap.org/img/w/${icon}.png" alt="Weather icon">`);
}


/**
 * 무료회원 lock 기능 클릭 액션
 * 1) alert 창으로 '유료회원 전용 기능입니다. 구독신청 창으로 이동합니다.'
 * 2) subscription page 요청
 */

function getSubscriptionPage() {
  alert('유료회원 전용 기능입니다. 구독신청 창으로 이동합니다.');
  console.log('subscription 페이지 요청');
  window.location.replace('http://localhost:9999/subscription');
}

