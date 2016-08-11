function generateMelody() {
    jQuery.ajax({
        type:"post",
        url: "/generate",
        success: function(data){
            location.href = JSON.parse(data).result;
        }
    })
}
function generateChords() {
    jQuery.ajax({
        type:"post",
        url: "/generateChords",
        success: function(data){
            location.href = JSON.parse(data).result;
        }
    })
}