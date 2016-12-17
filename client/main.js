var form = document.forms[0];
form.addEventListener('submit', function(e){
	e.preventDefault();
	upload(form);
});

function onUploadSuccess(response){
	console.log(response);
}

function onUploadFailure(response){
	console.log(response);
}

function upload(form){

	var fd = new FormData(form);

	fetch('/api/new', {
		body: fd,
		method: 'POST'
	}).then( function(r){
		return r.json();
	}).then( function(d){
		console.log(d);
	}).catch( function(err){
		console.log(err);
	});
}

window.onload = function(){
	Puzzly.init('canvas', 'img');
}