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

		console.info("확인 항구: " + searchPort);
		console.info("확인 시간: " + clickTime);
		console.info("확인 시간 24시간 전: " + before24clickTime);

		testCheck(sendData);
		// 대기선박, 작업선박, 평균 수용량 가져오기


	});
})

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
			console.log(portAvgCnt);

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
			console.log(workingTypeList);
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
			console.log(compareAvg);
			let message = "";
			if (compareAvg > 0) { message += `현재 평균보다 ${compareAvg.toFixed(0)}대 많은 선박이 작업중입니다.`; }
			else if (compareAvg == 0) { message += `현재 평균 ${compareAvg.toFixed(0)}과 같은 선박이 작업중입니다.`; }
			else if (compareAvg == -0) { message += `현제 평균 ${compareAvg.toFixed(0)}과 같은 선박이 작업중입니다.`; }
			else { message += `현재 평균보다 ${Math.abs(compareAvg).toFixed(0)}대 적은 선박이 작업중입니다.`; }

			/*
				항만 혼잡도 지표화
			*/
			let roh = Number(resp.calcRoh.roh); // 작업 효율
			let avgWorkingTime = resp.calcRoh.avgWorkingTime; // 선박 1대 평균 작업시간


			let effMessage = `지난 24시간 동안 선박 1대당 평균 작업 시간은 ${avgWorkingTime} 입니다.`
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

			if (roh < 0.25) { portCog += `매우 여유` }
			else if (roh >= 0.25 && roh < 0.75) { portCog += `여유` }
			else if (roh >= 0.75 && roh < 1.25) { portCog += `보통` }
			else if (roh >= 1.25 && roh < 1.75) { portCog += `혼잡` }
			else { portCog += `매우 혼잡` }


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


			console.log(resp.fourWeeks[0].weeks);

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
			console.log(roh);

			document.getElementById("waitingShipTotal").innerHTML = waitingHtml;
			document.getElementById("workingShipTotal").innerHTML = workingHtml;
			$('#portCog').prepend(portCog);
			$('#vesselMessage').append(message);
			$('#efficiencyMessage').append(effMessage);
			$('#avgWaiting').append(shipAvgWaitingHtml);
		}

	});
}
