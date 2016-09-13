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
      PRODUCT_KEY: '8ab607683fa14e58aa17c6ed95b34556',
      DID: 'WMJpRTHfXDqqtU94ymidjL',
      FROM_TIMESTAMP_MILLIS: start,
      TO_TIMESTAMP_MILLIS: end
    })
    $.get(url, function(res) {
      cb(res)
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
    var myChart = new Chart(ctx, {
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


  $(function() {
    $('.input-daterange').datepicker({
      format: 'yyyy/mm/dd',
      autoclose: true
    }).on('changeDate', function() {
      var $this = $(this)
      var startVal = $this.find('input[name=start]').val()
      var endVal = $this.find('input[name=end]').val()
      getDeviceAvg(getTime(startVal), getTime(endVal) + oneDay, buildDeviceAvgChart)
    }).trigger('changeDate')
  })
}(jQuery)