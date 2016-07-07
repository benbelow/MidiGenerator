function sendRequest() {
    jQuery.ajax({
        type:"post",
        url: "/generate",
        success: function(data){
            location.href = JSON.parse(data).result;
        }
    })
}