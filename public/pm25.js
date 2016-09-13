+function($) {
  var oneDay = 1000 * 60 * 60 * 24

  function urlFormatter(viewId, data) {
    return '/dataapi/view/v2/' + viewId + '?data=' + JSON.stringify(data)
  }

  function getDeviceAvg(start, end, cb) {
    var url = urlFormatter('AVZa1KdFwe2Jxq0nEb02', {
      PRODUCT_KEY: "pk1",
      DID: "did1",
      FROM_TIMESTAMP_MILLIS: start,
      TO_TIMESTAMP_MILLIS: end
    })
    $.get(url, function(res) {
      cb(res)
    })
  }

  function buildChart1(res) {
    var buckets = res.aggregations.date.buckets
    var dates = buckets.map(function(item) {
      var d = new Date(item.key)
      return d.getMonth() + 1 + '-' + d.getDate()
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
    }).on('changeDate', function(e) {
      var $this = $(this)
      var startVal = $this.find('input[name="start"]').val()
      var endVal = $this.find('input[name="end"]').val()
      getDeviceAvg(new Date(startVal).getTime(), new Date(endVal).getTime() + oneDay, buildChart1)
    }).trigger('changeDate')
  })
}(jQuery)