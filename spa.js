//lib
//todo https://github.com/googlearchive/storage-getting-started-javascript
//https://onesignal.com/pricing

//ref https://googleapis.dev/python/storage/latest/blobs.html
// https://vinta.ws/code/integrate-with-google-cloud-api-in-python.html
//https://blog.koliseo.com/limit-the-size-of-uploaded-files-with-signed-urls-on-google-cloud-storage/


	function setCookie(name,value,seconds) {
	var expires = "";
	if (seconds) {
		var date = new Date();
		date.setTime(date.getTime() + (seconds*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
function eraseCookie(name) {
	document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
function validateEmail(email)
	{
		var re = /\S+@\S+\.\S+/;
		return re.test(email);
	}

function httpRequest(url, type, data, callback){
	const Http = new XMLHttpRequest();
	//alert('new request'+url)
	Http.open(type, url, true);
	if (callback){
		Http.onreadystatechange = function() {
			if (this.readyState==4 ){ //&& this.status==200
					if (this.status==200){
					console.log('httpRequest ready. this.responseText:: '+this.responseURL)
					console.log(this.responseText)
					try{
						parsed = JSON.parse(this.responseText)
					}catch(e){
						parsed={}
					}
					callback(parsed)
				}else{
					callback({'error':this.status})
				}
			}
		}
	}
	if (!data){
		return Http.send();
	}
	if(type=='POST'){
		Http.setRequestHeader('Content-Type', 'multipart/form-data');
	}else if(type=='PUT'){ //put, get
		Http.setRequestHeader('Content-Type', data.type||'text/html'); //put
	}
	Http.send(data);
}

function timeNow(){
	var d = new Date();
		return Math.floor( d   );
	}



//function messageIframe(){
//	 const iFrame = document.getElementById('workerIframe');
//	 iFrame.contentWindow.postMessage(window.iframeMessage, 'https:/'+'/storage.googleapis.com/'); //domain of event.data[0]
//}

//function spa_putFileRequest(url, data, callback){
//		httpRequest(data.imagePutUrl, 'PUT',data) //, callback=waitResponce
//}
window.spa_apiRequestCallbacks={}
window.spa_apiRequestQueue=[]

function spa_apiRequest(commandName, data, callback){
	if (!spa_isLogined()){
		return  //already logined; malicious call
	}
	console.log('spa_apiRequest :: apiCommand=',commandName)
	document.getElementById('load_screen_root').innerHTML += '<br /><br />spa_apiRequest:: apiCommand='+commandName

	if (window.spa_apiRequestCallbacks.length>0){
		window.spa_apiRequestQueue.push([commandName, data, callback])
		//alert('Error #821088. Try again')
		//location.reload()
		return false
	}
	//ui_waiter(true)
	spa_requestId = timeNow()
	window.spa_apiRequestCallbacks[spa_requestId]=callback
	window.spa_responceAwaitTries=0
	if (!data.type){ //not a file
		data = JSON.stringify({'commandName':commandName, 'requestId':spa_requestId, 'data':data})
	}
	usePolicyDocument=false //todo
	if (usePolicyDocument){
		data = window.spa_requestPolicy + convertToFormFileAsAttachment(data)
		httpRequest(window.spa_requestUrl, 'POST', data, waitApiResponceAndCallback)
	}else{
		httpRequest(window.spa_requestUrl, 'PUT', data, waitApiResponceAndCallback)
	}
	console.log('spa_apiRequest :: success send put equest')

}

function waitApiResponceAndCallback(){
	if (Object.keys(window.spa_apiRequestCallbacks).length <= 0){
		console.log('waitApiResponceAndCallback:: no callbacks at start of function, spa_apiRequestCallbacks:: ')
			console.log(window.spa_apiRequestCallbacks)
			return
	}
	console.log('waitApiResponceAndCallback:: about to make get request, spa_apiRequestCallbacks:: ')
	console.log(window.spa_apiRequestCallbacks)
	httpRequest(window.spa_responceUrl, 'GET', {}, function(responce){
			console.log('waitApiResponceAndCallback"s callback got called with responce:')
			console.log(responce)
			//we got responce for what we asked
//			window.spa_requestId=''
			window.spa_responceAwaitTries=0
			//window.imagePutUrl=responce.imagePutUrl
//			window.spa_requestUrl=responce.requestUrl
//			window.spa_responceUrl=responce.responceUrl
			called=false
			if (callback=window.spa_apiRequestCallbacks[responce.requestId]){
				console.log('ids match, calling callback! id: '+responce.requestId)
				document.getElementById('load_screen_root').innerHTML += '<br />spa_apiRequest:: cbk with responce='+responce.responceData

				called = true
				delete window.spa_apiRequestCallbacks[responce.requestId]
				callback(responce.responceData)// !== false && ()
			}
			if (Object.keys(window.spa_apiRequestCallbacks).length > 0){
				if (!called){
					console.log('ids NOT match: no callback for recieved id, new timeout '+responce.requestId)
					setTimeout(waitApiResponceAndCallback, 1500)
				}
			}else{
				if (window.spa_apiRequestQueue.length>0){
					args = window.spa_apiRequestQueue[0]
					delete window.spa_apiRequestQueue[0]
					console.log('calling next request in queue')
					spa_apiRequest(args[0],args[1],args[2])
				}else{
					//ui_waiter(false)
				}
			}

	})
}


 //actions

function spa_authUser(userToLogin){
	if (spa_isLogined()){
		return  //already logined; malicious call
	}

	window.userToLogin = userToLogin
	udir = btoa(userToLogin) // userToLogin.replace(/[^a-zA-Z0-9-]/img,'_')
	const strWindowFeatures = 'toolbar=no, menubar=no, width=600, height=700';
	loginWindow = window.open('https://accounts.google.com/AccountChooser/signinchooser?continue=https%3A%2F%2Fstorage.cloud.google.com%2Froyal-art%2Frequests%2F'+udir+'%2Fauth&flowEntry=AccountChooser',  '_blank', strWindowFeatures);
	//    ?pli=1&authuser=2
	loginWindow.focus();

/*
	open common /auth file (with all users set read access)
	auth will appear
	after success auth js in this popup will xmlhttprequest  unexisting url,
	 if "asdf@dasf.com does not have access"
		so email is "asdf@dasf.com",
		report it to opener and
		window.close
	else == will never happen, if user pass auth then js will open
	if pass auth but not in the sysstem -
	 "asdf@dasf.com does not have access" will load
	 so top frame monitors url, and if googleusercontent.com - then
	 send messsage and if no responce means error message in window
	 close the window, open hidden iframe with public access,
	 it will     xmlhttprequest  unexisting url,
	 and get email from error and report it top frame
	 now top frame knows auth was succes but user xxx have not yet registred in the system
	 (go to register process?)
	*/
	//&authuser=2&ogss=1
	/*
	open public iframe from gcs
	 it will try to xmlhttprequest  unexisting url,
	 if "asdf@dasf.com does not have access"
		we logined and email is this
	 else
		send top frame "auth required",


	*/
}

 window.addEventListener("message", spa_receiveMessage, false);
//document.addEventListener("DOMContentLoaded", function(){
 //  spa_init()
//});

document.addEventListener("DOMContentLoaded", spa_init);

window.spa_userAuthSuccessCallback = ''

function spa_receiveMessage(event)
{
 //if (event.origin !== "https://.*.apidata.googleusercontent.com")
 //   return;
/*
	 if (!event.data or !event.data.length or !event.data.length<1 event.data.indexOf('<Code>ExpiredToken</Code>')>0){
		console.log('bad responce; try different server. '+event.data);

		//tmp: nothing
		alert('Service unavailable. Try again later.');
		return
	 }
*/
	 if (true){ //so far only logined message expected; todo expect different message and check here
		 //setState('logined',[window.userToLogin, event.data])
		 //ui_setLoginedInterface(window.userToLogin)
		  console.log(event.data)
		console.log(event.data['authedUrl'])
		console.log(event.data['authedUrl'].split('?')[-1])

		 timeout=event.data['timeout']
		 //=event.data[3]
		 setCookie('requestUrl',event.data['requestUrl'], timeout)
		 setCookie('requestPolicy',event.data['requestPolicy'], timeout)
		 setCookie('responceUrl',event.data['responceUrl'],timeout)
		 setCookie('loginedUser',window.userToLogin, timeout)

		 spa_init(true)
	 }
}

function spa_isLogined(){
	return  window.spa_loginedUser && validateEmail(window.spa_loginedUser)
}

function spa_navigate(page){
	location.href=page
}

function spa_signOut(){
	if (window.prompt('Sign out?'))
	{
		spa_apiRequest('signOut',{}) //to set monitoring rate from frequent to normal
		window.spa_loginedUser = undefined;
		eraseCookie('requestUrl')
		eraseCookie('requestPolicy')
		eraseCookie('responceUrl')
		eraseCookie('loginedUser')
	}
}


function spa_init(afterLogin){
	if (location.href.indexOf('http')<0){
		return
	}
	//!todo check login cookies expire date and set timeout to periodically opdate them when idle

/*
function httpGet(theUrl)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
	xmlHttp.send( null );
	return xmlHttp.responseText;
}
alert(httpGet('https://storage.cloud.google.com/royal-art/u/adsf/auth'))
*/
	dashboard = location.href.indexOf('dashboard.html')>-1

	//todo do before page content appears
	userCandidate = getCookie('loginedUser');
	if (validateEmail(userCandidate)){
		window.spa_loginedUser = userCandidate;
		window.spa_requestUrl = getCookie('requestUrl');
		window.spa_requestPolicy = getCookie('requestPolicy');
		window.spa_responceUrl = getCookie('responceUrl');
		if(window.spa_requestUrl){
			ui_setLoginedInterface(window.spa_loginedUser)
		}

		  if (!dashboard  || afterLogin === true){
			spa_navigate('dashboard.html')
		 }else{
			ui_setLoginedInterface(window.spa_loginedUser)
		 }

	}else{
		//tmp
		//document.getElementById('main-content').innerHTML.indexOf('Sign in required to access this page')>-1
		if (dashboard){
			 ui_signInDialog(true)
			 //window.spa_userAuthSuccessCallback = location.reload
		}else{
			ui_setLoginedInterface(false)
		}
	}
}