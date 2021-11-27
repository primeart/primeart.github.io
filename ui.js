
///interface

	function ui_signInDialog(display) {
		signInDialog(display)
	}
	function signInDialog(display) {
		if(window.event.target !== window.event.currentTarget) {
			return false
		}
		document.getElementById('signInBox').style.display = display
	}

	function ui_toggleHamburgerMenu(show) {
		toggleHamburgerMenu(show)
	}
	function toggleHamburgerMenu(show) {
		if(show) {
			document.getElementById('site_root').className = 'site-root site-root--site-nav-popup-active';
			document.getElementById('hamburgerNav').className = 'site-nav__popup-root site-nav__popup-root--active';
		} else {
			document.getElementById('site_root').className = 'site-root';
			document.getElementById('hamburgerNav').className = 'site-nav__popup-root';
		}
		event.stopPropagation();
	}

	function ui_setLoginedInterface(userName){
				//set get started from  sign in to get started
			//sign in to sign out, also in hamburger menu
			//set username and icon at top
	}


	function ui_waiter(show){
		if (show){
			document.getElementById('load_screen_root').style.display='flex'
		}else{
		 document.getElementById('load_screen_root').style.display='none'
		}

	}

	function ui_authWithEmailClicked(){
		userToLogin = document.getElementById('sign_in_form_email').value
		if (!validateEmail(userToLogin)){

			document.getElementById('loginErrorText').style.display='block'

			return
		}
		document.getElementById('loginErrorText').style.display='none'
		spa_authUser(userToLogin)
	}