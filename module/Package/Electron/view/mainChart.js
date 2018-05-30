const _ = require('lodash');
const $ = require('jquery');
const Highcharts = require('highcharts');
require('highcharts-solid-gauge');
require('highcharts-more');

function makeMainChart(chartDataObj) {
  // var chartDataObj = mainData.dailyPowerChartData;
  console.log('chartDataObj', chartDataObj);
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
  // var powerGenerationInfo = mainData.powerGenerationInfo;
  var gaugeOptions = {
    chart: {
      type: 'solidgauge',
      backgroundColor: 'none'
    },
    title: null,
    pane: {
      center: ['50%', '85%'],
      size: '140%',
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#fff',
        innerRadius: '60%',
        outerRadius: '100%',
        shape: 'arc'
      }
    },
    tooltip: {
      enabled: false
    },
    // the value axis
    yAxis: {
      stops: [
        [0.1, '#55BF3B'], // green
        [0.5, '#DDDF0D'], // yellow
        [0.9, '#DF5353'] // red
      ],
      lineWidth: 0,
      minorTickInterval: null,
      tickAmount: 2,
      title: {
        y: -70
      },
      labels: {
        y: 16
      }
    },
    plotOptions: {
      solidgauge: {
        dataLabels: {
          y: 10,
          borderWidth: 0,
          useHTML: true
        }
      }
    }
  };

  var currentPower = Highcharts.chart('chart_div_1', Highcharts.merge(gaugeOptions, {
    yAxis: {
      min: 0,
      max: powerGenerationInfo.currKwYaxisMax,
      tickPositioner: function () {
        return [this.min, this.max];
      },
      title: {
        text: '현재 출력'
      }
    },
    credits: {
      enabled: false
    },
    series: [{
      name: '현재 출력',
      data: [Number(powerGenerationInfo.currKw.toFixed(2))],
      dataLabels: {
        format: '<div style="text-align:center"><span style="font-size:25px;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
          '<span style="font-size:12px;color:silver">kW</span></div>'
      },
      tooltip: {
        valueSuffix: 'kW'
      }
    }]
  }));

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