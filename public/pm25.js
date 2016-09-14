+function($) {

  // config object
  var config = {
    pk: '8ab607683fa14e58aa17c6ed95b34556',
    did: 'WMJpRTHfXDqqtU94ymidjL',
    city: 'guangzhou'
  }

  var citiesNameTranslate = {
    beijing: '北京',
    guangzhou: '广州',
    shanghai: '上海',
    shenzhen: '深圳',
    shijiazhuang: '石家庄'
  }


  // general helper variables & functions
  var red = '#E74C3C'
  var blue = '#3498DB'
  var transparent = 'rgba(0,0,0,0)'

  function generateViewId(num) {
    return 'AVZa1KdFwe2Jxq0nEb0' + num
  }

  function urlFormatter(num, data) {
    return '/dataapi/view/v2/' + generateViewId(num) + '?data=' + JSON.stringify(data)
  }

  function getTime(timeStamp) {
    return new Date(timeStamp).getTime()
  }

  function renderChart(datepicker, fetchData, buildChart) {
    $(datepicker).datepicker({
      format: 'yyyy/mm/dd',
      autoclose: true
    }).on('changeDate', function() {
      var $this = $(this)
      var startVal = $this.find('input[name=start]').val()
      var endVal = $this.find('input[name=end]').val()
      var oneDay = 1000 * 60 * 60 * 24
      fetchData(getTime(startVal), getTime(endVal) + oneDay, buildChart)
    }).trigger('changeDate')
  }


  // fetchData functions

  // 设备PM2.5日平均值
  function getDeviceAvg(start, end, cb) {
    var url = urlFormatter(2, {
      PRODUCT_KEY: config.pk,
      DID: config.did,
      FROM_TIMESTAMP_MILLIS: start,
      TO_TIMESTAMP_MILLIS: end
    })
    $.get(url, function(res) {
      cb(res)
    })
  }

  // 设备PM2.5平均值（单个）
  function getSingleDeviceAvg(start, end, cb) {
    var url = urlFormatter(1, {
      PRODUCT_KEY: config.pk,
      DID: config.did,
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
      var url = urlFormatter(4, {
        PRODUCT_KEY: config.pk,
        FROM_TIMESTAMP_MILLIS: start,
        TO_TIMESTAMP_MILLIS: end,
        PM25_VALUE: indoorVal
      })
      $.get(url, function(res) {
        var defeat = 100 - res.aggregations.percentile_ranks.values[indoorVal]
        cb({defeat: defeat})
      })
    })
  }

  // 指定城市室内PM2.5排名百分比
  function getCityRank(start, end, cb) {
    getSingleDeviceAvg(start, end, function(res) {
      var indoorVal = res.aggregations.pm25_indoor_avg.value
      var url = urlFormatter(5, {
        PRODUCT_KEY: config.pk,
        FROM_TIMESTAMP_MILLIS: start,
        TO_TIMESTAMP_MILLIS: end,
        PM25_VALUE: indoorVal,
        CITY: config.city
      })
      $.get(url, function(res) {
        var defeat = 100 - res.aggregations.percentile_ranks.values[indoorVal]
        cb({defeat: defeat})
      })
    })
  }

  // 城市PM2.5日平均值
  function getCitiesAvg(start, end, cb) {
    var url = urlFormatter(3, {
      PRODUCT_KEY: config.pk,
      FROM_TIMESTAMP_MILLIS: start,
      TO_TIMESTAMP_MILLIS: end
    })

    $.get(url, function(res) {
      cb(res)
    })
  }


  // buildChart functions

  function buildDeviceAvgChart(res) {
    var buckets = res.aggregations.date.buckets
    var dates = buckets.map(function(date) {
      var day = new Date(date.key)
      return (day.getMonth() + 1) + '-' + day.getDate()
    })
    var outDoorData = buckets.map(function(bucket) {
      return bucket.pm25_outdoor_avg.value
    })
    var inDoorData = buckets.map(function(bucket) {
      return bucket.pm25_indoor_avg.value
    })
    var ctx = document.getElementById('c1')
    var chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: '室外',
          data: outDoorData,
          backgroundColor: transparent,
          borderColor: red,
          borderWidth: 5
        }, {
          label: '室内',
          data: inDoorData,
          backgroundColor: transparent,
          borderColor: blue,
          borderWidth: 5
        }]
      }
    })
  }

  function buildNationalRankChart(res) {
    var ctx = document.getElementById('c2')
    var chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['打败的用户', '所有用户'],
        datasets: [
          {
            data: [res.defeat.toFixed(2), 100],
            backgroundColor: [red, blue]
          }
        ]
      }
    })
  }

  function buildCityRankChart(res) {
    var ctx = document.getElementById('c3')
    var chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['打败的用户', '所有用户'],
        datasets: [
          {
            data: [res.defeat.toFixed(2), 100],
            backgroundColor: [red, blue]
          }
        ]
      }
    })
  }

  function buildCitiesAvgChart(res) {
    var buckets = res.aggregations.city.buckets
    var cities = buckets.map(function(bucket) {
      var key = bucket.key
      return (key in citiesNameTranslate) ? citiesNameTranslate[key] : key
    })
    var outDoorData = buckets.map(function(bucket) {
      return bucket.pm25_outdoor_avg.value
    })
    var inDoorData = buckets.map(function(bucket) {
      return bucket.pm25_indoor_avg.value
    })
    var ctx = document.getElementById('c4')
    var chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: cities,
        datasets: [{
          label: '室外',
          data: outDoorData,
          backgroundColor: red
        }, {
          label: '室内',
          data: inDoorData,
          backgroundColor: blue
        }]
      }
    })
  }


  // renderChart
  $(function() {
    renderChart('#datepicker1', getDeviceAvg, buildDeviceAvgChart)
    renderChart('#datepicker2', getNationalRank, buildNationalRankChart)
    renderChart('#datepicker3', getCityRank, buildCityRankChart)
    renderChart('#datepicker4', getCitiesAvg, buildCitiesAvgChart)
  })
  
}(jQuery)
