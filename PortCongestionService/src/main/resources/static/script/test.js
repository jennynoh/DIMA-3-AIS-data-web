"use strict";

let map;

async function initMap() {

	let ports = [];
	$(function(){
		$.ajax({
			url:"/fun/portLatLng"
			, method: "GET"
			, success:function(resp){
				console.log(resp);
				for(let i= 0; i< resp.length; ++i){
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
  var input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('placeholder', '장소를 검색하세요');
  input.style.marginTop = '10px';
  input.style.width = '300px';

  var searchBtn = document.createElement('button');
  searchBtn.setAttribute('type', 'sumit');
  searchBtn.textContent = '검색';
  searchBtn.style.marginTop = '10px';

  map = new Map(document.getElementById("map"), { // 좌표로 포커스를 맞춘다 
    zoom: 4,
    center: focus_map,
    mapId: "DEMO_MAP_ID",	// 없으면 지도 로드를 못하고 유효한 지도 ID 없이 초기화되어 지도에서 고급 마커를 사용할 수 없음 
    disableDefaultUI: true   // Ui 숨기기  
  });


/*
	검색창 이동 관련 부분
*/
  let isSearchContainerMoved = false; // 검색창이 이미 이동했는지 여부를 나타내는 변수(true는 이동했음, false는 원래 위치)

  // 검색창 변화를 위해서 div 컨테이너에 넣음
  var searchContainer = document.createElement('div');
  searchContainer.appendChild(input);
  searchContainer.appendChild(searchBtn);

  // 구글맵 상단에 검색창을 표시
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchContainer);
  searchContainer.style.marginTop = '4%';

	// 검색창이 왼쪽으로 이동
  function moveSearchContainer() {
    if (!isSearchContainerMoved) { // 검색창이 이동하지 않은 경우에만 실행
      map.controls[google.maps.ControlPosition.TOP_CENTER].removeAt(0); // 이전에 추가된 검색창 제거
      map.controls[google.maps.ControlPosition.LEFT_TOP].push(searchContainer); // 검색창을 왼쪽 상단에 추가
      searchContainer.style.marginTop = '4%'; // 검색창의 marginTop 속성 설정
      searchContainer.style.marginLeft = '15%';
      isSearchContainerMoved = true; // 검색창을 이동했음을 표시
    }
  }
  
  // 검색창을 원래 위치로 이동
  function resetSearchContainerPosition() {
    if (isSearchContainerMoved) { // 검색창이 이동한 경우(true)에만 실행
      map.controls[google.maps.ControlPosition.LEFT_TOP].removeAt(0); // 이전에 추가된 검색창 제거
      map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchContainer); // 검색창을 상단 중앙에 추가
      searchContainer.style.marginTop = '4%'; // 검색창의 marginTop 속성 설정
      searchContainer.style.marginLeft = '0%';
      isSearchContainerMoved = false; // 검색창을 원래 위치로 되돌림
    }
  }


  /*
    지도 상에서 마커를 표시 
  */
  ports.forEach((port, index) => {
    var lat = port[3]; // 위도 : 1증가 위로 이동, 1 하락 시 아래로 이동
    var lng = port[4]; // 경도 : 1증가 오른쪽으로 이동, 1 하락 시 왼쪽으로 이동
    console.log(lat);

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

      // 항구 정보
      document.querySelector('#portTitle').textContent = port[1];
      document.querySelector('#portCode').textContent = "("+ port[0] + ")";

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
      document.querySelector('#portCode').textContent = "("+ port[0] + ")";
    };



    // 검색 이벤트
    let searchPort;

    searchBtn.addEventListener('click', handleSearch);

    function handleSearch() {
      searchPort = input.value;
      if (searchPort.trim().toUpperCase() == port[0]) { // 항구 코드 검색
        SearchEvent(port[0])
        
      } 
      else if (searchPort.trim() == port[1]) { // 항구명(한글) 검색
        SearchEvent(port[0])
        
      } 
      else if(searchPort.trim().toUpperCase() == port[2]){ // 영문 검색
		  SearchEvent(port[0])
	  }
    }

	
  });


  // 구글 맵의 마커가 클릭 시 해당 항구의 port 선박 수용량 차트를 가져옴
  function sendAjaxRequest(port_code) {

    moveSearchContainer() // 검색창이 이동

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


    console.log(port_code);
    console.log(clickTime);
    console.log(before24clickTime);

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

    // 검색창 변환: 기존에 있던 위치를 지우고 새로운 위치로
    resetSearchContainerPosition()
	map.setCenter(focus_map); // 원래 형태로 이동
	map.setZoom(4); // 원래 줌으로 변경

  });

}
