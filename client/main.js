import Puzzly from './puzzly.js';

var form = document.forms[0];
form.addEventListener('submit', function(e){
	e.preventDefault();
	upload();
});

function onUploadSuccess(response){
	console.log(response)
}

function onUploadFailure(response){
	console.log(response);
}

function upload(){
	const image = document.querySelector('[type=file]').files;
	
	const fd = new FormData();
	fd.append('files[]', image[0])

	fetch('/api/puzzle', {
		body: fd,
		method: 'POST',
	})
	.then( response => response.json() )
	.then( function(d){
		onUploadSuccess(d);
	}).catch( function(err){
		onUploadFailure(err);
	});
}
