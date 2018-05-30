const _ = require('lodash');
const $ = require('jquery');
const Highcharts = require('highcharts');

function makeMainChart(chartDataObj) {
  // var chartDataObj = mainData.dailyPowerChartData;
  if (chartDataObj.series.length) {
    $('#dailyPowerChart').highcharts({
      chart: {
        type: 'spline',
        zoomType: 'x',
      },
      title: {
        text: ''
      },
      xAxis: {
        // opposite: true,
        title: {
          text: '시간(시)'
        },
        // tickInterval: 6
        categories: chartDataObj.range
      },
      yAxis: {
        min: 0,
        // max: powerGenerationInfo.currKwYaxisMax,
        title: {
          text: '발전량(kWh)'
        }
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            ]
          },
          marker: {
            radius: 2
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1
            }
          },
          threshold: null
        },
        series: {
          pointStart: 0
        }
      },
      legend: { //범례
        itemHoverStyle: {
          color: '#FF0000'
        },
        // layout: 'vertical',
        align: 'right',
        floating: true,
        // verticalAlign: 'middle',
        // borderWidth: 0,
      },
      series: chartDataObj.series,
      credits: {
        enabled: false
      },
    });
  } else {
    $('#dailyPowerChart').html('발전 내역이 존재하지 않습니다.').css({
      'line-height': '300px',
      'font-size': '25px'
    });
  }
}
exports.makeMainChart = makeMainChart;

function makeGaugeChart(powerGenerationInfo) {
  console.dir(powerGenerationInfo);

  let currKw = _.get(powerGenerationInfo, 'currKw');
  currKw = 1.7;
  let currKwYaxisMax = _.get(powerGenerationInfo, 'currKwYaxisMax');

  let percentageKw = _.round(_.multiply(_.divide(currKw, currKwYaxisMax), 100), 2);
  let maxKw = _.round(_.subtract(100, percentageKw), 2);

  let todayMaxKw = _.multiply(currKwYaxisMax, 6);
  let dailyPower = _.round(_.get(powerGenerationInfo, 'dailyPower'), 2);

  let percentageDailyPower = _.round(_.multiply(_.divide(dailyPower, todayMaxKw), 100), 2);
  let remainDailyPower = _.round(_.subtract(100, percentageDailyPower), 2);

  // var powerGenerationInfo = mainData.powerGenerationInfo;
  Highcharts.chart('chart_div_1', {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: 0,
      plotShadow: false,
      backgroundColor: 'none',
      // Edit chart spacing
      spacingBottom: 15,
      spacingTop: 10,
      spacingLeft: -100,
      spacingRight: 10,
    },
    title: {
      text: `출력<br/>${currKw} kW`,
      align: 'center',
      verticalAlign: 'middle',
      y: -20
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
      enabled: false
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          distance: -30,
          style: {
            fontWeight: 'bold',
            color: 'white'
          }
        },
        startAngle: -90,
        endAngle: 90,
        center: ['50%', '50%'],
      }
    },
    colors: ['#f45b5b', '#8085e9', '#8d4654', '#7798BF', '#aaeeee',
      '#ff0066', '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],    
    series: [{
      type: 'pie',
      name: 'Browser share',
      innerSize: '50%',
      data: [
        [`${percentageKw}%`, percentageKw],
        [`${maxKw}%`, maxKw],
        
      ]
    }],
    credits: {
      enabled: false,
    }
  });

  Highcharts.chart('chart_div_2', {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: 0,
      plotShadow: false,
      backgroundColor: 'none',
      // Edit chart spacing
      spacingBottom: 15,
      spacingTop: 10,
      spacingLeft: -100,
      spacingRight: 10,
    },
    title: {
      text: `발전량<br/>${dailyPower} kW`,
      align: 'center',
      verticalAlign: 'middle',
      y: -20
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
      enabled: false
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          distance: -30,
          style: {
            fontWeight: 'bold',
            color: 'white'
          }
        },
        startAngle: -90,
        endAngle: 90,
        center: ['50%', '50%'],
      }
    },
    legend: { //범례
      itemStyle: {
        fontWeight: 'bold',
        fontSize: '13px'
      }
    },
    colors: ['#f45b5b', '#8085e9', '#8d4654', '#7798BF', '#aaeeee',
      '#ff0066', '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
    series: [{
      type: 'pie',
      name: 'Browser share',
      innerSize: '50%',
      data: [
        [`${percentageDailyPower}%`, percentageDailyPower],
        [`${remainDailyPower}%`, remainDailyPower],
      ]
    }],
    credits: {
      enabled: false,
    }
  });

  
  // var dailyPowerChart = Highcharts.chart('chart_div_2', Highcharts.merge(gaugeOptions, {
  //   yAxis: {
  //     min: 0,
  //     max: powerGenerationInfo.currKwYaxisMax * 6,
  //     tickPositioner: function () {
  //       return [this.min, this.max];
  //     },
  //     title: {
  //       text: ''
  //     }
  //   },
  //   credits: {
  //     enabled: false
  //   },
  //   series: [{
  //     name: '금일 발전량',
  //     data: [Number(powerGenerationInfo.dailyPower.toFixed(2))],
  //     dataLabels: {
  //       format: '<div style="text-align:center"><span style="font-size:25px;color:' +
  //         ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
  //         '<span style="font-size:12px;color:silver">kWh</span></div>'
  //     },
  //     tooltip: {
  //       valueSuffix: 'kWh'
  //     }
  //   }]
  // }));
}
exports.makeGaugeChart = makeGaugeChart;


function makeTrendChart(powerChartData, chartDecorator) {
  if (powerChartData.series.length) {
    $('#moduleChart_1').highcharts({
      chart: {
        type: 'spline',
        zoomType: 'xy',
      },
      title: {
        text: chartDecorator.mainTitle
      },
      xAxis: {
        title: {
          text: chartDecorator.xAxisTitle
        },
        tickInterval: 1,
        categories: powerChartData.range
      },
      yAxis: [{
        title: {
          text: chartDecorator.yAxisTitle
        }
      }],
      legend: { //범례
        align: 'center',
        verticalAlign: 'bottom',
        borderWidth: 0
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      series: powerChartData.series,
      credits: {
        enabled: false
      },
    });
  } else {
    $('#moduleChart_1').html('발전 내역이 존재하지 않습니다.').css({
      'line-height': '240px',
      'font-size': '25px'
    });
  }
}
exports.makeTrendChart = makeTrendChart;