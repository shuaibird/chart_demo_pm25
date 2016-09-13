+function($) {
  $(function() {
    $.get('/dataapi/view/v2/AVZa1KdFwe2Jxq0nEb01?data={"PRODUCT_KEY":"pk1","DID":"did1","FROM_TIMESTAMP_MILLIS":1473468218123,"TO_TIMESTAMP_MILLIS":1473557618123}', function(data) {
      console.log(data)
    })
  })
}(jQuery)