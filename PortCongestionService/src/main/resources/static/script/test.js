/**
 * 
 */
"use strict";


    async function initMap() {

      var ports = [ // 각각 마커가 표시될 좌표와 항구이름
        ['인천항', 37.45950698852539, 126.6256103515625, 'KRINC']
        , ['부산항', 35.10362243652344, 129.04232788085938, 'KRPUS']
        , ['홍콩항', 22.3453, 114.1372, 'HKHKG']
        , ['상하이항', 30.626389, 122.064722, 'CNSHA']
        , ['도쿄항', 35.616944, 139.795556, 'JPTYO']
        , ['오사카항', 34.641944, 135.422778, 'JPOSA']
        , ['싱가포르항', 1.264, 103.84, 'SGSIN']
      ];

      const focus_map = { // 페이지 출력 시 포커스되는 좌표 위치
        lat: 25.0671234,
        lng: 126.6256103515625
      };

      const { Map } = await google.maps.importLibrary("maps");
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
      const { SearchBox } = await google.maps.importLibrary("places");

      const { InfoWindow } = await google.maps.importLibrary("maps");


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

      var map = new Map(document.getElementById("map"), { // 좌표로 포커스를 맞춘다 
        zoom: 4,
        center: focus_map,
        mapId: "DEMO_MAP_ID",	// 없으면 지도 로드를 못하고 유효한 지도 ID 없이 초기화되어 지도에서 고급 마커를 사용할 수 없음 
        disableDefaultUI: true   // Ui 숨기기  
      });

      // 구글맵 상단에 검색창을 표시
      map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
      map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchBtn);

      // 검색창을 사용할 때마다 발생하는 이벤트를 처리합니다
      //var searchBox = new google.maps.places.SearchBox(input);


      /*
        지도 상에서 마커를 표시 
      */
      ports.forEach((port, index) => {
        var lat = port[1]; // 위도 : 1증가 위로 이동, 1 하락 시 아래로 이동
        var lng = port[2]; // 경도 : 1증가 오른쪽으로 이동, 1 하락 시 왼쪽으로 이동

        var focus_lng = lng + 10; // 경도 값이 변하는 것 확인 //

        var click_focus_map = { // 항구 클릭 시 포커스되는 좌표 위치
          lat: lat,
          lng: focus_lng
        };

        var marker = new AdvancedMarkerElement({ // 각 항구마다 표시되는 마크
          position: { lat: lat, lng: lng },
          map: map,
          title: port[0]
        });

        /* 
          마커 클릭시 이벤트
        */
        function markerClickEvent() {
          map.setZoom(7);
          map.setCenter(click_focus_map);

          // AJAX 요청만을 보내는 코드
          sendAjaxRequest(port[3]);

          // 마커 클릭 시 팝업창이 보여짐
          modal.style.display = 'block';

          // 항구 정보
          document.querySelector('#portTitle').textContent = port[0];
          document.querySelector('#portLat').textContent = port[1];
          document.querySelector('#portLng').textContent = port[2];
        };

        marker.addListener("click", markerClickEvent);

        /* 
        항구 검색 시 이벤트
        */
        function SearchEvent(searchPortName) {
          map.setZoom(7);
          map.setCenter(click_focus_map);

          sendAjaxRequest(searchPortName);

          modal.style.display = 'block';

          document.querySelector('#portTitle').textContent = port[0];
          document.querySelector('#portLat').textContent = port[1];
          document.querySelector('#portLng').textContent = port[2];
        };



        // 검색 이벤트
        let searchPort;

        searchBtn.addEventListener('click', handleSearch);

        function handleSearch() {
          searchPort = input.value;
          if (searchPort.trim().toUpperCase() == port[3]) { SearchEvent(port[3]) } // 항구 코드 검색
          else if (searchPort.trim() == port[0]) { SearchEvent(port[3]) } // 항구명(한글) 검색
          //else alert("올바른 항구명을 입력해주세요"); // 반복문 안에 있어서 메시지가 7번 나옴
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


        console.log(port_code);
        console.log(clickTime);
        console.log(before24clickTime);

        let sendData = { "searchPort": port_code, "clickTime": clickTime, 'before24clickTime': before24clickTime }
        testCheck(sendData);

      }



    }