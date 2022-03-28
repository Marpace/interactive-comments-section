$(document).ready(function(){

    $(".js-compose-reply").hide(); 
    $(".edit-form").hide()
    $(".cancel-icon").hide()
    $(".cancel-text").hide()

    // calculates when comment was created based on "CreatedAt" field
    function timeCreated(ms) {
        let seconds = Math.round((ms / 1000));
        let minutes = Math.round((ms / (1000 * 60)));
        let hours = Math.round((ms / (1000 * 60 * 60)));
        let days = Math.round((ms / (1000 * 60 * 60 * 24)));
        let weeks = Math.round((ms / (1000 * 60 * 60 * 24 * 7)));
        let months = Math.round((ms / (1000 * 60 * 60 * 24 * 7 * 4)));
        if (seconds < 120) return "1 minute ago";
        else if (minutes < 60) return `${minutes} minutes ago`;
        else if (minutes < 120) return "1 hour ago";
        else if (hours < 24) return `${hours} hours ago`;
        else if (hours < 48) return "1 day ago";
        else if (days < 7) return `${days} days ago`;
        else if (days < 14) return "1 week ago";
        else if (weeks < 4) return `${weeks} weeks ago`;
        else if (weeks < 8) return "1 month ago";
        else return `${months} months ago`;
    }
    
    const currentTime = new Date().getTime();
    
    $("article").each(function(){    
        const diff = currentTime - $(this).find(".timeCreated").val()
        $(this).find(".js-time-created").html(timeCreated(diff))
    })

    const replyContainers = document.querySelectorAll(".replies");

    replyContainers.forEach(container => {
        let replies = [...container.querySelectorAll(".reply")]
        console.log(replies)

        if(replies.length >= 2){
            replies[0].style.display = "block";
            replies[1].style.display = "block";
        } else if (replies.length == 1) {
            replies[0].style.display = "block";
        }

    });

    $(".js-load-replies").click(function(){
        $(this).prev().children(".reply").css("display", "block");
        $(this).html("")

    });


    //function when clicking reply to a comment  
    $(".js-reply").each(function(){
        $(this).click(function(){
            const composeReply = $(this).parent().next();
            const replyTo = $(this).parent().find(".author__name").html();
            const textArea = composeReply.find(".js-compose-content");
            const replyUser = composeReply.find("#replyingTo");
    
            composeReply.slideToggle();
    
            console.log(textArea);
    
            textArea.attr("placeholder", `Reply to ${replyTo}...`)
            replyUser.attr("value", `${replyTo}`);
            textArea.focus()
    
        });
    
    })
    
    // display modal when comment delete button is clicked 
    $(".js-comment-delete").click(function(){
        $(this).next().next().next().fadeIn(200);
    });
    
    // close comment delete modal 
    $(".js-cancel").click(function(){
        $(this).parent().parent().parent().parent().hide();
    });
    
    
    // display modal when reply delete button is clicked 
    $(".js-reply-delete").click(function(){
    
        const replyIndex = $(this).parent().parent().children(".reply").index($(this).parent())
        const deleteReply = $(this).parent().parent().children(".modal").find("#replyIndex");
    
        $(this).parent().parent().children(".modal").fadeIn(200);
        deleteReply.val(replyIndex);
    
    });
    
    // close reply delete modal 
    $(".js-cancel").click(function(){
        $(this).parent().parent().parent().parent().hide();
    });
    
    
    
    // edit button for comments
    $(".js-edit-comment").each(function(){
        $(this).click(function(){
    
            $(this).find(".edit-icon").toggle()
            $(this).find(".cancel-icon").toggle()
            $(this).find(".edit-text").toggle()
            $(this).find(".cancel-text").toggle()
    
            const textArea = this.nextElementSibling.children[1];
            const editForm = $(this).next()
            
            editForm.toggle();
            editForm.parent().find(".js-content").toggle()
            editForm.find(".js-edited-content").focus()
            
            
        });
    });
    
    
    // edit button for replies
    $(".js-edit-reply").each(function(){
        $(this).click(function(){
    
            $(this).find(".edit-icon").toggle()
            $(this).find(".cancel-icon").toggle()
            $(this).find(".edit-text").toggle()
            $(this).find(".cancel-text").toggle()
    
            const textArea = this.nextElementSibling.children[1];
            const editForm = $(this).next()
            
            editForm.toggle();
            editForm.parent().find(".js-content").toggle()
            editForm.find(".js-edited-content").focus()
            
    
            // this is to get the index of reply and update the right one
            const replyIndex = $(this).parent().parent().children(".reply").index($(this).parent())
            const index = $(this).next().find("#reply-index")
            index.attr("value", replyIndex)
        });
    });
})
