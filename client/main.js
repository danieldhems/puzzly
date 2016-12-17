var form = document.forms[0];
form.addEventListener('submit', function(e){
	e.preventDefault();
	upload(form);
});

function upload(form){

	var fd = new FormData(form);

	// Create request
	var xhr = new XMLHttpRequest();
	xhr.contentType = "application/x-www-form-urlencoded;";
	xhr.open('POST', '/api/new', true);
	xhr.send(fd);

}

window.onload = function(){
	Puzzly.init('canvas', 'img');
}