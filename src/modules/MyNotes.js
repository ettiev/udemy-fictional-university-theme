import $ from "jquery";

class MyNotes {
    constructor() {
        this.events();    
    }

    events() {
        $("#my-notes").on("click", ".delete-note", this.deleteNote);
        $("#my-notes").on("click", ".edit-note", this.editNote.bind(this));
        $("#my-notes").on("click", ".update-note", this.updateNote.bind(this));
        $(".submit-note").on("click", this.createNote.bind(this));    
    }

    //Methods
    deleteNote(event) {
        var thisNote = $(event.target).parents("li");
        $.ajax({
            beforeSend: (xhr) => {
                xhr.setRequestHeader("X-WP-Nonce", universityData.nonce)        
            },
            url: universityData.root_url + "/wp-json/wp/v2/note/" + thisNote.data("id"),
            type: "DELETE",
            success: (response) => {
                thisNote.slideUp();
                console.log("Note was deleted!");
                console.log(response);
                if (response.userNoteCount < 5) {
                    $(".note-limit-message").removeClass("active");
                }
            },
            error: (response) => {
                console.log("Note was not deleted!");
                console.log(response);
            }
        })
    }

    updateNote(event) {
        var thisNote = $(event.target).parents("li");
        var ourUpdatedPost = {
            "title": thisNote.find(".note-title-field").val(),
            "content": thisNote.find(".note-body-field").val() 
        }
        $.ajax({
            beforeSend: (xhr) => {
                xhr.setRequestHeader("X-WP-Nonce", universityData.nonce)        
            },
            url: universityData.root_url + "/wp-json/wp/v2/note/" + thisNote.data("id"),
            data: ourUpdatedPost, 
            type: "POST",
            success: (response) => {
                this.makeNoteReadOnly(thisNote);
                console.log("Note was updated!");
                console.log(response);
            },
            error: (response) => {
                console.log("Note was not updated!");
                console.log(response);
            }
        })
    }

    createNote(event) {
        var ourNewPost = {
            "title": $(".new-note-title").val(),
            "content": $(".new-note-body").val(),
            "status": "publish" 
        }
        $.ajax({
            beforeSend: (xhr) => {
                xhr.setRequestHeader("X-WP-Nonce", universityData.nonce)        
            },
            url: universityData.root_url + "/wp-json/wp/v2/note/",
            data: ourNewPost, 
            type: "POST",
            success: (response) => {
                $(".new-note-title").val("");
                $(".new-note-body").val("");
                $(`
                    <li data-id="${response.id}">
                        <input readonly class="note-title-field" value="${response.title.raw}">
                        <span class="edit-note"><i class="fa fa-pencil" aria-hidden="true"></i> Edit</span>
                        <span class="delete-note"><i class="fa fa-trash-o" aria-hidden="true"></i> Delete</span>
                        <textarea readonly class="note-body-field">${response.content.raw}</textarea>
                        <span class="update-note btn btn--blue btn--small"><i class="fa fa-arrow-right" aria-hidden="true"></i> Save</span>
                    </li>    
                `).prependTo("#my-notes").hide().slideDown();
                console.log("Note was created!");
                console.log(response);
            },
            error: (response) => {
                if (response.responseText == "You have reached your note limit!") {
                    $(".note-limit-message").addClass("active");
                }
                console.log("Note was not created!");
                console.log(response);
            }
        })
    }

    editNote(event) {
        var thisNote = $(event.target).parents("li");
        if (thisNote.data("state") == "editable") {
            this.makeNoteReadOnly(thisNote);
        } else {
            this.makeNoteEditable(thisNote);
        }
    }
    
    makeNoteEditable(thisNote) {
        thisNote.find(".edit-note").html('<i class="fa fa-times" aria-hidden="true"></i> Cancel')
        thisNote.find(".note-title-field, .note-body-field").removeAttr("readonly").addClass("note-active-field");    
        thisNote.find(".update-note").addClass("update-note--visible");
        thisNote.data("state", "editable");
    }

    makeNoteReadOnly(thisNote) {
        thisNote.find(".edit-note").html('<i class="fa fa-pencil" aria-hidden="true"></i> Edit')
        thisNote.find(".note-title-field, .note-body-field").attr("readonly", "readonly").removeClass("note-active-field");    
        thisNote.find(".update-note").removeClass("update-note--visible");
        thisNote.data("state", "cancel");
    }



}

export default MyNotes;