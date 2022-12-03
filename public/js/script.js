$(".Irssm").on("click",function () {
    $(".Irssm").attr("active",0);
    $(this).attr("active",1);
    let content = $(this).attr("content");
    $(".modal-body .CdReC").removeClass("active");
    $(".modal-body .CdReC").each(function(){
        let content1 = $(this).attr("content");
        if (content1 == content) {
            $(this).addClass("active");
        }
    });
})
$(".modal-body .CdReC").on("click",function () {
    $(".modal-body .CdReC").removeClass("active");
    $(this).addClass("active");
    let content = $(this).attr("content");
    let img = $(this).find("img").attr("src");
    let text = $(this).find(".ktwiAW").text();
    $(".Irssm").each(function(){
        if ($(this).attr("active") == 1 ) {
            $(this).attr("content",content);
            $(this).find("img").attr("src",img);
            $(this).find(".ktwiAW").text(text);
        }
    });
})