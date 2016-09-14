+function($) {

  // helper variables & functions
  var oneDay = 1000 * 60 * 60 * 24

  function urlFormatter(viewId, data) {
    return '/dataapi/view/v2/' + viewId + '?data=' + JSON.stringify(data)
  }

  function getTime(timeStamp) {
    return new Date(timeStamp).getTime()
  }

  // 设备PM2.5日平均值
  function getDeviceAvg(start, end, cb) {
    var url = urlFormatter('AVZa1KdFwe2Jxq0nEb02', {
      PRODUCT_KEY: 'pk1',
      DID: 'did1',
      FROM_TIMESTAMP_MILLIS: start,
      TO_TIMESTAMP_MILLIS: end
    })
    $.get(url, function(res) {
      cb(res)
    })
  }

  // 设备PM2.5平均值（单个）
  function getSingleDeviceAvg(start, end, cb) {
    var url = urlFormatter('AVZa1KdFwe2Jxq0nEb01', {
      PRODUCT_KEY: 'pk1',
      DID: 'did1',
      FROM_TIMESTAMP_MILLIS: start,
      TO_TIMESTAMP_MILLIS: end
    })
    $.get(url, function(res) {
      cb(res)
    })
  }

  // 全国室内PM2.5排名百分比
  function getNationalRank(start, end, cb) {
    getSingleDeviceAvg(start, end, function(res) {
      var indoorVal = res.aggregations.pm25_indoor_avg.value
      var url = urlFormatter('AVZa1KdFwe2Jxq0nEb04', {
        PRODUCT_KEY: 'pk1',
        FROM_TIMESTAMP_MILLIS: start,
        TO_TIMESTAMP_MILLIS: end,
        PM25_VALUE: indoorVal
      })
      $.get(url, function(res) {
        var defeat = 100 - res.aggregations.percentile_ranks.values[indoorVal]
        cb({
          defeat: defeat
        })
      })
    })
  }

  // 指定城市室内PM2.5排名百分比
  function getCityRank(start, end, city, cb) {
    getSingleDeviceAvg(start, end, function(res) {
      var indoorVal = res.aggregations.pm25_indoor_avg.value
      var url = urlFormatter('AVZa1KdFwe2Jxq0nEb05', {
        PRODUCT_KEY: 'pk1',
        FROM_TIMESTAMP_MILLIS: start,
        TO_TIMESTAMP_MILLIS: end,
        PM25_VALUE: indoorVal,
        CITY: city
      })

      $.get(url, function(res) {
        var defeat = 100 - res.aggregations.percentile_ranks.values[indoorVal]
        cb({
          defeat: defeat
        })
      })
    })
  }

  function buildDeviceAvgChart(res) {
    var buckets = res.aggregations.date.buckets
    var dates = buckets.map(function(date) {
      var day = new Date(date.key)
      return (day.getMonth() + 1) + '-' + day.getDate()
    })
    var outDoorData = buckets.map(function(item) {
      return item.pm25_outdoor_avg.value
    })
    var inDoorData = buckets.map(function(item) {
      return item.pm25_indoor_avg.value
    })

    var ctx = document.getElementById('c1')
    var chart1 = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: '室外',
          data: outDoorData,
          backgroundColor: 'rgba(0,0,0,0)',
          borderColor: '#F1C40F',
          borderWidth: 1
        }, {
          label: '室内',
          data: inDoorData,
          backgroundColor: 'rgba(0,0,0,0)',
          borderColor: '#2ECC71',
          borderWidth: 1
        }]
      }
    })
  }

  function buildNationalRankChart(res) {
    var ctx = document.getElementById('c2')
    var chart2 = new Chart(ctx,{
      type: 'pie',
      data: {
        labels: ['打败的用户', '所有用户'],
        datasets: [
          {
            data: [res.defeat.toFixed(2), 100],
            backgroundColor: [
              '#E74C3C',
              '#3498DB'
            ]
          }
        ]
      }
    })
  }

  function buildCityRankChart(res) {
    var ctx = document.getElementById('c3')
    var chart3 = new Chart(ctx,{
      type: 'pie',
      data: {
        labels: ['打败的用户', '所有用户'],
        datasets: [
          {
            data: [res.defeat.toFixed(2), 100],
            backgroundColor: [
              '#E74C3C',
              '#3498DB'
            ]
          }
        ]
      }
    })
  }



  $(function() {
    // chart1
    $('#datepicker1').datepicker({
      format: 'yyyy/mm/dd',
      autoclose: true
    }).on('changeDate', function() {
      var $this = $(this)
      var startVal = $this.find('input[name=start]').val()
      var endVal = $this.find('input[name=end]').val()
      getDeviceAvg(getTime(startVal), getTime(endVal) + oneDay, buildDeviceAvgChart)
    }).trigger('changeDate')

    // chart2
    $('#datepicker2').datepicker({
      format: 'yyyy/mm/dd',
      autoclose: true
    }).on('changeDate', function() {
      var $this = $(this)
      var startVal = $this.find('input[name=start]').val()
      var endVal = $this.find('input[name=end]').val()
      getNationalRank(getTime(startVal), getTime(endVal) + oneDay, buildNationalRankChart)
    }).trigger('changeDate')

    // chart3
    var $datepicker3 = $('#datepicker3')
    $datepicker3.datepicker({
      format: 'yyyy/mm/dd',
      autoclose: true
    }).on('changeDate', function() {
      var $this = $(this)
      var startVal = $this.find('input[name=start]').val()
      var endVal = $this.find('input[name=end]').val()
      getCityRank(getTime(startVal), getTime(endVal) + oneDay, 'guangzhou', buildCityRankChart)
    }).trigger('changeDate')
  })
}(jQuery)