$(document).ready(function() {
  $(".todo-form form").submit(function (e) {
    e.preventDefault();
    var text = $(".todo-form input[type=text]").val().trim();
    if (text.length > 0) {
      //append todo
      $(".todo-list").append("<div class='todo-item'><input type='checkbox'>" + text + "<button class='delete'><i class='fas fa-trash-alt'></i></button></div>")
      $.ajax({
			method: "POST",
			url: "/todo",
			data: { todo: text }
		})
		.done(function( msg ) {
			console.log(msg);
		});
    }

    $(".todo-item input[type=checkbox]").change(toggleTodo)

    $(".todo-item button").click(deleteTodo)


    //clear input
    $(".todo-form input[type=text]").val("");
  });
	$(".todo-item input[type=checkbox]").change(toggleTodo)
	$(".todo-item button").click(deleteTodo)
})


function deleteTodo () {
    $(this).parent().remove();
    $.ajax({
			method: "DELETE",
			url: "/todo",
			data: { id: $(this).parent().attr("todoId") }
		})
		.done(function( msg ) {
			console.log(msg);
		});
}

function toggleTodo () {
	if(this.checked) {
		$(this).parent().addClass("inactive");
	} else {
		$(this).parent().removeClass("inactive");
	}
}