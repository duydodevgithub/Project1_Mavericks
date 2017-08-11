var userName = "admin";
var passWord = "admin";


$("#login").on("click", function() {
  if($("#username").val() == userName && $("#password").val() == passWord)
  {
    window.open('default.html')/*opens the target page while Id & password matches*/
  }
 else
 {
   alert("Error Password or Username")/*displays error message*/
  }
})

